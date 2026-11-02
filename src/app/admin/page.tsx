"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";
import { isSupabaseConfigured } from "@/lib/supabase";
import { ADMIN_PASSWORD, ADMIN_SESSION_KEY } from "@/lib/constants";
import { categories, categoryLabels } from "@/lib/data/products";
import { useProductCatalog } from "@/components/product/ProductCatalogProvider";
import { upsertProduct, deleteProduct } from "@/lib/services/products";
import { fetchOrders, updateOrderStatus, setOrderDeliveryDate, fetchContacts, replyToContact } from "@/lib/services/admin";
import { formatINR, formatShortDate } from "@/lib/utils";
import type { Category, ContactMessage, Order, OrderStatus, Product } from "@/lib/types";
import { LeafIcon, CheckIcon } from "@/components/icons";

type Tab = "products" | "orders" | "contacts";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "1") setAuthed(true);
    } catch {}
    setChecked(true);
  }, []);

  if (!checked) {
    return <Container className="py-20 text-center text-moss">Loading…</Container>;
  }

  if (!authed) {
    return <AdminGate onSuccess={() => setAuthed(true)} />;
  }

  return <Dashboard />;
}

function AdminGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      try {
        window.sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
      } catch {}
      onSuccess();
    } else {
      setError("Incorrect password.");
    }
  };

  return (
    <Container className="max-w-md py-24">
      <div className="rounded-2xl bg-white/50 p-8 shadow-natural">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-leaf-deep text-oat">
          <LeafIcon className="h-6 w-6 text-sprout" />
        </div>
        <h1 className="mt-4 text-2xl font-medium text-leaf-deep">Admin access</h1>
        <p className="mt-1 text-sm text-moss">Enter the admin password to continue.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input
            label="Password"
            type="password"
            value={password}
            autoFocus
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" fullWidth>Unlock</Button>
        </form>
      </div>
    </Container>
  );
}

