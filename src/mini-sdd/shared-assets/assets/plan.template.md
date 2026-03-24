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

## Tasks

> Task FORMAT:
> - [ ] 1.1 Pending task
> - [x] 1.1 Completed task
> - [ ]* 1.1 Optional task (nice-to-have, not blocking)

### 1. Theme Infrastructure
- [ ] 1.1 Create ThemeContext with light/dark state. (AC 1) **Done when:** ...
- [ ] 1.2 ...

### 2. UI Components
- [ ]* 2.1 Create ThemeToggle component. **Done when:** ...
- [ ] 2.2 ...

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

### Key references

- [variable/function name]: `path/to/file.ts#functionName`
- Follow the
pattern in: `path/to/example.ts#handlerName`
- Config key: `ENV_VAR_NAME` (used in
`path/to/config.ts`)

### Commands

_Migration commands, codegen steps, build, run test command, flags needed during implementation._

```
# example: db migration
npm run
db:migrate
```