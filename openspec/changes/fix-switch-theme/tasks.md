# Tasks

## 1. Manifesto (package.json e temas)

- [ ] 1.1 Apontar "Switch Sensation" para `./themes/sensation-dark-theme.json`, remover `themes/placeholder.json` e verificar que `git ls-files themes` não lista mais o placeholder
- [ ] 1.2 Trocar `activationEvents` para `["onStartupFinished"]` e verificar com `node -e "require('./package.json')"` que o JSON continua válido
- [ ] 1.3 Substituir as configurações `autoTheme.*` por `sensation.switch.lightTime` (padrão "06:00") e `sensation.switch.darkTime` (padrão "18:30"), com `pattern` HH:MM e descrições em inglês, e verificar no Settings UI do Extension Host que um valor inválido é sinalizado
- [ ] 1.4 Contribuir o comando `sensation.disableAutoSwitch` com o título "Sensation: Disable Auto Switch" e verificar que ele aparece na paleta de comandos do Extension Host

## 2. Lógica pura de horário

- [ ] 2.1 Implementar em `src/extension.js`, sem depender de `vscode`, o parse/validação de HH:MM com fallback para o padrão, e verificar com um script Node avulso que "18h30", "25:00" e "" caem no padrão e que "6:30" e "07:15" são aceitos
- [ ] 2.2 Implementar `temaParaHorario(date, lightTime, darkTime)`, incluindo o intervalo que atravessa a meia-noite e o caso de horários iguais, e verificar com script Node os cenários da spec (14:00, 22:00, 03:00, limite exato do escuro, 20:00/08:00 às 23:00)
- [ ] 2.3 Implementar `msAteProximaTransicao(date, lightTime, darkTime)` e verificar com script Node que às 18:29:30 com os padrões o resultado é 30000 e que às 23:00 o resultado aponta para as 06:00 do dia seguinte
- [ ] 2.4 Implementar a leitura dos horários com fallback de `autoTheme.switchTime` via `inspect()` (design, decisão 7) e verificar no Extension Host que `autoTheme.switchTime: "19:00"` sem `sensation.switch.darkTime` faz o escuro começar às 19:00

## 3. Estado e integração com o VS Code

- [ ] 3.1 Guardar o estado do modo em `context.globalState` (`sensation.switch.enabled`), aplicar o tema só quando ele for diferente do atual e gravar `sensation.switch.lastApplied` a cada escrita (decisões 1, 4 e 6), e verificar que selecionar "Switch Sensation" às 14:00 resulta em "Light Sensation" com `lastApplied` igual a "Light Sensation"
- [ ] 3.2 Tratar `onDidChangeConfiguration` de `workbench.colorTheme` com a regra Switch / esperado / outro (decisão 3), registrando o listener em `context.subscriptions`, e verificar que escolher "Monokai" ou o Sensation oposto desliga o modo
- [ ] 3.3 Na ativação, ligar o modo se o tema ativo for "Switch Sensation" e, com o modo ligado, desligá-lo se o tema ativo for diferente de `lastApplied` (decisões 2 e 4); verificar reiniciando o Extension Host sem troca (modo segue ligado) e depois de trocar para o Sensation oposto com a extensão desabilitada (modo desliga)
- [ ] 3.4 Agendar com `setTimeout` a próxima transição, reagendar no foco da janela e em mudanças de `sensation.switch.*`, e manter o intervalo de 1 minuto como rede de segurança, tudo descartado em `context.subscriptions` (decisão 5); verificar ajustando `darkTime` para 1–2 minutos à frente e observando a troca sem interação
- [ ] 3.5 Implementar o comando "Sensation: Disable Auto Switch" (desliga o modo, cancela os timers, mantém o tema e mostra uma mensagem) e verificar que o tema não muda depois de um `darkTime` próximo
- [ ] 3.6 Mostrar uma mensagem informativa na primeira vez que o modo é ligado, explicando como desligá-lo pelo comando "Sensation: Disable Auto Switch", e verificar que ela não reaparece numa segunda ativação

## 4. Documentação

- [ ] 4.1 Adicionar em `CHANGELOG.md`, seção `[Unreleased]`, um **Fixed** para o switch, um **Changed** para as configurações `sensation.switch.*` e a ativação, um **Removed** para `autoTheme.lightTheme`/`darkTheme`, e a nota de que quem foi afetado pelo bug deve selecionar "Switch Sensation" de novo; verificar que o formato segue o Keep a Changelog já usado no arquivo
- [ ] 4.2 Criar `README.md` mínimo, em inglês como o CHANGELOG, com: os três temas; como ligar o switch; como mudar `sensation.switch.lightTime`/`darkTime` em Settings, com os padrões 06:00 e 18:30; como desligar; e a seção **Known Issues** descrevendo que selecionar o tema que o switch já aplicou não desliga o modo, com o comando "Sensation: Disable Auto Switch" como contorno (design, decisão 10). Verificar que os nomes de configuração e de comando no README batem com o `package.json`

## 5. Verificação integrada

- [ ] 5.1 Percorrer manualmente no Extension Development Host todos os cenários de `specs/theme-switch/spec.md`, inclusive com duas janelas abertas numa transição (nenhuma janela deve desligar o modo), e registrar o resultado
- [ ] 5.2 Rodar `openspec validate fix-switch-theme --strict` e verificar que passa

## Workflow follow-up

- Arquivar a change (`/opsx:archive`) depois da revisão.
