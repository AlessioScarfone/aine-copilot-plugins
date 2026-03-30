---
name: get-note-by-id
status: in-progress
created: 2026-03-27
updated: 2026-03-28
requires: []
---

# get-note-by-id

## Summary
Add a GET /notes/:id endpoint that returns a single note by its numeric ID, or 404 if not found.

## Target User
API consumers retrieving a specific note.

## Scenarios

**Scenario 1: Note exists**
GIVEN a note with id 1 has been created
WHEN GET /notes/1 is called
THEN the response is 200 with the note object

**Scenario 2: Note not found**
GIVEN no note with id 99 exists
WHEN GET /notes/99 is called
THEN the response is 404 with an error message

## Acceptance Criteria
- [ ] GET /notes/:id returns 200 and the note when found
- [ ] GET /notes/:id returns 404 with a message when not found
- [ ] Jest test covers both scenarios
- [ ] Existing GET /notes endpoint is unaffected
