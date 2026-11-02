"use client";

import Image from "next/image";
import { useCart } from "./CartProvider";
import { useProductCatalog } from "@/components/product/ProductCatalogProvider";
import { formatINR } from "@/lib/utils";
import { MinusIcon, PlusIcon, CloseIcon } from "@/components/icons";

export default function CartItem({ slug, qty }: { slug: string; qty: number }) {
  const { setQty, removeItem } = useCart();
  const { getProduct } = useProductCatalog();
  const product = getProduct(slug);
  if (!product) return null;

  return (
    <div className="flex gap-4 py-4">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-kraft">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-leaf-deep">{product.name}</p>
          <button
            onClick={() => removeItem(slug)}
            className="rounded p-1 text-moss/60 transition-colors hover:text-tea"
            aria-label={`Remove ${product.name} from cart`}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-moss">{formatINR(product.price)}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center rounded-full border border-moss/25">
            <button
              onClick={() => setQty(slug, qty - 1)}
              className="p-1.5 text-moss hover:text-leaf-deep"
              aria-label="Decrease quantity"
            >
              <MinusIcon className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-medium">{qty}</span>
            <button
              onClick={() => setQty(slug, qty + 1)}
              className="p-1.5 text-moss hover:text-leaf-deep"
              aria-label="Increase quantity"
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="ml-auto text-sm font-semibold text-leaf-deep">
            {formatINR(product.price * qty)}
          </span>
        </div>
      </div>
    </div>
  );
}
