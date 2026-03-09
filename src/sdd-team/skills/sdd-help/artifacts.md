# SDD Artifacts

## Global documents

These live at the root of `{ARTIFACT_MAIN_FOLDER}/` and apply to the whole project.

---

### `{ARTIFACT_MAIN_FOLDER}/{SHARED_SUBFOLDER}/prd.md` — Product Requirements Document

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

### `{ARTIFACT_MAIN_FOLDER}/{SHARED_SUBFOLDER}/ux.md` — UX Design Document

**Purpose:** Defines how users experience the product — design decisions, component inventory, wireframes, and prototype spec.

**Created by:** `/sdd-ux` with the `sdd-ux-agent`

**Key sections:**
- Project Vision — platform, brand constraints, success definition
- Design Decisions Log — navigation pattern, content density, color approach, form interaction, feedback states
- Component Inventory — reusable UI building blocks (Button, Input, Card, Nav, etc.)
- Key Screen Wireframes — ASCII text wireframes for 2–3 key screens
- Prototype Specification — scope, interactions, breakpoints, design tokens

**Companion file:** `{ARTIFACT_MAIN_FOLDER}/{SHARED_SUBFOLDER}/prototype-<project-name>.html` — a standalone, working HTML/CSS prototype.

**When to update:** When new screens are added, design decisions change, or the component inventory grows.

---

### `{ARTIFACT_MAIN_FOLDER}/{SHARED_SUBFOLDER}/architecture.md` — Architecture Document

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

## Change artifacts

Every change lives in its own folder: `{ARTIFACT_MAIN_FOLDER}/{CHANGE_SUBFOLDER}/<change-name>/`

A *change* is a named, scoped unit of work — a feature, bug fix, or improvement. Changes are created by `/sdd-propose` and archived by `/sdd-archive`.

---

### `proposal.md` — What & Why

**Purpose:** Scope definition. Answers: what are we building and why does it matter?

**Created by:** `/sdd-propose` (Phase 4a)

**Key sections:**
- Why — motivation, problem, urgency
- What Changes — specific new capabilities, modifications, removals
- Capabilities — list of new/modified capabilities (each maps to a `specs/<name>/spec.md`)
- Impact — affected code, APIs, dependencies, systems

**Rule:** This file must exist before `design.md` or `tasks.md` can be created.

---

### `design.md` — How

**Purpose:** Technical approach. Answers: how will we implement what the proposal describes?

**Created by:** `/sdd-propose` (Phase 4b), after `proposal.md` exists

**Key sections:**
- Context — background and current state
- Goals / Non-Goals — what this design achieves and what it explicitly excludes
- Decisions — key design decisions and rationale
- Risks / Trade-offs — known risks and how they are mitigated

**Rule:** Design decisions here must be consistent with `architecture.md`. If they diverge, update the architecture first.

---

### `tasks.md` — Implementation Steps

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

### `specs/<capability>/spec.md` — Capability Specification

**Purpose:** Testable requirements and scenarios for a specific capability introduced or modified by the change.

**Location:** `{ARTIFACT_MAIN_FOLDER}/{CHANGE_SUBFOLDER}/<name>/{SPECS_SUBFOLDER}/<capability>/spec.md`

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

**Lifecycle:** Delta specs start inside a change folder. When the change is archived, `/sdd-archive` syncs them into `{ARTIFACT_MAIN_FOLDER}/{SPECS_SUBFOLDER}/<capability>/spec.md` — the permanent capability registry.

---

## Relationship map

```
{ARTIFACT_MAIN_FOLDER}/
├── {SHARED_SUBFOLDER}/           ← Global project documents
│   ├── prd.md              ← WHAT and WHY (whole product)
│   ├── ux.md               ← UX design decisions
│   ├── architecture.md     ← HOW the system is built
│   └── prototype-*.html    ← Living HTML prototype
├── {SPECS_SUBFOLDER}/  ← Global: permanent capability registry
│   └── <capability>/
│       └── spec.md
└── {CHANGE_SUBFOLDER}/
    ├── <change-name>/  ← Change: one scoped unit of work
    │   ├── proposal.md     ← What & why
    │   ├── design.md       ← How
    │   ├── tasks.md        ← Implementation steps
    │   └── {SPECS_SUBFOLDER}/  ← Delta specs (synced to shared on archive)
    │       └── <capability>/
    │           └── spec.md
    └── archive/        ← Completed changes (date-prefixed)
        └── YYYY-MM-DD-<name>/
```
