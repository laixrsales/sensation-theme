# theme-switch Specification

## Purpose

Alterna automaticamente o editor entre os temas Light Sensation e Dark Sensation conforme a hora definida. O usuário só precisa escolher "Switch Sensation" no seletor de temas, sem nenhuma configuração, e pode personalizar os horários padrão se quiser.

## Requirements

### Requirement: Ativar o modo switch pelo seletor de temas
A extensão SHALL oferecer "Switch Sensation" no seletor de temas. Quando o usuário selecionar esse tema, a extensão SHALL ligar o modo switch e aplicar imediatamente o tema Sensation correspondente ao horário atual.

#### Scenario: Seleção durante o dia
- **WHEN** o usuário seleciona "Switch Sensation" às 14:00 com os horários padrão
- **THEN** o modo switch fica ligado
- **AND** o tema ativo passa a ser "Light Sensation"

#### Scenario: Seleção durante a noite
- **WHEN** o usuário seleciona "Switch Sensation" às 22:00 com os horários padrão
- **THEN** o modo switch fica ligado
- **AND** o tema ativo passa a ser "Dark Sensation"

### Requirement: Manter o modo switch após a troca de tema
O modo switch SHALL continuar ligado depois que a extensão troca o tema ativo para Light Sensation ou Dark Sensation, e SHALL continuar ligado depois de reiniciar o VS Code.

#### Scenario: Transição após a primeira troca
- **GIVEN** o modo switch foi ligado às 14:00 e o tema ativo é "Light Sensation"
- **WHEN** o relógio chega ao horário de início do escuro
- **THEN** o tema ativo passa a ser "Dark Sensation"

#### Scenario: Reinício do editor
- **GIVEN** o modo switch está ligado e o VS Code foi fechado durante o dia
- **WHEN** o VS Code é aberto de novo depois do horário de início do escuro
- **THEN** o tema ativo passa a ser "Dark Sensation" logo após a inicialização

### Requirement: Escolher o tema conforme o horário
Com o modo switch ligado, a extensão SHALL aplicar "Light Sensation" quando o horário atual estiver entre o início do claro (inclusive) e o início do escuro (exclusive), e "Dark Sensation" fora desse intervalo. Se o início do claro for posterior ao início do escuro, o intervalo do claro SHALL atravessar a meia-noite.

#### Scenario: Limite exato do escuro
- **WHEN** o modo switch está ligado e o horário é exatamente o início do escuro
- **THEN** o tema ativo é "Dark Sensation"

#### Scenario: Madrugada
- **WHEN** o modo switch está ligado, os horários são os padrão e o horário é 03:00
- **THEN** o tema ativo é "Dark Sensation"

#### Scenario: Intervalo claro atravessando a meia-noite
- **WHEN** o início do claro é 20:00, o início do escuro é 08:00 e o horário é 23:00
- **THEN** o tema ativo é "Light Sensation"

### Requirement: Transição no horário
Com o modo switch ligado, a extensão SHALL trocar o tema em até 1 minuto depois de cada horário de transição enquanto o VS Code estiver aberto. Ao voltar de uma suspensão do sistema, SHALL corrigir o tema assim que a janela voltar a ter foco.

#### Scenario: Transição com o editor aberto
- **WHEN** o modo switch está ligado, o tema ativo é "Light Sensation" e o relógio passa do início do escuro
- **THEN** o tema ativo passa a ser "Dark Sensation" em até 1 minuto

#### Scenario: Retorno de suspensão
- **GIVEN** o modo switch está ligado e o computador foi suspenso às 17:00 com "Light Sensation" ativo
- **WHEN** o computador volta às 20:00 e a janela do VS Code recebe foco
- **THEN** o tema ativo passa a ser "Dark Sensation"

### Requirement: Desligar o modo switch por escolha manual
Com o modo switch ligado, se o usuário selecionar um tema diferente do que o horário atual indica, a extensão SHALL desligar o modo switch e SHALL deixar de alterar o tema.

#### Scenario: Usuário escolhe outro tema
- **GIVEN** o modo switch está ligado e o tema ativo é "Light Sensation"
- **WHEN** o usuário seleciona o tema "Monokai"
- **THEN** o modo switch é desligado
- **AND** o tema permanece "Monokai" depois do próximo horário de transição

