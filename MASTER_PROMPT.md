# EcoBrew — Master Prompt: Fix the Codebase

You are acting as a senior reviewer + engineer on the **EcoBrew** Next.js project
(`src/`, `supabase/`, `next.config.ts`, `package.json`). Below is a full audit of
the codebase as of 2026-11-06. **Fix every item on this list.** Verify each fix
compiles (`npx tsc --noEmit`), lints, and behaves correctly. Do not skip items,
do not "close" an item without actually changing code.

Review all of the following, in order of severity.

---

## 1. 🔴 FUNCTIONAL BUG — Google users cannot place orders (foreign-key violation)

- **Where:** `src/app/api/checkout/route.ts` (order insert); `src/app/auth/callback/route.ts`
  (Google OAuth callback); `supabase/schema.sql` (FK definition).
- **What's wrong:**
  - The `ecobrew_orders.user_id` column is `NOT NULL REFERENCES ecobrew_users(user_id)
    ON DELETE CASCADE` (`supabase/schema.sql`).
  - Checkout sends `user_id = account?.userId || google?.userId`.
  - The Google OAuth callback **never inserts a row into `ecobrew_users`** — it only
    sets a signed session cookie. So a Google sign-in user (no local account) hits a
    foreign-key violation when placing an order → checkout fails.
- **Fix:** Ensure a Google-authenticated user has a corresponding `ecobrew_users`
  row (idempotent upsert keyed on the Google account) created during the callback
  (or at checkout time), so the FK is satisfied. Keep using the service-role client.
  The local-account path already works — don't break it.

## 2. 🟠 TRUST/VALIDATION GAP — no server-side order price/quantity validation

- **Where:** `src/app/api/checkout/route.ts`.
- **What's wrong:** The server trusts `items` and `subtotal` from the client verbatim.
  It never recomputes the total from `ecobrew_products`, never validates `qty` is a
  positive integer, and never checks that each slug exists / is in stock.
- **Fix:** Server-side, load each product by slug, recompute `subtotal` from the DB
  prices, reject unknown slugs, non-positive / non-integer `qty`; and out-of-stock
  items. Never trust the client's `subtotal`.

## 3. 🟠 SECURITY — no brute-force protection on auth

- **Where:** `src/app/api/admin/auth/route.ts`, `src/app/api/auth/login/route.ts`.
- **What's wrong:** No rate limiting or lockout on admin / account login. The admin
  cookie is a single `role:"admin"` claim valid 8h.
- **Fix:** Add per-IP (and per-userId) rate limiting / exponential backoff on login
  attempts. Consider short-lived admin sessions and a logout flow that also invalidates
  server-side.

## 4. 🟠 SECURITY — SVG upload is a stored-XSS vector

- **Where:** `src/app/api/admin/upload-image/route.ts`, `src/lib/services/products.ts`
  (allowed types), `next.config.ts` (`dangerouslyAllowSVG: true`).
- **What's wrong:** `image/svg+xml` is allowed into a public bucket and rendered with
  `dangerouslyAllowSVG`. SVG can embed scripts; if any such URL is opened directly it
  executes in the site's origin.
- **Fix:** Drop `image/svg+xml` from allowed types (or serve SVG as attachment /
  with `Content-Security-Policy: sandbox`). Prefer PNG/JPEG/WebP/GIF only.

## 5. 🟡 DEAD CODE with real risk — delete `src/lib/services/auth.ts` client fallbacks

- **Where:** `src/lib/services/auth.ts`.
- **What's wrong:** `registerUser`, `loginUser`, `signInWithGoogle`,
  `syncSupabaseAuthUser`, `saveOrderToSupabase`, `checkUserIdExists` are **unused**
  (the UI only calls `/api/auth/*`). Worse, they store **plaintext passwords in
  localStorage** and create accounts with a known, guessable
  `password: "oauth_google_secure"` that `/api/auth/login` would accept if this code
  were ever wired up.
- **Fix:** Delete the file (and its references). If any part is truly needed, move it
  to the server side and hash passwords — never keep plaintext client-side.

## 6. 🟡 FOOTGUN — `schema.sql` still has wide-open RLS policies

- **Where:** `supabase/schema.sql` (lines ~37–40, 80–90).
- **What's wrong:** It grants `using (true)` / `with check (true)` to anon on users,
  orders, products, and contacts — including `users_select`, which exposes the
  `passwords` column. The hardened state exists only in the
  `20261105000000_security_hardening.sql` migration. Any fresh deployment using only
  `schema.sql` is wide open.
- **Fix:** Update `schema.sql` to the hardened policy set (public product read, public
  contact insert, storage read scoped to `product-images`, no public read/write on
  users/orders). Keep the migration for existing databases; make the two files agree.

## 7. 🟡 QUALITY — lint cleanup (non-functional)

- **Where:** throughout `src/`.
- **What's wrong:** 58 `@typescript-eslint/no-explicit-any` errors + unused-var warnings.
- **Fix:** Replace `any` with proper types in server/API code (especially
  `mapOrder` / `mapContact` / `mapProductRow` and Supabase row types). Keep the public
  Supabase client's Mock type sound. Do not weaken the ESLint config to pass.

---

## Definition of done (all fixes)

1. `npx tsc --noEmit` → 0 errors.
2. `npx eslint src` → 0 errors (warnings acceptable only if genuinely intentional).
3. Google sign-in → checkout completes successfully end-to-end.
4. Local account → checkout still completes.
5. A forged (client-sent) `subtotal` is ignored and recomputed server-side.
6. `schema.sql` and the migration describe the same hardened RLS state.
7. `src/lib/services/auth.ts` is gone or fully hardened (no plaintext client-side).
8. No `image/svg+xml` upload path remains.

Working directory: `/data/data/com.termux/files/home/ecobrew`.
Stack: Next.js (App Router, TypeScript, Tailwind) + Supabase (Postgres/Auth/Storage) + Vercel.
