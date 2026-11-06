-- EcoBrew Supabase schema
-- Run this in the Supabase SQL editor (https://supabase.com/dashboard -> SQL Editor -> New query)
-- It creates the users table with a UNIQUE user_id (no two users can share an ID)
-- and the orders table linked to that user.
--
-- RLS note: this file reflects the HARDENED policy state (see the
-- 20261105000000_security_hardening.sql migration). Only the operations the
-- public site legitimately needs are open: product reads, contact inserts, and
-- product-image reads. All writes flow through server-side API routes that use
-- the service_role key, which bypasses RLS.

-- Drop existing tables if re-running (dev only)
-- drop table if exists ecobrew_orders;
-- drop table if exists ecobrew_users;

create table if not exists ecobrew_users (
  user_id text primary key,                 -- the unique login ID; PK guarantees no duplicates
  password text not null,                   -- scrypt-hashed; server-only writes
  name text default '',
  email text default '',
  phone text default '',
  address text default '',
  city text default '',
  state text default '',
  pincode text default '',
  created_at timestamptz not null default now()
);

create table if not exists ecobrew_orders (
  id text primary key,                      -- e.g. ECB-XXXX-1
  user_id text not null references ecobrew_users(user_id) on delete cascade,
  items jsonb not null,                     -- [{ "slug": "...", "qty": 1 }, ...]
  subtotal numeric not null,
  customer jsonb not null,                  -- name/email/phone/address/city/state/pincode
  created_at timestamptz not null default now()
);

-- Row Level Security: hardened. Users/orders are never publicly readable or
-- writable; only the server (service_role) touches them.
alter table ecobrew_users enable row level security;
alter table ecobrew_orders enable row level security;

-- ---------------------------------------------------------------------------
-- Admin panel migration: DB-backed products, order status/delivery, contacts.
-- (Mirror of the migration applied to the live project via Supabase MCP.)
-- ---------------------------------------------------------------------------

create table if not exists ecobrew_products (
  slug text primary key,
  name text not null,
  category text not null,
  price numeric not null,
  short_description text default '',
  description text default '',
  image text default '',
  impact text default '',
  in_stock boolean not null default true,
  featured boolean not null default false,
  related jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table ecobrew_orders add column if not exists status text not null default 'pending';
alter table ecobrew_orders add column if not exists delivery_date timestamptz;

create table if not exists ecobrew_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id text references ecobrew_users(user_id) on delete cascade,
  name text default '',
  email text default '',
  message text default '',
  reply text default '',
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

alter table ecobrew_products enable row level security;
alter table ecobrew_contacts enable row level security;
alter table ecobrew_orders enable row level security;

-- Public reads/inserts the site still needs (hardened set):
-- - products: public SELECT (catalog pages + realtime)
-- - contacts: public INSERT (contact form), no public read
-- - orders/users: no public access at all (server/service_role only)

create policy "ecobrew_products_public_read" on ecobrew_products
  for select using (true);

create policy "ecobrew_contacts_public_insert" on ecobrew_contacts
  for insert with check (true);

-- ---------------------------------------------------------------------------
-- Live admin storage & realtime (applied to the live project as migration
-- "admin_product_images_and_realtime"; mirrored here for fresh projects).
-- ---------------------------------------------------------------------------

-- Public bucket for admin-uploaded product images (5 MB, image types only).
-- SVG is deliberately NOT allowed (stored-XSS vector).
insert into storage.buckets (id, name, file_size_limit, allowed_mime_types, public)
values ('product-images', 'product-images', 5242880,
        array['image/png','image/jpeg','image/webp','image/gif'], true)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Product images: public read limited to the product-images bucket; writes are
-- server-only (service_role bypasses RLS).
drop policy if exists "ecobrew_product_images_public_read" on storage.objects;
create policy "ecobrew_product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

-- Realtime: push product/order changes to connected clients.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'ecobrew_products'
  ) then
    alter publication supabase_realtime add table public.ecobrew_products;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'ecobrew_orders'
  ) then
    alter publication supabase_realtime add table public.ecobrew_orders;
  end if;
end $$;
