"use client";

import Image from "next/image";
import Link from "next/link";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { CardStack, CardStackItem } from "@/components/ui/card-stack";
import ProductCard from "@/components/product/ProductCard";
import { processSteps } from "@/lib/data/process";
import { HOME_STATS } from "@/lib/constants";
import { useProductCatalog } from "@/components/product/ProductCatalogProvider";
import InTransitBand from "@/components/home/InTransitBand";
import { LeafIcon, ArrowRightIcon } from "@/components/icons";

export default function Home() {
  const { products } = useProductCatalog();
  const featured = products.filter((p) => p.featured).slice(0, 3);
  const heroImage = featured[0]?.image ?? "/products/leaf-pen-stand.svg";
  const heroProduct = featured[0];

  const carouselItems: CardStackItem[] = products.map((p) => ({
    id: p.slug,
    title: p.name,
    description: p.shortDescription,
    imageSrc: p.image,
    href: `/products/${p.slug}`,
  }));

  return (
    <>
      <InTransitBand />

      {/* Hero — light, airy, glass (BhoomiX-inspired) */}
      <section className="relative overflow-hidden bg-oat">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(60% 50% at 80% 12%, rgba(201,151,48,0.14), transparent 65%), radial-gradient(46% 48% at 6% 85%, rgba(30,122,95,0.12), transparent 62%)",
          }}
        />
        <Container className="relative grid items-center gap-16 py-24 sm:py-32 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-6 inline-flex items-center gap-3 text-sm tracking-wide text-stone">
              <span className="h-px w-10 bg-tea" />
              A Bal Vigyan student project
            </p>
            <h1 className="text-5xl leading-[1.04] text-soil sm:text-6xl lg:text-[4.5rem]">
              Spent tea leaves make{" "}
              <span className="italic text-leaf-deep">useful things</span>.
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-moss">
              EcoBrew collects the tea leaves left behind in a chai glass and
              turns them into pen stands, stationery, and mini furniture —
              nothing wasted, nothing new.
            </p>
            <div className="mt-11 flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-leaf-deep text-white hover:bg-sprout-dark">
                  Shop the range
                </Button>
              </Link>
              <Link href="/process">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-leaf-deep/30 text-leaf-deep hover:border-tea hover:text-tea"
                >
                  See how it&apos;s made
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="glass relative aspect-[4/5] overflow-hidden rounded-biophilic p-2">
              <div className="relative h-full w-full overflow-hidden rounded-[0.6rem] bg-kraft">
                <Image
                  src={heroImage}
                  alt={heroProduct?.name ?? "EcoBrew product"}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
            {heroProduct && (
              <div className="glass-strong absolute -bottom-6 left-6 flex items-center gap-4 rounded-full py-3 pl-4 pr-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tea text-white">
                  <LeafIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-lg font-medium text-leaf-deep">{heroProduct.name}</p>
                  <p className="text-sm text-stone">From ~40 cups of chai</p>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Stats strip */}
      <section className="border-y border-leaf-deep/10 bg-kraft/70">
        <Container className="grid grid-cols-2 gap-10 py-12 lg:grid-cols-4">
          {HOME_STATS.map((stat) => (
            <div key={stat.label} className="text-center lg:text-left">
              <p className="font-display text-4xl font-medium text-leaf-deep sm:text-5xl">{stat.value}</p>
              <p className="mt-2 text-sm text-moss">{stat.label}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* Explore / advisory cards (mirrors BhoomiX tool-card row) */}
      <section className="py-20 sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              tag="Explore"
              title="Pick a door"
              subtitle="The range, the method, the people, or a guide — all one step away."
            />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/products", title: "Shop the range", body: "Pen stands, stationery, mini furniture and decor.", n: "01" },
              { href: "/guides", title: "Guides", body: "Method, materials, and care for your pieces.", n: "02" },
              { href: "/about", title: "Our story", body: "The school project behind the chai waste.", n: "03" },
              { href: "/contact", title: "Help & contact", body: "Questions, orders, or just to say hi.", n: "04" },
            ].map((c) => (
              <Reveal key={c.n}>
                <Link href={c.href} className="glass group flex h-full flex-col rounded-biophilic p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-natural">
                  <span className="font-display text-2xl font-light text-tea/70">{c.n}</span>
                  <h3 className="mt-4 font-display text-xl font-medium text-leaf-deep">{c.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-moss">{c.body}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-leaf-deep transition-colors group-hover:text-tea">
                    Open <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Brand band */}
      <section className="py-24 sm:py-28">
        <Container className="text-center">
          <p className="font-display text-4xl font-medium leading-tight text-soil sm:text-5xl">
            Nothing wasted. Nothing new.{" "}
            <span className="italic text-tea">Just chai.</span>
          </p>
          <p className="mx-auto mt-5 max-w-md text-base text-stone">
            Every piece starts as the leaves left in your glass.
          </p>
        </Container>
      </section>

      {/* Process teaser (Chapter: journey) */}
      <section className="py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              tag="The method · Chapter 2"
              title="From chai waste to a finished piece"
              subtitle="A simple, waste-free process — every step is safe and natural."
            />
          </Reveal>
          <div className="mt-14 grid gap-x-12 gap-y-10 border-t border-leaf-deep/10 pt-10 sm:grid-cols-2 lg:grid-cols-3">
            {processSteps.slice(0, 6).map((step, i) => (
              <Reveal key={step.n} delay={i * 0.05}>
                <div className="group flex gap-5">
                  <span className="font-display text-3xl font-light text-tea/70">
                    {String(step.n).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-medium text-leaf-deep">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-moss">{step.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-14">
            <Link
              href="/process"
              className="group inline-flex items-center gap-3 border-b-2 border-tea/60 pb-1 text-sm font-semibold tracking-wide text-tea transition-colors hover:border-leaf-deep hover:text-leaf-deep"
            >
              See all 7 steps
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* Collection gallery */}
      <section className="bg-kraft/60 py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              tag="The range · Chapter 3"
              title="Pick a piece"
              subtitle="Every product begins as spent tea leaves — swipe through the range."
            />
          </Reveal>
          <Reveal className="mt-12">
            <CardStack
              items={carouselItems}
              maxVisible={5}
              cardWidth={460}
              cardHeight={300}
              overlap={0.48}
              autoAdvance
              intervalMs={2600}
              pauseOnHover
              showDots
            />
          </Reveal>
        </Container>
      </section>

      {/* Featured products */}
      <section className="py-24 sm:py-32">
        <Container>
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <SectionHeading tag="The shop" title="Featured products" />
              <Link href="/products" className="hidden shrink-0 items-center gap-2 border-b-2 border-tea/60 pb-0.5 text-sm font-semibold text-tea transition-colors hover:border-leaf-deep hover:text-leaf-deep sm:inline-flex">
                View all <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product, i) => (
              <Reveal key={product.slug} delay={i * 0.08}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 sm:hidden">
            <Link href="/products">
              <Button fullWidth variant="outline">View all products</Button>
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* Story teaser (Chapter: solution) */}
      <section className="py-24 sm:py-32">
        <Container className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="order-2 lg:order-1">
            <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-tea">
              <span className="h-px w-10 bg-tea/60" />
              About us · Chapter 1
            </p>
            <h2 className="text-4xl font-medium text-soil sm:text-[2.9rem]">
              A school project with a small, real idea
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-moss">
              We asked a simple question: what happens to the tea leaves after the
              cup is emptied? Mostly they&apos;re thrown away. So we decided to make
              something from them.
            </p>
            <Link href="/about" className="mt-9 inline-block">
              <Button variant="outline" className="border-leaf-deep/30 text-leaf-deep hover:border-tea hover:text-tea">
                Read our story
              </Button>
            </Link>
          </Reveal>
          <Reveal delay={0.1} className="order-1 lg:order-2">
            <div className="glass relative aspect-[4/5] overflow-hidden rounded-biophilic p-2">
              <div className="relative h-full w-full overflow-hidden rounded-[0.6rem] bg-kraft">
                <Image
                  src={featured[1]?.image ?? heroImage}
                  alt={featured[1]?.name ?? "EcoBrew product"}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-leaf-deep/80 to-transparent p-7">
                  <p className="flex items-center gap-3 text-sm text-white">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-tea text-white">
                      <LeafIcon className="h-4 w-4" />
                    </span>
                    100% reclaimed — every piece starts as chaipatti.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Latest (mirrors BhoomiX news strip) */}
      <section className="border-t border-leaf-deep/10 bg-kraft/60 py-20 sm:py-24">
        <Container>
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <SectionHeading tag="Latest" title="From the workshop" />
              <Link href="/about" className="hidden shrink-0 items-center gap-2 border-b-2 border-tea/60 pb-0.5 text-sm font-semibold text-tea transition-colors hover:border-leaf-deep hover:text-leaf-deep sm:inline-flex">
                More <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { title: "A leaf, cleaned and dried", body: "The first step — rinsing chaipatti and letting the sun do its part.", tag: "Process" },
              { title: "Pressing the binder", body: "Natural binders hold each piece together. No glue, no plastic.", tag: "Materials" },
              { title: "Ready for the fair", body: "New shapes heading to Bal Vigyan — see them in the shop first.", tag: "Event" },
            ].map((post) => (
              <Reveal key={post.title}>
                <Link href="/process" className="glass group block h-full rounded-biophilic p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-natural">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-tea">{post.tag}</span>
                  <h3 className="mt-3 font-display text-xl font-medium text-leaf-deep">{post.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-moss">{post.body}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
