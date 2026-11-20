# MU EventHub — ICT251 Activity 7 Backend

Independent Express + PostgreSQL API for the Student Event Proposals System. Activity 6 stays at https://mu-eventhub.netlify.app; do not connect it for Activity 7 testing.

## 1. Database

Create a hosted PostgreSQL database (e.g. a hosted PostgreSQL provider). In its SQL editor, run `schema.sql`, then run `seed.sql`. The seed script inserts 8 fictional proposals only if the table is empty.

**Note on assignment:** The PDF mentions SQLite on pages 1 and 4, but its required npm install command uses `pg` and its SQL examples use PostgreSQL `$1` placeholders and `RETURNING`. This implementation follows the detailed PostgreSQL instructions. Ask the lecturer if SQLite is mandatory.

## 2. Local setup

Install a current Node.js LTS. In the `activity7-backend` directory:

```bash
npm install
```

Copy `.env.example` to `.env` and replace `DATABASE_URL` with your actual PostgreSQL connection string. Set `STUDENT_NUMBER` to your number, and `PGSSL=true` only if your database host requires SSL. The `.env` file must never be committed.

```bash
npm start
```

On PowerShell, use `npm.cmd` if `npm.ps1` is blocked.

Open http://localhost:3000 and http://localhost:3000/health; a successful database connection returns HTTP 200. `npm install` creates `package-lock.json`; commit it together with `package.json`.

## 3. Test using Postman (without Activity 6)

- GET `http://localhost:3000/health` -> 200
- GET `http://localhost:3000/api/records` -> 200 and JSON array
- POST `http://localhost:3000/api/records` -> 201 with new ID. Select Body > raw > JSON and paste:

```json
{
  "title": "Student Science Fair",
  "category": "Academic",
  "description": "A showcase of practical student science projects.",
  "status": "Pending"
}
```

- GET `http://localhost:3000/api/records/9` (replace 9 with new returned ID) -> 200
- PUT same URL with all 4 fields, changing status to `In progress` -> 200, ID unchanged
- DELETE same URL -> 200 `{"message":"Record deleted."}`
- GET the deleted ID -> 404
- POST missing title or unknown status -> 400
- GET `/api/records/abc` -> 400
- GET `/api/records/999999` -> 404
- POST invalid JSON -> 400
- Restart the server and verify records persist.

## 4. Deploy on Render

1. Push this folder to a GitHub repo. Never commit `.env` or `node_modules`.
2. In Render, create a **Web Service** connected to the repo, using the **Node** runtime.
3. Build command: `npm install`; Start command: `npm start`.
4. Set environment variables `DATABASE_URL`, `CLIENT_ORIGINS=https://mu-eventhub.netlify.app`, `STUDENT_NUMBER`, and `PGSSL` per your provider. Render supplies `PORT` automatically.
5. Deploy. Open your Render base URL `/`, then `/health` and `/api/records`.
6. Repeat POST, GET, PUT, DELETE, validation and restart tests against the hosted service via Postman.
7. Submit only the hosted **backend base URL** in the Activity 7 form. Do not submit the Activity 6 URL as the Activity 7 link.

Render free instances can sleep when idle, and their local filesystem is ephemeral, which is why persistent data is held in hosted PostgreSQL.

## Required project files

- `server.js`: Express, CORS, guide, health, error handling
- `db.js`: PostgreSQL pool
- `routes/records.js`: 5 REST handlers, validation
- `schema.sql`: table and constraints
- `seed.sql`: 8 demo records
- `.env.example`: local configuration template
- `.gitignore`: excludes secrets and dependencies
