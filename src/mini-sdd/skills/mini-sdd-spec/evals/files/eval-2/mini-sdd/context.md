---
product: Notes API
architecture: REST API (single-service, stateless)
stack:
  - Node.js
  - Fastify
  - Vitest
last_updated: 2026-03-20
---

# Project Context

## Product
A REST API for creating and managing personal notes. Users can create, list, update, and delete notes. Notes support plain-text content and optional tags.

## Architecture
Single-service REST API. Notes stored in-memory. Endpoints under `/notes`.

## Tech Stack
- **Runtime**: Node.js 20
- **Framework**: Fastify 4
- **Testing**: Vitest

## Key Features
- Create a note (POST /notes)
- List all notes (GET /notes)
- Update a note (PATCH /notes/:id)
- Delete a note (DELETE /notes/:id)

## Non-Functional Requirements
- Response time < 200ms for all endpoints
