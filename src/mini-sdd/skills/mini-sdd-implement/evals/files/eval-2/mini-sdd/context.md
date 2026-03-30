---
product: Notes App API
architecture: REST API
stack:
  - Node.js
  - Express
  - Jest
last_updated: 2026-03-28
---

# Project Context

## Product
A simple REST API for creating and retrieving markdown notes.

## Architecture
Single Express service. Notes are stored in a module-level array (in-memory).

## Tech Stack
- **Runtime**: Node.js 20
- **Framework**: Express 4
- **Testing**: Jest + Supertest

## Key Features
- POST /notes — create a note
- GET /notes — list all notes
- GET /notes/:id — get a note by ID (partial implementation in-progress)

## Non-Functional Requirements
- Simple and fast; no authentication needed
