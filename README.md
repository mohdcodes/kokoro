# 🐨 Kokoro — Cafe Ordering Web App & PWA

> *A place to build habit.*

Kokoro is a full-stack ordering website and installable PWA for the Kokoro cafe. Customers
browse the menu, place pickup orders, track them live, and leave reviews. Staff manage
everything from a role-based admin dashboard with live order notifications.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**,
**Supabase** (Postgres + Auth + Realtime + Storage), **Framer Motion**, and **Lenis**.

---

## ✨ Features

### Customer
- Glassmorphism UI in a soft light-purple theme with rounded "cafe" fonts (Baloo 2 / Nunito / Caveat)
- Full menu browsing by category, with cart, quantity steppers, and Hot/Cold variants
- Email/password auth (Supabase); profile page to update name & phone
- Checkout with a pickup name and a "message for your order" (e.g. *less sugar, allergies*)
- **Live order tracking** — status updates in real time (Pending → Acknowledged → Preparing → Ready → Completed)
- Short human-friendly **order number** (`#XXXXXXXX`) assigned when the order is acknowledged
- **Reviews** — rate 1–5 ★ + comment after an order is completed/cancelled (shown publicly once an admin approves)
- Contact / inquiry form for events, bulk orders, collabs, parties & functions
- **Installable PWA** — "Add to Home Screen", app icon, offline app shell
- Branded loading states (coffee-cup-fills animation) and skeletons

### Admin (role-based)
- **Super admin** can create/assign sub-admins with per-area permissions
- **Per-area permissions:** Orders · Inquiries · Reviews · Menu (each admin sees only what they're granted)
- **Live orders board** — tabbed by status, counts + unseen-order dots, realtime + sound/toast/notification on new orders, advance-status & cancel-with-reason
- **Menu management** — add / edit / delete items, edit name / price / description, toggle availability, upload images (Supabase Storage)
- **Reviews moderation** — approve / feature customer reviews for public display
- **Inquiries** — view all contact-form submissions
- **Activity log** — every admin action (who / what / when) recorded, visible to the super admin

---

## 🧱 Tech stack

| Area | Tech |
|------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Backend / DB | Supabase (Postgres, Auth, Realtime, Storage) |
| Animation | Framer Motion + Lenis smooth scroll |
| Icons | lucide-react |
| State | Zustand (cart) |
| Notifications | Supabase Realtime (in-app) + Web Push (VAPID) |

---

## 🚀 Getting started

### 1. Install
```bash
npm install
```

### 2. Environment variables
Copy the example file and fill in your Supabase + VAPID values:
```bash
cp .env.local.example .env.local
```
Get the Supabase values from your project → **Settings → API**. Generate VAPID keys with:
```bash
npx web-push generate-vapid-keys
```
> ⚠️ **Never commit `.env.local`** — it is gitignored. Only `.env.local.example` (placeholders) is tracked.

### 3. Set up the database
In the Supabase **SQL Editor**, run the following **in order**:
1. `supabase/schema.sql` — base tables, RLS, helpers, triggers
2. `supabase/seed.sql` — menu categories & items
3. Each migration in `supabase/migrations/` in numeric order:
   - `001_add_order_name.sql`
   - `002_add_cancel_reason.sql`
   - `003_add_reviews.sql` *(also enables Realtime on `reviews`)*
   - `004_roles_permissions_audit.sql` *(roles, permissions, activity log — promotes the seed super admin)*
   - `005_order_number.sql`
   - `006_storage_policies.sql` *(lets admins upload menu images)*

> The scripts are idempotent (safe to re-run). Edit the super-admin email in `004` if it isn't `arbaazcode@gmail.com`.

### 4. Create the image storage bucket
Supabase → **Storage → New bucket** → name it exactly **`menu-images`** → toggle **Public bucket ON** → Create.
(Recommended: raise the file-size limit to ~2 MB and allow `image/jpeg`, `image/png`, `image/webp`.)

### 5. Enable Realtime
Ensure the `orders` and `reviews` tables are in the `supabase_realtime` publication
(Database → Publications). `schema.sql` / migration `003` handle this automatically.

### 6. Run it
```bash
npm run dev   # http://localhost:9000
```

---

## 👤 Admin access

The super admin is set by migration `004` (email `arbaazcode@gmail.com` by default).
To make someone else an admin:
1. Have them sign up normally at `/signup`.
2. Log in as the super admin → **Admins** → add their email → pick permissions (or make them super admin).

Prefer SQL? Use `supabase/promote_admin.sql`.

---

## 🗄️ Useful SQL scripts
| File | Purpose |
|------|---------|
| `supabase/schema.sql` | Full schema (run first) |
| `supabase/seed.sql` | Menu data |
| `supabase/migrations/*` | Incremental changes (run in order) |
| `supabase/promote_admin.sql` | Promote a user to admin |
| `supabase/reset_data.sql` | ⚠️ **Destructive** — wipe all orders/reviews/users, keep menu + super admin |

---

## 📦 Deployment (Vercel + custom domain)

1. Push this repo to GitHub (linked to `mohdcodes/kokoro`).
2. Import the repo in **Vercel** and add the same env vars from `.env.local` in the Vercel project settings.
3. Add `NEXT_PUBLIC_SITE_URL=https://your-domain.com` in Vercel (used for push callbacks).
4. **Custom domain (GoDaddy):** add the domain in Vercel → follow Vercel's DNS instructions
   (typically an `A` record `76.76.21.21` for the root and a `CNAME` `cname.vercel-dns.com` for `www`;
   always use the exact records shown in your Vercel dashboard).

See `SETUP.md` for the detailed step-by-step.

---

## 📁 Project structure
```
src/
  app/                # routes (App Router)
    (auth)/           # login / signup
    admin/            # dashboard, orders, inquiries, reviews, menu, admins, activity
    menu, orders, checkout, account, about, contact
    actions/          # server actions (orders, menu, admins, reviews, auth)
  components/         # UI (Navbar, CartDrawer, OrderTracker, admin/*, home/*, skeletons/*)
  lib/                # supabase clients, data access, permissions, audit, format helpers
supabase/             # schema, seed, migrations, admin/reset scripts
public/               # PWA manifest, service worker, icons
```

---

## 📝 Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port 9000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build (port 9000) |
| `npm run lint` | Lint |

---

*Thank you for being a part of our little hideaway.* 💜
