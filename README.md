# node-project

A small REST API built with **Express** and **SQLite**, featuring JWT authentication.
It manages a collection of "people" (users with a name and age), protected behind
register/login endpoints.

## Features

- CRUD API for people, backed by SQLite (data persists across restarts)
- JWT authentication — passwords hashed with bcrypt
- Protected routes via auth middleware
- Test suite using Node's built-in test runner + supertest
- Environment-based config, ready to deploy on Render

## Tech stack

Express · better-sqlite3 · jsonwebtoken · bcryptjs · dotenv · supertest

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env
# then edit .env and set a real JWT_SECRET, e.g.:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Run in development (auto-restarts on change)
npm run dev

# ...or run in production mode
npm start
```

The server starts on `http://localhost:5000` (or the `PORT` from your `.env`).

## Environment variables

| Variable     | Description                                  | Default   |
| ------------ | -------------------------------------------- | --------- |
| `PORT`       | Port the server listens on                   | `5000`    |
| `JWT_SECRET` | Secret used to sign JWTs (**set in prod**)   | dev value |
| `DB_FILE`    | Path to the SQLite database file             | `data.db` |

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

Runs the suite against an in-memory SQLite database (`DB_FILE=:memory:`), so your
real `data.db` is never touched.

## Deployment (Render)

This repo includes a [`render.yaml`](render.yaml) Blueprint.

1. In the Render dashboard: **New → Blueprint** and point it at this repo.
2. Render generates a strong `JWT_SECRET` automatically.

> ⚠️ The free plan has an ephemeral filesystem, so the SQLite file is wiped on every
> deploy/restart. For durable data, attach a persistent disk (see the commented
> example in `render.yaml`) or migrate to a hosted Postgres database.

## Project structure

```
index.js              Server entry point (loads env, starts listening)
app.js                Express app (routes + middleware), exported for tests
config.js             JWT secret / expiry
db.js                 SQLite connection and schema
routes/               Route definitions (auth, users)
controllers/          Request handlers (auth, users)
middleware/auth.js    JWT verification middleware
tests/                Test suite (auth, people)
```
