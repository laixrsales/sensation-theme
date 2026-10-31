# Design

## Context

Hoje o `src/extension.js` usa `workbench.colorTheme === "Switch Sensation"` como sinal de que o modo switch está ligado. A primeira troca muda esse valor para "Light Sensation" ou "Dark Sensation", e daí em diante o `setInterval` sempre sai cedo (ver proposal.md, seção Why). Outros pontos do estado atual:

- Um tema do VS Code é um JSON estático e não existe API para um tema "dinâmico". O "Switch Sensation" só pode ser uma porta de entrada para um modo que a extensão controla.
- O `themes/placeholder.json` tem 0 bytes.
- O início do claro está fixo no código (`hour < 6`).
- O listener de configuração não é registrado em `context.subscriptions`.
- A extensão é JavaScript puro, sem build, sem dependências e sem testes.

## Goals / Non-Goals

**Goals:**
- Guardar o estado do modo switch fora do tema ativo.
- Distinguir uma troca de tema feita pela extensão de uma troca manual do usuário, inclusive com várias janelas abertas.
- Fazer as transições no horário certo sem polling frequente.
- Permitir que o usuário possa escolher os horários de troca, ou seguir com o horário default.

**Non-Goals:**
- Permitir alternar entre temas que não sejam os Sensation.
- Horários baseados em nascer e pôr do sol ou em localização.
- Seguir o modo claro/escuro do sistema operacional (`window.autoDetectColorScheme`).
- Montar uma infraestrutura de testes automatizados.

## Decisions

### 1. Estado do modo em `context.globalState`

A chave booleana `sensation.switch.enabled` fica no `globalState`.

- **Por quê:** funciona sem configuração, persiste entre reinícios e não polui as Settings do usuário.
- **Alternativa:** um setting visível `sensation.switch.enabled`. Foi descartado porque o objetivo é que quem instala não precise conhecer as configurações. A saída explícita fica com o comando "Sensation: Disable Auto Switch".

### 2. Ligar o modo pelo nome do tema selecionado

O modo liga quando `workbench.colorTheme` passa a ser "Switch Sensation". Isso é verificado em dois momentos: no `onDidChangeConfiguration` e na ativação. A verificação na ativação cobre o caso em que o usuário selecionou o tema antes de a extensão ativar, e também o Settings Sync trazendo esse valor de outra máquina. Em seguida a extensão aplica o tema do horário.

### 3. Detectar troca manual comparando com o tema esperado para agora

Quando `workbench.colorTheme` muda e o modo está ligado, a extensão calcula `expected = temaParaHorario(agora)`:

```
novo tema == "Switch Sensation"  -> (re)liga e aplica
novo tema == expected            -> nada (fomos nós, outra janela ou um no-op)
qualquer outro                   -> desliga o modo
```

- **Por quê:** com várias janelas, cada uma roda seu próprio extension host e escreve a mesma configuração global. Se a regra fosse "desligar quando o tema for diferente do último que *eu* apliquei", uma janela que trocou na transição faria a outra desligar o modo. Comparar com o tema esperado para o horário atual é determinístico e igual em todas as janelas.
- **Alternativa:** uma flag `isApplying` local. Ela não enxerga as escritas feitas por outras janelas.

### 4. Na ativação, comparar com o último tema aplicado

Toda vez que a extensão escreve `workbench.colorTheme`, ela também grava o valor em `globalState` (`sensation.switch.lastApplied`). Na ativação, com o modo ligado:

```
tema ativo == "Switch Sensation"  -> (re)liga e aplica
tema ativo == lastApplied         -> segue ligado e aplica o tema do horário
qualquer outro                    -> desliga o modo e mantém o tema
```

Isso pega trocas feitas enquanto a extensão não rodava, como quando ela estava desabilitada ou o Settings Sync trouxe outro tema, inclusive para o Sensation oposto. Assim a extensão não sobrescreve essas escolhas.

- **Alternativa:** desligar só quando o tema ativo não é Sensation (a versão anterior desta decisão). Ela deixava passar a troca para o Sensation oposto feita com a extensão desabilitada.
- **Limite:** se o tema escolhido for igual a `lastApplied`, a troca é indistinguível. É o mesmo known issue da decisão 10.

### 5. Agendamento com `setTimeout` para a próxima transição

A extensão calcula quantos milissegundos faltam para o próximo `lightTime` ou `darkTime` e agenda um único `setTimeout`. O disparo aplica o tema e reagenda. O timer é recalculado também:

- quando a janela recebe foco (`window.onDidChangeWindowState` com `focused`), o que cobre a suspensão do sistema e o drift de relógio;
- quando `sensation.switch.*` muda.

Como rede de segurança contra timers atrasados, existe um intervalo de 1 minuto que só compara o tema e não escreve nada se estiver tudo certo.

