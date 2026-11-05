-- EcoBrew security hardening migration
--
-- What it changes:
--   1. Revokes the wide-open `using (true)` / `with check (true)` policies
--      that let anyone with the public anon key read/write every table
--      (including ecobrew_users' plaintext password column, all orders,
--      products, and contact messages).
--   2. Keeps only what public visitors legitimately need:
--        - products: public SELECT (catalog pages + realtime)
--        - contacts: public INSERT (contact form), no public read
--        - orders/users: no public access at all
--        - storage (product-images): public read, write via service_role only
--   3. All writes (product CRUD, order placement/status, contact replies, image
--      uploads) now flow through server-side API routes that authenticate with
--      the service_role key (which bypasses RLS).
--
-- NOTE on policy names: the project's earlier schema created these policies
-- under slightly different names (e.g. `users_select`, `orders_insert`). The
-- DROP statements below target the exact names observed in the live database.

-- ---------------------------------------------------------------------------
-- Drop the open anon policies (they apply to both anon and authenticated).
-- ---------------------------------------------------------------------------

-- Users: no public read (exposes passwords) or insert.
drop policy if exists "users_select" on ecobrew_users;
drop policy if exists "users_insert" on ecobrew_users;
drop policy if exists "ecobrew_users_select" on ecobrew_users;
drop policy if exists "ecobrew_users_insert" on ecobrew_users;

-- Orders: no public access at all.
drop policy if exists "orders_select" on ecobrew_orders;
drop policy if exists "orders_insert" on ecobrew_orders;
drop policy if exists "ecobrew_orders_select" on ecobrew_orders;
drop policy if exists "ecobrew_orders_insert" on ecobrew_orders;
drop policy if exists "ecobrew_orders_update" on ecobrew_orders;
drop policy if exists "ecobrew_orders_delete" on ecobrew_orders;

-- Products: public read only (keep catalog + realtime), no anon writes.
drop policy if exists "ecobrew_products_select" on ecobrew_products;
drop policy if exists "ecobrew_products_insert" on ecobrew_products;
drop policy if exists "ecobrew_products_update" on ecobrew_products;
drop policy if exists "ecobrew_products_delete" on ecobrew_products;

-- Contacts: public insert only (contact form), no public read/update.
drop policy if exists "ecobrew_contacts_insert" on ecobrew_contacts;
drop policy if exists "ecobrew_contacts_select" on ecobrew_contacts;
drop policy if exists "ecobrew_contacts_update" on ecobrew_contacts;

-- Storage: no public writes; scope any public read to the product-images bucket.
drop policy if exists "ecobrew_product_images_write" on storage.objects;
drop policy if exists "ecobrew_product_images_update" on storage.objects;
drop policy if exists "ecobrew_product_images_read" on storage.objects;

-- ---------------------------------------------------------------------------
-- Public reads/inserts the site still needs.
-- ---------------------------------------------------------------------------

-- Catalog: anyone may read products (public site + realtime push).
create policy "ecobrew_products_public_read" on ecobrew_products
  for select using (true);

-- Contact form: anyone may submit a message; nobody can read the inbox
-- without the server (admin) role.
create policy "ecobrew_contacts_public_insert" on ecobrew_contacts
  for insert with check (true);

-- Product images: public read limited to the product-images bucket; writes are
-- server-only (service_role bypasses RLS).
create policy "ecobrew_product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');
