# Plan: create-post

## Approach
Add POST /posts route. Validate that the userId refers to an existing user. Store posts in a module-level Map.

## Tasks

### Implementation
- [ ] Create `src/routes/posts.js` with POST /posts handler
- [ ] Check that userId exists in the users store; return 404 if not
- [ ] Validate required fields; return 400 on missing title or body

### Tests
- [ ] Add Vitest tests for POST /posts — success, 404, and 400 cases
