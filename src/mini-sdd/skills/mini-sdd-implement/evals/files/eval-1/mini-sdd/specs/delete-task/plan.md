# Plan: delete-task

## Approach
Add a DELETE route to the Fastify server. Tasks are stored in a module-level `tasks` Map keyed by id. The handler removes the entry and returns 204, or replies 404 if the id is absent. Wrap existing task logic in a shared module so the new test can import it cleanly.

## Trade-offs
- In-memory only — no persistence; acceptable given the current context.md architecture.

## Tasks

### Setup
- [ ] Extract the tasks store into `src/tasks-store.js` so it can be shared between the route file and tests

### Implementation
- [ ] Add `DELETE /tasks/:id` route in `src/routes/tasks.js` — reply 204 on success, 404 when not found

### Tests
- [ ] Add Vitest tests for DELETE /tasks/:id covering the 204 and 404 cases in `src/routes/tasks.test.js`
