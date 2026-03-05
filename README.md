# AINE Plugin Collection — GitHub Copilot Agent Plugins

Collection of GitHub Copilot Agent Plugins, each designed to embed a specialized workflow directly into your editor. This repository hosts multiple plugins that share a common build pipeline and can be installed independently.

**Current plugins:**

| Plugin | Description |
|---|---|
| [`sdd-team`](src/sdd-team/README.md) | A full software-development team powered by Specification-Driven Development (SDD) |

---

## Requirements

- **VS Code** 1.100 or later
- **GitHub Copilot** subscription with Agent mode enabled

---

## Installation

### Install from github repo

[Configure plugin marketplaces](https://code.visualstudio.com/docs/copilot/customization/agent-plugins#_configure-plugin-marketplaces)

### Manual installation (local build):

Clone this repository, run `nvm use && npm ci && npm run build`. Then follow instruction here: [Use local plugins](https://code.visualstudio.com/docs/copilot/customization/agent-plugins#_use-local-plugins). 

Example:
```json
"chat.plugins.paths": {
   "path/aine-copilot-plugins/plugins/sdd-team": true
},
```

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

Each skill that **generates** documents includes its own templates in a `templates/` subdirectory.
Skills that only **read** documents (sdd-implement, sdd-explore, sdd-verify, sdd-archive) do not include templates.
The build process automatically includes these templates in the plugin distribution.

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

### Create new plugin

```bash
npm run plugin:create
```

This command scaffolds a new plugin directory under `src/` with a basic `plugin.json`. You can then customize these files to build your plugin.

---

## VS Code Documentation

For more information on Agent Plugins, see the official VS Code documentation:  
https://code.visualstudio.com/docs/copilot/customization/agent-plugins
