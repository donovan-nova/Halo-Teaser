# Halo Finance — Teaser

A single-page "coming soon" placeholder for **halofinance.com**, hosted on Vercel.
Visitors can leave their email ("Be the first to know"); submissions are stored in
the Neon Postgres database **GS_HALODB**.

Static front end (`index.html`) + one serverless function (`api/subscribe.js`).
The Halo logo and the Oswald/Inter fonts are embedded in the page, so it renders
identically everywhere with no external asset loading.

---

## How the email capture works

1. Visitor clicks **Be the first to know** → an email field + **Submit** appear.
2. On submit, the page `POST`s `{ "email": "..." }` to `/api/subscribe`.
3. The function validates the address and inserts it into the `signups` table in
   **GS_HALODB** (`ON CONFLICT DO NOTHING`, so repeat submissions are harmless).

---

## One-time setup

### 1. Create the table in GS_HALODB
In the Neon console for **GS_HALODB**, open the SQL editor and run [`schema.sql`](./schema.sql):

```sql
CREATE TABLE IF NOT EXISTS signups (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2. Connect the repo to Vercel
- Vercel → **Add New… → Project** → import `donovan-nova/Halo-Teaser`.
- Framework preset: **Other** (no build step needed — it's static + `/api`).

### 3. Add the database connection string (do NOT commit it)
- In Neon (GS_HALODB) copy the **pooled** connection string
  (`postgresql://…-pooler…/…?sslmode=require`).
- In Vercel → Project → **Settings → Environment Variables**, add:
  - **Name:** `DATABASE_URL`
  - **Value:** the pooled connection string
  - Environments: Production (and Preview if you want).
- Redeploy so the variable takes effect.

> Tip: installing Vercel's **Neon integration** sets `DATABASE_URL` for you
> automatically — either approach works.

### 4. Point the domain
In Vercel → Project → **Settings → Domains**, add `halofinance.com`
(and `www`) and follow the DNS instructions.

---

## Viewing sign-ups
In the Neon SQL editor for GS_HALODB:

```sql
SELECT email, created_at FROM signups ORDER BY created_at DESC;
```

---

## Local development (optional)
```bash
npm install
npm i -g vercel
vercel dev      # runs the static page + /api locally
```
Create a `.env` with `DATABASE_URL=...` for local testing (already git-ignored).

---

## Notes
- **NCR number:** the page deliberately does not claim "registered credit provider".
  There is a `DEV NOTE` comment at the top of `index.html`; add the NCR registration
  number there once it is confirmed.
- All customer-facing copy is placeholder marketing text for the pre-launch period.
