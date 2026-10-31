# 📜 Changelog

All notable changes to this project will be documented in this file.  
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.3.0] - 2026-10-31
### Added
- **OpenSpec** setup for spec-driven planning of changes (`openspec/` directory and project context).
- Claude Code skills and commands for the OpenSpec workflow (`.claude/`).
- `Sensation: Disable Auto Switch` command to turn off **Switch Sensation** while keeping the current theme.
- `README.md` with usage instructions and known issues.

### Changed
- Switch times are now configured with `sensation.switch.lightTime` (default `06:00`) and `sensation.switch.darkTime` (default `18:30`). They replace `autoTheme.switchTime`, which is no longer read.
- The extension now activates on `onStartupFinished` instead of `*`.

### Removed
- `autoTheme.lightTheme` and `autoTheme.darkTheme` settings: **Switch Sensation** always alternates between Light Sensation and Dark Sensation.
- Empty `placeholder.json` theme file: **Switch Sensation** now shows the dark palette until the extension applies the theme for the current time.

### Fixed
- **Switch Sensation** now keeps alternating between Light Sensation and Dark Sensation; before, it switched only once, right after being selected. If you were affected, select **Switch Sensation** again.
- Description of the `autoTheme.darkTheme` setting (theme used during the night).

## [1.2.0] - 2025-09-29
### Added
- **Dynamic theme** that automatically switches between dark and light modes depending on the time of day.

## [1.1.0] - 2025-09-29
### Added
- **Light theme** for VSCode.  
- Palette based on **beige**, with **pink** and **brown** highlights.  
- Improved contrasts for better readability in light mode.  

## [1.0.0] - 2025-09-29
### Added
- Initial **dark theme** for VSCode.  
- Palette based on **brown**, with **pink** and **beige** highlights.
