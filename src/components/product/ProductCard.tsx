import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { categoryLabels } from "@/lib/data/products";
import { formatINR } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-biophilic bg-white/70 shadow-soft ring-1 ring-leaf-deep/8 transition-all duration-300 hover:-translate-y-1 hover:shadow-natural"
    >
      <div className="relative aspect-square overflow-hidden bg-kraft">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {!product.inStock && (
          <span className="absolute left-4 top-4 rounded-full bg-soil/85 px-3 py-1 text-xs font-medium text-oat">
            Back soon
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-tea">
          {categoryLabels[product.category]}
        </p>
        <h3 className="mt-2 font-display text-[1.35rem] font-medium text-leaf-deep">
          {product.name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-moss">
          {product.shortDescription}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-leaf-deep/10 pt-4">
          <span className="font-display text-xl font-medium text-leaf-deep">
            {formatINR(product.price)}
          </span>
          <span className="text-sm font-semibold text-tea transition-transform duration-300 group-hover:translate-x-1">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
