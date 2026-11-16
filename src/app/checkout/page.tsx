import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import BrandLogo from "@/components/ui/BrandLogo";

export const metadata: Metadata = {
  title: "Checkout — TeaRX",
  description: "Simulated checkout for TeaRX products.",
};

export default function CheckoutPage() {
  return (
    <Container className="max-w-3xl py-16 sm:py-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          title="Checkout"
          subtitle="Secure checkout — review your order and confirm."
        />
        <BrandLogo className="h-14 w-14 ring-2 ring-leaf-deep/15 shadow-soft" sizes="56px" />
      </div>
      <div className="mt-10">
        <CheckoutSteps />
      </div>
    </Container>
  );
}
