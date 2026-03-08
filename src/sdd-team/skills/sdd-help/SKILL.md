---
name: sdd-help
description: 'Learn about the SDD process and artifacts — quick overview, deep dives into each document type, team roles, and skill commands'
---

Answer questions about the Specification-Driven Development (SDD) approach, its artifacts, and how to use the `sdd-team` skills effectively.

**This is a knowledge and reference skill — it does not create or modify any files.** Use it when you want to understand the workflow, explore what an artifact should contain, or figure out what to do next.

**Input**: The argument after `/sdd-help` is your question or topic, for example:
- `/sdd-help` — show the overview and navigation menu
- `/sdd-help artifacts` — explain every artifact type
- `/sdd-help process` — walk through the full SDD lifecycle
- `/sdd-help prd` — deep dive on a specific artifact
- `/sdd-help what's next` — suggest the next step based on what exists in `sdd-docs/`

---

## Entry Point

1. **Read what already exists** — list `sdd-docs/` and `sdd-docs/changes/` (if they exist) to understand the project's current SDD state.

2. **Interpret the user's input**:
   - No input or "overview" → display the **SDD Overview** and the **Navigation Menu**
   - Topic keyword (artifact name, phase name, skill name, role) → go straight to that section
   - "what's next" or "where am I" → assess current state and recommend the next step
   - Free-form question → answer directly, referencing the relevant sections below

3. **Display the Navigation Menu** after any response longer than a quick answer, so the user can continue exploring:

```
📖 sdd-help — What would you like to explore?

[1] SDD Overview        — What SDD is and why it works
[2] Full Process        — All 7 stages from idea to archive
[3] Artifacts           — Every document type explained
[4] Skills & Commands   — When and how to use each slash command
[5] Team Roles          — Which agent to use for each task
[6] What's Next         — Assess project state and suggest next step
```

---

## [1] SDD Overview

**Specification-Driven Development (SDD)** is a workflow where every change starts with a written specification before any code is written.

### Core idea

```
Think → Write → Review → Implement → Verify → Archive
```

Instead of jumping straight to code, SDD captures decisions in structured documents. Those documents serve as the single source of truth for the entire team (human and AI alike).

### Why it works

| Traditional approach | SDD approach |
|---|---|
| Decisions live in chat, memory, or nowhere | Decisions live in versioned documents |
| AI agents guess what you want | Agents read specs before acting |
| Changes are hard to review | Every change has a traceable paper trail |
| Context is lost between sessions | `sdd-docs/` persists context across sessions |

### Key principle: specs before code

Every change travels through three layers:
1. **Global documents** (`prd.md`, `ux.md`, `architecture.md`) — shared context for the whole project
2. **Change artifacts** (`proposal.md`, `design.md`, `tasks.md`) — scoped context for one change
3. **Capability specs** (`specs/<name>/spec.md`) — testable requirements for new capabilities

Agents read these files at the start of every session, so context is never lost.

---

## [2] Full Process

The SDD lifecycle has two phases: **Project Setup** (done once) and the **Change Lifecycle** (repeated for every feature or fix).

### Phase A — Project Setup (done once)

```
/sdd-prd → /sdd-ux → /sdd-arch
```

| Step | Skill | Output | Purpose |
|---|---|---|---|
| 1 | `/sdd-prd` | `sdd-docs/prd.md` | Define WHAT the product is and WHY |
| 2 | `/sdd-ux` | `sdd-docs/ux.md`, `sdd-docs/prototype-*.html` | Define how users will experience it |
| 3 | `/sdd-arch` | `sdd-docs/architecture.md` | Define HOW the system is built |

These three documents are **global** — they apply to the whole project and are updated as the product evolves.

### Phase B — Change Lifecycle (repeated per change)

```
/sdd-propose → [/sdd-explore] → /sdd-implement → /sdd-verify → /sdd-archive
```

| Step | Skill | Output | Purpose |
|---|---|---|---|
| 4 | `/sdd-propose <name>` | `sdd-docs/changes/<name>/` artifacts | Scope the change and generate implementation plan |
| 5 *(optional)* | `/sdd-explore [topic]` | Thinking, diagrams, decisions | Investigate before or during implementation |
| 6 | `/sdd-implement [name]` | Code and tests | Build the change test-first |
| 7 | `/sdd-verify [name]` | Verification report | Confirm implementation matches the spec |
| 8 | `/sdd-archive [name]` | Archived change + synced specs | Close out the change |

### Flowchart

```
sdd-docs/ exists?
└── No  → Start with /sdd-prd
└── Yes →
        prd.md exists?
        └── No  → /sdd-prd first
        └── Yes →
                ux.md exists?
                └── No  → /sdd-ux (optional but recommended), then check architecture
                └── Yes →
                        architecture.md exists?
                        └── No  → /sdd-arch (optional but recommended)
                        └── Yes →
                                Ready to work? → /sdd-propose <change-name>
                                                 → /sdd-implement
                                                 → /sdd-verify
                                                 → /sdd-archive
```

---

