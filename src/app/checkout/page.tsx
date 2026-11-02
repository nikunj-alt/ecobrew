import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";

export const metadata: Metadata = {
  title: "Checkout — EcoBrew",
  description: "Simulated checkout for EcoBrew products.",
};

export default function CheckoutPage() {
  return (
    <Container className="max-w-3xl py-16 sm:py-24">
      <SectionHeading
        title="Checkout"
        subtitle="This is a simulated flow for the Bal Vigyan fair — no real payment occurs."
      />
      <div className="mt-10">
        <CheckoutSteps />
      </div>
    </Container>
  );
}
