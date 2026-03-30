# Project Context

> Last updated: 2026-02-10

## Product

**Name**: Inventory Service
**Description**: A backend service for managing product inventory across multiple warehouses. Used by warehouse operators and supply chain managers.

## Key Features

- Product catalog management
- Stock level tracking per warehouse
- Reorder alerts when stock drops below threshold
- CSV import/export for bulk operations

## Architecture

**Description**: Monolithic Express REST API with MongoDB for document storage.

### Components

| Component | Responsibility | Tech |
|-----------|---------------|------|
| API Server | REST endpoints | Express 4 |
| Database | Document storage | MongoDB / Mongoose |

## Tech Stack

- **Language(s)**: JavaScript (Node.js 20)
- **Framework(s)**: Express 4
- **Database**: MongoDB
- **Testing**: Jest + Supertest
- **Build / Bundler**: N/A (no bundler)
- **CI/CD**: GitHub Actions
- **Deployment**: Docker on AWS ECS

## Non-Functional Requirements

- Response time < 300ms for reads
- Must handle 500 concurrent warehouse users

## Critical Constraints

- Must stay compatible with existing MongoDB schemas

## Notes

Initial version shipped. Moving to PostgreSQL for the users table in next sprint.
