"use client";

import React, { useState } from "react";
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
import WireframeGlobe from "@/components/home/WireframeGlobe";
import { LeafIcon, ArrowRightIcon } from "@/components/icons";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useCart } from "@/components/cart/CartProvider";
import { useWeather } from "@/hooks/useWeather";

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function aqiLabel(value: number) {
  if (value <= 50) return "Good";
  if (value <= 100) return "Moderate";
  if (value <= 150) return "Unhealthy (sensitive)";
  if (value <= 200) return "Unhealthy";
  if (value <= 300) return "Very unhealthy";
  return "Hazardous";
}

function StatTile({ label, value, icon, sub }: { label: string; value: string; icon: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white/60 p-3 border border-leaf-deep/10">
      <div className="flex items-center justify-between">
        <span className="text-sm">{icon}</span>
        <span className="text-[10px] uppercase tracking-wider text-tea font-semibold">{label}</span>
      </div>
      <p className="mt-1.5 text-sm font-bold text-soil truncate">{value}</p>
      {sub && <p className="text-[10px] text-stone">{sub}</p>}
    </div>
  );
}

export default function Home() {
  const { products } = useProductCatalog();
  const { openSearch } = useAppSettings();
  const { addItem } = useCart();
  const [activeWeatherDay, setActiveWeatherDay] = useState<number>(0);
  const { weather, loading, error, permissionDenied, refreshLocation } = useWeather();

  const featured = products.filter((p) => p.featured).slice(0, 3);
  const heroProduct = products.find((p) => p.slug === "leaf-pen-stand") || products[0];

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

      {/* Hero — Fullscreen Cinematic Mountain Sunset */}
      <section className="relative min-h-[92vh] overflow-hidden flex flex-col justify-between pt-10 pb-14 sm:pt-12 sm:pb-20">
        {/* Cinematic Mountain Sunset Background Image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/mountain_sunset.jpg"
            alt="Misty mountain forest at sunset"
            fill
            priority
            className="object-cover object-center scale-105 transition-transform duration-1000"
          />
          {/* Moody atmospheric gradients & vignettes matching video */}
          <div className="absolute inset-0 bg-gradient-to-t from-soil via-soil/60 to-soil/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-soil/80 via-transparent to-soil/70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(16,29,23,0.7)_100%)]" />
        </div>

        <Container className="relative z-10 grid items-center gap-8 sm:gap-12 lg:grid-cols-[1.1fr_0.9fr] my-auto">
          {/* Left Column: Typographic Hero */}
          <div className="max-w-2xl text-left">
            {/* Micro Eyebrow */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-200 backdrop-blur-md border border-white/15">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>TOOLS & ADVISORY FOR EVERY CIRCULAR DECISION</span>
            </div>

            {/* Headline matching video: GROW + SMARTER (italic serif) */}
            <div className="space-y-1">
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-none">
                GROW
              </h1>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-serif italic font-normal text-amber-200 text-5xl sm:text-6xl lg:text-7xl leading-none">
                  SMARTER
                </span>
                <span className="font-display text-xl sm:text-2xl font-light text-white/90 tracking-wide">
                  with <strong className="font-bold text-emerald-400">EcoBrew</strong>
                </span>
              </div>
            </div>

            {/* Subtitle */}
            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-stone-200">
              Spent tea leaves upcycled into handcrafted pen stands, stationery, and mini furniture.
              An independent circular-economy brand converting urban chai waste into durable goods.
            </p>

            {/* Dual Pill Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/products">
                <button className="flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-soil shadow-natural hover:bg-stone-100 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <span>Shop the Range</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/process">
                <button className="flex items-center gap-2.5 rounded-full bg-white/10 hover:bg-white/20 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md border border-white/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <span>The 7-Step Method</span>
                </button>
              </Link>
            </div>

            {/* Floating Mobile & Desktop Search Trigger Pill (Video 01:05) */}
            <div className="mt-8">
              <button
                type="button"
                onClick={openSearch}
                className="flex w-full max-w-md items-center justify-between rounded-full bg-white/15 hover:bg-white/25 px-5 py-3 text-xs sm:text-sm text-white/80 backdrop-blur-md border border-white/25 shadow-lg transition-all group"
              >
                <div className="flex items-center gap-3">
                  <svg className="h-4 w-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search products, craft, circular advisory...</span>
                </div>
                <kbd className="rounded-md bg-white/20 px-2 py-0.5 font-mono text-[11px] text-white group-hover:bg-emerald-500 transition-colors">
                  ⌘K
                </kbd>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual Feature Card */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl p-3 border border-white/20 shadow-2xl backdrop-blur-md bg-white/10">
              <div className="relative h-full w-full overflow-hidden rounded-2xl bg-soil/50">
                <Image
                  src={heroProduct?.image ?? "/products/leaf-pen-stand.jpg"}
                  alt={heroProduct?.name ?? "EcoBrew product"}
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                {/* Bottom Card Pill info */}
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="glass-strong rounded-2xl p-4 shadow-lg flex items-center justify-between border border-white/30">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-leaf-deep text-sprout shadow-sm">
                        <LeafIcon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-display text-base font-bold text-soil">{heroProduct?.name}</p>
                        <p className="text-xs text-moss font-medium">Reclaimed from ~40 chai glasses</p>
                      </div>
                    </div>
                    <span className="font-display text-lg font-bold text-leaf-deep">
                      ₹{heroProduct?.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wireframe Globe Circular Badge */}
            <div className="glass-strong absolute -top-4 -right-4 flex items-center gap-3 rounded-2xl p-3 shadow-natural border border-tea/40 z-10 backdrop-blur-xl">
              <div className="h-12 w-12 overflow-hidden rounded-xl bg-leaf-deep/15 flex items-center justify-center">
                <WireframeGlobe className="h-full w-full" />
              </div>
              <div className="pr-2 text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-tea">Circular Life</p>
                <p className="font-display text-xs font-semibold text-leaf-deep">Zero Waste Flow</p>
              </div>
            </div>
          </div>
        </Container>

        {/* Ambient Bottom Scroll indicator */}
        <div className="relative z-10 text-center text-white/50 text-xs flex flex-col items-center gap-1 pt-6">
          <span>Explore Circular Modules</span>
          <span className="animate-bounce">↓</span>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-leaf-deep/15 bg-white/70 backdrop-blur-md">
        <Container className="grid grid-cols-2 gap-6 py-8 sm:gap-8 sm:py-10 lg:grid-cols-4">
          {HOME_STATS.map((stat) => (
            <div key={stat.label} className="text-center lg:text-left">
              <p className="font-display text-3xl sm:text-4xl font-bold text-leaf-deep">{stat.value}</p>
              <p className="mt-1 text-xs sm:text-sm text-moss font-medium">{stat.label}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* Bento Grid Section — Video 01:25 - 01:34 ("Everything you need") */}
      <section className="py-14 sm:py-28 bg-oat">
        <Container>
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-tea mb-2">
                PRODUCTS & CRAFT
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-soil">
                Everything you need
              </h2>
              <p className="mt-3 text-sm sm:text-base text-moss">
                From chai cup to craft — explore every circular tool in one integrated place.
              </p>
            </div>
          </Reveal>

          {/* Bento Grid Layout */}
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            
            {/* Bento Card 1: Featured Spotlight Product (2 cols) */}
            <div className="md:col-span-2 lg:col-span-2 rounded-3xl glass-strong border border-white/50 overflow-hidden p-6 sm:p-8 flex flex-col justify-between shadow-soft hover:shadow-natural transition-all group">
              <div className="flex items-center justify-between pb-4">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                  Top Artisan Choice
                </span>
                <span className="text-xs font-medium text-stone">40 cups diverted</span>
              </div>

              <div className="relative aspect-[16/10] w-full my-4 overflow-hidden rounded-2xl bg-kraft">
                <Image
                  src="/products/leaf-pen-stand.jpg"
                  alt="Leaf Pen Stand"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="pt-2">
                <h3 className="font-display text-2xl font-bold text-leaf-deep">Leaf Pen Stand</h3>
                <p className="mt-1 text-xs sm:text-sm text-moss leading-relaxed">
                  Dual-tier desk stand pressed from 40 glasses of spent chai leaves. Naturally textured, bonded with plant resins and sealed with organic beeswax.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-leaf-deep/10 pt-4">
                  <span className="font-display text-xl font-bold text-soil">₹180</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const item = products.find((p) => p.slug === "leaf-pen-stand");
                        if (item) addItem(item.slug);
                      }}
                      className="rounded-xl bg-leaf-deep px-4 py-2 text-xs font-semibold text-white hover:bg-sprout-dark transition-colors"
                    >
                      Quick Add +
                    </button>
                    <Link
                      href="/products/leaf-pen-stand"
                      className="rounded-xl border border-leaf-deep/20 px-3 py-2 text-xs font-semibold text-leaf-deep hover:bg-white transition-colors"
                    >
                      Details &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Live Weather & Curing Forecast (2 cols) */}
            <div className="md:col-span-1 lg:col-span-2 rounded-3xl glass-strong border border-white/50 p-6 sm:p-7 flex flex-col justify-between shadow-soft">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-leaf-deep/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{weather?.current?.icon ?? "🌡️"}</span>
                    <div>
                      <h3 className="font-display text-base font-bold text-leaf-deep">
                        {weather?.city ?? "Indore, India"}
                      </h3>
                      <p className="text-[11px] text-stone">
                        {weather
                          ? `Live weather · updated ${formatTime(weather.updatedAt)}`
                          : "Fetching live weather…"}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900">
                    {weather?.current ? `${Math.round(weather.current.temp)}°C ${weather.current.condition}` : "…"}
                  </span>
                </div>

                {permissionDenied && (
                  <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl bg-white/60 border border-leaf-deep/10 px-3 py-2">
                    <span className="text-[11px] text-stone">
                      Showing default (Indore) forecast.
                    </span>
                    <button
                      type="button"
                      onClick={refreshLocation}
                      className="shrink-0 rounded-full bg-leaf-deep px-3 py-1 text-[11px] font-semibold text-white hover:bg-sprout-dark transition-colors"
                    >
                      Use my location
                    </button>
                  </div>
                )}

                {loading && !weather && (
                  <div className="mt-4 space-y-3 animate-pulse">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-16 rounded-2xl bg-white/50" />
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-24 rounded-2xl bg-white/50" />
                      ))}
                    </div>
                  </div>
                )}

                {weather?.current && (
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <StatTile label="Feels like" value={`${Math.round(weather.current.feelsLike)}°`} icon="🌡️" />
                    <StatTile label="Humidity" value={`${Math.round(weather.current.humidity)}%`} icon="💧" />
                    <StatTile label="Wind" value={`${Math.round(weather.current.windKmh)} km/h`} icon="🍃" />
                    <StatTile label="Rain today" value={`${weather.current.precipitationMm.toFixed(1)} mm`} icon="🌧️" />
                    {weather.aqi != null && (
                      <StatTile label="Air Quality" value={`${weather.aqi} AQI`} icon="🫁" sub={aqiLabel(weather.aqi)} />
                    )}
                  </div>
                )}

                {weather?.daily.length ? (
                  <>
                    <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {weather.daily.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveWeatherDay(idx)}
                          className={`flex flex-col items-center rounded-2xl p-2.5 text-center transition-all ${
                            activeWeatherDay === idx
                              ? "bg-leaf-deep text-white shadow-soft scale-105"
                              : "bg-white/60 text-soil hover:bg-white"
                          }`}
                        >
                          <span className="text-xs font-bold">{item.day}</span>
                          <span className="text-lg my-1">{item.icon}</span>
                          <span className="text-xs font-semibold">{item.high}°</span>
                          <span className={`text-[10px] ${activeWeatherDay === idx ? "text-emerald-200" : "text-stone"}`}>
                            {item.rainMm > 0 ? `${item.rainMm}mm` : "Dry"}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-5 rounded-2xl bg-white/70 p-3.5 border border-leaf-deep/10">
                      <div className="flex items-center justify-between text-xs font-semibold text-leaf-deep">
                        <span>{weather.daily[activeWeatherDay].day}, {weather.daily[activeWeatherDay].date} · {weather.daily[activeWeatherDay].condition}</span>
                        <span>Max {weather.daily[activeWeatherDay].high}°</span>
                      </div>
                      <p className="text-[11px] text-stone mt-1">
                        {weather.daily[activeWeatherDay].rainMm > 10
                          ? "High moisture: indoor heat press recommended for optimal leaf bonding."
                          : "Low moisture: perfect natural solar-curing window for sun-drying chai batches."}
                      </p>
                    </div>
                  </>
                ) : null}

                {error && !weather && (
                  <p className="mt-4 text-xs text-red-600">Couldn&apos;t load live weather right now. Please try again shortly.</p>
                )}
              </div>
            </div>

            {/* Bento Card 3: Tea Cup Organiser */}
            <div className="rounded-3xl glass-strong border border-white/50 p-6 flex flex-col justify-between shadow-soft hover:shadow-natural transition-all group">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-kraft">
                <Image
                  src="/products/tea-cup-organiser.jpg"
                  alt="Tea Cup Organiser"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="pt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-tea">Desk Craft</span>
                <h4 className="font-display text-lg font-bold text-leaf-deep mt-0.5">Tea Cup Organiser</h4>
                <p className="text-xs text-moss mt-1 line-clamp-2">
                  Three cylindrical wells with natural grain to organize pens, clips, and scissors.
                </p>
                <div className="mt-4 flex items-center justify-between pt-2 border-t border-leaf-deep/10">
                  <span className="font-bold text-soil">₹240</span>
                  <Link
                    href="/products/tea-cup-organiser"
                    className="text-xs font-semibold text-tea hover:underline"
                  >
                    View piece &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Bento Card 4: Tea-Soil Seedling Pots */}
            <div className="rounded-3xl glass-strong border border-white/50 p-6 flex flex-col justify-between shadow-soft hover:shadow-natural transition-all group">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-kraft">
                <Image
                  src="/products/tea-soil-pots.jpg"
                  alt="Tea Soil Pots"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="pt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-tea">Biodegradable</span>
                <h4 className="font-display text-lg font-bold text-leaf-deep mt-0.5">Tea-Soil Seedling Pots</h4>
                <p className="text-xs text-moss mt-1 line-clamp-2">
                  Plant directly into garden soil — breaks down into rich organic nitrogen fertilizer in 30 days.
                </p>
                <div className="mt-4 flex items-center justify-between pt-2 border-t border-leaf-deep/10">
                  <span className="font-bold text-soil">₹120 (Set of 4)</span>
                  <Link
                    href="/products/tea-soil-pots"
                    className="text-xs font-semibold text-tea hover:underline"
                  >
                    View piece &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Bento Card 5: Mini Furniture Showcase (2 cols) */}
            <div className="md:col-span-2 lg:col-span-2 rounded-3xl glass-strong border border-white/50 p-6 sm:p-7 flex flex-col justify-between shadow-soft">
              <div className="flex items-center justify-between pb-3 border-b border-leaf-deep/10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-tea">Signature Collection</span>
                  <h4 className="font-display text-xl font-bold text-leaf-deep">Artisanal Mini Furniture</h4>
                </div>
                <Link href="/products" className="text-xs font-semibold text-leaf-deep hover:underline">
                  Browse range &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 my-3">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-kraft group">
                  <Image
                    src="/products/mini-chair.jpg"
                    alt="Mini Chair"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex flex-col justify-end text-white">
                    <p className="text-xs font-bold">Mini Chair</p>
                    <p className="text-[11px] text-amber-200">₹450 &bull; 120 chai cups</p>
                  </div>
                </div>

                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-kraft group">
                  <Image
                    src="/products/mini-table.jpg"
                    alt="Mini Table"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex flex-col justify-end text-white">
                    <p className="text-xs font-bold">Mini Table</p>
                    <p className="text-[11px] text-amber-200">₹520 &bull; 150 chai cups</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-moss pt-2">
                <span>Hand-pressed with hydraulic moulds &bull; 100% rigid circular composite</span>
                <span className="font-semibold text-leaf-deep">Zero Waste</span>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* Chapter 3: 3D Swiping Card Stack Carousel */}
      <section className="bg-kraft/80 py-16 sm:py-32 border-y border-leaf-deep/10">
        <Container>
          <Reveal>
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-tea">Chapter 3 &bull; The Range</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-soil mt-1">
                Handcrafted from chai waste
              </h2>
              <p className="text-sm text-moss mt-2">
                Swipe through the collection — every single piece started as spent leaves from a tea glass.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <CardStack
              items={carouselItems}
              maxVisible={5}
              cardWidth={480}
              cardHeight={320}
              overlap={0.48}
              autoAdvance
              intervalMs={2800}
              pauseOnHover
              showDots
            />
          </Reveal>
        </Container>
      </section>

      {/* Chapter 2: The 7-Step Method */}
      <section className="py-16 sm:py-32 bg-oat">
        <Container>
          <Reveal>
            <SectionHeading
              tag="The Method &bull; Chapter 2"
              title="From chai waste to an enduring piece"
              subtitle="A clean, non-toxic circular craft method with full traceability, from chai stall to finished piece."
            />
          </Reveal>
          <div className="mt-14 grid gap-x-10 gap-y-8 border-t border-leaf-deep/15 pt-10 sm:grid-cols-2 lg:grid-cols-3">
            {processSteps.slice(0, 6).map((step, i) => (
              <Reveal key={step.n} delay={i * 0.05}>
                <div className="group rounded-2xl glass p-6 hover:shadow-soft transition-all">
                  <span className="font-display text-3xl font-light text-tea">
                    {String(step.n).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-xl font-bold text-leaf-deep mt-3">{step.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-moss">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12 text-center">
            <Link
              href="/process"
              className="inline-flex items-center gap-2 rounded-full bg-leaf-deep px-6 py-3 text-xs font-semibold text-white shadow-soft hover:bg-sprout-dark transition-all"
            >
              <span>Explore all 7 steps in detail</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* Featured Products Grid */}
      <section className="py-16 sm:py-32 bg-kraft/50">
        <Container>
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <SectionHeading tag="The Shop" title="Featured pieces" />
              <Link
                href="/products"
                className="hidden shrink-0 items-center gap-2 border-b-2 border-tea/60 pb-0.5 text-sm font-semibold text-tea transition-colors hover:border-leaf-deep hover:text-leaf-deep sm:inline-flex"
              >
                View all pieces <ArrowRightIcon className="h-4 w-4" />
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
          <div className="mt-10 text-center sm:hidden">
            <Link href="/products">
              <Button fullWidth variant="outline">View all products</Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Story Chapter */}
      <section className="py-16 sm:py-32 bg-oat">
        <Container className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="order-2 lg:order-1">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-tea">Chapter 1 &bull; Our Story</span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-soil mt-2">
              A question about what gets thrown away
            </h2>
            <p className="mt-5 text-sm sm:text-base leading-relaxed text-moss">
              Walking past tea stalls in our city, we noticed bin after bin overflowing with spent tea leaves.
              We asked: why throw away rich organic fiber when it can become durable desks, pen stands, and pots?
              That question became EcoBrew.
            </p>
            <div className="mt-8">
              <Link href="/about">
                <button className="rounded-full border border-leaf-deep/30 px-6 py-2.5 text-xs font-semibold text-leaf-deep hover:bg-leaf-deep hover:text-white transition-all">
                  Read the research journey &rarr;
                </button>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="order-1 lg:order-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl p-3 glass-strong shadow-natural">
              <div className="relative h-full w-full overflow-hidden rounded-2xl bg-kraft">
                <Image
                  src="/products/spoon-bookmark.jpg"
                  alt="Handcrafted spoon bookmark"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-leaf-deep/90 via-leaf-deep/40 to-transparent p-6 text-white">
                  <p className="text-xs font-medium flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Handcrafted in Indore, India
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
