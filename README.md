# AINE Plugin Collection — GitHub Copilot Agent Plugins

AINE is a collection of GitHub Copilot Agent Plugins, each designed to embed a specialized workflow directly into your editor. This repository hosts multiple plugins that share a common build pipeline and can be installed independently.

**Current plugins:**

| Plugin | Description |
|---|---|
| [`sdd-team`](#sdd-team-plugin) | A full software-development team powered by Specification-Driven Development (SDD) |

---

## Requirements

- **VS Code** 1.99 or later
- **GitHub Copilot** subscription with Agent mode enabled

---

## Installation

Agent Plugins are installed directly from a GitHub repository. No marketplace listing or extension file is required.

1. Open VS Code and make sure the **GitHub Copilot** extension is installed and signed in.
2. Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and run:
   ```
   GitHub Copilot: Install Chat Extension from GitHub
   ```
3. Enter the repository path and plugin name when prompted:
   ```
   github/aine-team-copilot-plugin
   ```
4. VS Code will discover the plugin manifests under `plugins/` and let you choose which plugin to install.

> **Manual installation (local build):** Clone this repository, run `npm run build`, then install from the generated `plugins/<plugin-name>/.github/plugin/plugin.json` using the same command above and pointing to the local path.

After installation, the agents and skills are immediately available in the Copilot Chat panel.

---

## Plugins

### sdd-team

`sdd-team` brings a full virtual software-development team into your editor, powered by a Specification-Driven Development (SDD) workflow.

→ See [src/sdd-team/README.md](src/sdd-team/README.md) for full documentation.

---

## Project Structure

```
aine-team-copilot-plugin/
├── src/                          # Plugin source files (one subfolder per plugin)
│   ├── sdd-team/                 # sdd-team plugin source
│   │   ├── plugin.json           # Plugin manifest (source)
│   │   ├── agents/               # Agent definitions (.agent.md)
│   │   ├── prompts/              # Skill prompts (.prompt.md)
│   │   └── templates/            # Document templates
│   └── <your-new-plugin>/        # Add new plugins here
│       ├── plugin.json
│       └── ...
├── plugins/                      # Built output — one subfolder per plugin
│   └── sdd-team/
│       ├── .github/plugin/
│       │   └── plugin.json       # Final plugin manifest
│       ├── agents/
│       ├── skills/
│       └── templates/
└── scripts/                      # Build and validation scripts
```

Source files live in `src/`. Each subdirectory of `src/` is treated as an independent plugin and materialized into the corresponding `plugins/<name>/` directory by `npm run build`.

---

## Development

### Build

```bash
npm install
npm run build
```

The build script automatically discovers all plugin directories inside `src/` and for each one:

- Copies agents, skills, and templates into `plugins/<plugin-name>/`
- Converts `.prompt.md` files into skill `SKILL.md` files
- Places the final `plugin.json` at `plugins/<plugin-name>/.github/plugin/plugin.json`

To add a new plugin, create a new directory under `src/` with a `plugin.json` and any agents, prompts, and templates — the build will pick it up automatically.

### Validate

```bash
npm run plugin:validate
```

Validates that all paths referenced in every `plugin.json` point to existing files.

---

## VS Code Documentation

For more information on Agent Plugins, see the official VS Code documentation:  
https://code.visualstudio.com/docs/copilot/customization/agent-plugins
