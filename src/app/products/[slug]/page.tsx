"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import Badge from "@/components/ui/Badge";
import AddToCartButton from "@/components/product/AddToCartButton";
import ProductCard from "@/components/product/ProductCard";
import { categoryLabels } from "@/lib/data/products";
import { formatINR } from "@/lib/utils";
import { useProductCatalog } from "@/components/product/ProductCatalogProvider";
import { LeafIcon } from "@/components/icons";

const slugLabels: Record<string, string> = {
  "leaf-pen-stand": "Leaf Pen Stand",
  "tea-cup-organiser": "Tea Cup Organiser",
  "leaf-coaster-set": "Leaf Coaster Set",
  "spoon-bookmark": "Spoon Bookmark",
  "leaf-notebook": "Leaf Notebook",
  "mini-chair": "Mini Chair",
  "mini-table": "Mini Table",
  "wall-leaf-tile": "Wall Leaf Tile",
  "tea-soil-pots": "Tea-Soil Pots",
};

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const { getProduct, getRelatedProducts } = useProductCatalog();
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product.slug, product.category);

  return (
    <Container className="py-12 sm:py-20">
      <nav className="mb-8 flex items-center gap-2 text-sm text-moss" aria-label="Breadcrumb">
        <Link href="/products" className="hover:text-leaf-deep">Products</Link>
        <span aria-hidden="true">/</span>
        <span className="text-leaf-deep">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-kraft shadow-natural">
          <Image src={product.image} alt={product.name} fill priority className="object-cover" />
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="tea">{categoryLabels[product.category]}</Badge>
            {product.impact && <Badge>{product.impact}</Badge>}
          </div>

          <h1 className="mt-4 text-4xl font-medium text-leaf-deep">{product.name}</h1>
          <p className="mt-3 font-display text-3xl font-medium text-sprout-dark">
            {formatINR(product.price)}
          </p>

          <div className="mt-6 flex items-start gap-3 rounded-xl bg-white/50 p-4">
            <LeafIcon className="mt-0.5 h-5 w-5 shrink-0 text-sprout-dark" />
            <p className="text-sm leading-relaxed text-moss">{product.description}</p>
          </div>

          <div className="mt-8">
            <AddToCartButton slug={product.slug} inStock={product.inStock} />
          </div>

          <div className="mt-8 border-t border-moss/15 pt-6 text-sm text-moss">
            <p className="flex items-center gap-2">
              <LeafIcon className="h-4 w-4 text-sprout" />
              Hand-shaped from reclaimed tea leaves & natural binders.
            </p>
            <p className="mt-2 flex items-center gap-2">
              <LeafIcon className="h-4 w-4 text-sprout" />
              Compostable at end of life — nothing goes to waste.
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-2xl font-medium text-leaf-deep">You might also like</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
