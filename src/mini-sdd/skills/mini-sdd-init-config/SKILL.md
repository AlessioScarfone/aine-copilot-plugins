---
name: mini-sdd-init-config
description: 'Scaffold the mini-sdd configuration file (mini-sdd.config.yml) that defines pre and post hooks for the context, spec, and implement steps. Use when setting up a customization of mini-sdd on a project. Do not use for implementing features, writing specs, or creating project context.'
---

Scaffold or update the mini-sdd configuration file at `./{ARTIFACT_MAIN_FOLDER}/mini-sdd.config.yml`.

This file is read by `mini-sdd-context`, `mini-sdd-spec`, and `mini-sdd-implement` to inject custom pre/post instructions into their workflows.

---

## Entry point

1. Check whether `./{ARTIFACT_MAIN_FOLDER}/mini-sdd.config.yml` already exists.
   - **If it exists** → read it, show a summary of the configured hooks, and ask:
     > "A config file already exists with the following hooks:
     > - context.pre: N hook(s)
     > - context.post: N hook(s)
     > - spec.pre: N hook(s)
     > - spec.post: N hook(s)
     > - implement.pre: N hook(s)
     > - implement.post: N hook(s)
     >
     > Do you want to **add hooks**, **edit existing hooks**, or **reset to the template**?"
     - **Add / Edit** → proceed to **Update flow**
     - **Reset** → proceed to **Creation flow** (overwrite)
   - **If it does not exist** → proceed to **Creation flow**

---

## Creation flow

### 1. Read the template

Read the template from `assets/mini-sdd.config.template.yml`.

{SKILL_ASSETS_NOTICE}

### 2. Generate the config

Using the template as the base structure. Keep example entries commented out for hooks the user did not specify. If `mini-sdd.config.yml` report to the user and stop the execution.

- Create `./{ARTIFACT_MAIN_FOLDER}/` directory if it does not exist.
- Write the file to `./{ARTIFACT_MAIN_FOLDER}/mini-sdd.config.yml`.
- Confirm:
  > "✅ Created `./{ARTIFACT_MAIN_FOLDER}/mini-sdd.config.yml` with your hook configuration."

Show the final content of the generated file to the user for review.

---

## Output rules

{SKILL_ASSETS_NOTICE}
- Do not overwrite the config file without confirmation if it already exists.

## Error handling

- **File not writable / path missing**: create the `./{ARTIFACT_MAIN_FOLDER}/` directory if it does not exist before writing.
- **Invalid YAML produced**: validate the structure before writing. If the YAML would be invalid (e.g., missing colon, bad indentation), fix it automatically and note the correction to the user.
