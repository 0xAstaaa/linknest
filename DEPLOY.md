# Deploying LinkNest to Vercel

LinkNest develops locally on a SQLite file. Vercel's filesystem is read-only and
ephemeral, so production needs a hosted database. We use **Turso** (hosted libSQL),
which speaks the same driver this app already uses — so **zero code changes** are
needed, only environment variables.

Everything the app reads is `process.env`-driven, so these are the only moving parts.

---

## 1. Create a Turso database (free)

1. Sign up at **https://turso.tech** (GitHub login works).
2. Install the CLI, or use the web dashboard:
   ```bash
   # macOS/Linux
   curl -sSfL https://get.tur.so/install.sh | bash
   turso auth login
   turso db create linknest
   ```
3. Get the connection details:
   ```bash
   turso db show linknest --url          # -> libsql://linknest-xxxx.turso.io
   turso db tokens create linknest       # -> a long token string
   ```
   Keep both. Call them `DB_URL` and `DB_TOKEN` below.

> No CLI? The Turso web dashboard shows the same URL and lets you create a token.

---

## 2. Push the schema to Turso

From the project folder, run migrations against the remote DB **once**. The Prisma
CLI takes the token as a query param on the URL:

```bash
DATABASE_URL="<DB_URL>?authToken=<DB_TOKEN>" npx prisma migrate deploy
```

Optionally seed a starter profile (otherwise the app creates a blank one on first
visit):

```bash
DATABASE_URL="<DB_URL>" DATABASE_AUTH_TOKEN="<DB_TOKEN>" npm run db:seed
```

---

## 3. Put the code on GitHub

```bash
git init
git add -A
git commit -m "LinkNest"
git branch -M main
git remote add origin https://github.com/<you>/linknest.git
git push -u origin main
```

(The local `.env` and `prisma/dev.db` are gitignored — only `.env.example` ships.)

---

## 4. Import into Vercel

1. Go to **https://vercel.com/new** and import your `linknest` repo.
2. Framework preset: **Next.js** (auto-detected). Leave build settings default —
   the app defines `vercel-build` so Vercel runs `prisma migrate deploy && next build`.
3. Add **Environment Variables** (Project → Settings → Environment Variables):

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | `<DB_URL>` (e.g. `libsql://linknest-xxxx.turso.io`) |
   | `DATABASE_AUTH_TOKEN` | `<DB_TOKEN>` |
   | `DASHBOARD_PASSWORD` | a strong password of your choice |
   | `SESSION_SECRET` | a long random string (e.g. `openssl rand -hex 32`) |

4. Click **Deploy**.

---

## 5. Done

- Your public page: `https://<project>.vercel.app/`
- Owner dashboard: `https://<project>.vercel.app/dashboard` → log in with
  `DASHBOARD_PASSWORD`.

Analytics are real from the first visit — every view and click is written to Turso
and shown in the dashboard chart.

### Custom domain
Project → Settings → Domains → add your domain and follow the DNS instructions.

### Updating later
Push to `main`; Vercel rebuilds and re-runs `prisma migrate deploy` so new
migrations apply automatically.
