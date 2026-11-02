"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProduct, formatINR } from "@/lib/utils";
import type { Order } from "@/lib/types";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import { CheckIcon, LeafIcon } from "@/components/icons";

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("ecobrew-last-order");
      if (raw) setOrder(JSON.parse(raw) as Order);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <Container className="py-16 sm:py-24">
      {!order ? (
        <div className="mx-auto max-w-lg rounded-2xl bg-white/50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-kraft">
            <LeafIcon className="h-6 w-6 text-moss" />
          </div>
          <h1 className="text-2xl text-leaf-deep">No recent order found</h1>
          <p className="mt-2 text-moss">
            You haven't placed a (simulated) order yet on this device.
          </p>
          <Link href="/products" className="mt-6 inline-block">
            <Button>Browse products</Button>
          </Link>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-start gap-4 rounded-2xl bg-leaf-deep p-8 text-oat">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sprout text-leaf-deep">
              <CheckIcon className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-3xl font-medium">Thank you! Order placed</h1>
              <p className="mt-2 text-oat/70">
                This is a simulated order for the Bal Vigyan fair — you won't be
                charged and nothing is really shipped.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-oat/60">Order number</p>
                <p className="font-medium">{order.id}</p>
              </div>
              <div>
                <p className="text-oat/60">Placed on</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-white/50 p-6 sm:p-8">
            <h2 className="mb-4 text-lg font-medium text-leaf-deep">Items</h2>
            <div className="divide-y divide-moss/15">
              {order.items.map((item) => {
                const product = getProduct(item.slug);
                if (!product) return null;
                return (
                  <div key={item.slug} className="flex items-center gap-4 py-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-kraft">
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-leaf-deep">{product.name}</p>
                      <p className="text-sm text-moss">× {item.qty}</p>
                    </div>
                    <span className="font-medium text-leaf-deep">
                      {formatINR(product.price * item.qty)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-moss/15 pt-4">
              <span className="font-medium text-leaf-deep">Subtotal</span>
              <span className="font-display text-xl font-semibold text-leaf-deep">
                {formatINR(order.subtotal)}
              </span>
            </div>
            <div className="mt-6 rounded-xl bg-kraft p-5 text-sm">
              <p className="font-medium text-leaf-deep">Deliver to</p>
              <p className="mt-1 text-moss">
                {order.customer.name} — {order.customer.address}, {order.customer.city},{" "}
                {order.customer.state} {order.customer.pincode}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className="flex-1">
              <Button fullWidth size="lg">Continue shopping</Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button fullWidth size="lg" variant="outline">Back to home</Button>
            </Link>
          </div>
        </div>
      )}
    </Container>
  );
}
