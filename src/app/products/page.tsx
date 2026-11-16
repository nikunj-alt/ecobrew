"use client";

import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import CategoryFilter from "@/components/product/CategoryFilter";
import { useProductCatalog } from "@/components/product/ProductCatalogProvider";
import BrandLogo from "@/components/ui/BrandLogo";

export default function ProductsPage() {
  const { products } = useProductCatalog();

  return (
    <Container className="py-16 sm:py-24">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeading
          tag="The shop"
          title="Everything here was once a cup of chai"
          subtitle="Choose a category or browse the whole range."
        />
        <BrandLogo className="h-14 w-14 ring-2 ring-leaf-deep/15 shadow-soft" sizes="56px" />
      </div>
      <div className="mt-10">
        <CategoryFilter products={products} />
      </div>
    </Container>
  );
}
