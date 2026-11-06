import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CONTACT_EMAIL, CONTACT_PHONE, NAV_LINKS } from "@/lib/constants";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-soil text-oat border-t border-leaf-deep/20 pt-16 pb-8">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at bottom, rgba(30,122,95,0.4) 0%, transparent 70%)",
        }}
      />

      <Container className="relative z-10">
        {/* Top 4-column footer links */}
        <div className="grid gap-10 pb-16 sm:grid-cols-2 lg:grid-cols-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="relative h-8 w-8 overflow-hidden rounded-full ring-1 ring-emerald-400/30">
                <Image
                  src="/logo.png"
                  alt="EcoBrew Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                EcoBrew
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-stone/80">
              A Bal Vigyan 2026 student innovation initiative transforming urban chai waste streams into heirloom sustainable desk crafts and circular goods.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>100% Upcycled &bull; Zero Plastic</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-tea">Explore</h3>
            <ul className="mt-3 space-y-2 text-xs">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-stone hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/my-orders" className="text-stone hover:text-white transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/find-us" className="text-stone hover:text-white transition-colors">
                  Bal Vigyan Pavilion Stall
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-tea">Advisory & Contact</h3>
            <ul className="mt-3 space-y-2 text-xs text-stone">
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white transition-colors">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>{CONTACT_PHONE}</li>
              <li>Social Science Research Wing, Bal Vigyan</li>
              <li>Indore, Madhya Pradesh, India</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-tea">The Circular Promise</h3>
            <p className="mt-3 text-xs leading-relaxed text-stone">
              Every single piece is bonded exclusively with natural plant-based binders and cured under natural sunlight. Returns to the earth within 90 days of composting.
            </p>
            <div className="mt-4 rounded-xl bg-white/5 p-3 border border-white/5">
              <p className="text-[11px] font-medium text-white/90">Curious about the recipe?</p>
              <Link href="/process" className="text-[11px] text-emerald-300 hover:underline mt-0.5 inline-block">
                View our open-source method &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Giant Typographic Brand Banner (Video Frame 01:35) */}
        <div className="py-12 sm:py-16 text-center select-none overflow-hidden">
          <div className="relative inline-block w-full">
            <span
              className="font-display font-black tracking-widest text-[14vw] sm:text-[13vw] leading-none uppercase text-transparent bg-clip-text bg-gradient-to-b from-white/25 via-emerald-500/15 to-transparent transition-all hover:from-white/40 hover:via-emerald-400/30"
              style={{
                textShadow: "0 0 80px rgba(30,122,95,0.2)",
              }}
            >
              ECOBREW
            </span>
            <div className="mt-[-2vw] sm:mt-[-2.5vw] flex items-center justify-center gap-3">
              <span className="h-px w-12 sm:w-24 bg-tea/40" />
              <span className="font-display text-xs sm:text-sm font-semibold tracking-[0.35em] text-tea uppercase">
                BAL VIGYAN 2026
              </span>
              <span className="h-px w-12 sm:w-24 bg-tea/40" />
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="border-t border-white/10 pt-6 flex flex-col items-center justify-between gap-3 text-[11px] text-stone sm:flex-row">
          <span>&copy; 2026 EcoBrew. Crafted for Bal Vigyan.</span>
          <div className="flex items-center gap-4">
            <Link href="/cookie-policy" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
            <span>&bull;</span>
            <Link href="/admin" className="hover:text-white transition-colors">
              Admin Access
            </Link>
            <span>&bull;</span>
            <span>Zero Plastic &bull; 100% Chai Waste</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
