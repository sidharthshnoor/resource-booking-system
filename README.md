# Resource Booking System

Stage 1 foundation for a production-quality resource booking system. It establishes the React/Vite client, Express REST API foundation, PostgreSQL connection, and initial relational schema. Authentication, booking APIs, and application UI are intentionally deferred to later stages.

## Technology Stack

- Frontend: React and Vite, JavaScript
- Backend: Node.js and Express
- Database: PostgreSQL
- API style: REST

## Folder Structure

```text
client/                 Minimal React/Vite application
server/
  src/
    config/             Environment and database configuration
    controllers/        HTTP request handlers
    db/migrations/      Re-creatable PostgreSQL schema
    middleware/         Future shared middleware
    models/             Future data-access models
    routes/             API route definitions
    services/           Future business logic
    utils/              Shared utilities
    app.js              Express application
    server.js           HTTP server and startup
```

## PostgreSQL Setup

Create an empty database, for example:

```bash
createdb resource_booking_db
```

Then apply the schema from the repository root:

```bash
psql -d resource_booking_db -f server/src/db/migrations/001_initial_schema.sql
```

The migration enables `btree_gist` and uses a PostgreSQL exclusion constraint on each resource's half-open time range. Pending and approved bookings for the same resource therefore cannot overlap, including under concurrent writes. Adjacent bookings are allowed.

## Environment Variables

Copy `.env.example` to `server/.env` and replace the placeholders:

```text
DATABASE_URL=postgresql://username:password@localhost:5432/resource_booking_db
PORT=5000
JWT_SECRET=your_secret_here
```

`JWT_SECRET` is reserved for the authentication stage and is not used yet. Never commit `.env`.

## Install and Run

Backend:

```bash
cd server
npm install
npm run dev
```

Frontend, in a second terminal:

```bash
cd client
npm install
npm run dev
```

## Verification

With the backend running, request:

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{"success":true,"message":"Resource Booking API is running"}
```

The backend prints `PostgreSQL connection verified` before it starts listening. If the connection cannot be established, startup exits with an error.
