const vscode = require('vscode');

function activate(context) {
    function applyThemeByTime() {
        const config = vscode.workspace.getConfiguration();
        const currentTheme = config.get("workbench.colorTheme");
        const switchTime = config.get("autoTheme.switchTime", "18:30");
        const lightTheme = config.get("autoTheme.lightTheme", "Light Sensation");
        const darkTheme = config.get("autoTheme.darkTheme", "Dark Sensation");

        if (currentTheme !== "Switch Sensation") {
            return;
        }

        const [switchHour, switchMinute] = switchTime.split(":").map(Number);

        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        let theme;
        if (hour > switchHour || (hour === switchHour && minute >= switchMinute) || hour < 6) {
            theme = darkTheme;
        } else {
            theme = lightTheme;
        }

        vscode.workspace.getConfiguration("workbench").update(
            "colorTheme",
            theme,
            vscode.ConfigurationTarget.Global
        );
    }

    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration("workbench.colorTheme")) {
            applyThemeByTime();
        }
    });

    applyThemeByTime();

    const interval = setInterval(applyThemeByTime, 5 * 60 * 1000);
    context.subscriptions.push({ dispose: () => clearInterval(interval) });
}

function deactivate() {}

module.exports = { activate, deactivate };
