import Link from "next/link";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { CONTACT_EMAIL } from "@/lib/constants";
import { LeafIcon, ArrowRightIcon } from "@/components/icons";
import LiveLocationButton from "@/components/location/LiveLocationButton";

interface Place {
  kind: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  external?: boolean;
}

const PLACES: Place[] = [
  {
    kind: "Online",
    title: "The EcoBrew shop",
    body: "The whole range lives here — browse, and order from the site.",
    href: "/products",
    cta: "Browse the market",
  },
  {
    kind: "Event",
    title: "Our Studio",
    body: "Visit our Indore studio to see how spent tea leaves become finished goods — and meet the team behind them.",
    href: "/about",
    cta: "About us",
  },
  {
    kind: "Direct",
    title: "Reach us",
    body: "For questions about an order or the project, write to us — we read everything.",
    href: `/mailto:${CONTACT_EMAIL}`,
    cta: "Send a message",
    external: true,
  },
];

export default function FindUsPage() {
  return (
    <Container className="py-16 sm:py-24">
      <SectionHeading
        tag="Find us"
        title="Where to find EcoBrew"
        subtitle="Online, in-store, or by email — pick whichever is easiest."
      />

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {PLACES.map((p) => (
          <div key={p.title} className="glass flex h-full flex-col rounded-biophilic p-7">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf-deep text-white">
              <LeafIcon className="h-5 w-5" />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-tea">{p.kind}</p>
            <h2 className="mt-2 font-display text-2xl font-medium text-leaf-deep">{p.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-moss">{p.body}</p>
            {p.external ? (
              <a
                href={p.href}
                className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-leaf-deep transition-colors hover:text-tea"
              >
                {p.cta}
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            ) : (
              <Link href={p.href} className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-leaf-deep transition-colors hover:text-tea">
                {p.cta}
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="mt-14">
        <div className="glass mx-auto max-w-lg rounded-biophilic p-7 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-tea">Getting here</p>
          <h2 className="mt-2 font-display text-2xl font-medium text-leaf-deep">Use your live location</h2>
          <p className="mt-3 text-sm leading-relaxed text-moss">
            Capture where you are — it&apos;s saved on this device and ready to reuse at checkout or sign-up.
          </p>
          <div className="mt-6 flex justify-center">
            <LiveLocationButton />
          </div>
        </div>
      </div>

      <div className="mt-14 text-center">
        <p className="text-sm text-stone">Prefer to just look at the products first?</p>
        <Link href="/products" className="mt-5 inline-block">
          <Button>Shop the range</Button>
        </Link>
      </div>
    </Container>
  );
}