## [3] Artifacts

### Global documents

These live at the root of `sdd-docs/` and apply to the whole project.

---

#### `sdd-docs/prd.md` — Product Requirements Document

**Purpose:** Defines WHAT the product is and WHY it exists. The highest-level shared truth.

**Created by:** `/sdd-prd` with the `sdd-pm-agent`

**Key sections:**
- Executive Summary — vision, target users, problem being solved
- Success Criteria — measurable goals (user, business, technical)
- Product Scope — MVP / Growth / Vision tiers
- User Journeys — narrative stories for each user type
- Functional Requirements — `FR#: [Actor] can [capability]` format
- Non-Functional Requirements — performance, security, accessibility

**When to update:** When product scope, user journeys, or functional requirements change. Use `/sdd-prd` (edit workflow) or `/sdd-propose` (automated pipeline).

**Tip:** Every Functional Requirement should be testable: "Users can export their data as CSV" — not "The system will support data exports."

---

#### `sdd-docs/ux.md` — UX Design Document

**Purpose:** Defines how users experience the product — design decisions, component inventory, wireframes, and prototype spec.

**Created by:** `/sdd-ux` with the `sdd-ux-designer-agent`

**Key sections:**
- Project Vision — platform, brand constraints, success definition
- Design Decisions Log — navigation pattern, content density, color approach, form interaction, feedback states
- Component Inventory — reusable UI building blocks (Button, Input, Card, Nav, etc.)
- Key Screen Wireframes — ASCII text wireframes for 2–3 key screens
- Prototype Specification — scope, interactions, breakpoints, design tokens

**Companion file:** `sdd-docs/prototype-<project-name>.html` — a standalone, working HTML/CSS prototype.

**When to update:** When new screens are added, design decisions change, or the component inventory grows.

---

#### `sdd-docs/architecture.md` — Architecture Document

**Purpose:** Defines HOW the system is built — tech stack, data architecture, API surface, naming conventions, project structure.

**Created by:** `/sdd-arch` with the `sdd-architect-agent`

**Key sections:**
- Project Classification — type, domain, complexity, greenfield vs brownfield
- Starter Template — chosen scaffold and inherited decisions
- Core Architectural Decisions — database, auth, API design, frontend, infrastructure
- Implementation Patterns — naming conventions, file structure, error handling, response formats
- Project Directory Tree — real file and folder structure (no generic placeholders)
- API Surface — endpoint table with method, path, auth, description

**When to update:** When technology choices change, new architectural patterns emerge, or the API surface expands.

---

### Change artifacts

Every change lives in its own folder: `sdd-docs/changes/<change-name>/`

A *change* is a named, scoped unit of work — a feature, bug fix, or improvement. Changes are created by `/sdd-propose` and archived by `/sdd-archive`.

---

#### `proposal.md` — What & Why

**Purpose:** Scope definition. Answers: what are we building and why does it matter?

**Created by:** `/sdd-propose` (Phase 4a)

**Key sections:**
- Why — motivation, problem, urgency
- What Changes — specific new capabilities, modifications, removals
- Capabilities — list of new/modified capabilities (each maps to a `specs/<name>/spec.md`)
- Impact — affected code, APIs, dependencies, systems

**Rule:** This file must exist before `design.md` or `tasks.md` can be created.

---

#### `design.md` — How

**Purpose:** Technical approach. Answers: how will we implement what the proposal describes?

**Created by:** `/sdd-propose` (Phase 4b), after `proposal.md` exists

**Key sections:**
- Context — background and current state
- Goals / Non-Goals — what this design achieves and what it explicitly excludes
- Decisions — key design decisions and rationale
- Risks / Trade-offs — known risks and how they are mitigated

**Rule:** Design decisions here must be consistent with `architecture.md`. If they diverge, update the architecture first.

---

#### `tasks.md` — Implementation Steps

**Purpose:** Ordered, checkable task list for implementing the change.

**Created by:** `/sdd-propose` (Phase 4c), after `design.md` exists

**Format:**
```markdown
## 1. Task Group Name

- [ ] 1.1 Task description
- [ ] 1.2 Task description

## 2. Another Task Group

- [ ] 2.1 Task description
```

**Rule:** Tasks must be granular enough that each one is independently verifiable. `- [ ]` is incomplete, `- [x]` is done. `/sdd-implement` reads this file and marks tasks as it goes.

---

#### `specs/<capability>/spec.md` — Capability Specification

**Purpose:** Testable requirements and scenarios for a specific capability introduced or modified by the change.

**Location:** `sdd-docs/changes/<name>/specs/<capability>/spec.md`

**Created by:** `/sdd-propose` (Phase 4d), only when new capabilities are introduced

**Format:**
```markdown
## ADDED Requirements

### Requirement: <requirement name>
<requirement text>

#### Scenario: <scenario name>
- **WHEN** <condition>
- **THEN** <expected outcome>
```

**Lifecycle:** Delta specs start inside a change folder. When the change is archived, `/sdd-archive` syncs them into `sdd-docs/specs/<capability>/spec.md` — the permanent capability registry.

