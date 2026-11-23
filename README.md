# What It Really Cost

A ledger of what real AI-built apps cost to build. Plan pages show the sticker price. This shows credits, tokens, or dollars someone stated for a specific build, with a link to the source.

Hosted at [cost.belairestudio.com](https://cost.belairestudio.com). Next.js App Router, TypeScript, Tailwind, Postgres (a Supabase connection string is fine).

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev
```

The site runs with no `DATABASE_URL`. Lists, averages, and the sponsor bar stay empty, and the copy says the database isn’t connected. Signup still accepts an address: it is appended to `data/signups.jsonl` (gitignored) and is not sent to Resend. Submit and the sponsor form say the queue isn’t connected.

With a database:

```bash
npm run db:migrate
npm run db:seed
```

`db:migrate` runs `db/schema.sql`. Every statement is `CREATE TABLE IF NOT EXISTS` (plus indexes), so it is safe to run again. `db:seed` upserts `db/seed.json` on slug.

The client is [postgres.js](https://github.com/porsager/postgres) with `prepare: false`, which is what Supabase’s transaction pooler (port 6543) needs. It is not the Supabase JS client.

## Environment

See `.env.example`.

| Variable | Used for |
| --- | --- |
| `DATABASE_URL` | Postgres. Empty is allowed; the UI degrades. |
| `ADMIN_TOKEN` | `Authorization: Bearer …` on `/api/admin/*`. |
| `RESEND_API_KEY` | Audience sync and sponsor notification email. |
| `RESEND_AUDIENCE_ID` | Segment id (current API) or a legacy audience id. |
| `RESEND_FROM` | From address, e.g. `newsletter@mail.belairestudio.com`. |
| `SPONSOR_NOTIFY_EMAILS` | Comma-separated inboxes for sponsor leads. |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin, no trailing slash. |

Missing Resend variables never crash a request. The signup is stored in Postgres when `DATABASE_URL` is set, and the sponsor lead is stored even when the notification email can’t be sent.

## Pages

- `/` — leaderboard, search, filters (tool, app type, shipped), and average-cost cards.
- `/tools/[tool]` — “What it really costs to build on &lt;Tool&gt;”.
- `/types/[type]` — “What a &lt;type&gt; costs to build”.
- `/builds/[slug]` — one build and its source.
- `/submit` — review queue only. Honeypot field `company_website`, plus 5 submissions per IP hash per hour.
- `/sponsor` — live build, subscriber, and monthly pageview counts, and a $29/week contact form. No checkout.
- `/go/[sponsor]` — logs a click, then redirects to the sponsor URL.

Pageviews are counted in the app, one row per path per day. Prefetches, `/api`, `/go`, robots, sitemap, and OG image requests are skipped. There is no third-party analytics script.

## Admin API

Every route requires `Authorization: Bearer $ADMIN_TOKEN`. A missing or wrong token is `401`. A missing `DATABASE_URL` is `503` (except the newsletter route, which still renders an empty issue).

```bash
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3000/api/admin/queue

curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "content-type: application/json" \
  -d '{"id":"<submission-uuid>","decision":"approve"}' \
  http://localhost:3000/api/admin/approve

curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "content-type: application/json" \
  -d '{"id":"<submission-uuid>","decision":"reject"}' \
  http://localhost:3000/api/admin/approve

curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "content-type: application/json" \
  -d '{"id":"<submission-uuid>","decision":"approve","edits":{"dollars":95,"title":"Karrot"}}' \
  http://localhost:3000/api/admin/approve

curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3000/api/admin/stats

curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3000/api/admin/searches

curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3000/api/admin/sponsors

curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "content-type: application/json" \
  -d '{"slug":"acme","name":"Acme","tagline":"Builds faster","url":"https://example.com","startsOn":"2026-11-17","endsOn":"2026-11-23"}' \
  http://localhost:3000/api/admin/sponsors
```

Approve creates a row in `builds` and marks the submission `approved`. Reject only changes status. A submission that is already reviewed returns `409`. Optional `edits` may set `tool`, `appType`, `title`, `description`, `credits`, `tokens`, `dollars`, `prompts`, `days`, `shipped` (`yes` / `no` / `unsure`), `sourceUrl`, and `authorName`. An approved build still needs a slug-shaped tool and app type, an http(s) source, and at least one of credits, tokens, or dollars. `0` is a real stated cost.

`POST /api/admin/sponsors` updates when `id` is sent and inserts otherwise. Dates are `YYYY-MM-DD`. Send `"active": false` to hide a week. The public bar uses the active week whose dates include today. Every public sponsor link is `/go/<slug>`.

`GET /api/admin/stats` returns pageviews by day (last 30 days), signup count, build count, submission counts by status, and sponsor click totals.

`GET /api/admin/searches` returns recent queries that matched nothing.

## Newsletter

`emails/weekly.tsx` is the Tuesday issue: five picks, cheapest and priciest builds added in the last 7 days that stated a dollar total, one “cost to build X” average (the app type with the most stated dollar totals), and a Sponsored by line.

```bash
npm run newsletter > /tmp/issue.html
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3000/api/admin/newsletter
```

Both render HTML from the database. Neither sends the email. Paste the HTML into a Resend Broadcast, or send it with the Resend API yourself.

## Seed

`db/seed.json` has 33 builds. Every row has a public source URL. A number is stored only when that source stated it. Unknown fields are `null`. “About” and “around” are stored as the figure the author used, and the description says so. Currencies that aren’t USD are not converted. Hours are not turned into days. A plan price is not stored as the cost of the build.

Windsurf has a catalog page and no seed row: no single public build with a stated total was verified.

## Scripts

- `npm run dev` / `npm run build` / `npm run start`
- `npm run lint`
- `npm run typecheck`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run newsletter`
