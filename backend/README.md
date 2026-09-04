# Trakive Backend

The RESTful API backend service for the **Trakive** internship onboarding and performance tracking platform.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase compatible)
- **Database Driver**: `pg` (Node-Postgres)
- **Language**: JavaScript (ES6+)

---

## Directory Structure

```text
backend/
├── src/
│   ├── config/          # App & PostgreSQL / Supabase configuration
│   ├── controllers/     # API request controllers (health, etc.)
│   ├── database/        # Database migrations & seeds
│   │   ├── migrations/  # SQL schema migrations (001_initial_schema.sql)
│   │   ├── seeds/       # SQL seed scripts (001_roles_permissions.sql)
│   │   ├── migrate.js   # Migration runner script
│   │   ├── seed.js      # Seed runner script
│   │   └── verify.js    # Schema & seed verification runner
│   ├── middleware/      # Security, CORS, logging, validation, & error handling
│   ├── models/          # PostgreSQL Data Access Layer & Model Abstractions
│   ├── routes/          # API routes (versioned)
│   ├── services/        # Business logic & external service integrations
│   ├── utils/           # Shared utilities (errors, responses, validation, etc.)
│   ├── jobs/            # Background tasks & cron workers
│   ├── app.js           # Express application setup
│   └── server.js        # Server entry point & process management
├── .env                 # Environment variables (git-ignored)
├── .env.example         # Environment template
├── package.json         # Dependencies & scripts
└── README.md            # Backend documentation
```

---

## Environment Variables

Copy `.env.example` to `.env` and adjust the variables for your environment:

```bash
cp .env.example .env
```

| Variable                     | Default Value           | Description                                              |
| :--------------------------- | :---------------------- | :------------------------------------------------------- |
| `PORT`                       | `5000`                  | HTTP Server Port                                         |
| `NODE_ENV`                   | `development`           | Environment mode (`development` / `production` / `test`) |
| `CORS_ORIGIN`                | `http://localhost:5173` | Allowed CORS origin                                      |
| `DATABASE_URL`               | _Optional_              | Full Supabase PostgreSQL connection string               |
| `DB_HOST`                    | `localhost`             | PostgreSQL Database Host                                 |
| `DB_PORT`                    | `5432`                  | PostgreSQL Database Port                                 |
| `DB_NAME`                    | `trakive_db`            | PostgreSQL Database Name                                 |
| `DB_USER`                    | `postgres`              | PostgreSQL Database User                                 |
| `DB_PASSWORD`                | `postgres`              | PostgreSQL Database Password                             |
| `DB_SSL`                     | `false`                 | Enable SSL (Required for Supabase)                       |
| `DB_SSL_REJECT_UNAUTHORIZED` | `true`                  | Enforce strict SSL certificate verification              |
| `DB_MAX_CONNECTIONS`         | `20`                    | Max Pool Connections                                     |
| `RATE_LIMIT_WINDOW_MS`       | `900000`                | Rate limiter window in ms (15 minutes)                   |
| `RATE_LIMIT_MAX_REQUESTS`    | `100`                   | Max requests per window                                  |

---

## Database Setup & Migrations

### 1. PostgreSQL / Supabase Setup

Ensure your PostgreSQL instance (or Supabase PostgreSQL project) is running.

### 2. Run Database Migrations

Executes all SQL schema migrations from an empty database to build the complete table structure, foreign key constraints, checks, indexes, and triggers:

```bash
npm run migrate
```

### 3. Run Database Seeds

Seeds system roles (`super_admin`, `org_admin`, `department_head`, `supervisor`, `intern`), permission definitions, and default role-permission mappings:

```bash
npm run seed
```

### 4. Full Database Setup (Migrate + Seed)

Runs migrations and seeds in sequence:

```bash
npm run db:setup
```

### 5. Verify Database Schema & Seed Data

Runs verification checks against the database:

```bash
node src/database/verify.js
```

`npm run seed` also creates a supervisor account for portal verification:

| Email                    | Password         |
| ------------------------ | ---------------- |
| `supervisor@trakive.com` | `Supervisor123!` |

---

## Running the Backend

### Development Mode (with hot reloading via nodemon)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

---

## Health Check Endpoints

- **Root API Health Check**: `GET /api/health`
- **Versioned Health Check**: `GET /api/v1/health`

### Sample Health Check Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "API and database are healthy",
  "data": {
    "status": "ok",
    "timestamp": "2026-08-14T07:51:32.000Z",
    "environment": "development",
    "uptime": "12s",
    "database": {
      "status": "connected",
      "latencyMs": 4
    },
    "process": {
      "pid": 12972,
      "nodeVersion": "v22.16.0",
      "memoryUsage": {
        "rss": "49MB",
        "heapTotal": "17MB",
        "heapUsed": "11MB"
      }
    }
  }
}
```
