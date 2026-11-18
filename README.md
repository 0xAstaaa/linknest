# LinkNest

A single-tenant, self-hosted **link-in-bio page** with an editorial design and a
password-protected dashboard. One person hosts it; visitors see the public page at
`/`; the owner edits everything at `/dashboard`.

Built with **Next.js 16** (App Router, Server Actions), **Prisma 7** + **libSQL/SQLite**,
**Tailwind CSS 4**, and **simple-icons** for official brand glyphs.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React Server Components, Server Actions) |
| Language | TypeScript |
| Database | Prisma 7 ORM with the libSQL driver adapter — SQLite locally, Turso in prod |
| Styling | Tailwind CSS 4, custom editorial design system |
| Auth | Password + HMAC-signed, HTTP-only cookie session (no external auth service) |
| Drag & drop | dnd-kit |
| Icons | simple-icons (official brand SVG paths) |
| Analytics | Event-sourced; inline-SVG time-series chart (no chart library) |

## Features

- Public editorial link page with 6 monochrome themes
- Password-gated dashboard (set via env) with a signed-cookie session
- Drag-and-drop link ordering, active toggles, live phone preview
- Auto-detected brand icons (GitHub, Instagram, X, YouTube, TikTok, Spotify, …)
- **Real analytics** — every view & click is logged as a timestamped event;
  the dashboard shows a true 7-day chart, totals, and click-through rate.
  No personal data is stored (no IPs, no cookies, no identifiers).

## Local development

```bash
npm install
cp .env.example .env        # then edit DASHBOARD_PASSWORD
npx prisma migrate dev      # creates prisma/dev.db
npm run db:seed             # optional: demo profile + sample events
npm run dev                 # http://localhost:3000
```

- Public page: `http://localhost:3000/`
- Dashboard: `http://localhost:3000/dashboard` (redirects to `/login`)

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DASHBOARD_PASSWORD` | yes | Password for the owner dashboard |
| `SESSION_SECRET` | recommended | Signs the session cookie (use a long random string) |
| `DATABASE_URL` | prod only | Turso libSQL URL; unset = local SQLite file |
| `DATABASE_AUTH_TOKEN` | prod only | Turso auth token (runtime) |

## Deploying to Vercel (with Turso)

Vercel's filesystem is ephemeral, so the local SQLite file can't be used in
production. We use **Turso** (hosted libSQL — the same driver this app already
uses), which has a free tier. See `DEPLOY.md` for the full step-by-step.

Quick version:

1. Create a free database at [turso.tech](https://turso.tech) and copy its URL +
   auth token.
2. Push migrations to it:
   ```bash
   DATABASE_URL="libsql://YOUR-DB.turso.io?authToken=YOUR_TOKEN" npx prisma migrate deploy
   ```
3. Import the repo in Vercel and set the env vars above
   (`DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `DASHBOARD_PASSWORD`, `SESSION_SECRET`).
4. Deploy. The build runs `prisma migrate deploy && next build` automatically
   (see `vercel-build` in `package.json`).

## License

MIT — see [LICENSE](./LICENSE).
