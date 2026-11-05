"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { useAuth } from "@/components/auth/AuthProvider";
import { orderEta } from "@/lib/utils";
import type { Order } from "@/lib/types";
import { LeafIcon } from "@/components/icons";

const ACTIVE = new Set(["pending", "approved", "in_transit"]);

export default function InTransitBand() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoaded(true);
      return;
    }
    let alive = true;
    (async () => {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as { orders?: Order[] };
      if (!alive) return;
      setOrders((data.orders ?? []).filter((o) => ACTIVE.has(o.status)));
      setLoaded(true);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  if (!loaded || orders.length === 0) return null;

  return (
    <section className="border-b border-sprout/30 bg-sprout/10">
      <Container className="py-3.5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="flex items-center gap-2 font-medium text-leaf-deep">
            <span className="h-2 w-2 rounded-full bg-sprout animate-pulse" />
            In transit ({orders.length})
          </span>
          {orders.slice(0, 3).map((o) => (
            <Link href="/my-orders" key={o.id} className="group flex items-center gap-1.5 text-moss hover:text-leaf-deep">
              <LeafIcon className="h-3.5 w-3.5 text-sprout" />
              <span className="font-medium">{o.id}</span>
              <span className="text-moss/70">· {orderEta(o)}</span>
            </Link>
          ))}
          <Link
            href="/my-orders"
            className="ml-auto font-medium text-sprout-dark hover:underline"
          >
            Track orders →
          </Link>
        </div>
      </Container>
    </section>
  );
}
