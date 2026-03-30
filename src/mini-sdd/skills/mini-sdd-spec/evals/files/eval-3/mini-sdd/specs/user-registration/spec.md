---
name: user-registration
status: ready
requires: []
created: 2026-03-10
updated: 2026-03-10
---

# User Registration

## Summary
Allow new users to register by providing a username and password. The API stores the user in-memory and returns the new user's ID.

## User
A new visitor who wants to create an account.

## Scenarios

### Scenario 1: Successful registration
- **GIVEN** no user with the given username exists
- **WHEN** POST /users/register is called with `{ username, password }`
- **THEN** a new user record is created and the response contains the user's `id`

### Scenario 2: Duplicate username
- **GIVEN** a user with the same username already exists
- **WHEN** POST /users/register is called with the same username
- **THEN** the API returns 409 Conflict

## Non-Goals
- Email verification
- Password strength enforcement

## Acceptance Criteria
- [ ] AC1: POST /users/register with valid body returns 201 and `{ id }`
- [ ] AC2: Duplicate username returns 409
- [ ] AC3: Missing username or password returns 400

## Constraints
- No external auth libraries

## Dependencies
- None

## Technical Notes
Store users in a module-level `users` array. Hash passwords with Node's built-in `crypto.createHash`.

## Notes
None.

## Open Questions

| # | Question | Affects | Owner | Status |
|---|----------|---------|-------|--------|

---

## Decision Log

| Decision | Rationale |
|----------|-----------|

---

## Development Notes after implementation
