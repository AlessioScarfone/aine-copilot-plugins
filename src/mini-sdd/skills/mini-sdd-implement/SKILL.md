---
name: mini-sdd-implement
description: 'Implement a feature from an existing spec file. Use when executing development work defined in a spec, coding a feature, or completing a specified requirement. Do not use for creating specs, updating project context, or proposing new features.'
---

Implement a feature based on an existing spec in `./{ARTIFACT_MAIN_FOLDER}/{SPECS_SUBFOLDER}/`.

Reads the task list from the spec's `plan.md`, executes tasks one by one, tracks progress via checkboxes, and appends development notes to `spec.md` on completion. Supports resuming across sessions.

> **Note:** Task generation is handled by `mini-sdd-spec`. This skill only executes tasks already written in `plan.md`.

---

## Hook execution

Before doing anything else, check for hook configuration:

1. Attempt to read `./{ARTIFACT_MAIN_FOLDER}/mini-sdd.config.yml`.
   - If the file does not exist, skip this section entirely and proceed to the **Entry point**.
   - If it exists, parse the YAML and look for `hooks.implement.pre` (list of strings).
2. **Execute pre hooks**: for each instruction in `hooks.implement.pre`, carry it out as an explicit step before starting the main workflow. Announce each hook as it runs:
   > "⚙️ Pre-hook: \<instruction\>"
3. After the skill's full workflow completes (including any confirmations), execute **post hooks** from `hooks.implement.post` in the same way:
   > "⚙️ Post-hook: \<instruction\>"
4. If a hook instruction is ambiguous or cannot be executed, inform the user and skip it — never block the main workflow.

---

## Entry point

1. Read `./{ARTIFACT_MAIN_FOLDER}/context.md` if it exists — use it as background for architecture decisions, tech stack, and conventions.
2. Determine which spec to implement:
   - If a spec name is provided in the input (e.g., `/mini-sdd-implement user-authentication`), use it.
   - If no name is provided, scan spec folders in `./{ARTIFACT_MAIN_FOLDER}/{SPECS_SUBFOLDER}/` and read each `spec.md` frontmatter. Present specs with status `ready` or `in-progress` and ask the user to pick one.
   - For specs with status `ready`, also evaluate whether all `requires` dependencies are already `done`.
   - If some ready specs still have unmet `requires`, report them separately as not yet implementable.
   - If no specs exist, inform the user:
     > "No specs found in `./{ARTIFACT_MAIN_FOLDER}/{SPECS_SUBFOLDER}/`. Use `/mini-sdd-spec` to create one first."
3. Read the spec folder at `./{ARTIFACT_MAIN_FOLDER}/{SPECS_SUBFOLDER}/<spec-name>/`:
   - Read `spec.md` YAML frontmatter to get `status`, `requires`, `created`, and `updated`.
   - Read `plan.md` to get the task list.
4. Verify the spec status and decide the flow:
   - `ready` → verify `plan.md` exists and has unchecked tasks, then proceed to **Execute tasks**.
     - Before proceeding, evaluate every entry in `requires:`. If at least one dependency is not `done`, stop and list the unmet dependencies with their current statuses. Tell the user the spec is not yet implementable even though its stored status is `ready`.
     - If `plan.md` is missing or has no tasks, inform the user:
       > "`plan.md` has no tasks for `<spec-name>`. Run `/mini-sdd-spec` to generate the plan first."
   - `in-progress` → proceed to **Resume implementation**.
   - `done` → ask: _"This spec is already marked as done. Do you want to re-run it?"_ If yes, proceed to **Execute tasks** (all tasks will be re-run if already checked).

---

## Resume implementation

Used when the spec is `in-progress`.

1. Read `plan.md` and find the first unchecked task (`- [ ]`) across all `## Tasks` sections.
2. Show current progress:
   > "📊 Resuming `<spec-name>`: N/M tasks complete"
   > "Next task: \<task description\>"
3. Ask: _"Continue with this task?"_
4. Proceed to **Execute tasks** starting from the first unchecked task.

---

## Execute tasks

Before starting, set `spec.md` frontmatter to `status: in-progress`, `updated: YYYY-MM-DD`.

For each unchecked task in `plan.md` in order:

1. Announce which task is being worked on:
   > "🔨 Task N/M: \<task description\>"
2. Implement the code changes required for this task.
3. Keep changes minimal and focused on the task.
4. Mark the task complete **in `plan.md`**: `- [ ]` → `- [x]`.
5. Update `spec.md` frontmatter: `updated: YYYY-MM-DD`.
6. Continue to the next unchecked task.

**Pause if:**
- Task is unclear → ask for clarification
- Implementation reveals an issue → report and wait for guidance
- User interrupts → keep `spec.md` status as `in-progress`, summarize progress

---

## Completion

When all tasks are checked:

1. Review each acceptance criterion from the spec and check satisfied ones: `- [ ]` → `- [x]`.
2. In the `spec.md` frontmatter set: `status: done`, `updated: YYYY-MM-DD`.
3. Scan all other spec folders and find specs in status not `done` whose `requires:` contains `<spec-name>` (the spec that was just completed) and update their statuses:
   - Remove the completed spec from the list of unmet dependencies (`requires:` frontmatter field).
   - If all of them are now `done`, so the requires list is empty, the spec is now implementable and update the status to `ready` (if it was previously blocked by this dependency).
   - If at least one dependency is still not `done`, leave/update the status as `blocked`.
   - Summarize any specs that became implementable.
4. Append a "Development Notes" section to `spec.md` summarizing what was implemented, files changed, and any important follow-ups. The notes should be concise and reference changed files.
5. Show a completion summary:

```
✅ Implementation complete: <spec-name>

Tasks: M/M done
Acceptance criteria: N/M satisfied

Changes made:
- <file 1>: <what changed>
- <file 2>: <what changed>
```

5. **Auto-update `context.md`**:
   - Read `./{ARTIFACT_MAIN_FOLDER}/context.md`.
   - Based on the completed spec and the changes made, identify which sections of `context.md` are affected (e.g., new tech stack entries, updated architecture components, changed project status, new key features).
   - Update **only** the relevant sections — do not rewrite unaffected content.
   - Set `Last updated` to today (`YYYY-MM-DD`).
   - Confirm to the user:
     > "✅ Updated `./{ARTIFACT_MAIN_FOLDER}/context.md` to reflect the completed feature."

---

## Error handling

- **Spec not found**: List available specs and ask the user to choose.
- **Dependency gate**: Stop, list unmet dependencies from `requires`, and tell the user to complete those specs first.
- **Unclear requirement**: Ask for clarification before implementing.
- **Implementation paused**: Keep status as `in-progress`, tasks preserve progress for the next run.

---

## Output rules

{SKILL_ASSETS_NOTICE}
- Follow the tech stack and conventions from `context.md`.
- Write clean, idiomatic code — no unnecessary abstractions.
- All progress tracking lives in `plan.md` located alongside `spec.md` in the spec folder.
- Do not modify unrelated specs or unrelated files.
