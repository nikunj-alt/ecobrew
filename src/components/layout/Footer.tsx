import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE, CONTACT_EMAIL, CONTACT_PHONE, NAV_LINKS } from "@/lib/constants";
import { LeafIcon } from "@/components/icons";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="mt-auto bg-leaf-deep text-oat">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sprout/20 text-sprout">
              <LeafIcon className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-medium">{SITE_NAME}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-oat/70">
            {SITE_TAGLINE} A school project turned small brand, making useful
            things from chai waste.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-sprout">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-oat/70 transition-colors hover:text-oat">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-sprout">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm text-oat/70">
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-oat">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>{CONTACT_PHONE}</li>
            <li>Presented at Bal Vigyan, India</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-sprout">Our promise</h3>
          <p className="mt-3 text-sm leading-relaxed text-oat/70">
            Every product is made from reclaimed tea leaves and compostable
            binders — nothing new, nothing wasted.
          </p>
        </div>
      </Container>
      <div className="border-t border-oat/15 py-5">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-oat/60 sm:flex-row">
          <span>© 2026 {SITE_NAME}. A student project.</span>
          <span>Made from spent tea leaves, with care.</span>
        </Container>
      </div>
    </footer>
  );
}
