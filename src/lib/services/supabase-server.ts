import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client authenticated with the service_role key.
 *
 * service_role bypasses Row Level Security, so it must ONLY ever be used
 * inside API routes / server code that has already authenticated the caller
 * (e.g. the HMAC session cookie or the admin cookie). It is never shipped to
 * the browser.
 *
 * Required env: SUPABASE_URL (the NEXT_PUBLIC_* one is also accepted for the
 * URL only) and SUPABASE_SERVICE_ROLE_KEY.
 */

let cached: SupabaseClient | null = null;

import { randomUUID } from "node:crypto";
import { products as staticProducts } from "@/lib/data/products";
import type { ProductRow, UserRow, OrderRow, ContactRow } from "@/lib/supabase-types";

// In-memory mock database store for development / preview environments without Supabase keys
interface MockDbStore {
  users: Map<string, UserRow>;
  products: Map<string, ProductRow>;
  orders: Map<string, OrderRow>;
  contacts: Map<string, ContactRow>;
  storage: Map<string, string>;
}

const globalStore = globalThis as unknown as { __ecobrew_mock_db?: MockDbStore };

function getMockDb(): MockDbStore {
  if (!globalStore.__ecobrew_mock_db) {
    const productsMap = new Map<string, ProductRow>();
    for (const p of staticProducts) {
      productsMap.set(p.slug, {
        slug: p.slug,
        name: p.name,
        category: p.category,
        price: p.price,
        short_description: p.shortDescription || "",
        description: p.description || "",
        image: p.image || "",
        impact: p.impact || "",
        in_stock: p.inStock,
        featured: p.featured ?? false,
        related: p.related ?? [],
        created_at: new Date().toISOString(),
      });
    }

    const usersMap = new Map<string, UserRow>();
    // Pre-seed demo user (userId: demo, password: demo123)
    usersMap.set("demo", {
      user_id: "demo",
      password: "scrypt:URUo695x5F86d8W+N0QZwA==:kfYvnb+H8UvuBmagNzvW93UMfrQjD3ch+jGTLkfkne1RHahKH/dn4nwJxfh8Z0IaCjaS3LukVAE1IrXzvWxQ9g==",
      name: "Demo Visitor",
      email: "demo@ecobrew.local",
      phone: "+91 9876543210",
      address: "123 Green Way",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
      created_at: new Date().toISOString(),
    });

    globalStore.__ecobrew_mock_db = {
      users: usersMap,
      products: productsMap,
      orders: new Map<string, OrderRow>(),
      contacts: new Map<string, ContactRow>(),
      storage: new Map<string, string>(),
    };
  }
  return globalStore.__ecobrew_mock_db;
}

class MockQueryBuilder<T extends Record<string, unknown>> {
  private filters: Array<(item: T) => boolean> = [];
  private sortFn: ((a: T, b: T) => number) | null = null;

  constructor(private getItems: () => T[]) {}

  select(_fields?: string) {
    void _fields;
    return this;
  }

  eq(col: string, val: unknown) {
    this.filters.push((item) => (item as Record<string, unknown>)[col] === val);
    return this;
  }

  in(col: string, vals: unknown[]) {
    const set = new Set(vals);
    this.filters.push((item) => set.has((item as Record<string, unknown>)[col]));
    return this;
  }

  order(col: string, options?: { ascending?: boolean }) {
    const asc = options?.ascending !== false;
    this.sortFn = (a, b) => {
      const va = (a as Record<string, unknown>)[col];
      const vb = (b as Record<string, unknown>)[col];
      if (va === vb) return 0;
      if (va === undefined || va === null) return 1;
      if (vb === undefined || vb === null) return -1;
      return (va > vb ? 1 : -1) * (asc ? 1 : -1);
    };
    return this;
  }

  private execute(): T[] {
    let result = this.getItems().slice();
    for (const filter of this.filters) {
      result = result.filter(filter);
    }
    if (this.sortFn) {
      result.sort(this.sortFn);
    }
    return result;
  }

  async maybeSingle(): Promise<{ data: T | null; error: null }> {
    const list = this.execute();
    return { data: list[0] ?? null, error: null };
  }

  async single(): Promise<{ data: T | null; error: { message: string } | null }> {
    const list = this.execute();
    if (list.length === 0) {
      return { data: null, error: { message: "Row not found" } };
    }
    return { data: list[0], error: null };
  }

