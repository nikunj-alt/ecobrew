# EcoBrew

A Next.js e-commerce storefront (App Router, TypeScript, Tailwind) for a
Bal Vigyan fair project. Uses Supabase (Postgres + Storage) for persistence.

## Security model

All database **writes** (order placement, admin product/order/contact actions,
image uploads, account signup/login) go through server-side API routes under
`src/app/api/` that authenticate the caller (HMAC-signed httpOnly account /
admin / Google cookies). Row Level Security is locked down so the **anon**
key can only read products and submit contact messages — it cannot read or
write users, orders, or the contact inbox.

**Required environment variables** (see `.env.example`):

| Variable | Public? | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Public anon/publishable key |
| `NEXT_PUBLIC_SITE_URL` | yes | Deployed origin (OAuth redirect) |
| `ECOBREW_SESSION_SECRET` | no | Signs all httpOnly session cookies |
| `SUPABASE_SERVICE_ROLE_KEY` | no | Server-only writes (bypasses RLS) |
| `ADMIN_PASSWORD_HASH` | no | Admin password as an scrypt hash (no default) |

Before first use:

1. Put real values in `.env.local` (copy `.env.example`).
2. Run `supabase/migrations/20261105000000_security_hardening.sql` in the
   Supabase SQL editor to apply the RLS lockdown.
3. Generate an admin hash with
   `node -e "const{scryptSync,randomBytes}=require('crypto');const s=randomBytes(16).toString('base64');const h=scryptSync(process.argv[1],s,64).toString('base64');console.log('scrypt:'+s+':'+h)" 'your-password'`
   and set `ADMIN_PASSWORD_HASH` to it.

## Google Sign-In setup

"Continue with Google" uses Supabase Auth with PKCE (redirect to a Google login
page, then back to `/auth/callback`). To make it work:

1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) in the deployed environment.
2. Set `NEXT_PUBLIC_SITE_URL` to your deployed origin (e.g. `https://ecobrew.vercel.app`).
3. In **Supabase → Auth → URL Configuration → Redirect URLs**, add
   `${NEXT_PUBLIC_SITE_URL}/auth/callback`.
4. In **Supabase → Auth → Providers**, enable **Google**; in Google Cloud,
   add `https://<project-ref>.supabase.co/auth/v1/callback` as an authorized
   redirect URI.
5. Set `ECOBREW_SESSION_SECRET` (>= 16 chars) — it signs the httpOnly session
   cookie; without it the callback fails and Google login won't complete.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
