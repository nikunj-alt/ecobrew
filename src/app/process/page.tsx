import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ProcessTimeline from "@/components/process/ProcessTimeline";
import BrandLogo from "@/components/ui/BrandLogo";

export const metadata: Metadata = {
  title: "Our Process — TeaRX",
  description: "How used tea leaves become pen stands, stationery, and mini furniture.",
};

export default function ProcessPage() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeading
          tag="The method"
          title="Seven steps, leaf to product"
          subtitle="Every TeaRX piece starts in a used chai glass and ends as something useful. Here is the whole route."
        />
        <BrandLogo className="h-14 w-14 ring-2 ring-leaf-deep/15 shadow-soft" sizes="56px" />
      </div>
      <div className="mt-12 max-w-3xl">
        <ProcessTimeline />
      </div>
    </Container>
  );
}
