# AINE Plugin Collection 

Collection of GitHub Copilot Plugins, each designed to embed a specialized workflow directly into your editor. This repository hosts multiple plugins that share a build pipeline and can be installed independently.

**Current plugins:**

| Plugin | Description 
|---|---|
| [`sdd-team`](src/sdd-team/README.md) | A full software-development team powered by Specification-Driven Development (SDD) |
| [`mini-sdd`](src/mini-sdd/README.md) | A minimal spec-driven development framework — context, spec, implement |

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
  "path/aine-copilot-plugins/dist/plugins/sdd-team": true
},
```

After installation, the agents and skills are immediately available in the Copilot Chat panel.

---

## Plugins

### sdd-team

`sdd-team` brings a full virtual software-development team into your editor, powered by a Specification-Driven Development (SDD) workflow.

→ See [src/sdd-team/README.md](src/sdd-team/README.md) for full documentation.

---

### mini-sdd

`mini-sdd` is a lightweight spec-driven framework with three skills: define project context, write feature specs, and implement them with task tracking.

→ See [src/mini-sdd/README.md](src/mini-sdd/README.md) for full documentation.

---

## Project Structure

```
aine-team-copilot-plugin/
├── src/                          # Plugin source files (one subfolder per plugin)
│   ├── sdd-team/                 # sdd-team plugin source
│   │   ├── plugin.json           # Plugin manifest (source)
│   │   ├── config.json           # Build variables and shared asset mappings
│   │   ├── assets/               # Shared assets (distributed to skills at build time)
│   │   │   └── assets/        # Templates shared across multiple skills
│   │   ├── agents/               # Agent definitions (.agent.md)
│   │   └── skills/               # Skill definitions (one subfolder per skill)
│   │       ├── sdd-help/         # Example skill with local-only assets
│   │       │    ├── SKILL.md      # Skill definition and prompt
│   │       │    └── references/   # Reference files local to this skill
│   │       └── ...
│   └── <your-new-plugin>/        # Add new plugins here
│       ├── plugin.json
│       └── ...
├── dist/plugins/                 # Built output — one subfolder per plugin
│   └── sdd-team/
│       ├── .github/plugin/
│       │   └── plugin.json       # Final plugin manifest
│       ├── agents/
│       └── skills/               # Each skill contains its distributed templates
│           ├── sdd-prd/
│           │   ├── SKILL.md
│           │   └── assets/    # Copied from plugin-level assets/ at build time
│           └── ...
└── scripts/                      # Build and validation scripts
```

Source files live in `src/`. Each subdirectory of `src/` is treated as an independent plugin and materialized into the corresponding `dist/plugins/<name>/` directory by `npm run build`.

Assets shared across multiple skills live in the plugin-level `shared-assets` folder and are distributed to the appropriate skill directories at build time via `sharedAssets` in `config.json`. Skills that use local-only assets (not shared) can keep their own files directly in their skill subfolder. If a shared asset has the same path as a local skill asset, the local version wins and the shared one is skipped for that skill.

---

## Development

### Build

```bash
npm install
npm run build
```

The build script automatically discovers all plugin directories inside `src/` and for each one:

- Copies agents, skills, and templates into `dist/plugins/<plugin-name>/`
- Converts `.prompt.md` files into skill `SKILL.md` files
- Places the final `plugin.json` at `dist/plugins/<plugin-name>/.github/plugin/plugin.json`
- Applies variable substitutions defined in `config.json` (see [Plugin variables](#plugin-variables) below)

To add a new plugin, create a new directory under `src/` with a `plugin.json` and any agents and skills — the build will pick it up automatically.

> [!WARNING]
> Plugin does not support `prompts`, but you can include a `prompts/` folder in your > > plugin and it will be converted into a skill by the build process.

### Plugin variables

Each plugin can define a `config.json` file at the root of its source directory to declare build-time variables:

```json
{
  "variables": {
    "ARTIFACT_MAIN_FOLDER": "sdd-docs"
  }
}
```

In any agent, skill, or template file use the placeholder `{VARIABLE_NAME}`. The build will replace every occurrence with the configured value across all text files (`.md`, `.json`, `.html`, `.yaml`) in the plugin output.

**Example** — in a skill file:

```
Read the PRD at `{ARTIFACT_MAIN_FOLDER}/prd.md`.
```

After build, this becomes:

```
Read the PRD at `sdd-docs/prd.md`.
```

This lets end users (or CI) customise paths and names without editing every skill file — just change the value in `config.json` and re-run `npm run build`.

### Shared assets

Templates or other files needed by multiple skills can be placed once in the plugin-level `assets/` folder and distributed to the right skills at build time, avoiding duplication.

Declare the mapping in `config.json` under `sharedAssets`:

```json
{
  "variables": { ... },
  "sharedAssets": [
    { "asset": "assets/prd.md", "skills": ["sdd-prd", "sdd-init"] },
    { "asset": "scripts/common.sh", "skills": ["*"] }
  ]
}
```

Each entry specifies:
- **`asset`** — path relative to the plugin's `shared-assets/` folder (file or directory)
- **`skills`** — list of skill folder names to copy it into, or `["*"]` to copy into every skill

During the build, each asset is copied into `skills/<skill-name>/<asset>` (e.g. `skills/sdd-prd/assets/prd.md`). The plugin-level `shared-assets/` folder is **not** included in the dist output — only the per-skill copies are.

**Local wins:** if a skill already contains a file at the same destination path, the shared asset is skipped and the local file is preserved. This makes it safe to override a shared asset for a specific skill without touching the others.

Variable substitution (see above) is applied to shared assets after they are copied, so `{VARIABLE_NAME}` placeholders work in shared templates too.

### @embed directive

The `@embed` directive lets you inline the contents of any file directly into a skill or agent markdown file at build time, without shipping the referenced file as a separate asset.

Place the directive anywhere in a `.md`, `.txt`, `.yaml`, `.yml`, `.json`, or `.html` file inside a plugin:

```md
<!-- @embed ./assets/my-template.md -->
```

During the build, the directive is replaced with the full contents of the referenced file. Paths are resolved **relative to the file that contains the directive**.

If the target file does not exist, the directive is left unchanged and a warning is printed to the console.

**When to use `@embed` vs shared assets**

| | `@embed` | Shared assets |
|---|---|---|
| Content appears inline in the skill | ✅ | ❌ (separate file) |
| Preserves progressive disclosure | ❌ (always loaded) | ✅ |
| Good for | Small, always-needed snippets | Templates read on demand |

### Create new plugin

```bash
npm run plugin:create
```

This command scaffolds a new plugin directory under `src/` with a basic `plugin.json`. You can then customize these files to build your plugin.


---

## VS Code Documentation

For more information on Agent Plugins, see the official VS Code documentation:  
https://code.visualstudio.com/docs/copilot/customization/agent-plugins
