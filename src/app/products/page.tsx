import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import CategoryFilter from "@/components/product/CategoryFilter";
import { products } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Products — EcoBrew",
  description: "Pen stands, stationery, mini furniture, and decor — all made from spent tea leaves.",
};

export default function ProductsPage() {
  return (
    <Container className="py-16 sm:py-24">
      <SectionHeading
        tag="The shop"
        title="Everything here was once a cup of chai"
        subtitle="Browse the eco — choose a category or see it all. These are placeholder products you can edit later."
      />
      <div className="mt-10">
        <CategoryFilter products={products} />
      </div>
    </Container>
  );
}
