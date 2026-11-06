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

      {/* Hero */}
      <section className="relative overflow-hidden bg-leaf-deep">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(58% 48% at 78% 18%, rgba(240,234,225,0.14), transparent 62%), radial-gradient(42% 46% at 8% 82%, rgba(138,90,59,0.18), transparent 60%)",
          }}
        />
        <Container className="relative grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-6 inline-flex items-center gap-3 text-sm text-oat/60">
              <span className="h-px w-10 bg-tea-light" />
              A Bal Vigyan student project
            </p>
            <h1 className="text-5xl leading-[1.05] text-oat sm:text-6xl lg:text-[4.25rem]">
              Spent tea leaves make useful things.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-oat/75">
              EcoBrew collects the tea leaves left behind in a chai glass and
              turns them into pen stands, stationery, and mini furniture —
              nothing wasted, nothing new.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-oat text-leaf-deep hover:bg-white">
                  Shop the range
                </Button>
              </Link>
              <Link href="/process">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-oat/40 text-oat hover:border-oat hover:bg-white/10"
                >
                  See how it's made
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-kraft shadow-2xl">
              <Image
                src={heroImage}
                alt={heroProduct?.name ?? "EcoBrew product"}
                fill
                priority
                className="object-cover"
              />
            </div>
            {heroProduct && (
              <div className="absolute -bottom-5 left-6 flex items-center gap-4 bg-oat px-6 py-4 shadow-natural">
                <div>
                  <p className="font-display text-lg font-medium text-leaf-deep">{heroProduct.name}</p>
                  <p className="text-sm text-moss">From ~40 cups of chai</p>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Stats strip */}
      <section className="border-b border-moss/15 bg-white/40">
        <Container className="grid grid-cols-2 gap-8 py-10 lg:grid-cols-4">
          {HOME_STATS.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl font-medium text-leaf-deep sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-moss">{stat.label}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* Brand band */}
      <section className="border-y border-leaf-deep/8 bg-kraft/60 py-24 sm:py-28">
        <Container className="text-center">
          <p className="font-display text-4xl font-medium leading-tight text-leaf-deep sm:text-5xl">
            Nothing wasted. Nothing new. Just chai.
          </p>
          <p className="mx-auto mt-5 max-w-md text-base text-moss">
            Every piece starts as the leaves left in your glass.
          </p>
        </Container>
      </section>

      {/* Process teaser */}
      <section className="py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              tag="The method"
              title="From chai waste to a finished piece"
              subtitle="A simple, waste-free process — every step is safe and natural."
            />
          </Reveal>
          <div className="mt-14 grid gap-x-12 gap-y-10 border-t border-leaf-deep/10 pt-10 sm:grid-cols-2 lg:grid-cols-3">
            {processSteps.slice(0, 6).map((step, i) => (
              <Reveal key={step.n} delay={i * 0.05}>
                <div className="group flex gap-5">
                  <span className="font-display text-2xl font-light text-tea/60">
                    {String(step.n).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-medium text-leaf-deep">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-moss">{step.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-14">
            <Link
              href="/process"
              className="group inline-flex items-center gap-3 border-b border-leaf-deep/30 pb-1 text-sm font-medium tracking-wide text-leaf-deep transition-colors hover:border-tea hover:text-tea"
            >
              See all 7 steps
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* Collection gallery */}
      <section className="overflow-hidden bg-white/40 py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              tag="The range"
              title="Pick a piece"
              subtitle="Every product begins as spent tea leaves — swipe through the range."
            />
          </Reveal>
          <Reveal className="mt-10">
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
              <Link href="/products" className="hidden shrink-0 items-center gap-2 border-b border-leaf-deep/30 pb-0.5 text-sm font-medium text-leaf-deep transition-colors hover:border-tea hover:text-tea sm:inline-flex">
                View all <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Story teaser */}
      <section className="bg-white/40 py-24 sm:py-32">
        <Container className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="order-2 lg:order-1">
            <SectionHeading
              tag="About us"
              title="A school project with a small, real idea"
              subtitle="We asked a simple question: what happens to the tea leaves after the cup is emptied? Mostly they're thrown away. So we decided to make something from them."
            />
            <Link href="/about" className="mt-8 inline-block">
              <Button variant="outline">Read our story</Button>
            </Link>
          </Reveal>
          <Reveal delay={0.1} className="order-1 lg:order-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-leaf-deep shadow-natural">
              {featured[1] ? (
                <Image
                  src={featured[1].image}
                  alt={featured[1].name}
                  fill
                  className="object-cover"
                />
              ) : (
                <Image
                  src={heroImage}
                  alt="EcoBrew product"
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-leaf-deep/90 to-transparent p-6">
                <p className="flex items-center gap-2 text-sm text-oat">
                  <LeafIcon className="h-4 w-4 text-sprout" />
                  100% reclaimed — every piece starts as chaipatti.
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
