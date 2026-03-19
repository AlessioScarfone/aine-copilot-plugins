---
name: mini-sdd-implement
description: 'Implement a feature from an existing spec file. Use when executing development work defined in a spec, coding a feature, or completing a specified requirement. Do not use for creating specs, updating project context, or proposing new features.'
---

Implement a feature based on an existing spec in `./{ARTIFACT_MAIN_FOLDER}/./{SPECS_SUBFOLDER}/`.

Breaks the spec into concrete tasks, appends them to the spec file, implements them one by one, and tracks progress via checkboxes. Supports resuming across sessions.

---

## Entry point

1. Read `./{ARTIFACT_MAIN_FOLDER}/context.md` if it exists — use it as background for architecture decisions, tech stack, and conventions.
2. Determine which spec to implement:
   - If a spec name is provided in the input (e.g., `/mini-sdd-implement user-authentication`), use it.
   - If no name is provided, list all `.md` files in `./{ARTIFACT_MAIN_FOLDER}/./{SPECS_SUBFOLDER}/` (excluding `context.md`) and check their status. Present specs with status `todo`, `todo-changed`, or `in-progress` and ask the user to pick one.
   - If no specs exist, inform the user:
     > "No specs found in `./{ARTIFACT_MAIN_FOLDER}/./{SPECS_SUBFOLDER}/`. Use `/mini-sdd-spec` to create one first."
3. Read the selected spec file from `./{ARTIFACT_MAIN_FOLDER}/./{SPECS_SUBFOLDER}/<spec-name>.md`.
   - Read the YAML frontmatter to get `status`, `created`, and `updated`.
4. Verify the spec status and decide the flow:
   - `todo` → proceed to **Task generation**
   - `todo-changed` → **clear the existing Tasks section**, then proceed to **Task generation**
   - `in-progress` → check if a Tasks section with items exists:
     - **Tasks exist with unchecked items** → skip to **Resume implementation** 
     - **No tasks or all checked** → proceed to **Task generation**
   - `done` → ask: _"This spec is already marked as done. Do you want to re-implement it?"_ If yes, clear tasks and proceed to **Task generation**.

---

## Task generation

1. Read the spec thoroughly: summary, scenarios, acceptance criteria, dependencies, technical notes.
2. Read `./{ARTIFACT_MAIN_FOLDER}/context.md` for tech stack and architecture guidance.
3. Break the spec into **concrete, ordered implementation tasks**. Each task should be:
   - Small enough to complete in one focused step
   - Actionable (starts with a verb: "Create...", "Add...", "Update...")
   - Ordered by dependency (earlier tasks don't depend on later ones)
4. Present the task list to the user:
   > "📋 Tasks for `<spec-name>`:"
   > 1. <task 1>
   > 2. <task 2>
   > 3. ...
5. Ask: _"Does this task breakdown look good? Any adjustments?"_
6. After confirmation, **write the tasks into the spec file** under the `## Tasks` section using checkbox format:
   ```
   ## Tasks

   - [ ] Task 1 description
   - [ ] Task 2 description
   - [ ] Task 3 description
   ```
   Replace any existing content under `## Tasks` (including the template comments).
   Spec template file is available at `assets/spec-template.md` for reference.
7. In the spec frontmatter set: `status: in-progress`, `updated: YYYY-MM-DD`.
8. Proceed to **Execute tasks**.

---

## Resume implementation

Used when the spec is `in-progress` and tasks already exist.

1. Parse the Tasks section to find the first unchecked task (`- [ ]`).
2. Show current progress:
   > "📊 Resuming `<spec-name>`: N/M tasks complete"
   > "Next task: <task description>"
3. Ask: _"Continue with this task?"_
4. Proceed to **Execute tasks** starting from the first unchecked task.

---

## Execute tasks

For each unchecked task in order:

1. Announce which task is being worked on:
   > "🔨 Task N/M: <task description>"
2. Implement the code changes required for this task.
3. Keep changes minimal and focused on the task.
4. Mark the task complete in the spec file: `- [ ]` → `- [x]`
5. In the spec frontmatter update: `updated: YYYY-MM-DD`.
6. Continue to the next unchecked task.

**Pause if:**
- Task is unclear → ask for clarification
- Implementation reveals an issue → report and wait for guidance
- User interrupts → keep status as `in-progress`, summarize progress

---

## Completion

When all tasks are checked:

1. Review each acceptance criterion from the spec and check satisfied ones: `- [ ]` → `- [x]`.
2. In the spec frontmatter set: `status: done`, `updated: YYYY-MM-DD`.
3. Show a completion summary:

```
✅ Implementation complete: <spec-name>

Tasks: M/M done
Acceptance criteria: N/M satisfied

Changes made:
- <file 1>: <what changed>
- <file 2>: <what changed>
```

4. Suggest next steps:
   > "Run `/mini-sdd-context` to update the project context if this feature affects the architecture or tech stack."

---

## Clearing tasks on `todo-changed`

When the spec frontmatter shows `status: todo-changed`, the existing tasks are stale because the spec was modified. Before generating new tasks:

1. Replace the entire content of the `## Tasks` section with the template placeholder:
   ```
   ## Tasks

   <!-- Auto-generated by mini-sdd-implement. Do not edit manually. -->
   ```
2. Also reset any checked acceptance criteria back to unchecked: `- [x]` → `- [ ]`.
3. Then proceed with **Task generation** as normal.

---

## Error handling

- **Spec not found**: List available specs and ask the user to choose.
- **Blocked by dependency**: Inform the user and ask how to proceed.
- **Unclear requirement**: Ask for clarification before implementing.
- **Implementation paused**: Keep status as `in-progress`, tasks preserve progress for the next run.

---

## Output rules

{SKILL_ASSETS_NOTICE}
- Follow the tech stack and conventions from `context.md`.
- Write clean, idiomatic code — no unnecessary abstractions.
- All progress tracking lives in the spec file itself — no external tracker files.
- Do not modify other specs or unrelated files.
