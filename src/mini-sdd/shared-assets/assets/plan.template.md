---
spec-name: spec-name
status: todo
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

## Approach

_Describe the
technical strategy in 2–5 sentences. Be specific: name the files, patterns, and
mechanisms. Not "add an endpoint" but "add a POST /api/x handler in src/api/x.ts
following the pattern in src/api/y.ts". If a key file or location is unknown, say
so explicitly — e.g. "the middleware will be mounted in the app entry point
(location TBD — see Q1)"._

---

## Trade-offs

_List only real choices made. Format:
option A vs option B — chose A because [reason]. Remove this section entirely
if there were no meaningful choices._

-

---

## Tasks

_Ordered checkbox list.
Each task is atomic, named (references the specific file/function), tagged with
the acceptance criteria it covers, and ends with a **Done when:** binary check. Group tasks in macro task.
Tasks blocked on an open question are marked ⚠️._

- [ ] [Task description] **(AC 2)**. **Done when:** [observable, binary
check]

Example:

```
### 1. Theme Infrastructure
- [ ] 1.1 Create ThemeContext with light/dark state. (AC 1) **Done when:** ...
- [ ] 1.2 ...

### 2. UI Components
- [ ] 2.1 Create ThemeToggle component. **Done when:** ...
- [ ] 2.2 ...
```

---

## Open Questions

_Things that couldn't be determined during
exploration. Each question is numbered, specific, and states what it affects. Remove
resolved questions. If no open questions remain, remove this section
entirely._

| # | Question | Affects | Owner | Status
|
|---|----------|---------|-------|--------|
| Q1 | [Specific question — e.g. "Where is the Express app initialized:
src/app.ts, src/index.ts, or src/server.ts?"] | [What this blocks — e.g. "Task
3: where to mount the middleware"] | | Open |

---

## Technical Notes

_Implementation reference for the agent — not required reading for humans. Real file
paths only. Label new files explicitly._

### Files to change

| File | Change
|
|------|--------|
| `path/to/existing-file.ts` | [description of what changes] |
|
`path/to/new-file.ts` _(new)_ | [what this file will contain] |

### Key
references

- [variable/function name]: `path/to/file.ts#functionName`
- Follow the
pattern in: `path/to/example.ts#handlerName`
- Config key: `ENV_VAR_NAME` (used in
`path/to/config.ts`)

### Commands

_Migration commands, codegen steps, build, rum test commad,flags needed during implementation._

```
# example: db migration
npm run
db:migrate
```

### Notes

- [Any other implementation details, gotchas, or
observations from exploration]