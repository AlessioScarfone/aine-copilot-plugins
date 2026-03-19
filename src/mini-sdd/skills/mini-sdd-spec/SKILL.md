---
name: mini-sdd-spec
description: 'Create or update a feature spec describing a single requirement with scenarios and acceptance criteria. Use when defining a new feature, capturing a requirement, or refining an existing spec. Do not use for implementing code or updating project context.'
---

Create or update a feature specification file in `./{ARTIFACT_MAIN_FOLDER}/./{SPECS_SUBFOLDER}/`.

Each spec captures a single feature or requirement with clear scenarios and acceptance criteria, serving as the contract between the user intent and the implementation.

---

## Entry point

1. Read `./{ARTIFACT_MAIN_FOLDER}/context.md` if it exists — use it as background for all decisions.
2. Determine the user's intent from the input (e.g., `/mini-sdd-spec user authentication`).
   - If no feature name or description is provided, ask: _"What feature or requirement do you want to spec?"_
3. Derive a **spec name** in dash-case from the feature description (e.g., `user-authentication`, `csv-export`, `dark-mode-toggle`).
4. Check for an existing spec by looking for `./{ARTIFACT_MAIN_FOLDER}/./{SPECS_SUBFOLDER}/<spec-name>.md` (exact match) and by scanning other specs for content similarity.
   - **If a match is found** → read its YAML frontmatter to get the current `status`, show a brief summary, and ask:
     > "A spec `<existing-spec-name>` already exists (status: <current-status>). Do you want to **update this spec** or **create a new one** with a different name?"
     - **Update** → proceed to **Update flow**
     - **New** → ask for a different name and proceed to **Creation flow**
   - **If no match is found** → output the derived name and proceed to **Creation flow**:
     > "📝 Spec name: `<spec-name>`"

---

## Creation flow

### 1. Clarify the requirement

Ask the user the following in a **single numbered message** (skip questions already answered in the input or inferred from initial context):

1. **What should this feature do?** — Describe the desired behavior in 2–3 sentences.
2. **Who is the user?** — Who benefits from this feature?
3. **Key scenarios** — List 2–4 main scenarios or use cases.
4. **Acceptance criteria** — How do we know it's done? Any edge cases?
5. **Dependencies** — Does this require other features, APIs, or libraries?
6. **Technical notes** — Any implementation hints, API details, or architectural considerations?

### 2. Generate the spec file

Read the template from `./assets/spec-template.md` and fill it in using the gathered information.

- Write the file to `./{ARTIFACT_MAIN_FOLDER}/./{SPECS_SUBFOLDER}/<spec-name>.md`
- In the YAML frontmatter set: `status: todo`, `created: YYYY-MM-DD`, `updated: YYYY-MM-DD`
- Confirm to the user:
  > "✅ Created spec `./{ARTIFACT_MAIN_FOLDER}/./{SPECS_SUBFOLDER}/<spec-name>.md` (status: todo)."

---

## Update flow

Use this when a spec already exists and the user chose to update it.

1. Read the current spec file.
2. Ask: _"What needs to change? New scenarios, updated acceptance criteria, scope change?"_
3. Apply the changes to the relevant sections.
4. In the YAML frontmatter set: `status: todo-changed`, `updated: YYYY-MM-DD`.
5. Show a summary of what changed.
6. Confirm:

---

## Status lifecycle

| Status | Meaning |
|--------|---------|
| `todo` | Spec just created, not yet implemented |
| `todo-changed` | Spec was updated after creation or after a previous implementation pass |
| `in-progress` | Implementation has started (set by `mini-sdd-implement`) |
| `done` | Implementation completed and verified (set by `mini-sdd-implement`) |

> **Note**: This skill only sets `todo` and `todo-changed`. The `in-progress` and `done` statuses are managed by the `mini-sdd-implement` skill.

---

## Output rules

- One spec per file, one feature per spec.
- Keep specs concise — aim for something an AI agent can read and implement without ambiguity.
- Use concrete scenario format (GIVEN/WHEN/THEN or WHEN/THEN) for testable criteria.
- If the user is vague, ask one follow-up, then proceed with best effort and mark assumptions in the spec.

## Error handling

- **Spec name conflict**: If the derived dash-case name collides with an existing unrelated spec, show both and ask the user to confirm or pick a different name.
- **No input provided**: Ask _"What feature or requirement do you want to spec?"_ before doing anything else.
- **Spec file not writable / path missing**: Create the `./{ARTIFACT_MAIN_FOLDER}/./{SPECS_SUBFOLDER}/` directory if it does not exist before writing.
- **User abandons the interview mid-way**: Save whatever was collected, mark unanswered fields as `<!-- to be defined -->`, and confirm the partial spec was written.
