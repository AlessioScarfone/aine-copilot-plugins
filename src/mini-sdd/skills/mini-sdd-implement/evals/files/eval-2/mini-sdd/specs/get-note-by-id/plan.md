# Plan: get-note-by-id

## Approach
Add a route handler for `GET /notes/:id`. Parse the id as an integer and look it up in the notes array. Return the note on match or a 404 JSON error.

## Trade-offs
- In-memory store — no persistence; consistent with existing architecture.

## Tasks

### Implementation
- [x] Add `GET /notes/:id` route handler in `src/routes/notes.js`
- [x] Parse the id param as an integer and find the note in the store

### Tests
- [ ] Add Jest + Supertest test for `GET /notes/:id` — success case (200)
- [ ] Add Jest + Supertest test for `GET /notes/:id` — not found case (404)