  then<TResult1 = { data: T[]; error: null }, TResult2 = never>(
    onfulfilled?: ((value: { data: T[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    const result = { data: this.execute(), error: null };
    return Promise.resolve(result).then(onfulfilled, onrejected);
  }
}

class MockSupabaseServerClient {
  from(table: string) {
    const db = getMockDb();

    const getItems = (): Array<Record<string, unknown>> => {
      if (table === "ecobrew_users") return Array.from(db.users.values()) as unknown as Array<Record<string, unknown>>;
      if (table === "ecobrew_products") return Array.from(db.products.values()) as unknown as Array<Record<string, unknown>>;
      if (table === "ecobrew_orders") return Array.from(db.orders.values()) as unknown as Array<Record<string, unknown>>;
      if (table === "ecobrew_contacts") return Array.from(db.contacts.values()) as unknown as Array<Record<string, unknown>>;
      return [];
    };

    return {
      select: (fields?: string) => new MockQueryBuilder(getItems).select(fields),
      insert: async (rows: Array<Record<string, unknown>>) => {
        for (const row of rows) {
          if (table === "ecobrew_users") {
            const uid = String(row.user_id || "");
            if (db.users.has(uid)) {
              return { data: null, error: { message: `User ID "${uid}" is already taken.`, code: "23505" } };
            }
            db.users.set(uid, row as unknown as UserRow);
          } else if (table === "ecobrew_products") {
            const slug = String(row.slug || "");
            db.products.set(slug, row as unknown as ProductRow);
          } else if (table === "ecobrew_orders") {
            const id = String(row.id || `ECB-${Date.now()}`);
            db.orders.set(id, row as unknown as OrderRow);
          } else if (table === "ecobrew_contacts") {
            const id = String(row.id || randomUUID());
            db.contacts.set(id, { ...row, id, created_at: new Date().toISOString() } as unknown as ContactRow);
          }
        }
        return { data: rows, error: null };
      },
      upsert: async (rows: Array<Record<string, unknown>>, options?: { onConflict?: string; ignoreDuplicates?: boolean }) => {
        for (const row of rows) {
          if (table === "ecobrew_users") {
            const uid = String(row.user_id || "");
            if (options?.ignoreDuplicates && db.users.has(uid)) {
              continue;
            }
            db.users.set(uid, row as unknown as UserRow);
          } else if (table === "ecobrew_products") {
            const slug = String(row.slug || "");
            db.products.set(slug, row as unknown as ProductRow);
          } else if (table === "ecobrew_orders") {
            const id = String(row.id || "");
            db.orders.set(id, row as unknown as OrderRow);
          }
        }
        return { data: rows, error: null };
      },
      update: (fields: Record<string, unknown>) => ({
        eq: async (col: string, val: unknown) => {
          if (table === "ecobrew_users" && col === "user_id") {
            const existing = db.users.get(String(val));
            if (existing) db.users.set(String(val), { ...existing, ...fields });
          } else if (table === "ecobrew_products" && col === "slug") {
            const existing = db.products.get(String(val));
            if (existing) db.products.set(String(val), { ...existing, ...fields });
          } else if (table === "ecobrew_orders" && col === "id") {
            const existing = db.orders.get(String(val));
            if (existing) db.orders.set(String(val), { ...existing, ...fields });
          } else if (table === "ecobrew_contacts" && col === "id") {
            const existing = db.contacts.get(String(val));
            if (existing) db.contacts.set(String(val), { ...existing, ...fields });
          }
          return { data: null, error: null };
        },
      }),
      delete: () => ({
        eq: async (col: string, val: unknown) => {
          if (table === "ecobrew_users" && col === "user_id") db.users.delete(String(val));
          if (table === "ecobrew_products" && col === "slug") db.products.delete(String(val));
          if (table === "ecobrew_orders" && col === "id") db.orders.delete(String(val));
          if (table === "ecobrew_contacts" && col === "id") db.contacts.delete(String(val));
          return { data: null, error: null };
        },
      }),
    };
  }

  storage = {
    from: () => ({
      upload: async (path: string) => {
        getMockDb().storage.set(path, "uploaded");
        return { data: { path }, error: null };
      },
      getPublicUrl: (path: string) => {
        return {
          data: {
            publicUrl: path.startsWith("http") ? path : `/products/leaf-pen-stand.jpg`,
          },
        };
      },
    }),
  };
}

let mockClientInstance: MockSupabaseServerClient | null = null;

function isRealKey(val: string | undefined): boolean {
  if (!val) return false;
  const s = val.trim().toLowerCase();
  return (
    s.length > 5 &&
    !s.includes("your-") &&
    !s.includes("your_") &&
    !s.includes("placeholder")
  );
}

export function getSupabaseServer(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (isRealKey(url) && isRealKey(serviceKey)) {
    if (cached) return cached;
    cached = createClient(url!.replace(/\/+$/, ""), serviceKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return cached;
  }

  if (!mockClientInstance) {
    mockClientInstance = new MockSupabaseServerClient();
  }
  return mockClientInstance as unknown as SupabaseClient;
}

export function isSupabaseServerConfigured(): boolean {
  // Returns true because either real Supabase or in-memory fallback is active
  return true;
}

export function isRealSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return isRealKey(url) && isRealKey(serviceKey);
}
