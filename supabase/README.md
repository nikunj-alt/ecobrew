# EcoBrew — Supabase setup

The site works without Supabase (it falls back to browser-local storage), but to use
Supabase as the real database:

1. Create a project at https://supabase.com/dashboard
2. Run `supabase/schema.sql` in the SQL Editor (creates `ecobrew_users` with a
   **PRIMARY KEY on `user_id`** — so no two users can ever have the same ID —
   plus `ecobrew_orders` linked to the user)
3. Copy the project **URL** and an **API key** from Project Settings → API
   (use the classic anon key, or the newer `sb_publishable_…` key — either works)
4. Add them to a local `.env.local` (never committed — `.gitignore` already blocks `.env*`):

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
# or
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
```

5. On Vercel: Project → Settings → Environment Variables → add the same
   variables, then redeploy.

## How accounts work

- **Register**: pick a unique User ID (3–24 chars: `a-z 0-9 _ . -`) + password (min 4).
  The ID is checked live for availability, then inserted. Uniqueness is enforced twice:
  by the DB primary key (unique violation `23505` is caught and shown to the user)
  and by a pre-check in the app.
- **Login**: User ID + password. On success the account is stored in sessionStorage
  and shown in the header as `@yourid`.
- **Checkout** requires a logged-in account; the shipping form is pre-filled from it
  and every order is saved to `ecobrew_orders` with the owning `user_id`.
