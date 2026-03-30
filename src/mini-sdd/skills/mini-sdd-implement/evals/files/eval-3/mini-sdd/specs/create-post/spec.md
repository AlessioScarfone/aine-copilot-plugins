---
name: create-post
status: ready
created: 2026-03-29
updated: 2026-03-29
requires:
  - user-registration
---

# create-post

## Summary
Add POST /posts endpoint so authenticated users can create blog posts. Requires user accounts to exist first.

## Target User
Registered blog users creating content.

## Scenarios

**Scenario 1: Create a post**
GIVEN a user with id 1 exists
WHEN POST /posts is called with { userId: 1, title: "Hello", body: "World" }
THEN the response is 201 with the new post object

**Scenario 2: Unknown author**
GIVEN no user with id 99 exists
WHEN POST /posts is called with { userId: 99, title: "Oops", body: "..." }
THEN the response is 404 with an error

## Acceptance Criteria
- [ ] POST /posts returns 201 with the new post when userId is valid
- [ ] POST /posts returns 404 when the userId does not exist
- [ ] POST /posts returns 400 when title or body is missing
- [ ] Vitest test covers success and error cases
