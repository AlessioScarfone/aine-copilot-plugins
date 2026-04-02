# AINE Plugin Collection 

Collection of GitHub Copilot Plugins, each designed to embed a specialized workflow directly into your editor. This repository hosts multiple plugins that share a build pipeline and can be installed independently.

- [AINE Plugin Collection](#aine-plugin-collection)
  - [Available plugins](#available-plugins)
  - [Requirements](#requirements)
  - [Installation](#installation)
    - [Install from github repo](#install-from-github-repo)
    - [Manual installation (local build)](#manual-installation-local-build)
  - [Project Structure](#project-structure)
  - [Development](#development)
    - [Build](#build)
    - [Plugin variables](#plugin-variables)
    - [Shared assets](#shared-assets)
    - [@embed directive](#embed-directive)
    - [Create new plugin](#create-new-plugin)
    - [Review SKILL with TESSL](#review-skill-with-tessl)
    - [Evaluate a skill](#evaluate-a-skill)
  - [VS Code Documentation](#vs-code-documentation)

## Available plugins

| Plugin | Description 
|---|---|
| [`sdd-team`](src/sdd-team/README.md) | A full software-development team powered by Specification-Driven Development (SDD) |
| [`mini-sdd`](src/mini-sdd/README.md) | A minimal spec-driven development framework — context -> spec -> implement |
| [`aine-agents`](src/aine-agents/README.md) | Specialist engineering agents for code exploration, architecture planning, and high-signal code review, plus a guided `/feature-dev` workflow |

---

## Requirements

- **VS Code** 1.100 or later
- **GitHub Copilot** subscription with Agent mode enabled

---

## Installation

### Install from github repo

[Configure plugin marketplaces](https://code.visualstudio.com/docs/copilot/customization/agent-plugins#_configure-plugin-marketplaces)

### Manual installation (local build)

Clone this repository, run `nvm use && npm ci && npm run build`. Then follow instruction here: [Use local plugins](https://code.visualstudio.com/docs/copilot/customization/agent-plugins#_use-local-plugins). 

Example:
```json
"chat.plugins.paths": {
  "path/aine-copilot-plugins/dist/plugins/sdd-team": true
},
```

After installation, the agents and skills are immediately available in the Copilot Chat panel.

---

## Project Structure

```
aine-team-copilot-plugin/
├── src/                          # Plugin source files (one subfolder per plugin)
│   ├── sdd-team/                 # sdd-team plugin source
│   │   ├── plugin.json           # Plugin manifest (source)
│   │   ├── config.json           # Build variables and shared asset mappings
│   │   ├── shared-assets/               # Shared assets (distributed to skills at build time)
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

To add a new plugin, create a new directory under `src/` with a `plugin.json` and any agents and skills — the build will pick it up automatically, or use the dedicated script `npm run plugin:create`

> [!WARNING]
> The plugin format does not support `prompts`, but you can include a `prompts/` folder in your plugin and it will be converted into a skill by the build process.

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
<!-- @embed assets/my-template.md -->
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

### Review SKILL with TESSL

Validate a skill (or all skills in a plugin) against the [tessl](https://tessl.io) spec. Run `npm run build` first to populate `dist/plugins/`.

```bash
npm run skill:review
```

The CLI will prompt you to pick a plugin and a skill (or "All skills" for an aggregated report).

For non-interactive use — e.g. in CI:

```bash
Usage: npm run skill:review -- [options]

Options:
  -p, --plugin <name>   Plugin to review (must exist in dist/plugins/)
  -s, --skill  <name>   Single skill to review
  -a, --all             Review all skills in the plugin and print a summary table
  -j, --json            Output raw JSON (single skill) or aggregated JSON (--all)
```


### Evaluate a skill

Skills can be evaluated with a draft-test-review-iterate loop powered by the [skill-creator](https://github.com/anthropics/skills) skill. The loop runs test prompts against the skill and a no-skill baseline, grades assertions automatically, and opens an interactive viewer so you can review outputs and leave feedback.

**Prerequisites**: install `skill-creator` globally:

```bash
npx skills add https://github.com/anthropics/skills --skill skill-creator
```

**Example prompt** (paste into Copilot Chat with the skill-creator active):

```
I already have a skill in #file:src/mini-sdd — I want to create evals for the
#file:src/mini-sdd/skills/mini-sdd-context skill. Read #file:src/mini-sdd/README.md
for context on what the skill is supposed to do.
```

The skill-creator will:
1. Propose 2–3 realistic test cases for you to approve
2. Create input fixture files under `skills/<skill-name>/evals/files/`
3. Save test cases to `skills/<skill-name>/evals/evals.json`
4. Spawn parallel subagent runs — one with the skill, one baseline — per test case
5. Draft and grade assertions while runs are in progress
6. Aggregate results into `<skill-name>-workspace/iteration-1/benchmark.json`
7. Open a static HTML viewer (`/tmp/<skill-name>-review.html`) for qualitative review

After reviewing, tell the skill-creator what you'd like to improve and ask for another iteration. Repeat until satisfied.

---

## VS Code Documentation

For more information on Agent Plugins, see the official VS Code documentation:  
https://code.visualstudio.com/docs/copilot/customization/agent-plugins
