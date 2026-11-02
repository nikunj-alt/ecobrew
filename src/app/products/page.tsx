"use client";

import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import CategoryFilter from "@/components/product/CategoryFilter";
import { useProductCatalog } from "@/components/product/ProductCatalogProvider";

export default function ProductsPage() {
  const { products } = useProductCatalog();

  return (
    <Container className="py-16 sm:py-24">
      <SectionHeading
        tag="The shop"
        title="Everything here was once a cup of chai"
        subtitle="Browse the eco — choose a category or see it all. Products are managed from the admin panel and served from the database."
      />
      <div className="mt-10">
        <CategoryFilter products={products} />
      </div>
    </Container>
  );
}
