"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";
import AccountModal from "@/components/auth/AccountModal";
import { getLoggedInUser } from "@/lib/services/auth";
import type { UserAccount } from "@/lib/services/auth";
import { useProductCatalog } from "@/components/product/ProductCatalogProvider";
import { formatINR, formatShortDate, orderEta } from "@/lib/utils";
import type { ContactMessage, Order } from "@/lib/types";
import { LeafIcon } from "@/components/icons";

export default function MyOrdersPage() {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { getProduct } = useProductCatalog();

  const load = async () => {
    const [oRes, cRes] = await Promise.all([fetch("/api/orders"), fetch("/api/contacts")]);
    const oData = (await oRes.json().catch(() => ({}))) as { orders?: Order[] };
    const cData = (await cRes.json().catch(() => ({}))) as { contacts?: ContactMessage[] };
    setOrders(oData.orders ?? []);
    setContacts(cData.contacts ?? []);
    setLoading(false);
  };

  useEffect(() => {
    const u = getLoggedInUser();
    setUser(u);
    if (u) {
      load();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Container className="py-20 text-center text-moss">Loading your orders…</Container>
    );
  }

  if (!user) {
    return (
      <Container className="max-w-lg py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-kraft">
          <LeafIcon className="h-6 w-6 text-moss" />
        </div>
        <h1 className="mt-4 text-2xl font-medium text-leaf-deep">Sign in to track orders</h1>
        <p className="mt-2 text-sm text-moss">
          Log in with your EcoBrew User ID to see your order status and any replies from the admin team.
        </p>
        <div className="mt-6">
          <Button onClick={() => setIsAuthOpen(true)}>Account / Login</Button>
        </div>
        <AccountModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={(u) => { setUser(u); setLoading(true); load(); }} />
      </Container>
    );
  }

  const activeOrders = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");

  return (
    <Container className="py-14 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-moss">Signed in as</p>
          <h1 className="mt-1 text-3xl font-medium text-leaf-deep">@{user.userId}</h1>
        </div>
        <Link href="/products">
          <Button variant="outline" size="sm">Shop more</Button>
        </Link>
      </div>

      {/* Active orders banner */}
      {activeOrders.length > 0 && (
        <div className="mt-8 rounded-2xl border border-sprout/30 bg-sprout/10 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-leaf-deep">
            <span className="h-2.5 w-2.5 rounded-full bg-sprout animate-pulse" />
            <h2 className="font-medium">In transit</h2>
          </div>
          <div className="mt-3 space-y-2 text-sm text-leaf-deep">
            {activeOrders.map((o) => (
              <p key={o.id}>
                <span className="font-medium">{o.id}</span> — {orderEta(o)}
              </p>
            ))}
          </div>
          <p className="mt-3 text-xs text-moss">
            These orders leave this banner once they're marked delivered or cancelled.
          </p>
        </div>
      )}

      {/* Orders list */}
      <section className="mt-10">
        <h2 className="text-lg font-medium text-leaf-deep">Your orders</h2>
        {orders.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-white/50 p-8 text-center text-sm text-moss">
            <p>You haven't placed any orders yet.</p>
            <Link href="/products" className="mt-4 inline-block">
              <Button size="sm">Browse products</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl bg-white/50 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="font-medium text-leaf-deep">{order.id}</span>
                  <OrderStatusBadge status={order.status} />
                  <span className="text-xs text-moss">Placed {formatShortDate(order.createdAt)}</span>
                  {order.deliveryDate && order.status !== "cancelled" && (
                    <span className="text-xs text-moss">Delivery by {formatShortDate(order.deliveryDate)}</span>
                  )}
                </div>

                <div className="mt-4 divide-y divide-moss/15">
                  {order.items.map((item) => {
                    const product = getProduct(item.slug);
                    return (
                      <div key={item.slug} className="flex items-center gap-4 py-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-kraft">
                          {product && (
                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-leaf-deep">
                            {product ? product.name : item.slug}
                          </p>
                          <p className="text-xs text-moss">× {item.qty}</p>
                        </div>
                        {product && (
                          <span className="text-sm font-medium text-leaf-deep">
                            {formatINR(product.price * item.qty)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-moss/15 pt-3 text-sm">
                  <span className="text-moss">{order.customer.name || "—"}</span>
                  <span className="font-medium text-leaf-deep">{formatINR(order.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Inquiries + replies */}
      <section className="mt-12">
        <h2 className="text-lg font-medium text-leaf-deep">Your inquiries</h2>
        {contacts.length === 0 ? (
          <p className="mt-3 text-sm text-moss">
            No messages sent yet. Head to the{" "}
            <Link href="/contact" className="font-medium text-sprout-dark underline">contact page</Link>{" "}
            to reach the team.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {contacts.map((c) => (
              <div key={c.id} className="rounded-2xl bg-white/50 p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-xs text-moss">{formatShortDate(c.createdAt)}</span>
                  {c.reply ? (
                    <span className="rounded-full bg-sprout/15 px-2.5 py-0.5 text-xs font-medium text-sprout-dark">Replied</span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">Awaiting reply</span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-leaf-deep">{c.message}</p>
                {c.reply && (
                  <div className="mt-4 rounded-xl bg-kraft p-4">
                    <p className="text-xs font-medium text-leaf-deep">EcoBrew team replied:</p>
                    <p className="mt-1 text-sm leading-relaxed text-moss">{c.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </Container>
  );
}
