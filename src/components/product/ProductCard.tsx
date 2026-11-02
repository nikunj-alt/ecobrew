import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { categoryLabels } from "@/lib/data/products";
import { formatINR } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white/50 shadow-natural transition-shadow hover:shadow-lg"
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
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <Badge tone="tea">{categoryLabels[product.category]}</Badge>
        </div>
        <h3 className="mt-3 font-display text-lg font-medium text-leaf-deep">
          {product.name}
        </h3>
        <p className="mt-1 flex-1 text-sm leading-relaxed text-moss">
          {product.shortDescription}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-leaf-deep">
            {formatINR(product.price)}
          </span>
          <span className="text-sm font-medium text-sprout-dark transition-transform group-hover:translate-x-0.5">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
