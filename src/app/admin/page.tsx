"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";
import { categories, categoryLabels } from "@/lib/data/products";
import { useProductCatalog } from "@/components/product/ProductCatalogProvider";
import { formatINR, formatShortDate } from "@/lib/utils";
import type { Category, ContactMessage, Order, OrderStatus, Product } from "@/lib/types";
import { LeafIcon, CheckIcon } from "@/components/icons";

type Tab = "products" | "orders" | "contacts";

interface AdminApiData {
  authed?: boolean;
  ok?: boolean;
  error?: string;
  url?: string;
  orders?: Order[];
  contacts?: ContactMessage[];
}

async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<{ res: Response; data: AdminApiData }> {
  const res = await fetch(path, {
    ...init,
    headers: init?.body instanceof FormData ? undefined : { "Content-Type": "application/json" },
  });
  return { res, data: (await res.json().catch(() => ({}))) as AdminApiData };
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    apiFetch("/api/admin/auth").then(({ data }) => {
      setAuthed(Boolean(data.authed));
      setChecked(true);
    });
  }, []);

  if (!checked) {
    return <Container className="py-20 text-center text-moss">Loading…</Container>;
  }

  if (!authed) {
    return <AdminGate onSuccess={() => setAuthed(true)} />;
  }

  return <Dashboard onLogout={() => setAuthed(false)} />;
}

function AdminGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError("");
    const { res, data } = await apiFetch("/api/admin/auth", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok && data.ok) {
      onSuccess();
    } else {
      setError(data.error || "Incorrect password.");
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
          <Button type="submit" fullWidth disabled={busy}>{busy ? "Checking…" : "Unlock"}</Button>
        </form>
      </div>
    </Container>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("products");

  const logout = async () => {
    await apiFetch("/api/admin/auth", { method: "DELETE" });
    onLogout();
  };

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-moss">EcoBrew</p>
          <h1 className="text-2xl font-medium text-leaf-deep">Admin panel</h1>
        </div>
        <Button size="sm" variant="ghost" onClick={logout}>Log out</Button>
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
    apiFetch("/api/admin/orders").then(({ data }) => {
      if (alive) setCount(data.orders?.length ?? null);
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

  const showError = (msg: string) => setNotice({ kind: "err", text: msg });

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
                onToggleStock={async () => {
                  setBusy(true);
                  const { res, data } = await apiFetch(`/api/admin/products/${p.slug}`, {
                    method: "PATCH",
                    body: JSON.stringify({ inStock: !p.inStock }),
                  });
                  setBusy(false);
                  if (res.ok && data.ok) {
                    await refresh(p.inStock ? `Marked "${p.name}" out of stock.` : `Marked "${p.name}" in stock.`);
                  } else {
                    showError(`Stock update failed: ${data.error}`);
                  }
                }}
                onDelete={async () => {
                  if (!window.confirm(`Delete "${p.name}" permanently? This cannot be undone.`)) return;
                  setBusy(true);
                  const { res, data } = await apiFetch(`/api/admin/products/${p.slug}`, {
                    method: "DELETE",
                  });
                  setBusy(false);
                  if (res.ok && data.ok) {
                    await refresh(`Deleted "${p.name}".`);
                  } else {
                    showError(`Delete failed: ${data.error}`);
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
  onToggleStock,
  onDelete,
  busy,
}: {
  product: Product;
  onEdit: () => void;
  onToggleStock: () => void;
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
        <Button size="sm" variant="outline" onClick={onToggleStock} disabled={busy}>
          {product.inStock ? "Mark out of stock" : "Mark in stock"}
        </Button>
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const upload = async (file: File | undefined) => {
    if (!file) return;
    const slug = (product ? product.slug : form.slug).trim().toLowerCase().replace(/\s+/g, "-");
    if (!slug) {
      setError("Slug is required before uploading an image.");
      return;
    }
    setError("");
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slug", slug);
    const { res, data } = await apiFetch("/api/admin/upload-image", { method: "POST", body: fd });
    setUploading(false);
    if (res.ok && data.url) {
      set("image", data.url);
    } else {
      setError(data.error || "Upload failed.");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = (product ? product.slug : form.slug).trim().toLowerCase().replace(/\s+/g, "-");
    if (!slug || !form.name.trim()) {
      setError("Slug and name are required.");
      return;
    }
    setBusy(true);
    setError("");
    const { res, data } = await apiFetch("/api/admin/products", {
      method: "POST",
      body: JSON.stringify({
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
      }),
    });
    setBusy(false);
    if (res.ok && data.ok) {
      await onSaved();
    } else {
      setError(data.error || "Could not save product.");
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
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-moss">Product image</label>
          <div className="flex items-center gap-2">
            {form.image && (
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-kraft ring-1 ring-moss/20">
                <Image src={form.image} alt="Current image" fill sizes="40px" className="object-cover" />
              </div>
            )}
            <label className="cursor-pointer rounded-lg border border-moss/25 bg-white/60 px-3 py-2 text-sm text-leaf-deep hover:bg-white/80">
              {uploading ? "Uploading…" : "Upload image"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  upload(e.target.files?.[0]);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>
          <input
            value={form.image}
            onChange={(e) => set("image", e.target.value)}
            placeholder="/products/leaf-pen-stand.svg or an uploaded image URL"
            className={inputCls}
          />
        </div>
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
    const { data } = await apiFetch("/api/admin/orders");
    setOrders(data.orders ?? []);
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await apiFetch("/api/admin/orders");
      if (!alive) return;
      setOrders(data.orders ?? []);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Light polling keeps the board live (new customer orders + status changes)
  // without exposing the orders table to the anon role via realtime.
  useEffect(() => {
    const t = setInterval(() => {
      apiFetch("/api/admin/orders").then(({ data }) => {
        setOrders(data.orders ?? []);
        setLoading(false);
      });
    }, 15000);
    return () => clearInterval(t);
  }, []);

  const act = async (id: string, fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusyId(id);
    const { ok, error } = await fn();
    setBusyId(null);
    if (ok) await load();
    else alert(`Action failed: ${error}`);
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
          onApprove={() => act(o.id, () => setStatus(o.id, "approved"))}
          onSetDate={(date) =>
            act(o.id, () => apiFetch(`/api/admin/orders/${o.id}/delivery-date`, {
              method: "PATCH",
              body: JSON.stringify({ date }),
            }).then(({ res, data }) => ({ ok: !!(res.ok && data.ok), error: data.error })))
          }
          onDeliver={() => act(o.id, () => setStatus(o.id, "delivered"))}
          onCancel={() => act(o.id, () => setStatus(o.id, "cancelled"))}
        />
      ))}
    </div>
  );
}

async function setStatus(id: string, status: OrderStatus) {
  const { res, data } = await apiFetch(`/api/admin/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return { ok: !!(res.ok && data.ok), error: data.error };
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
    const { data } = await apiFetch("/api/admin/contacts");
    setContacts(data.contacts ?? []);
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await apiFetch("/api/admin/contacts");
      if (!alive) return;
      setContacts(data.contacts ?? []);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <p className="text-sm text-moss">Loading messages…</p>;

  if (contacts.length === 0) {
    return <p className="rounded-2xl bg-white/50 p-8 text-center text-sm text-moss">No contact messages yet.</p>;
  }

  const sendReply = async (id: string) => {
    if (!replyText.trim()) return;
    setBusy(true);
    const { res, data } = await apiFetch(`/api/admin/contacts/${id}/reply`, {
      method: "POST",
      body: JSON.stringify({ reply: replyText.trim() }),
    });
    setBusy(false);
    if (res.ok && data.ok) {
      setReplyFor(null);
      setReplyText("");
      await load();
    } else {
      alert(`Reply failed: ${data.error}`);
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
