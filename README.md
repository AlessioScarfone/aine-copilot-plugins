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

## sdd-team Plugin

`sdd-team` brings a full virtual software-development team into your editor. It provides four specialized agents and eight skills that collaborate through a **Specification-Driven Development (SDD)** workflow: ideas are captured in structured documents first, then implemented from those documents.

### Agents

Switch to an agent by typing `@agent-name` in the Copilot Chat panel.

| Agent | Handle | Role |
|---|---|---|
| Product Manager | `@pm` | PRD creation, requirements discovery, stakeholder alignment |
| System Architect | `@architect` | Architecture documentation, system design, trade-off analysis |
| Senior Software Engineer | `@dev` | TDD implementation, code review, story execution |
| Design Studio | `@ux-designer` | UX brainstorming, design decisions, HTML/CSS prototyping |

Each agent is a collaborative peer — it asks questions, presents options, and waits for your confirmation before proceeding.

### Skills (Slash Commands)

Skills are invoked as slash commands inside any agent conversation.

**Global project documents** — create or update the shared documents that all agents use as context:

| Command | Description | Output |
|---|---|---|
| `/sdd-prd` | Create or update the Product Requirements Document | `sdd-docs/prd.md` |
| `/sdd-ux` | Create or update the UX design document and HTML prototype | `sdd-docs/ux.md`, `sdd-docs/prototype-*.html` |
| `/sdd-arch` | Create or update the architecture document | `sdd-docs/architecture.md` |

**Change lifecycle** — a *change* is a named, scoped unit of work (a feature, bug fix, or improvement) living in `sdd-docs/changes/<name>/`:

| Command | Description |
|---|---|
| `/sdd-propose <name>` | Propose a change — creates `proposal.md`, `design.md`, and `tasks.md` |
| `/sdd-explore [topic]` | Enter explore mode for open-ended thinking; no code is written |
| `/sdd-implement [name]` | Implement the tasks for a change using TDD |
| `/sdd-verify [name]` | Verify that the implementation matches the change artifacts |
| `/sdd-archive [name]` | Archive a completed and verified change |

### SDD Workflow

```mermaid
flowchart TD
    PRD["/sdd-prd — Define product requirements"] --> UX
    UX["/sdd-ux — Design UX & create prototype"] --> ARCH
    ARCH["/sdd-arch — Define system architecture"] --> PROPOSE

    PROPOSE["/sdd-propose — Scope change & generate artifacts"] --> EXPLORE

    EXPLORE{{"Exploration needed?"}}
    EXPLORE -- Yes --> EX["/sdd-explore — Think & research"]
    EX --> IMPLEMENT
    EXPLORE -- No --> IMPLEMENT

    IMPLEMENT["/sdd-implement — Build change test-first"] --> VERIFY
    VERIFY["/sdd-verify — Confirm implementation matches spec"] --> ARCHIVE
    ARCHIVE["/sdd-archive — Close out change"]

    style PRD fill:#4A90D9,color:#fff
    style UX fill:#7B68EE,color:#fff
    style ARCH fill:#5BA854,color:#fff
    style PROPOSE fill:#E8A838,color:#fff
    style IMPLEMENT fill:#E8A838,color:#fff
    style VERIFY fill:#E8A838,color:#fff
    style ARCHIVE fill:#888,color:#fff
    style EX fill:#D95B5B,color:#fff
```

```
1. /sdd-prd          → Define what the product does and why
2. /sdd-ux           → Define the user experience and create a prototype
3. /sdd-arch         → Define how the system is built
4. /sdd-propose      → Scope a change and generate implementation artifacts
5. /sdd-implement    → Build the change test-first
6. /sdd-verify       → Confirm the implementation matches the spec
7. /sdd-archive      → Close out the change
```

For small changes, `/sdd-propose` followed by `/sdd-implement` is often sufficient. For exploratory work, start with `/sdd-explore`.

### Document structure

All SDD documents are stored in a `sdd-docs/` directory at the root of your project:

```
sdd-docs/
├── prd.md                    # Product Requirements Document
├── ux.md                     # UX design document
├── architecture.md           # Architecture document
├── prototype-<project>.html  # Interactive HTML prototype
└── changes/
    ├── <change-name>/
    │   ├── proposal.md       # What & why
    │   ├── design.md         # How
    │   └── tasks.md          # Implementation steps
    └── archive/              # Completed changes
```

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
├── plugins/                      # Built output — one subfolder per plugin (committed)
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
