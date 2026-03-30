# Task Management API

REST API for teams to manage tasks, projects, and deadlines.

## Getting started

```bash
npm install
npm run dev
```

Requires PostgreSQL 15+. Copy `.env.example` to `.env` and configure your database connection.

## Environment variables

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret key for signing JWT tokens
- `PORT` — Server port (default: 3000)
