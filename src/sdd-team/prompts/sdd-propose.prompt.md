---
description: Propose a change — creates all artifacts and updates PRD, UX, and Architecture in one pipeline
agent: sdd-pm-agent
---

Propose a change that updates all global project documents and creates all change artifacts — in one automated pipeline.

This covers:
- Updating `sdd-docs/prd.md` with any new requirements - if update is needed
- Updating `sdd-docs/ux.md` and HTML prototype with UX changes - if exists
- Updating `sdd-docs/architecture.md` with technical changes - if exists
- Creating change artifacts (`proposal.md`, `design.md`, `tasks.md`)

The output is a fully updated project documentation set + a ready-to-implement change.

---

**Input**: The argument after `/sdd-propose` is the change name (kebab-case) OR a description of what the user wants to build.

**Agent**: Coordinates the full pipeline, dispatching subagents for global document updates.

**Steps**

0. **PRD Gate** — check if `sdd-docs/prd.md` exists.

   If it does NOT exist, stop immediately and tell the user:
   > "A PRD is required before proposing a change. Please create one first using `/sdd-prd`, then come back to `/sdd-propose`."

   Do NOT proceed past this step without a PRD.

1. **Understand the change**

   If no input was provided, use the **AskUserQuestion tool** (open-ended, no preset options) to ask:
   > "What change do you want to work on? Describe what you want to build or fix."

   Read all global project documents (`sdd-docs/prd.md`, `sdd-docs/ux.md`, `sdd-docs/architecture.md`, `sdd-docs/prototype-*.html`, `README.md`), existing specs (`sdd-docs/specs/*/spec.md`) and user input to fully understand the change and its implications.

   Present a **change impact summary**:
   - What's changing
   - Which documents need updating and why
   - Which existing specs are affected
   - Proposed change name (kebab-case, e.g. "add user authentication" → `add-user-auth`)

   Get user confirmation before proceeding.

2. **Phase 1 — Update PRD** (`sdd-docs/prd.md`)

   Launch a **subagent** (via `runSubagent`) with a detailed prompt that:
   - Instructs it to read `pm.agent.md` and adopt the PM agent persona
   - Provides the change description and affected sections
   - Requests surgical edits only: Scope table, User Journeys, Functional Requirements, Non-Functional Requirements
   - Updates `Last updated` date
   - Returns a summary of changes made

3. **Phase 2 — Update UX** (`sdd-docs/ux.md` + `sdd-docs/prototype-*.html`)

   Launch a **subagent** (via `runSubagent`) with a detailed prompt that:
   - Instructs it to read `ux-designer.agent.md` and adopt the UX Designer agent persona
   - Provides the change description and affected sections
   - Requests surgical edits: Design Decisions Log, Component Inventory, Wireframes, Prototype Spec, HTML prototype
   - Updates `Last updated` date
   - Returns a summary of changes made

4. **Phase 3 — Update Architecture** (`sdd-docs/architecture.md`)

   Launch a **subagent** (via `runSubagent`) with a detailed prompt that:
   - Instructs it to read `architect.agent.md` and adopt the Architect agent persona
   - Provides the change description and affected sections
   - Requests surgical edits: Database schema, API surface table, API response examples, Conventions table
   - Updates `Last updated` date
   - Returns a summary of changes made

5. **Phase 4 — Create change artifacts**

   Create the change directory:
   ```bash
   mkdir -p sdd-docs/changes/"<name>"
   ```

   If a change with that name already exists, ask the user whether to continue it or start fresh.

   Use the **TodoWrite tool** to track progress through the following artifacts (in creation order):

   a. **`proposal.md`** — what & why (must be created first)
      - Read `templates/proposal.md` for structure
      - Use the confirmed change description, PRD context, and summaries from Phases 1–3 as input
      - Save to `sdd-docs/changes/<name>/proposal.md`
      - Verify the file exists before continuing

   b. **`design.md`** — how (requires proposal)
      - Read `templates/design.md` for structure
      - Read `sdd-docs/changes/<name>/proposal.md` for context
      - Incorporate Architecture decisions from Phase 3
      - Save to `sdd-docs/changes/<name>/design.md`
      - Verify the file exists before continuing

   c. **`tasks.md`** — implementation steps (requires design)
      - Read `templates/tasks.md` for structure
      - Read `sdd-docs/changes/<name>/design.md` for context
      - If API surface changed, include a task for README update
      - Save to `sdd-docs/changes/<name>/tasks.md`
      - Verify the file exists before continuing

   d. **`specs/<capability>/spec.md`** — only if new capabilities are introduced
      - Read `templates/spec.md` for structure
      - Can be created alongside design
      - Save to `sdd-docs/changes/<name>/specs/<capability>/spec.md`

6. **Completion**

   Show pipeline summary:
   - Which global docs were updated and what changed in each
   - List of artifacts created under `sdd-docs/changes/<name>/`
   - Status: "All artifacts created! Ready for implementation with `/sdd-implement`."

**Guardrails**
- Single input, full pipeline — user describes the change once, all phases use that context
- Ask question if input is unclear — do not proceed without understanding the change
- Surgical edits — never rewrite entire documents; only update affected sections
- Cross-document consistency — same terminology and field names across PRD, UX, Architecture, and specs
- Date stamps — update in every modified document
- No silent skips — if a phase has no changes, explicitly state it
- README awareness — if API surface changes (endpoints, request/response, curl examples), include README update in tasks
- Ask user only at Step 1 for confirmation — then execute the full pipeline autonomously
- Phases 1–3 MUST each be dispatched via `runSubagent` — never read agent files directly to adopt a persona
- Phase 4 runs directly (no subagent needed) — use project context and Phase 1–3 summaries as constraints
- Each subagent prompt must be self-contained: include change description, affected sections, edit rules, and expected return format
- Follow each agent's quality standards (FR format for PRD, C/R/A decisions for UX, decision rationale for Architecture)
