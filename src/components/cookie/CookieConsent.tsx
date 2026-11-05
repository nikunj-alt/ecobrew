"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type Consent = "accepted" | "declined" | null;

/**
 * Cookie consent banner. Does not set any tracking cookies — the site only
 * uses the server-side auth session cookie and local storage for the cart and
 * preferences. This banner records the visitor's explicit choice.
 */
export default function CookieConsent() {
  const [consent, setConsent] = useLocalStorage<Consent>(
    "ecobrew_cookie_consent",
    null,
  );

  const visible = consent === null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          role="dialog"
          aria-label="Cookie consent"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-moss/15 bg-white/95 p-5 shadow-natural backdrop-blur"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sprout/10 text-sprout-dark">
              <Cookie className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-leaf-deep">We use cookies</p>
              <p className="mt-1 text-sm leading-relaxed text-moss">
                EcoBrew uses a small, secure session cookie and local storage to
                keep you signed in, remember your cart, and save your
                preferences. We don&apos;t track you for ads.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <Link
              href="/cookie-policy"
              className="rounded-full px-4 py-2 text-sm font-medium text-moss transition-colors hover:bg-white/60"
            >
              Cookie policy
            </Link>
            <button
              type="button"
              onClick={() => setConsent("declined")}
              className="rounded-full border border-moss/30 px-4 py-2 text-sm font-medium text-moss transition-colors hover:border-moss"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => setConsent("accepted")}
              className="rounded-full bg-sprout px-5 py-2 text-sm font-medium text-leaf-deep transition-colors hover:bg-sprout-dark"
            >
              Accept
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
