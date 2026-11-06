"use client";

import Link from "next/link";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { LeafIcon, ArrowRightIcon } from "@/components/icons";

const GUIDES = [
  {
    n: "01",
    title: "The method",
    eyebrow: "How it's made",
    body: "Seven steps take the leaves left in a chai glass to a finished piece — collect, clean, dry, bind, press, shape, and finish. Every step is simple, safe, and uses no plastic.",
    href: "/process",
    cta: "See the 7 steps",
  },
  {
    n: "02",
    title: "Materials",
    eyebrow: "What goes in",
    body: "Spent tea leaves (chaipatti) and natural binders — nothing else. No wax coating, no plastic filler, no dyes. The whole piece is compostable at end of life.",
    href: "/about",
    cta: "About our materials",
  },
  {
    n: "03",
    title: "Care & use",
    eyebrow: "Looking after your piece",
    body: "Keep it dry and out of direct sunlight for the longest life. It's sturdy enough for everyday desk use and, when you're done with it, it can go back to the earth.",
    href: "/contact",
    cta: "Ask us anything",
  },
];

export default function GuidesPage() {
  return (
    <Container className="py-16 sm:py-24">
      <Reveal>
        <SectionHeading
          tag="Guides · Field notes"
          title="How EcoBrew works"
          subtitle="Three short guides: the method, the materials, and how to care for what you own."
        />
      </Reveal>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {GUIDES.map((g, i) => (
          <Reveal key={g.n} delay={i * 0.08}>
            <div className="glass flex h-full flex-col rounded-biophilic p-7">
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl font-light text-tea/70">{g.n}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf-deep text-white">
                  <LeafIcon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-tea">{g.eyebrow}</p>
              <h2 className="mt-2 font-display text-2xl font-medium text-leaf-deep">{g.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-moss">{g.body}</p>
              <Link href={g.href} className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-leaf-deep transition-colors hover:text-tea">
                {g.cta}
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-14 text-center">
        <p className="text-sm text-stone">Still curious? The full story is one page away.</p>
        <Link href="/about" className="mt-5 inline-block">
          <Button variant="outline" fullWidth={false}>Read our story</Button>
        </Link>
      </Reveal>
    </Container>
  );
}
