const vscode = require('vscode');

const SWITCH_THEME = "Switch Sensation";
const LIGHT_THEME = "Light Sensation";
const DARK_THEME = "Dark Sensation";

const DEFAULT_LIGHT_TIME = "06:00";
const DEFAULT_DARK_TIME = "18:30";

const ENABLED_KEY = "sensation.switch.enabled";
const LAST_APPLIED_KEY = "sensation.switch.lastApplied";
const WELCOMED_KEY = "sensation.switch.welcomed";

const SAFETY_CHECK_MS = 60 * 1000;
const TRANSITION_DELAY_MS = 1000;

// Pure time logic (no vscode dependency). Times are minutes since midnight.

function parseTime(value) {
    const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(typeof value === "string" ? value.trim() : "");
    if (!match) {
        return undefined;
    }
    return Number(match[1]) * 60 + Number(match[2]);
}

function themeForTime(date, lightTime, darkTime) {
    const minutes = date.getHours() * 60 + date.getMinutes();

    if (lightTime === darkTime) {
        return DARK_THEME;
    }

    const isLight = lightTime < darkTime
        ? minutes >= lightTime && minutes < darkTime
        : minutes >= lightTime || minutes < darkTime;

    return isLight ? LIGHT_THEME : DARK_THEME;
}

function msUntilNextTransition(date, lightTime, darkTime) {
    const waits = [lightTime, darkTime].map(time => {
        const next = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(time / 60), time % 60);
        if (next <= date) {
            next.setDate(next.getDate() + 1);
        }
        return next - date;
    });
    return Math.min(...waits);
}

// VS Code integration

function readTimes() {
    const config = vscode.workspace.getConfiguration("sensation.switch");
    return {
        lightTime: parseTime(config.get("lightTime")) ?? parseTime(DEFAULT_LIGHT_TIME),
        darkTime: parseTime(config.get("darkTime")) ?? parseTime(DEFAULT_DARK_TIME)
    };
}

function activate(context) {
    let transitionTimer;
    let safetyInterval;

    const isEnabled = () => context.globalState.get(ENABLED_KEY, false);
    const currentTheme = () => vscode.workspace.getConfiguration("workbench").get("colorTheme");

    function expectedTheme() {
        const { lightTime, darkTime } = readTimes();
        return themeForTime(new Date(), lightTime, darkTime);
    }

    async function applyExpectedTheme() {
        const theme = expectedTheme();

        if (context.globalState.get(LAST_APPLIED_KEY) !== theme) {
            await context.globalState.update(LAST_APPLIED_KEY, theme);
        }
        if (currentTheme() !== theme) {
            await vscode.workspace.getConfiguration("workbench").update(
                "colorTheme",
                theme,
                vscode.ConfigurationTarget.Global
            );
        }
    }

    function scheduleNextTransition() {
        clearTimeout(transitionTimer);
        const { lightTime, darkTime } = readTimes();
        const wait = msUntilNextTransition(new Date(), lightTime, darkTime) + TRANSITION_DELAY_MS;

        transitionTimer = setTimeout(() => {
            applyExpectedTheme();
            scheduleNextTransition();
        }, wait);
    }

    function stopTimers() {
        clearTimeout(transitionTimer);
        clearInterval(safetyInterval);
        transitionTimer = undefined;
        safetyInterval = undefined;
    }

    function start() {
        applyExpectedTheme();
        scheduleNextTransition();
        if (!safetyInterval) {
            safetyInterval = setInterval(applyExpectedTheme, SAFETY_CHECK_MS);
        }
    }

    function showWelcomeOnce() {
        if (context.globalState.get(WELCOMED_KEY, false)) {
            return;
        }
        context.globalState.update(WELCOMED_KEY, true);
        vscode.window.showInformationMessage(
            `Switch Sensation is on: the editor will alternate between ${LIGHT_THEME} and ${DARK_THEME} ` +
            `by the time of day. To turn it off, pick another theme or run "Sensation: Disable Auto Switch".`
        );
    }

    async function enable() {
        await context.globalState.update(ENABLED_KEY, true);
        start();
        showWelcomeOnce();
    }

    async function disable() {
        stopTimers();
        await context.globalState.update(ENABLED_KEY, false);
    }

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("workbench.colorTheme")) {
                const theme = currentTheme();
                if (theme === SWITCH_THEME) {
                    enable();
                } else if (isEnabled()) {
                    // A theme equal to the expected one was written by us (or another window).
                    if (theme === expectedTheme()) {
                        applyExpectedTheme();
                    } else {
                        disable();
                    }
                }
            } else if (isEnabled() && e.affectsConfiguration("sensation.switch")) {
                start();
            }
        }),

        vscode.window.onDidChangeWindowState(state => {
            if (state.focused && isEnabled()) {
                start();
            }
        }),

        vscode.commands.registerCommand("sensation.disableAutoSwitch", async () => {
            if (!isEnabled()) {
                vscode.window.showInformationMessage("Sensation auto switch is already off.");
                return;
            }
            await disable();
            vscode.window.showInformationMessage(`Sensation auto switch is off. "${currentTheme()}" will stay active.`);
        }),

        { dispose: stopTimers }
    );

    const theme = currentTheme();
    if (theme === SWITCH_THEME) {
        enable();
    } else if (isEnabled()) {
        // The theme changed while the extension was not running: respect that choice.
        if (theme === context.globalState.get(LAST_APPLIED_KEY)) {
            start();
        } else {
            disable();
        }
    }
}

function deactivate() {}

module.exports = { activate, deactivate, parseTime, themeForTime, msUntilNextTransition };
