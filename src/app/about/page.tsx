import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { LeafIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Our Story — EcoBrew",
  description: "Why a group of students started EcoBrew — turning chai waste into useful things.",
};

const values = [
  {
    icon: "leaf",
    title: "Reduce",
    body: "Every cup of tea is a handful of waste. We take that waste and keep it in use.",
  },
  {
    icon: "leaf",
    title: "Reuse",
    body: "The same leaves that steeped your chai become the desk, stand, or decor you keep.",
  },
  {
    icon: "leaf",
    title: "Recycle",
    body: "When a piece finally wears out, the materials return to the earth — naturally.",
  },
];

export default function AboutPage() {
  return (
    <Container className="py-16 sm:py-24">
      <SectionHeading
        tag="Our story"
        title="The idea behind EcoBrew"
        subtitle="We're a team of students working on a social-science project for Bal Vigyan. What began as a question about waste became a small brand."
      />

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <div className="rounded-biophilic shadow-soft ring-1 ring-leaf-deep/8 bg-white/70 p-8 lg:col-span-2">
          <h2 className="text-2xl font-medium text-leaf-deep">Where it started</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-moss">
            <p>
              Every day, millions of cups of chai are drunk in India. After the
              last sip, the spent tea leaves — <em>chaipatti</em> — are almost
              always thrown away. That&apos;s a lot of organic waste going nowhere.
            </p>
            <p>
              In our project, we collect that chaipatti and give it a second
              life. Through cleaning, drying, and pressing the leaves with
              natural binders, we shape them into things people actually use:
              pen stands, stationery, mini chairs and tables, and decor.
            </p>
            <p>
              EcoBrew is our brand for this idea — proof that a household waste
              stream can become a small, useful product line.
            </p>
          </div>
        </div>

        <div className="rounded-biophilic bg-leaf-deep p-8 text-oat shadow-natural">
          <h2 className="text-xl font-medium text-sprout">The three Rs</h2>
          <div className="mt-5 space-y-6">
            {values.map((v) => (
              <div key={v.title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sprout/20 text-sprout">
                  <LeafIcon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-medium">{v.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-oat/70">{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
