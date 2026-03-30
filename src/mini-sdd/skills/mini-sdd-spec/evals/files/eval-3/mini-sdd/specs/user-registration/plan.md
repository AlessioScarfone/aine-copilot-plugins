---
spec-name: user-registration
status: ready
created: 2026-03-10
updated: 2026-03-10
---

## Approach

Add a `POST /users/register` Fastify route that validates the request body, checks for duplicate usernames in the in-memory `users` array, hashes the password with `crypto.createHash('sha256')`, and returns the new user ID.

---

## Tasks

### 1. User store
- [ ] 1.1 Create `src/users/users-store.js` with a module-level `users` array and `addUser` / `findByUsername` helpers. (AC1) **Done when:** Module exports both helpers without error.

### 2. Registration route
- [ ] 2.1 Create `src/routes/users.js` with POST /users/register handler. (AC1, AC2, AC3) **Done when:** Route validates body, hashes password, saves user, and returns `{ id }` with 201.
- [ ] 2.2 Register users route in `src/app.js`. **Done when:** Server starts and route is reachable.

### 3. Tests
- [ ] 3.1 Write Vitest tests for success, duplicate username, and missing fields. **Done when:** All three scenarios tested and passing.

---

## Technical Notes

### Files to change

| File | Change |
|------|--------|
| `src/users/users-store.js` _(new)_ | In-memory store |
| `src/routes/users.js` _(new)_ | Registration route |
| `src/app.js` | Register users plugin |
| `src/routes/users.test.js` _(new)_ | Vitest tests |