---

### Relationship map

```
sdd-docs/
├── prd.md              ← Global: WHAT and WHY (whole product)
├── ux.md               ← Global: UX design decisions
├── architecture.md     ← Global: HOW the system is built
├── prototype-*.html    ← Global: living HTML prototype
├── specs/              ← Global: permanent capability registry
│   └── <capability>/
│       └── spec.md
└── changes/
    ├── <change-name>/  ← Change: one scoped unit of work
    │   ├── proposal.md     ← What & why
    │   ├── design.md       ← How
    │   ├── tasks.md        ← Implementation steps
    │   └── specs/          ← Delta specs (synced to global on archive)
    │       └── <capability>/
    │           └── spec.md
    └── archive/        ← Completed changes (date-prefixed)
        └── YYYY-MM-DD-<name>/
```

---

## [4] Skills & Commands

| Command | Phase | Purpose | Suggested Agent |
|---|---|---|---|
| `/sdd-prd` | Setup | Create or update the PRD | `sdd-pm-agent` |
| `/sdd-ux` | Setup | Create or update the UX design and prototype | `sdd-ux-designer-agent` |
| `/sdd-arch` | Setup | Create or update the architecture document | `sdd-architect-agent` |
| `/sdd-propose <name>` | Change | Create all change artifacts in one pipeline | `sdd-pm-agent` |
| `/sdd-explore [topic]` | Change | Free-form thinking; read files, no code written | Any |
| `/sdd-implement [name]` | Change | Implement tasks test-first | `sdd-dev-agent` |
| `/sdd-verify [name]` | Change | Verify implementation matches specs | Any |
| `/sdd-archive [name]` | Change | Sync delta specs and archive completed change | Any |
| `/sdd-help [topic]` | Any | Learn about SDD process and artifacts | Any |

### Choosing the right skill

```
Starting a new project?
  → /sdd-prd first, then /sdd-ux and /sdd-arch

Adding a feature or fixing a bug?
  → /sdd-propose <change-name>
  → /sdd-implement when artifacts are ready

Not sure what to implement?
  → /sdd-explore to think it through first

Done with implementation?
  → /sdd-verify to confirm spec compliance
  → /sdd-archive to close out

Lost or unsure what's next?
  → /sdd-help what's next
```

---

## [5] Team Roles

Each agent brings a specialized perspective. Switch to the recommended agent for best results.

| Agent | Handle | Expertise | Best used for |
|---|---|---|---|
| Product Manager | `sdd-pm-agent` | PRD creation, requirements discovery, stakeholder alignment | `/sdd-prd`, `/sdd-propose`, scope decisions |
| System Architect | `sdd-architect-agent` | Distributed systems, API design, tech stack decisions | `/sdd-arch`, trade-off analysis, architecture review |
| Senior Software Engineer | `sdd-dev-agent` | TDD, code implementation, adversarial code review | `/sdd-implement`, `/sdd-verify`, code review |
| Design Studio | `sdd-ux-designer-agent` | UX brainstorming, design decisions, HTML/CSS prototyping | `/sdd-ux`, design decisions, prototype iteration |

---

## [6] What's Next

When the user asks "what's next", "where am I", or similar:

1. **Inspect the current state** of `sdd-docs/`:
   - Does `prd.md` exist?
   - Does `ux.md` exist?
   - Does `architecture.md` exist?
   - Are there active changes in `sdd-docs/changes/`? (excluding `archive/`)
   - Do any active changes have incomplete tasks in `tasks.md`?

2. **Recommend the next step** based on what you find:

| State | Recommendation |
|---|---|
| No `sdd-docs/` at all | Start with `/sdd-prd` to define your product |
| `prd.md` missing | Run `/sdd-prd` — required before proposing any change |
| `prd.md` exists, no `ux.md` or `architecture.md` | Run `/sdd-ux` then `/sdd-arch` to complete project setup |
| Setup complete, no active changes | Run `/sdd-propose <name>` to start your first change |
| Active change exists with no `tasks.md` | Run `/sdd-propose <name>` to generate missing artifacts |
| Active change with incomplete tasks | Run `/sdd-implement <name>` to continue implementation |
| All tasks complete, not verified | Run `/sdd-verify <name>` to confirm spec compliance |
| All tasks complete and verified | Run `/sdd-archive <name>` to close out the change |

3. **Show the user the state you found** so they can correct any misreading before acting.

---

## Guardrails

- **Read-only skill** — never create, modify, or delete any file. If the user wants to create or update a document, direct them to the appropriate skill command.
- **Reference real paths** — when mentioning files, always use the actual path format (`sdd-docs/prd.md`, `sdd-docs/changes/<name>/proposal.md`).
- **Assess current state first** — always inspect `sdd-docs/` before answering "what's next" or making recommendations.
- **Stay factual** — describe the artifacts and process as they are defined in the skill files, not as general best practices.
- **Suggest, don't act** — offer the next command to run; let the user decide when to switch skills.
