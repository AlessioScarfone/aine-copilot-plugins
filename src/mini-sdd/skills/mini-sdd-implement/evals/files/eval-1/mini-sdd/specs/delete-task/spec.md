---
name: delete-task
status: ready
created: 2026-03-25
updated: 2026-03-25
requires: []
---

# delete-task

## Summary
Add a DELETE /tasks/:id endpoint so users can remove tasks by ID.

## Target User
API consumer automating personal task management.

## Scenarios

**Scenario 1: Delete existing task**
GIVEN a task with id "abc" exists
WHEN DELETE /tasks/abc is called
THEN the task is removed and the response is 204 No Content

**Scenario 2: Delete non-existent task**
GIVEN no task with id "xyz" exists
WHEN DELETE /tasks/xyz is called
THEN the response is 404 Not Found

## Acceptance Criteria
- [ ] DELETE /tasks/:id returns 204 when the task is found and deleted
- [ ] DELETE /tasks/:id returns 404 when the task does not exist
- [ ] Remaining tasks are unaffected after deletion
- [ ] A Vitest test covers both the success and not-found scenarios
