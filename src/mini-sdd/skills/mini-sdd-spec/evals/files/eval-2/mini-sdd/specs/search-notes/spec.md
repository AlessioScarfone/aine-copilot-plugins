---
name: search-notes
status: ready
requires: []
created: 2026-03-15
updated: 2026-03-15
---

# Search Notes

## Summary
Allow users to search notes by keyword, returning all notes whose title or body contains the query string. The search is case-insensitive and operates against the in-memory store.

## User
End user who wants to quickly find a specific note.

## Scenarios

### Scenario 1: Matching notes returned
- **GIVEN** the notes store contains several notes
- **WHEN** the user sends GET /notes?q=meeting
- **THEN** only notes containing "meeting" (case-insensitive) in title or body are returned

### Scenario 2: No matches
- **GIVEN** the notes store contains notes that don't match the query
- **WHEN** the user sends GET /notes?q=xyznonexistent
- **THEN** an empty array is returned with status 200

## Non-Goals
- Full-text search indexing or ranking
- Search across tags
- Pagination

## Acceptance Criteria
- [ ] AC1: GET /notes?q=<term> returns only matching notes
- [ ] AC2: Matching is case-insensitive
- [ ] AC3: When no notes match, the response is an empty array with 200 status
- [ ] AC4: When no `q` param is provided, behaviour falls back to listing all notes

## Constraints
- Must not introduce any new dependencies

## Dependencies
- None

## Technical Notes
Filter the in-memory notes array using `String.prototype.includes()`. The existing GET /notes route handler in `src/routes/notes.js` must be modified to accept an optional `q` querystring parameter.

## Notes
Assumptions: note objects have `id`, `title`, `body` fields.

## Open Questions

| # | Question | Affects | Owner | Status |
|---|----------|---------|-------|--------|
| 1 | Should search also match tags when tags are added later? | AC scope | | Open |

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Case-insensitive match | Most natural for a simple search box |

---

## Development Notes after implementation
