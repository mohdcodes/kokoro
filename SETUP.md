# Kokoro Cafe — Setup Guide

This guide walks through setting up Supabase, web push, local development, and deployment to
Vercel with a custom GoDaddy domain.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account/project.
2. Open the **SQL Editor** in your project dashboard.
3. Paste the contents of `supabase/schema.sql` and run it. This creates all tables, RLS policies,
   the `handle_new_user` trigger, and enables Realtime on the `orders` table.
4. Paste the contents of `supabase/seed.sql` and run it. This inserts all menu categories and
   items from the physical menu board (see `MENU_DATA.md`).
5. Confirm Realtime is enabled: **Database → Replication** → make sure the `orders` table is
   listed under the `supabase_realtime` publication (the schema script does this via
   `alter publication supabase_realtime add table orders;`, but double-check in the dashboard).

### Get your API keys

In **Project Settings → API**, copy:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret — server-only, used for push
  notifications)

Copy `.env.local.example` to `.env.local` and fill these in.

## 2. Generate VAPID keys for web push

Run:

```bash
npx web-push generate-vapid-keys
```

This prints a public and private key. Put them in `.env.local`:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public key>
VAPID_PRIVATE_KEY=<private key>
VAPID_SUBJECT=mailto:you@example.com
```

## 3. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## 4. Create the first admin user

1. Sign up normally through `/signup`.
2. In the Supabase SQL Editor, find your user's UUID (Authentication → Users, or
   `select id, email from auth.users;`).
3. Promote the account to admin:

```sql
update profiles set role = 'admin' where id = '<user-uuid>';
```

4. Log out and back in, then visit `/admin` — you should see the dashboard.

## 5. Deploy to Vercel

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com), import the GitHub repo (or run `vercel` from the CLI).
3. In the Vercel project's **Settings → Environment Variables**, add the same variables from
   `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`
   - `NEXT_PUBLIC_SITE_URL` (your production URL, e.g. `https://kokoro.cafe`) — used internally so
     order-status server actions can call the push API route.
4. Deploy.

## 6. Point your GoDaddy domain at Vercel

1. In your Vercel project, go to **Settings → Domains** and add your domain (e.g. `kokoro.cafe`).
2. Vercel will show you the exact DNS records to add — typically:
   - Root domain (`kokoro.cafe`): an **A record** pointing to `76.76.21.21`
   - `www` subdomain: a **CNAME record** pointing to `cname.vercel-dns.com`
3. Log in to GoDaddy → **My Products → DNS** for your domain, and add those records.
4. **Important:** always double-check the exact records shown in your own Vercel dashboard —
   Vercel's IPs/CNAME targets can change over time, and the dashboard always shows the current
   values for your specific domain.
5. DNS propagation can take a few minutes to a few hours.

## 7. Swapping in real menu photos

All menu items currently use Unsplash placeholder images (a handful of stock photo URLs reused
per category, e.g. "coffee", "mojito-drink", "smoothie", etc.) set via `image_url` in
`supabase/seed.sql`. To use real photos:

- Easiest: update `image_url` directly in the `menu_items` table via the Supabase Table Editor or
  a SQL `update` statement.
- Or upload images to Supabase Storage and update `image_url` to the public storage URL.

The admin menu page (`/admin/menu`) currently only supports toggling item availability — it does
not yet have an image upload UI.

## Notes on what's simplified

- Admin menu management is **view + availability toggle only** — no add/edit/delete item forms
  yet. Use the Supabase Table Editor or SQL for full menu edits.
- The contact page stores messages in a `contact_messages` table (readable by admins only via
  RLS) — there's no admin UI to view them yet; check the table directly in Supabase.
- Offline support via the service worker is a basic app-shell cache (network-first), not a full
  offline-first PWA.
