# Resource Booking Server

The Stage 1 Express API foundation. The server verifies its PostgreSQL connection before listening and exposes `GET /api/health`.

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `PORT`.
2. Install dependencies with `npm install`.
3. Run the migration in `src/db/migrations/001_initial_schema.sql`.
4. Start the server with `npm run dev`.
