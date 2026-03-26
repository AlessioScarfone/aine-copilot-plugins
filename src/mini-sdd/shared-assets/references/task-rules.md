# Task Rules

## Format
- `- [ ] 1.1 Pending task`
- `- [x] 1.1 Completed task`
- `- [ ]* 1.1 Optional task` (nice-to-have, not blocking)

## Numbering
- Top-level tasks: `1.`, `2.`, `3.`
- Sub-tasks: `2.1`, `2.2`, `2.3`
- Maximum 2 levels (no `2.1.1`)
- Parent tasks with sub-tasks are GROUP HEADERS — not directly executed
- Mark parent complete only when ALL sub-tasks are done
- Use sub-tasks when a feature has 3+ related implementation steps

## Requirement references
- Always include an AC/Requirement reference: _(AC 1)_
- Every requirement must be covered by at least one task

## Task content
Each task should include:
- **Clear objective** — what to implement
- **Implementation details** — sub-bullets with specifics
- **Requirement reference** — for traceability

## Guidelines
- Coding tasks ONLY — no deployment, user testing, or documentation tasks
- Incremental — each task builds on the previous
- Actionable by AI — specific enough for code generation
- Include checkpoints — periodic verification that tests pass
- Test-driven where appropriate — mark test tasks with `*` if optional

> **Note**: `spec.md` is the human-readable contract; `plan.md` tracks tasks and is read by `mini-sdd-implement`.
