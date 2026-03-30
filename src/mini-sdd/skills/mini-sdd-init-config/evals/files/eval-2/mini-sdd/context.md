---
product: notes-api
last_updated: 2026-03-28
---

# Project Context

## Product
A lightweight REST API for managing personal notes. Users can create, read, update, and delete notes. Each note has a title, body, and optional tags.

## Architecture
Single-process Node.js service. REST over HTTP with JSON. No database persistence in the initial version — in-memory store only.

## Tech Stack
- Runtime: Node.js 20
- Framework: Fastify 4
- Test runner: Vitest
- Linter: ESLint

## Non-Functional Requirements
- P99 latency under 50 ms for all CRUD endpoints
- 100% of happy-path routes covered by unit tests
