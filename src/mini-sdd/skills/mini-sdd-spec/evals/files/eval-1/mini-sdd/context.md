---
product: Task Management API
architecture: REST API (single-service, stateless)
stack:
  - Node.js
  - Fastify
  - Vitest
last_updated: 2026-03-20
---

# Project Context

## Product
A lightweight REST API for managing personal tasks. Supports creating, listing, completing, and deleting tasks. Single-user, no auth required.

## Architecture
Single-service REST API. Tasks are stored in-memory (no persistent DB layer yet). All endpoints are under `/tasks`.

## Tech Stack
- **Runtime**: Node.js 20
- **Framework**: Fastify 4
- **Testing**: Vitest

## Key Features
- Create a task (POST /tasks)
- List all tasks (GET /tasks)
- Complete a task (PATCH /tasks/:id)
- Delete a task (DELETE /tasks/:id)

## Non-Functional Requirements
- Response time < 100ms for all endpoints
- JSON content type on all responses
