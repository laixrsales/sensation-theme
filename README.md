# Sensation Theme

A VS Code theme inspired by Nestlé's Sensação chocolate.

## Themes

- **Dark Sensation**: brown base with pink and beige accents.
- **Light Sensation**: beige base with brown and pink details.
- **Switch Sensation**: alternates between Light Sensation and Dark Sensation by the time of day.

Pick a theme with **Preferences: Color Theme** (`Ctrl+K Ctrl+T`, or `Cmd+K Cmd+T` on macOS).

## Switch Sensation

Select **Switch Sensation** in the theme picker and you are done: no configuration needed. By default the editor uses Light Sensation from **06:00** and Dark Sensation from **18:30**.

After you select it, the picker shows Light Sensation or Dark Sensation as the active theme. That is expected: the switch stays on and changes between the two at the configured times.

### Changing the switch times

Open **Settings** (`Ctrl+,`), search for `sensation`, and set:

| Setting | Default | Description |
|---|---|---|
| `sensation.switch.lightTime` | `06:00` | When Light Sensation starts (24-hour `HH:MM`). |
| `sensation.switch.darkTime` | `18:30` | When Dark Sensation starts (24-hour `HH:MM`). |

Changes apply right away. Invalid values fall back to the defaults.

### Turning the switch off

- Pick any other theme, or
- Run **Sensation: Disable Auto Switch** from the Command Palette (`Ctrl+Shift+P`). The current theme stays active.

## Known Issues

- **Selecting the theme that is already active does not turn the switch off.** If Switch Sensation has applied Light Sensation and you select Light Sensation in the picker, VS Code does not report any change, so the switch stays on and changes to Dark Sensation at the next switch time. The same applies to Dark Sensation. To keep a fixed theme, run **Sensation: Disable Auto Switch**, or pick the other Sensation theme first and then the one you want.
