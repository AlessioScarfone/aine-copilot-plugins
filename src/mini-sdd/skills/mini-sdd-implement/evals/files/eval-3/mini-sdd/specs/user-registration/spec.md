---
name: user-registration
status: ready
created: 2026-03-28
updated: 2026-03-28
requires: []
---

# user-registration

## Summary
Add POST /users endpoint for creating user accounts with a username and email.

## Acceptance Criteria
- [ ] POST /users returns 201 with the created user
- [ ] POST /users returns 400 if username or email is missing
- [ ] Duplicate username returns 409