- **Alternativa:** manter só o `setInterval` de 5 min. Isso dá até 5 min de atraso e escreve configuração à toa.

### 6. Escrever somente quando o tema muda

`workbench.colorTheme` só é atualizado (`ConfigurationTarget.Global`) se o valor atual for diferente do esperado. Isso evita eventos em cascata e escritas concorrentes entre janelas.

### 7. Configurações e compatibilidade

- `sensation.switch.lightTime` tem padrão "06:00" e `sensation.switch.darkTime` tem padrão "18:30". Os dois aceitam string HH:MM, com `pattern` no schema do `package.json` para o editor sinalizar valores inválidos.
- A validação acontece em runtime com a regex `^([01]\d|2[0-3]):[0-5]\d$`. Um valor inválido cai no padrão. Para aceitar entradas legadas como "6:30", a hora com 1 dígito também é aceita.
- Fallback do `darkTime`: se `inspect("sensation.switch.darkTime")` não tem valor global nem de workspace, a extensão usa `autoTheme.switchTime` quando ele é válido.
- As configurações `autoTheme.lightTheme` e `autoTheme.darkTheme` são removidas e os nomes dos temas ficam como constantes.
- Se `lightTime` for igual a `darkTime`, o tema fica sempre escuro. A regra do intervalo vazio já produz esse resultado.

### 8. Entrada do tema e ativação

- "Switch Sensation" passa a apontar para `./themes/sensation-dark-theme.json` com `uiTheme: "vs-dark"`, e o `placeholder.json` é removido.
- `activationEvents` passa a `["onStartupFinished"]`. Desde o VS Code 1.74, os comandos contribuídos ativam a extensão sem precisar declarar evento.
- O comando `sensation.disableAutoSwitch` aparece como "Sensation: Disable Auto Switch". Ele desliga o modo, cancela os timers e mostra uma mensagem informativa.

### 9. Lógica pura separada da integração

A lógica pura (parse de horário, `temaParaHorario(date, light, dark)`, `msAteProximaTransicao`) fica em funções sem dependência de `vscode`. Assim ela pode ser verificada com um script Node simples, sem montar uma infraestrutura de testes.

### 10. Known issue: selecionar o tema que já está ativo

O VS Code não emite `onDidChangeConfiguration` quando o valor de `workbench.colorTheme` não muda, e não há API para observar o seletor de temas. Então, se o switch aplicou "Light Sensation" e o usuário seleciona "Light Sensation", a extensão não tem como perceber, e o modo continua ligado.

- **Decisão:** aceitar a limitação, documentá-la no README (seção Known Issues) e indicar o comando "Sensation: Disable Auto Switch" como contorno. Escolher o outro tema e voltar também funciona.
- **Alternativa descartada:** contribuir variantes próprias do switch ("Switch Sensation (Light)"/"(Dark)") para que o tema aplicado nunca coincida com o estático. Ela resolveria o caso, mas lista 5 temas no seletor, o que foi rejeitado.

## Risks / Trade-offs

- [O seletor mostra "Light Sensation" ou "Dark Sensation" marcado, e não "Switch"] → Limitação da plataforma. Na primeira ativação do modo, uma mensagem informativa explica que o switch está ativo e como desligá-lo.
- [Selecionar o tema que o switch já aplicou não desliga o modo] → Known issue (decisão 10). Fica documentado no README, com o comando "Sensation: Disable Auto Switch" como contorno, e é citado na mensagem da primeira ativação.
- [A propagação do `globalState` entre janelas pode demorar] → A decisão 3 não depende de as janelas compartilharem o estado na hora certa. Uma janela que ainda acha que o modo está ligado só escreve o tema esperado, e nunca desfaz uma escolha manual.
- [Escritas concorrentes de várias janelas na transição] → Todas escrevem o mesmo valor, e a decisão 6 reduz as escritas.
- [Usuários que personalizaram `autoTheme.lightTheme`/`darkTheme` perdem a personalização] → Registrado no CHANGELOG. A extensão não foi disponibilizada para usuários ainda.
- [Fuso horário ou horário de verão] → Usa-se a hora local do sistema (`Date`). O reagendamento no foco e o intervalo de 1 minuto corrigem desvios.

## Migration Plan

- O `autoTheme.switchTime` continua sendo lido como fallback. Nenhuma ação é necessária do usuário.
- Quem tem "Switch Sensation" selecionado: na ativação, a decisão 2 liga o modo automaticamente.
- Quem tem "Light Sensation" ou "Dark Sensation" ativo por causa do bug antigo: o modo não é ligado, já que não há estado salvo. Essa pessoa precisa selecionar "Switch Sensation" de novo. Isso vai registrado no CHANGELOG.
- Rollback: reverter o commit. O `globalState` órfão é inofensivo.
