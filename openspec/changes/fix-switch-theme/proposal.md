# Proposal

## Why

O tema "Switch Sensation" deveria alternar entre o Light Sensation e o Dark Sensation conforme a hora do dia (default), ou de acordo com a hora escolhida pelo usuário. Hoje ele troca uma única vez, no momento em que é selecionado, e depois para. A extensão usa o tema ativo para saber se o modo switch está ligado, mas a primeira coisa que o switch faz é trocar o tema ativo, e com isso essa informação se perde. Além disso, o `placeholder.json` está vazio e o VS Code não consegue carregá-lo. A versão 1.2.0 registra o recurso no CHANGELOG como entregue, mas para quem instala ele não funciona.

A extensão deve funcionar sem configuração: quem instala só escolhe "Switch Sensation" no seletor de temas e o tema passa a alternar sozinho.

## What Changes

- O "Switch Sensation" continua no seletor de temas e passa a ser a forma de **ligar o modo switch**. O estado do modo fica guardado pela extensão e não depende mais do tema ativo.
- A extensão alterna entre Light Sensation e Dark Sensation nos horários de transição, e também ao iniciar e quando a janela volta a ter foco (por exemplo, depois de o computador sair da suspensão).
- Se o usuário escolher manualmente outro tema, o modo switch desliga. Também é adicionado um comando para desligar o modo explicitamente. Isso também vale caso o usuário escolha os temas "Light Sensation" ou "Dark Sensation".
- **Known issue**: se o usuário escolher o tema que o switch já aplicou (por exemplo, "Light Sensation" durante o horário do claro), o VS Code não emite nenhum evento e o modo continua ligado. O contorno é o comando "Sensation: Disable Auto Switch". O caso fica documentado no README.
- Os dois horários de transição passam a ser configuráveis pelo usuário, com padrões 06:00 (início do claro) e 18:30 (início do escuro) que dispensam configuração. Hoje o início do claro está fixo no código.
- Horários inválidos nas configurações deixam de quebrar a lógica: a extensão usa o horário padrão.
- O `placeholder.json` vazio é removido. A entrada "Switch Sensation" passa a apontar para o arquivo do tema escuro, para nunca exibir um tema quebrado.
- **BREAKING**: as configurações `autoTheme.*` passam para o namespace `sensation.switch.*`. O valor antigo de `autoTheme.switchTime` continua sendo lido como fallback. As configurações `autoTheme.lightTheme` e `autoTheme.darkTheme` são removidas, e o switch alterna sempre entre os dois temas Sensation.
- A ativação muda de `"*"` para `onStartupFinished`.
- O CHANGELOG ganha uma entrada **Fixed** para a correção do switch.
- É criado um `README.md` mínimo, com o uso do switch (como ligar, desligar e mudar os horários) e uma seção **Known Issues**. O README completo, com instalação e screenshots, fica para uma change separada.

## Capabilities

### New Capabilities
- `theme-switch`: modo de alternância automática entre os temas Light Sensation e Dark Sensation conforme a hora definida. Cobre como o modo liga e desliga, o agendamento das transições e as configurações de horário.

### Modified Capabilities

(nenhuma: não há specs existentes)

## Impact

- `src/extension.js`: reescrita da lógica de ativação, estado e agendamento.
- `package.json`: entrada do tema Switch, `activationEvents`, configurações (`sensation.switch.*`) e novo comando.
- `themes/placeholder.json`: removido.
- `CHANGELOG.md`: nova entrada em `[Unreleased]`.
- `README.md`: novo arquivo, com uso do switch e Known Issues.
- Os temas Light e Dark (`themes/sensation-*-theme.json`) não mudam.
- Quem tinha configurado `autoTheme.lightTheme` ou `autoTheme.darkTheme` perde essa personalização.
