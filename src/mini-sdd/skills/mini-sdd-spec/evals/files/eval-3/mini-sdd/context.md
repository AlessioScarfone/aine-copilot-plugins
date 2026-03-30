---
product: Blog API
architecture: REST API (single-service, stateless)
stack:
  - Node.js
  - Fastify
  - Vitest
last_updated: 2026-03-20
---

# Project Context

## Product
A REST API for a simple blog platform. Authors can register, authenticate, and publish posts. Readers can list and view posts.

## Architecture
Single-service REST API. Data stored in-memory. Auth via simple token check (no JWT yet).

## Tech Stack
- **Runtime**: Node.js 20
- **Framework**: Fastify 4
- **Testing**: Vitest

## Key Features
- User registration (POST /users/register)
- User login (POST /users/login)
- List posts (GET /posts)
- View post (GET /posts/:id)

## Non-Functional Requirements
- All protected routes require an `Authorization` header
