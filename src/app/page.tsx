"use client";

import Image from "next/image";
import Link from "next/link";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import LiquidMetalShader from "@/components/ui/liquid-metal-shader";
import { CardStack, CardStackItem } from "@/components/ui/card-stack";
import WireframeGlobe from "@/components/home/WireframeGlobe";
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
      <section className="relative overflow-hidden border-b border-moss/15">
        <div className="absolute inset-0" aria-hidden="true">
          <LiquidMetalShader />
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-b from-leaf-deep/80 via-leaf-deep/35 to-leaf-deep/80"
          aria-hidden="true"
        />
        <Container className="relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-sprout/20 px-4 py-1.5 text-sm font-medium text-sprout">
              <LeafIcon className="h-4 w-4" /> A Bal Vigyan student project
            </p>
            <h1 className="text-4xl leading-tight text-oat sm:text-5xl lg:text-6xl">
              Spent tea leaves make{" "}
              <span className="text-sprout">useful things</span>.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-oat/80">
              EcoBrew collects the tea leaves left behind in a chai glass and
              turns them into pen stands, stationery, and mini furniture —
              nothing wasted, nothing new.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products">
                <Button size="lg">Shop the range</Button>
              </Link>
              <Link href="/process">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-oat/50 text-oat hover:border-oat hover:bg-white/10"
                >
                  See how it's made
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-kraft shadow-natural">
              <Image
                src={heroImage}
                alt={heroProduct?.name ?? "EcoBrew product"}
                fill
                priority
                className="object-cover"
              />
            </div>
            {heroProduct && (
              <div className="absolute -bottom-4 left-4 flex items-center gap-3 rounded-2xl bg-white/90 px-5 py-3 shadow-natural backdrop-blur">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sprout text-leaf-deep">
                  <LeafIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-leaf-deep">{heroProduct.name}</p>
                  <p className="text-xs text-moss">From ~40 cups of chai</p>
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

      {/* Liquid metal brand band */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0" aria-hidden="true">
          <LiquidMetalShader baseColor="#16241b" metalColor="#3a4a3e" highlightColor="#d8e7cc" />
        </div>
        <div className="absolute inset-0 bg-leaf-deep/40" aria-hidden="true" />
        <Container className="relative text-center">
          <p className="font-display text-3xl font-medium text-oat sm:text-4xl">
            Nothing wasted. Nothing new. Just chai.
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm text-oat/75">
            Every piece starts as the leaves left in your glass.
          </p>
        </Container>
      </section>

      {/* Process teaser */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            tag="The method"
            title="From chai waste to a finished piece"
            subtitle="A simple, waste-free process — every step is safe and natural."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {processSteps.slice(0, 6).map((step) => (
              <div key={step.n} className="rounded-2xl bg-white/50 p-5">
                <span className="font-display text-sm font-medium text-sprout-dark">Step {step.n}</span>
                <h3 className="mt-1 font-display text-lg font-medium text-leaf-deep">{step.title}</h3>
              </div>
            ))}
            <Link
              href="/process"
              className="group flex items-center justify-between rounded-2xl bg-leaf-deep p-5 text-oat transition-colors hover:bg-soil"
            >
              <span className="font-medium">See all 7 steps</span>
              <ArrowRightIcon className="h-5 w-5 text-sprout transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Container>
      </section>

      {/* 3D collection gallery */}
      <section className="overflow-hidden bg-white/40 py-16 sm:py-24">
        <Container>
          <SectionHeading
            tag="The range"
            title="Pick a piece to explore"
            subtitle="Every product begins as spent tea leaves — swipe through the range."
          />
          <div className="mt-6">
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
          </div>
        </Container>
      </section>

      {/* Featured products */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <SectionHeading tag="The shop" title="Featured products" />
            <Link href="/products" className="hidden shrink-0 items-center gap-1 text-sm font-medium text-sprout-dark hover:underline sm:inline-flex">
              View all <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
          <div className="mt-8 sm:hidden">
            <Link href="/products">
              <Button fullWidth variant="outline">View all products</Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Story teaser */}
      <section className="bg-white/40 py-16 sm:py-24">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <SectionHeading
              tag="About us"
              title="A school project with a small, real idea"
              subtitle="We asked a simple question: what happens to the tea leaves after the cup is emptied? Mostly they're thrown away. So we decided to make something from them."
            />
            <Link href="/about" className="mt-6 inline-block">
              <Button variant="outline">Read our story</Button>
            </Link>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-3xl bg-leaf-deep shadow-natural">
              <WireframeGlobe className="h-[340px] w-full lg:h-[420px]" />
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-leaf-deep/90 to-transparent p-5">
                <LeafIcon className="h-6 w-6 text-sprout" />
                <p className="text-sm text-oat">100% reclaimed — every piece starts as chaipatti.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