#### Scenario: Usuário escolhe o tema Sensation oposto
- **GIVEN** o modo switch está ligado às 14:00 e o tema ativo é "Light Sensation"
- **WHEN** o usuário seleciona "Dark Sensation"
- **THEN** o modo switch é desligado
- **AND** o tema permanece "Dark Sensation" depois do próximo início do claro

#### Scenario: Usuário escolhe o tema que o horário já indica (known issue)
- **GIVEN** o modo switch está ligado às 14:00 e o tema ativo é "Light Sensation"
- **WHEN** o usuário seleciona "Light Sensation" no seletor de temas
- **THEN** o modo switch continua ligado, porque o VS Code não emite nenhum evento quando o tema selecionado é o mesmo
- **AND** o tema ativo passa a ser "Dark Sensation" no próximo início do escuro

### Requirement: Desligar o modo switch por troca feita com a extensão inativa
Na ativação, se o modo switch estiver ligado e o tema ativo for diferente do último tema aplicado pela extensão, a extensão SHALL desligar o modo switch e SHALL manter o tema ativo.

#### Scenario: Troca de tema com a extensão desabilitada
- **GIVEN** o modo switch estava ligado e a extensão aplicou "Light Sensation"
- **WHEN** o usuário desabilita a extensão, seleciona "Dark Sensation" e reabilita a extensão
- **THEN** o modo switch é desligado
- **AND** o tema permanece "Dark Sensation"

#### Scenario: Reinício sem troca manual
- **GIVEN** o modo switch está ligado e a extensão aplicou "Light Sensation"
- **WHEN** o VS Code é reiniciado sem que o usuário tenha trocado o tema
- **THEN** o modo switch continua ligado

### Requirement: Comando para desligar o modo switch
A extensão SHALL oferecer na paleta de comandos o comando "Sensation: Disable Auto Switch", que desliga o modo switch e mantém o tema ativo no momento. Esse comando é o contorno documentado para o caso em que a escolha manual do tema não desliga o modo.

#### Scenario: Desligar pelo comando
- **GIVEN** o modo switch está ligado e o tema ativo é "Dark Sensation"
- **WHEN** o usuário executa "Sensation: Disable Auto Switch"
- **THEN** o modo switch é desligado
- **AND** o tema permanece "Dark Sensation" depois do próximo início do claro

### Requirement: Horários de transição configuráveis
A extensão SHALL oferecer as configurações `sensation.switch.lightTime` (padrão "06:00") e `sensation.switch.darkTime` (padrão "18:30"), no formato HH:MM de 24 horas. Mudanças nessas configurações SHALL valer imediatamente.

#### Scenario: Sem configuração
- **WHEN** o usuário não alterou nenhuma configuração
- **THEN** o claro começa às 06:00 e o escuro às 18:30

#### Scenario: Alteração com o modo ligado
- **GIVEN** o modo switch está ligado, são 17:00 e o tema ativo é "Light Sensation"
- **WHEN** o usuário altera `sensation.switch.darkTime` para "16:00"
- **THEN** o tema ativo passa a ser "Dark Sensation" sem reiniciar o editor

### Requirement: Tolerância a horários inválidos
Se um horário configurado não estiver no formato HH:MM válido (horas 00 a 23, minutos 00 a 59), a extensão SHALL usar o valor padrão daquele horário e SHALL continuar alternando os temas normalmente.

#### Scenario: Horário malformado
- **WHEN** `sensation.switch.darkTime` vale "18h30"
- **THEN** a extensão usa 18:30 como início do escuro

#### Scenario: Horário fora do intervalo
- **WHEN** `sensation.switch.lightTime` vale "25:00"
- **THEN** a extensão usa 06:00 como início do claro

### Requirement: Aparência antes da ativação
O tema "Switch Sensation" SHALL ter a aparência do Dark Sensation, para que o editor nunca mostre um tema vazio ou quebrado enquanto a extensão ainda não aplicou o tema do horário.

#### Scenario: Seleção antes da extensão ativar
- **WHEN** "Switch Sensation" está selecionado e a extensão ainda não terminou de ativar
- **THEN** o editor exibe as cores do Dark Sensation sem erro de carregamento de tema
