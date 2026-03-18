```markdown
## Project Context Analysis

### Requirements Overview
<!-- Summarize functional requirements and NFRs extracted from the PRD/UX spec -->

**Core functionality:**
- <!-- key capability 1 -->
- <!-- key capability 2 -->

**Critical non-functional requirements:**
- <!-- performance, security, compliance, scale targets -->

**Technical constraints:**
- <!-- existing stack, team preferences, deployment targets, integration obligations -->

### Cross-Cutting Concerns
<!-- Real-time needs, multi-tenancy, regulatory, offline, accessibility level -->

---

## Tech Stack & Starter

**Chosen starter / scaffolding:**
<!-- e.g., Create Next.js App, Vite + React, NestJS CLI, etc. -->

**Scaffold command:**
```sh
# command to initialize the project
```

**Tech decisions inherited from starter:**
<!-- List what the starter decided so agents Do not re-decide them -->

| Concern | Decision | Version |
|---------|----------|---------|
| Framework | | |
| Language | | |
| Bundler / compiler | | |
| Test runner | | |
| Linter / formatter | | |

---

## Core Architectural Decisions

### Data Architecture

| Concern | Decision | Rationale |
|---------|----------|-----------|
| Database | | |
| ORM / query layer | | |
| Schema validation | | |
| Migrations | | |
| Caching | | |

### Auth & Security

| Concern | Decision | Rationale |
|---------|----------|-----------|
| Authentication | | |
| Authorization | | |
| Token storage | | |
| Encryption at rest | | |
| API security | | |

### API & Communication

| Concern | Decision | Rationale |
|---------|----------|-----------|
| API style | <!-- REST / GraphQL / tRPC / gRPC --> | |
| Versioning | | |
| Error handling | | |
| Rate limiting | | |
| Real-time (if needed) | | |

### Frontend (if applicable)

| Concern | Decision | Rationale |
|---------|----------|-----------|
| State management | | |
| Component architecture | | |
| Routing | | |
| Data fetching | | |
| Performance strategy | | |

### Infrastructure

| Concern | Decision | Rationale |
|---------|----------|-----------|
| Hosting / cloud | | |
| CI/CD | | |
| Environment config | | |
| Monitoring / logging | | |
| Scaling strategy | | |

---

## Implementation Patterns & Consistency Rules

### Naming Conventions

| Entity | Pattern | Example |
|--------|---------|---------|
| Database tables | | `user_accounts` |
| API endpoints | | `/api/v1/users` |
| Files | | `user-service.ts` |
| Components | | `UserCard.tsx` |
| Variables | | `camelCase` |

### Project Structure

```
<!-- Insert full directory tree here. Use real file names, not generic placeholders. -->
src/
├── ...
```

### API Response Format

```json
{
  "data": {},
  "error": null,
  "meta": {}
}
```

### Error Structure

```json
{
  "code": "RESOURCE_NOT_FOUND",
  "message": "Human-readable message",
  "details": {}
}
```

### Other Conventions

| Concern | Convention |
|---------|------------|
| Date format | <!-- ISO 8601 / Unix timestamp --> |
| JSON field casing | <!-- camelCase / snake_case --> |
| Event naming | <!-- e.g., `user.created` --> |
| Logging format | <!-- structured JSON / plain text --> |
| Loading states | <!-- skeleton / spinner / disabled button --> |
| Validation timing | <!-- on blur / on submit / on change --> |

---

## Integration Boundaries

<!-- Define the seams between layers and services -->

**API boundaries:**
- <!-- e.g., All DB access through service layer — no direct queries in route handlers -->

**Component boundaries:**
- <!-- e.g., Presentational components receive all data via props — no direct store access -->

**Data access patterns:**
- <!-- e.g., Repository pattern for all persistence; no raw SQL in business logic -->

---

## Validation & Gaps

### Decision Compatibility Check
<!-- Confirm tech choices work together, versions are compatible, no contradictions -->
- [ ] All chosen versions compatible
- [ ] No conflicting patterns (e.g., two state management approaches)
- [ ] NFRs have architectural support

### Open Questions
<!-- Decisions still to be resolved. Format: [Question] → [Who decides / by when] -->
- <!-- e.g., WebSocket vs SSE for real-time → decide before Phase 2 -->

### Known Gaps
<!-- Critical / Important / Nice-to-have gaps identified -->
| Gap | Priority | Notes |
|-----|----------|-------|
| | Critical | |
| | Important | |
```
