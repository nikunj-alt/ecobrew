import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { categoryLabels } from "@/lib/data/products";
import { formatINR } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-sm bg-white/50 shadow-natural transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-kraft">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {!product.inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-soil/80 px-2.5 py-0.5 text-xs font-medium text-oat">
            Back soon
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-tea">
          {categoryLabels[product.category]}
        </p>
        <h3 className="mt-3 font-display text-xl font-medium text-leaf-deep">
          {product.name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-moss">
          {product.shortDescription}
        </p>
        <div className="mt-6 flex items-center justify-between border-t border-leaf-deep/10 pt-4">
          <span className="font-display text-lg font-medium text-leaf-deep">
            {formatINR(product.price)}
          </span>
          <span className="text-sm font-medium text-tea transition-transform duration-300 group-hover:translate-x-1">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
