import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Cookie Policy — EcoBrew",
  description:
    "How EcoBrew uses cookies and local storage: the session cookie, cart, and preferences. No ad tracking.",
};

export default function CookiePolicyPage() {
  return (
    <Container className="py-12 sm:py-20">
      <SectionHeading
        tag="Transparency"
        title="Cookie policy"
        subtitle="EcoBrew is a small student project — we keep things simple and minimal, and we never track you for advertising."
      />

      <div className="mx-auto mt-10 max-w-3xl space-y-10 text-moss">
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-medium text-leaf-deep">What we use and why</h2>
          <p className="leading-relaxed">
            The site is a working demo of a school project, so it keeps a very small
            footprint. The only things stored on your device are the ones needed
            for the site to function:
          </p>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              <span className="font-medium text-leaf-deep">Session cookie (ecobrew_session)</span>{" "}
              — a secure, server-side cookie that keeps you signed in. It is
              httpOnly, signed, and short-lived. This is essential for login, orders,
              and the admin panel.
            </li>
            <li>
              <span className="font-medium text-leaf-deep">Local storage</span> — remembers your
              cart, your cookie preference, and a few UI choices. This never leaves
              your device and is never sent to advertising networks.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-medium text-leaf-deep">What we don&apos;t do</h2>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            <li>No third-party advertising or tracking pixels.</li>
            <li>No selling or sharing of your personal data.</li>
            <li>No profiling, cross-site tracking, or behavioural ads.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-medium text-leaf-deep">Managing cookies</h2>
          <p className="leading-relaxed">
            You can accept or decline the non-essential local storage via the consent
            banner. The session cookie is essential and can always be cleared by
            signing out, or by clearing your browser&apos;s cookies. The banner choice
            is saved locally and can be reset at any time by clearing your site data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-medium text-leaf-deep">Questions</h2>
          <p className="leading-relaxed">
            This is a student project presented at Bal Vigyan, India. If you have any
            questions about privacy, reach out through the{" "}
            <a href="/contact" className="text-sprout underline underline-offset-2 hover:text-sprout-dark">
              contact page
            </a>.
          </p>
        </section>
      </div>
    </Container>
  );
}
