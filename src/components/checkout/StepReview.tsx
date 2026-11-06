"use client";

import Image from "next/image";
import { useProductCatalog } from "@/components/product/ProductCatalogProvider";
import { formatINR } from "@/lib/utils";
import type { CartItem, CustomerDetails } from "@/lib/types";

export default function StepReview({
  items,
  subtotal,
  customer,
}: {
  items: CartItem[];
  subtotal: number;
  customer: CustomerDetails;
}) {
  const { getProduct } = useProductCatalog();
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium text-moss">Items</h3>
        <div className="divide-y divide-moss/15 rounded-sm bg-white/50 px-5">
          {items.map((item) => {
            const product = getProduct(item.slug);
            if (!product) return null;
            return (
              <div key={item.slug} className="flex items-center gap-4 py-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-kraft">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-leaf-deep">{product.name}</p>
                  <p className="text-xs text-moss">× {item.qty}</p>
                </div>
                <span className="text-sm font-medium text-leaf-deep">
                  {formatINR(product.price * item.qty)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-moss">Deliver to</h3>
        <div className="rounded-sm bg-white/50 px-5 py-4 text-sm text-leaf-deep">
          <p className="font-medium">{customer.name}</p>
          <p className="text-moss">
            {customer.address}, {customer.city}, {customer.state} — {customer.pincode}
          </p>
          <p className="mt-1 text-moss">{customer.email} · {customer.phone}</p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-sm bg-kraft px-5 py-4">
        <span className="font-medium text-leaf-deep">Subtotal</span>
        <span className="font-display text-xl font-semibold text-leaf-deep">
          {formatINR(subtotal)}
        </span>
      </div>
    </div>
  );
}
