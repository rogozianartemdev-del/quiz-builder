# Quiz Builder

A full-stack web application for building custom quizzes. Users can create quizzes with
different question types, browse all quizzes in a dashboard, open any quiz in a read-only
detail view, and (as a bonus) take a quiz and check their answers.

- **Backend:** Node.js, Express 5, TypeScript, Prisma, PostgreSQL
- **Frontend:** React, TypeScript, Vite, React Router, React Hook Form, Zod, React-Bootstrap
- **Infrastructure:** Docker / Docker Compose
- **Auth:** JWT (Bearer token)
- **Tests:** Jest + Supertest (backend)

## Features

### Required by the assignment

- Create a quiz with a title and one or more questions (`/create`)
  - **Boolean** – True/False radio buttons
  - **Input** – short text answer
  - **Checkbox** – multiple options, several of them can be correct
  - Questions can be added and removed dynamically
- Quiz list (`/quizzes`) with title, number of questions, link to details and a delete icon
  (removes the quiz from the database and from the page)
- Quiz details (`/quizzes/:id`) – title and questions rendered in read-only mode
- REST API: `POST /quizzes`, `GET /quizzes`, `GET /quizzes/:id`, `DELETE /quizzes/:id`
- ESLint + Prettier, `.env` based configuration, Prisma migrations, seed script

### Added on top of the assignment

These were not part of the original task:

- **Registration and login with JWT.** All `/quizzes*` endpoints require
  `Authorization: Bearer <token>`. The frontend stores the token, attaches it to every
  request and logs the user out automatically on `401`.
- **Ownership rule.** Every quiz belongs to its author. Everyone who is logged in can see
  all quizzes, but only the author can delete a quiz (otherwise the API returns `403`).
- **Backend test suite** covering all backend code (auth, quizzes, validation, error
  handling, token service, config, Prisma repositories). Tests run without a database.
- **Everything runs in Docker** (database, backend with automatic migrations, frontend
  served by nginx) plus a separate service for running tests in a container.
- **"Take quiz" page** (`/quizzes/:id/take`) where answers can be entered and checked.
  The read-only detail page required by the assignment is left unchanged.
- Server-side validation with Zod, helmet, CORS, bcrypt password hashing.

## Project structure

```
quiz-builder/
├── docker-compose.yml
├── .env.example               # variables for docker compose
├── README.md
├── backend/
│   ├── Dockerfile             # stages: base, test, build, runtime
│   ├── prisma/                # schema.prisma, migrations/, seed.ts
│   ├── src/
│   │   ├── routes/            # HTTP layer
│   │   ├── services/          # business logic (auth, quizzes, tokens)
│   │   ├── repositories/      # database access (Prisma)
│   │   ├── middleware/        # auth, validation, error handling
│   │   ├── schemas/           # Zod request schemas
│   │   ├── app.ts             # express app factory
│   │   └── server.ts          # entry point
│   └── tests/                 # Jest + Supertest
└── frontend/
    ├── Dockerfile, nginx.conf
    └── src/
        ├── pages/             # one folder per page: <Page>.tsx + use<Page>.ts (logic)
        ├── components/        # shared components (Layout, ProtectedRoute)
        ├── services/          # API client
        ├── context/           # auth context
        └── schemas/           # form validation
```

The frontend keeps markup and logic apart: each page folder contains a `.tsx` file with
the markup and a `use*.ts` hook with the logic (state, requests, forms).

## Requirements

- Node.js 20+
- Docker and Docker Compose

## Quick start (everything in Docker)

```bash
cp .env.example .env        # then set JWT_SECRET to a long random string
docker compose up --build
```

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:5173  |
| API      | http://localhost:4000  |
| Postgres | localhost:5432         |

Database migrations are applied automatically when the backend container starts.

Open http://localhost:5173, click **Sign up**, create an account and you can start
building quizzes. To stop and remove the database volume: `docker compose down -v`.

## Local development (without containers for the apps)

### 1. Database

```bash
cp .env.example .env
docker compose up -d db
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy   # create tables
npm run seed                # optional: demo user and a sample quiz
npm run dev                 # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

## Environment variables

`.env` files are not committed – copy the `.env.example` files.

**Root `.env`** (used by docker compose)

| Variable | Description | Default |
|---|---|---|
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Database credentials | `quiz` |
| `JWT_SECRET` | Secret for signing tokens (**required**) | – |
| `JWT_EXPIRES_IN` | Token lifetime | `1h` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `VITE_API_URL` | API URL baked into the frontend build | `http://localhost:4000` |

**`backend/.env`** (local development)

| Variable | Description |
|---|---|
| `PORT` | API port (`4000`) |
| `DATABASE_URL` | `postgresql://quiz:quiz@localhost:5432/quiz?schema=public` |
| `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` | Same as above |

**`frontend/.env`**

| Variable | Description |
|---|---|
| `VITE_API_URL` | API base URL (`http://localhost:4000`) |

## Creating a sample quiz

**Option 1 – seed script.** `npm run seed` (in `backend/`) creates a demo user
`demo@example.com` / `password123` and a "Sample quiz" with one question of each type.
Running it again creates one more sample quiz.

**Option 2 – through the UI.** Sign up, open **Create**, fill in the form and save.

**Option 3 – through the API.**

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"me@example.com","password":"password123"}' | jq -r .token)

curl -X POST http://localhost:4000/quizzes \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "JS basics",
    "questions": [
      { "type": "BOOLEAN", "text": "JavaScript is statically typed", "correctBoolean": false },
      { "type": "INPUT", "text": "Keyword to declare a constant?", "correctText": "const" },
      { "type": "CHECKBOX", "text": "Which values are falsy?", "options": [
        { "text": "0", "isCorrect": true },
        { "text": "\"\"", "isCorrect": true },
        { "text": "\"0\"", "isCorrect": false }
      ]}
    ]
  }'
```

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | – | Create an account, returns `{ token, user }` |
| POST | `/auth/login` | – | Log in, returns `{ token, user }` |
| POST | `/quizzes` | ✓ | Create a quiz (`201`) |
| GET | `/quizzes` | ✓ | List quizzes: `id`, `title`, `questionsCount`, `authorId`, `createdAt` |
| GET | `/quizzes/:id` | ✓ | Full quiz with all questions and options (`404` if not found) |
| DELETE | `/quizzes/:id` | ✓ | Delete a quiz (`204`; `403` if you are not the author) |
| GET | `/health` | – | Health check |

Errors are returned as `{ "message": "...", "details": ... }`. Validation errors use
status `400`; missing or invalid tokens use `401`.

**Validation rules:** title 1–200 characters; 1–50 questions; checkbox questions need
2–10 options with at least one correct; the expected answer of an input question is
optional; passwords are 8–72 characters.

## Tests, linting, formatting

```bash
cd backend
npm test                     # run tests
npm run test:cov             # tests with coverage report (threshold: 90%)
npm run lint
npm run format:check         # or: npm run format

cd ../frontend
npm run lint
npm run format:check
```

Backend tests use in-memory repositories, so they do not need a database. To run them in
a container:

```bash
docker compose run --rm backend-test
```

## Notes and limitations

- The JWT is stored in `localStorage` for simplicity. For production, an httpOnly cookie
  with a refresh token would be safer.
- The "Take quiz" page checks answers in the browser, because the API returns the correct
  answers (the read-only view needs them). That is fine for a demo, but a real quiz
  platform should grade on the server and hide correct answers from participants.
- There is no rate limiting on the auth endpoints.
- `server.ts` (the process entry point) is excluded from coverage, and the Prisma
  repositories are tested against a mocked client, not a real database.