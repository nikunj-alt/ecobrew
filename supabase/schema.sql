-- EcoBrew Supabase schema
-- Run this in the Supabase SQL editor (https://supabase.com/dashboard -> SQL Editor -> New query)
-- It creates the users table with a UNIQUE user_id (no two users can share an ID)
-- and the orders table linked to that user.

-- Drop existing tables if re-running (dev only)
-- drop table if exists ecobrew_orders;
-- drop table if exists ecobrew_users;

create table if not exists ecobrew_users (
  user_id text primary key,                 -- the unique login ID; PK guarantees no duplicates
  password text not null,                   -- demo only; use Supabase Auth or a hashed column in production
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

-- Row Level Security: open for the anon key used by this demo site.
-- (A production app would use Supabase Auth + policies keyed to auth.uid().)
alter table ecobrew_users enable row level security;
alter table ecobrew_orders enable row level security;

create policy "ecobrew_users_select" on ecobrew_users for select using (true);
create policy "ecobrew_users_insert" on ecobrew_users for insert with check (true);
create policy "ecobrew_orders_insert" on ecobrew_orders for insert with check (true);
create policy "ecobrew_orders_select" on ecobrew_orders for select using (true);