function Dashboard() {
  const [tab, setTab] = useState<Tab>("products");

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-moss">EcoBrew</p>
          <h1 className="text-2xl font-medium text-leaf-deep">Admin panel</h1>
        </div>
        {!isSupabaseConfigured() && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            ⚠ Supabase not configured — changes won't persist
          </span>
        )}
      </div>

      <div className="mt-6 flex gap-1 rounded-xl bg-white/50 p-1">
        {(["products", "orders", "contacts"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-leaf-deep text-oat" : "text-moss hover:text-leaf-deep"
            }`}
          >
            {t} {t === "orders" && <OrdersCount />}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "products" && <ProductsTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "contacts" && <ContactsTab />}
      </div>
    </Container>
  );
}

function OrdersCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    fetchOrders().then((orders) => {
      if (alive) setCount(orders.length);
    });
    return () => {
      alive = false;
    };
  }, []);
  if (count === null) return null;
  return <span className="ml-1 text-xs opacity-70">({count})</span>;
}

/* ----------------------------- Products tab ----------------------------- */

function ProductsTab() {
  const { products, reload, loading } = useProductCatalog();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const refresh = async (msg: string) => {
    await reload();
    setNotice({ kind: "ok", text: msg });
    setTimeout(() => setNotice(null), 3000);
  };

  if (loading) {
    return <p className="text-sm text-moss">Loading products…</p>;
  }

  return (
    <div>
      {notice && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${notice.kind === "ok" ? "bg-sprout/15 text-sprout-dark" : "bg-red-50 text-red-600"}`}>
          {notice.text}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-moss">{products.length} products in catalog</p>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>+ Add product</Button>
        )}
      </div>

      {adding && (
        <ProductEditor
          key="new"
          mode="add"
          onCancel={() => setAdding(false)}
          onSaved={async () => {
            setAdding(false);
            await refresh("Product added.");
          }}
        />
      )}

      <div className="space-y-3">
        {products.map((p) => (
          <div key={p.slug} className="rounded-2xl bg-white/50 p-4">
            {editing === p.slug ? (
              <ProductEditor
                product={p}
                mode="edit"
                onCancel={() => setEditing(null)}
                onSaved={async () => {
                  setEditing(null);
                  await refresh(`Saved "${p.name}".`);
                }}
              />
            ) : (
              <ProductRow
                product={p}
                onEdit={() => setEditing(p.slug)}
                onDelete={async () => {
                  setBusy(true);
                  const res = await deleteProduct(p.slug);
                  setBusy(false);
                  if (res.success) {
                    await refresh(`Deleted "${p.name}".`);
                  } else {
                    setNotice({ kind: "err", text: `Delete failed: ${res.error}` });
                  }
                }}
                busy={busy}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductRow({
  product,
  onEdit,
  onDelete,
  busy,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-kraft">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-leaf-deep">{product.name}</p>
          {product.featured && (
            <span className="rounded-full bg-leaf-deep/10 px-2 py-0.5 text-[10px] font-medium text-leaf-deep">★ Featured</span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              product.inStock ? "bg-sprout/15 text-sprout-dark" : "bg-red-100 text-red-600"
            }`}
          >
            {product.inStock ? "In stock" : "Out of stock"}
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm text-moss">
          {categoryLabels[product.category]} · {product.slug}
        </p>
      </div>
      <div className="text-right">
        <p className="font-display text-lg font-medium text-leaf-deep">{formatINR(product.price)}</p>
        <p className="text-xs text-moss">{product.impact || "—"}</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
        <Button size="sm" variant="ghost" onClick={onDelete} disabled={busy} className="text-red-600">
          Delete
        </Button>
      </div>
    </div>
  );
}

const emptyForm = {
  slug: "",
  name: "",
  category: "decor" as Category,
  price: "",
  shortDescription: "",
  description: "",
  image: "",
  impact: "",
  inStock: true,
  featured: false,
};

function ProductEditor({
  product,
  mode,
  onCancel,
  onSaved,
}: {
  product?: Product;
  mode: "add" | "edit";
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState(() =>
    product
      ? {
          slug: product.slug,
          name: product.name,
          category: product.category,
          price: String(product.price),
          shortDescription: product.shortDescription || "",
          description: product.description || "",
          image: product.image,
          impact: product.impact || "",
          inStock: product.inStock,
          featured: product.featured,
        }
      : { ...emptyForm },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = (product ? product.slug : form.slug).trim().toLowerCase().replace(/\s+/g, "-");
    if (!slug || !form.name.trim()) {
      setError("Slug and name are required.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await upsertProduct({
      slug,
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price || 0),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      image: form.image.trim() || "/logo.png",
      impact: form.impact.trim(),
      inStock: form.inStock,
      featured: form.featured,
    });
    setBusy(false);
    if (res.success) {
      await onSaved();
    } else {
      setError(res.error || "Could not save product.");
    }
  };

  const inputCls =
    "w-full rounded-xl border border-moss/25 bg-white/60 px-3 py-2 text-sm text-leaf-deep placeholder:text-moss/50 focus:border-sprout focus:outline-2 focus:outline-sprout/40";

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-leaf-deep">
          {mode === "add" ? "Add new product" : `Edit — ${product?.name}`}
        </h3>
        <button type="button" onClick={onCancel} className="text-xs font-medium text-moss hover:text-leaf-deep">
          Cancel
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {mode === "add" && (
          <Input label="Slug (url)" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="leaf-pen-stand" />
        )}
        <Input label="Name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-moss">Category</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value as Category)}
            className={inputCls}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{categoryLabels[c]}</option>
            ))}
          </select>
        </div>
        <Input label="Price (₹)" type="number" min={0} value={form.price} onChange={(e) => set("price", e.target.value)} />
        <Input label="Image URL" value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="/products/leaf-pen-stand.svg" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Short description" value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
        <Input label="Impact" value={form.impact} onChange={(e) => set("impact", e.target.value)} placeholder="≈ 40 cups of chaipatti" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-moss">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className={inputCls}
        />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-leaf-deep">
          <input type="checkbox" checked={form.inStock} onChange={(e) => set("inStock", e.target.checked)} />
          In stock
        </label>
        <label className="flex items-center gap-2 text-sm text-leaf-deep">
          <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
          Featured
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={busy}>{busy ? "Saving…" : "Save product"}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Discard</Button>
      </div>
    </form>
  );
}

/* ------------------------------ Orders tab ------------------------------ */

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { getProduct } = useProductCatalog();

  const load = async () => {
    setOrders(await fetchOrders());
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const act = async (id: string, fn: () => Promise<{ success: boolean; error?: string }>) => {
    setBusyId(id);
    const res = await fn();
    setBusyId(null);
    if (res.success) await load();
    else alert(`Action failed: ${res.error}`);
  };

  if (loading) return <p className="text-sm text-moss">Loading orders…</p>;

  if (orders.length === 0) {
    return <p className="rounded-2xl bg-white/50 p-8 text-center text-sm text-moss">No orders yet.</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <OrderCard
          key={o.id}
          order={o}
          busy={busyId === o.id}
          getProduct={getProduct}
          onApprove={() => act(o.id, () => updateOrderStatus(o.id, "approved"))}
          onSetDate={(date) => act(o.id, () => setOrderDeliveryDate(o.id, date))}
          onDeliver={() => act(o.id, () => updateOrderStatus(o.id, "delivered"))}
          onCancel={() => act(o.id, () => updateOrderStatus(o.id, "cancelled"))}
        />
      ))}
    </div>
  );
}

function OrderCard({
  order,
  busy,
  getProduct,
  onApprove,
  onSetDate,
  onDeliver,
  onCancel,
}: {
  order: Order;
  busy: boolean;
  getProduct: (slug: string) => Product | undefined;
  onApprove: () => void;
  onSetDate: (date: string) => void;
  onDeliver: () => void;
  onCancel: () => void;
}) {
  const [dateVal, setDateVal] = useState(() =>
    order.deliveryDate ? order.deliveryDate.slice(0, 10) : "",
  );

  const done = order.status === "delivered" || order.status === "cancelled";

  return (
    <div className="rounded-2xl bg-white/50 p-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-medium text-leaf-deep">{order.id}</span>
        <OrderStatusBadge status={order.status} />
        <span className="text-xs text-moss">
          {order.userId ? `@${order.userId}` : "Guest"} · {formatShortDate(order.createdAt)}
        </span>
        <span className="font-medium text-leaf-deep ml-auto">{formatINR(order.subtotal)}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-moss">
        {order.items.map((it) => {
          const p = getProduct(it.slug);
          return (
            <span key={it.slug} className="rounded-full bg-white/70 px-2.5 py-1 ring-1 ring-moss/15">
              {p ? p.name : it.slug} × {it.qty}
            </span>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl bg-kraft px-4 py-2.5 text-xs text-leaf-deep">
        {order.customer.name} — {order.customer.address}, {order.customer.city}, {order.customer.state}{" "}
        {order.customer.pincode} · {order.customer.phone}
      </div>

      {!done && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {order.status === "pending" && (
            <Button size="sm" onClick={onApprove} disabled={busy}>Approve</Button>
          )}
          {(order.status === "approved" || order.status === "in_transit") && (
            <>
              <input
                type="date"
                value={dateVal}
                onChange={(e) => setDateVal(e.target.value)}
                className="rounded-lg border border-moss/25 bg-white/60 px-2.5 py-1.5 text-sm text-leaf-deep focus:border-sprout focus:outline-2 focus:outline-sprout/40"
              />
              <Button size="sm" variant="outline" disabled={busy || !dateVal} onClick={() => dateVal && onSetDate(dateVal)}>
                Set delivery date · ship
              </Button>
              <Button size="sm" onClick={onDeliver} disabled={busy}>Mark delivered</Button>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={onCancel} disabled={busy} className="text-red-600">
            Cancel order
          </Button>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Contacts tab ----------------------------- */

function ContactsTab() {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setContacts(await fetchContacts());
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p className="text-sm text-moss">Loading messages…</p>;

  if (contacts.length === 0) {
    return <p className="rounded-2xl bg-white/50 p-8 text-center text-sm text-moss">No contact messages yet.</p>;
  }

  const sendReply = async (id: string) => {
    if (!replyText.trim()) return;
    setBusy(true);
    const res = await replyToContact(id, replyText.trim());
    setBusy(false);
    if (res.success) {
      setReplyFor(null);
      setReplyText("");
      await load();
    } else {
      alert(`Reply failed: ${res.error}`);
    }
  };

  return (
    <div className="space-y-4">
      {contacts.map((c) => (
        <div key={c.id} className="rounded-2xl bg-white/50 p-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-medium text-leaf-deep">{c.name}</span>
            <span className="text-xs text-moss">{c.email}</span>
            {c.userId && <span className="text-xs text-moss">@{c.userId}</span>}
            <span className="text-xs text-moss">{formatShortDate(c.createdAt)}</span>
            {c.reply && (
              <span className="ml-auto flex items-center gap-1 rounded-full bg-sprout/15 px-2.5 py-0.5 text-xs font-medium text-sprout-dark">
                <CheckIcon className="h-3 w-3" /> Replied
              </span>
            )}
          </div>

          <p className="mt-3 text-sm leading-relaxed text-leaf-deep">{c.message}</p>

          {c.reply && (
            <div className="mt-3 rounded-xl bg-kraft p-3 text-sm">
              <p className="text-xs font-medium text-leaf-deep">Your reply:</p>
              <p className="mt-1 text-moss">{c.reply}</p>
            </div>
          )}

          {replyFor === c.id ? (
            <div className="mt-4 space-y-2">
              <textarea
                rows={3}
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply to the user…"
                className="w-full rounded-xl border border-moss/25 bg-white/60 px-3 py-2 text-sm text-leaf-deep placeholder:text-moss/50 focus:border-sprout focus:outline-2 focus:outline-sprout/40"
              />
              <div className="flex gap-2">
                <Button size="sm" disabled={busy || !replyText.trim()} onClick={() => sendReply(c.id)}>
                  {busy ? "Sending…" : "Send reply"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setReplyFor(null); setReplyText(""); }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            !c.reply && (
              <div className="mt-4">
                <Button size="sm" variant="outline" onClick={() => setReplyFor(c.id)}>
                  Reply
                </Button>
              </div>
            )
          )}
        </div>
      ))}
    </div>
  );
}
