---
name: mini-sdd-spec
description: 'Create or update a feature spec describing a single requirement with scenarios and acceptance criteria. Use when defining a new feature, capturing a requirement, or refining an existing spec. Do not use for implementing code or updating project context.'
---

Create or update a feature specification file in `./{ARTIFACT_MAIN_FOLDER}/{SPECS_SUBFOLDER}/`.

Each spec captures a single feature or requirement with clear scenarios and acceptance criteria, serving as the contract between the user intent and the implementation.

---

## Hook execution

Before doing anything else, check for hook configuration:

1. Attempt to read `./{ARTIFACT_MAIN_FOLDER}/mini-sdd.config.yml`.
   - If the file does not exist, skip this section entirely and proceed to the **Entry point**.
   - If it exists, parse the YAML and look for `hooks.spec.pre` (list of strings).
2. **Execute pre hooks**: for each instruction in `hooks.spec.pre`, carry it out as an explicit step before starting the main workflow. Announce each hook as it runs:
   > "⚙️ Pre-hook: \<instruction\>"
3. After the skill's full workflow completes (including any confirmations), execute **post hooks** from `hooks.spec.post` in the same way:
   > "⚙️ Post-hook: \<instruction\>"
4. If a hook instruction is ambiguous or cannot be executed, inform the user and skip it — never block the main workflow.

---

## Entry point

1. Read `./{ARTIFACT_MAIN_FOLDER}/context.md` if it exists — use it as background for all decisions.
2. Determine the user's intent from the input (e.g., `/mini-sdd-spec user authentication`).
   - If no feature name or description is provided, ask: _"What feature or requirement do you want to spec?"_
3. Derive a **spec name** in dash-case from the feature description (e.g., `user-authentication`, `csv-export`, `dark-mode-toggle`).
4. Check for an existing spec by looking for `./{ARTIFACT_MAIN_FOLDER}/{SPECS_SUBFOLDER}/<spec-name>/spec.md` (exact match) and by scanning other spec folders for content similarity.
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
5. **Technical notes** — Any implementation hints, API details, or architectural considerations?

After collecting the requirements, inspect the existing specs under `./{ARTIFACT_MAIN_FOLDER}/{SPECS_SUBFOLDER}/` and infer whether this spec depends on other specs being completed first. Populate `requires:` automatically from that analysis.

Ask the user about dependencies only if the relationship is ambiguous:
> "I found that `<spec-name>` may need `<dependency-spec>` to be completed first. Should I mark it as a dependency?"

### 2. Generate the spec file

Read the template from `assets/spec.template.md` and fill it in using the gathered information.

- Create the folder `./{ARTIFACT_MAIN_FOLDER}/{SPECS_SUBFOLDER}/<spec-name>/` if it does not exist.
- Write the spec to `./{ARTIFACT_MAIN_FOLDER}/{SPECS_SUBFOLDER}/<spec-name>/spec.md`.
- In the `spec.md` YAML frontmatter set: `requires: [<spec-name>, ...]` from the inferred dependencies, `created: YYYY-MM-DD`, `updated: YYYY-MM-DD`.
- Set `status: ready`.
- Treat unmet `requires` as a derived blocking condition during implementation, not as a separate stored status.

### 3. Generate the plan

Break the spec into concrete, ordered implementation tasks and write them to `plan.md`:

1. Read `./{ARTIFACT_MAIN_FOLDER}/context.md` (if present) for tech stack and architecture guidance and any other additional context provided by the user.
2. Read the spec content: summary, scenarios, acceptance criteria, dependencies, technical notes.
3. Break the spec into tasks. Follow the **Task Rules** section for formatting, numbering, and content guidelines.
4. If any open questions or assumptions were noted in the spec ask the user for clarification before finalizing the tasks.
5. Present the task list to the user:
   > "📋 Tasks for `<spec-name>`:"
   > 1. \<task 1\>
   > 2. \<task 2\>
6. Ask: _"Does this task breakdown look good? Any adjustments?"_
7. After confirmation, write `plan.md` using `assets/plan.template.md` as the base, filling all the sections. Write to `./{ARTIFACT_MAIN_FOLDER}/{SPECS_SUBFOLDER}/<spec-name>/plan.md`.
8. Confirm to the user:
   > "✅ Created `<spec-name>/spec.md` (status: ready) and `<spec-name>/plan.md` with N tasks."


