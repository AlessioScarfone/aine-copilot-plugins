---
name: mini-sdd-init-config
description: 'Scaffold or update the mini-sdd configuration file (mini-sdd.config.yml) that defines pre and post hooks for the context, spec, and implement steps. Use when setting up hook customization on a project, adding new hooks, or reviewing existing hook configuration. Do not use for implementing features, writing specs, or creating project context.'
---

Scaffold or update the mini-sdd configuration file at `./{ARTIFACT_MAIN_FOLDER}/mini-sdd.config.yml`.

This file is read by `mini-sdd-context`, `mini-sdd-spec`, and `mini-sdd-implement` to inject custom pre/post instructions into their workflows.

---

## Entry point

1. Check whether `./{ARTIFACT_MAIN_FOLDER}/mini-sdd.config.yml` already exists.
   - **If it exists** → read it, show a summary of configured hooks:
     ```
     📋 Current hook configuration:
     - context.pre:   N hook(s)  → <first instruction, truncated>
     - context.post:  N hook(s)
     - spec.pre:      N hook(s)
     - spec.post:     N hook(s)
     - implement.pre: N hook(s)
     - implement.post: N hook(s)
     ```
     Then ask:
     > "Do you want to **update the hooks** (I'll walk you through each event) or **reset to the default template** (all current hooks will be replaced)?"
     - **Update** → proceed to **Hook interview**, pre-filling current values
     - **Reset** → proceed to **Hook interview** with empty values (template defaults)
   - **If it does not exist** → proceed to **Hook interview** with empty values

---

## Hook interview

Ask the user about each of the six hook events **in a single numbered message**. For each event, describe what it does and show the current value if one exists.

Present it like this:

> Let's configure your hooks. Answer each question below — if you don't want any hook for an event, reply "none" or leave it blank. If you want multiple actions, list them (I'll split them into separate hook items).
>
> **context step**
> 1. **pre-context** — runs before `mini-sdd-context` starts.
>    Current: `<current value or "none">`
>    What custom instruction should run before creating/updating the project context? (e.g. "Check if context.md already exists in a non-standard location")
>
> 2. **post-context** — runs after `mini-sdd-context` completes.
>    Current: `<current value or "none">`
>    What should happen after the context file is written? (e.g. "Update root README with a summary of the new context")
>
> **spec step**
> 3. **pre-spec** — runs before `mini-sdd-spec` starts.
>    Current: `<current value or "none">`
>    What should happen before creating or updating a spec? (e.g. "Check that the git working directory is clean")
>
> 4. **post-spec** — runs after `mini-sdd-spec` completes.
>    Current: `<current value or "none">`
>    What should happen after a spec and plan are written? (e.g. "Append an entry to CHANGELOG.md under Unreleased")
>
> **implement step**
> 5. **pre-implement** — runs before `mini-sdd-implement` starts.
>    Current: `<current value or "none">`
>    What should happen before starting implementation? (e.g. "Run the existing test suite and confirm it is green")
>
> 6. **post-implement** — runs after `mini-sdd-implement` completes.
>    Current: `<current value or "none">`
>    What should happen after all implementation tasks are done? (e.g. "Run npm run lint && npm test and fix any failures")

### Interpreting answers

- **Negative response** ("none", "no", "nothing", "n/a", blank, "-") → set that event to an empty list `[]`; omit the key from the generated YAML entirely (cleaner output).
- **Single action** → one list item.
- **Multiple actions in one answer** (comma-separated, numbered list, "and then", newline-separated) → split into separate list items. Each item must be a single, atomic instruction.
- **Unchanged / "keep it"** → preserve the existing value from the current config.

---

## Write the config

1. Read the template from `assets/mini-sdd.config.template.yml` as the base structure.

   {SKILL_ASSETS_NOTICE}

2. Build the final YAML: include only hook events that have at least one instruction. Omit empty events entirely (no empty lists in the output).
3. Create `./{ARTIFACT_MAIN_FOLDER}/` if it does not exist.
4. Write (overwrite if updating) `./{ARTIFACT_MAIN_FOLDER}/mini-sdd.config.yml`.
5. Show the final content of the written file to the user.
6. Confirm:
   > "✅ Saved `./{ARTIFACT_MAIN_FOLDER}/mini-sdd.config.yml` — N hook event(s) configured."

---

## Hook instruction guidelines

- Write hooks as imperative sentences: "Check…", "Update…", "Run…"
- Each item should be one atomic action — don't combine unrelated steps in a single item.
- Pre hooks should be non-destructive checks or preparatory steps.
- Post hooks should be follow-up actions after the skill's main work is complete.
- If the project stack uses specific commands or paths, include them explicitly.

---

## Output rules

{SKILL_ASSETS_NOTICE}
- Never silently overwrite an existing config — always show the current state first.
- Always show the final written file content after saving.

## Error handling

- **File not writable / path missing**: create the `./{ARTIFACT_MAIN_FOLDER}/` directory if it does not exist before writing.
- **Invalid YAML produced**: validate the structure before writing. If the YAML would be invalid (e.g., missing colon, bad indentation), fix it automatically and note the correction to the user.
- **User skips all hooks**: write a minimal valid config with only a top-level `hooks: {}` block and note that no hooks are active.
