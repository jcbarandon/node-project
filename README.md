# node-project

A small REST API built with **Express** and **Postgres**, featuring JWT authentication.
It manages a collection of "people" (users with a name and age), protected behind
register/login endpoints.

## Features

- CRUD API for people, backed by Postgres
- JWT authentication — passwords hashed with bcrypt
- Protected routes via auth middleware
- Test suite using Node's built-in test runner + supertest (runs against in-memory Postgres — no server needed)
- Environment-based config, ready to deploy on Render

## Tech stack

Express · pg (Postgres) · jsonwebtoken · bcryptjs · dotenv · supertest · pg-mem (tests)

## Getting started

You need a running Postgres database. Locally you can create one with:

```bash
createdb node_project
```

Then:

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env
# then edit .env:
#   - set DATABASE_URL to your Postgres connection string
#   - set a real JWT_SECRET, e.g.:
#       node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Run in development (auto-restarts on change)
npm run dev

# ...or run in production mode
npm start
```

The tables are created automatically on startup.

The server starts on `http://localhost:5000` (or the `PORT` from your `.env`).

## Environment variables

| Variable       | Description                                             | Default   |
| -------------- | ------------------------------------------------------- | --------- |
| `PORT`         | Port the server listens on                              | `5000`    |
| `JWT_SECRET`   | Secret used to sign JWTs (**required** — app won't start without it) | —     |
| `DATABASE_URL` | Postgres connection string                              | —         |
| `DATABASE_SSL` | Set to `true` for managed Postgres that requires SSL    | `false`   |

## API

### Auth (public)

#### `POST /auth/register`

```json
{ "email": "joe@example.com", "password": "secret123" }
```

Returns `201` with a token:

```json
{ "token": "eyJhbGciOi..." }
```

Errors: `400` missing fields · `409` email already registered.

#### `POST /auth/login`

```json
{ "email": "joe@example.com", "password": "secret123" }
```

Returns `200` with a token. Errors: `400` missing fields · `401` invalid credentials.

### People (protected)

All `/people` routes require an `Authorization` header:

```
Authorization: Bearer <token>
```

| Method   | Path          | Description            | Success |
| -------- | ------------- | ---------------------- | ------- |
| `GET`    | `/people`     | List all people        | `200`   |
| `POST`   | `/people`     | Create a person        | `201`   |
| `GET`    | `/people/:id` | Get one person         | `200`   |
| `PATCH`  | `/people/:id` | Update a person        | `200`   |
| `DELETE` | `/people/:id` | Delete a person        | `200`   |

Create/update body:

```json
{ "username": "joe", "age": 30 }
```

Missing token → `401`. Unknown id → `404`. Missing fields on create → `400`.

### Example flow

```bash
# Register (or log in) to get a token
TOKEN=$(curl -s -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"joe@example.com","password":"secret123"}' | jq -r .token)

# Create a person
curl -X POST http://localhost:5000/people \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"username":"joe","age":30}'

# List people
curl http://localhost:5000/people -H "Authorization: Bearer $TOKEN"
```

## Testing

```bash
npm test
```

Runs the suite against an in-memory Postgres (`pg-mem`), so no database server is
required and your real database is never touched.

## Deployment (Render)

This repo includes a [`render.yaml`](render.yaml) Blueprint that provisions both the
web service and a managed Postgres database.

1. In the Render dashboard: **New → Blueprint** and point it at this repo.
2. Render creates the Postgres database, injects `DATABASE_URL`, and generates a
   strong `JWT_SECRET` automatically.

Data persists in the managed Postgres database across deploys and restarts.

## Project structure

```
index.js              Server entry point (loads env, starts listening)
app.js                Express app (routes + middleware), exported for tests
config.js             JWT secret / expiry
db.js                 Postgres connection pool and schema (initDb)
routes/               Route definitions (auth, users)
controllers/          Request handlers (auth, users)
middleware/           JWT verification + async error wrapper
tests/                Test suite (auth, people)
```