## Task Rules

### Format
- [ ] 1.1 Pending task
- [x] 1.1 Completed task
- [ ]* 1.1 Optional task (nice-to-have, not blocking)

### Numbering
- Top-level tasks: 1., 2., 3.
- Sub-tasks: 2.1, 2.2, 2.3
- Maximum 2 levels (no 2.1.1)
- Parent tasks with sub-tasks are GROUP HEADERS (not directly executed)
- Mark parent complete only when ALL sub-tasks are done
- Tasks without sub-tasks are directly executable
- Use sub-tasks when a feature has 3+ related implementation steps

### Requirement References
- Always include AC/Requirement reference: _(AC 1)_
- Every requirement should be covered by at least one task

### Task content
Each task should include:

- Clear objective - What to implement
- Implementation details - Sub-bullets with specifics
- Requirement reference - Traceability

### Guidelines
- Coding tasks ONLY - No deployment, user testing, documentation
- Incremental progress - Each task builds on previous
- Actionable by AI - Tasks should be specific enough for code generation
- Include checkpoints - Periodic verification that tests pass
- Test-driven where appropriate - Mark test tasks with * if optional

NOTE: `spec.md` is the human-readable contract; `plan.md` tracks tasks and is used by `mini-sdd-implement`.

---

## Update flow

Use this when a spec already exists and the user chose to update it.

1. Read the current spec from `./{ARTIFACT_MAIN_FOLDER}/{SPECS_SUBFOLDER}/<spec-name>/spec.md`.
2. Ask: _"What needs to change? New scenarios, updated acceptance criteria, scope change?"_
3. Apply the changes to the relevant sections of `spec.md`.
4. Re-inspect the other specs in `./{ARTIFACT_MAIN_FOLDER}/{SPECS_SUBFOLDER}/` and re-infer `requires:` from the updated spec content.
5. In the YAML frontmatter set: `requires: [<spec-name>, ...]`, `updated: YYYY-MM-DD`, `status: ready`.
   - If some `requires` are not yet `done`, keep that as a derived blocking condition for implementation.
6. Generate new plans based on the updated spec (follow the same steps as **Creation flow §3**) and **append** a new dated section to the existing `plan.md` using using `assets/plan.template.md` as the base. Do **not** remove existing tasks — preserve the history of previous implementations.
7. Show a summary of what changed, which dependencies were inferred, and what new tasks were added.
8. Confirm:
   > "✅ Updated `<spec-name>/spec.md` (status: ready) and appended N new tasks to `<spec-name>/plan.md`."

---

## Status lifecycle

| Status | Meaning |
|--------|---------|
| `ready` | Spec is ready to be implemented |
| `in-progress` | Implementation has started (set by `mini-sdd-implement`) |
| `done` | Implementation completed and verified (set by `mini-sdd-implement`) |

> **Note**: This skill sets `ready`. Whether a spec is currently implementable is derived from `requires`: if any dependency is not `done`, implementation must stop until those dependencies are completed. The `in-progress` and `done` statuses are managed by the `mini-sdd-implement` skill.

---

## Output rules

{SKILL_ASSETS_NOTICE}
- One spec per file, one feature per spec.
- Keep specs concise — aim for something an AI agent can read and implement without ambiguity.
- Use concrete scenario format (GIVEN/WHEN/THEN or WHEN/THEN) for testable criteria.
- If the user is vague, ask one follow-up, then proceed with best effort and mark assumptions in the spec.

## Error handling

- **Spec name conflict**: If the derived dash-case name collides with an existing unrelated spec, show both and ask the user to confirm or pick a different name.
- **No input provided**: Ask _"What feature or requirement do you want to spec?"_ before doing anything else.
- **Spec folder not writable / path missing**: Create the `./{ARTIFACT_MAIN_FOLDER}/{SPECS_SUBFOLDER}/<spec-name>/` directory if it does not exist before writing.
- **User abandons the interview mid-way**: Save whatever was collected, mark unanswered fields as `<!-- to be defined -->`, and confirm the partial spec was written.
