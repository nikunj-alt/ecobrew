import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ProcessTimeline from "@/components/process/ProcessTimeline";

export const metadata: Metadata = {
  title: "Our Process — EcoBrew",
  description: "How spent tea leaves become pen stands, stationery, and mini furniture.",
};

export default function ProcessPage() {
  return (
    <Container className="py-16 sm:py-24">
      <SectionHeading
        tag="The method"
        title="Seven steps, leaf to product"
        subtitle="Every EcoBrew piece starts in a used chai glass and ends as something useful. Here is the whole route."
      />
      <div className="mt-12 max-w-3xl">
        <ProcessTimeline />
      </div>
    </Container>
  );
}
