---
spec-name: search-notes
status: ready
created: 2026-03-15
updated: 2026-03-15
---

## Approach

Extend the existing GET /notes route in `src/routes/notes.js` to accept an optional `q` query string parameter. If `q` is present, filter the in-memory notes array using a case-insensitive `String.prototype.includes()` check on both `title` and `body` fields. No new dependencies required.

---

## Tasks

### 1. Route logic
- [ ] 1.1 Add `q` querystring schema to the GET /notes Fastify route schema. (AC1, AC4) **Done when:** The route accepts `?q=` without a 400 validation error.
- [ ] 1.2 Add filter logic that narrows the notes array when `q` is present. (AC1, AC2) **Done when:** GET /notes?q=meeting returns only notes containing "meeting" case-insensitively.
- [ ] 1.3 Ensure empty result returns `[]` with 200. (AC3) **Done when:** GET /notes?q=zzznomatch returns `[]` and HTTP 200.

### 2. Tests
- [ ] 2.1 Write Vitest tests covering: match, no-match, no-param fallback. **Done when:** All three test scenarios pass.

---

## Technical Notes

### Files to change

| File | Change |
|------|--------|
| `src/routes/notes.js` | Add optional `q` querystring, add filter logic |
| `src/routes/notes.test.js` _(new)_ | Vitest tests for search scenarios |

### Commands
```
npm test
```
