"use client";

import { useState, useEffect } from "react";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AccountModal from "@/components/auth/AccountModal";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";
import { LeafIcon } from "@/components/icons";

export default function ContactPage() {
  const { user, refresh } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // Prefill from the logged-in account.
  useEffect(() => {
    if (!user) return;
    Promise.resolve().then(() => {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
      }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  const setField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = "Enter a valid email.";
    if (!form.message.trim()) errs.message = "Write a short message.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Reply surface is attached to an account; ask to log in first.
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    setStatus("sending");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
    if (res.ok && data.ok) {
      setStatus("sent");
      setForm((prev) => ({ ...prev, message: "" }));
    } else {
      setStatus("error");
    }
  };

  return (
    <Container className="max-w-3xl py-16 sm:py-24">
      <SectionHeading
        tag="Get in touch"
        title="Talk to the team"
        subtitle="Questions about the project, the process, or the products? Drop us a line."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_280px]">
        <form onSubmit={handleSubmit} className="space-y-5">
          {status === "sent" && (
            <div className="rounded-xl border border-sprout/30 bg-sprout/10 p-4 text-sm text-leaf-deep">
              Thanks {user?.name || form.name}! Your message has been sent to the team.
              You&apos;ll see our reply in{" "}
              <a href="/my-orders" className="font-medium text-sprout-dark underline">My Orders → Inquiries</a>.
            </div>
          )}
          {status === "error" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              Something went wrong sending your message. Please try again.
            </div>
          )}
          <Input label="Your name" value={form.name} error={errors.name} onChange={(e) => setField("name", e.target.value)} />
          <Input label="Your email" type="email" value={form.email} error={errors.email} onChange={(e) => setField("email", e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-sm font-medium text-moss">Message</label>
            <textarea
              id="message"
              rows={5}
              value={form.message}
              onChange={(e) => setField("message", e.target.value)}
              placeholder="Tell us what you'd like to know…"
              className={`rounded-2xl border border-leaf-deep/15 bg-white/70 px-5 py-4 text-sm text-leaf-deep placeholder:text-moss/50 focus:border-tea focus:outline-2 focus:outline-tea/40 ${
                errors.message ? "border-red-400" : "border-moss/25"
              }`}
            />
            {errors.message && <span className="text-xs text-red-500">{errors.message}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send message"}
            </Button>
            {!user && (
              <span className="text-xs text-moss">
                You&apos;ll be asked to log in so you can see our reply.
              </span>
            )}
          </div>
        </form>

        <aside className="space-y-5">
          <div className="rounded-biophilic shadow-soft ring-1 ring-leaf-deep/8 bg-white/70 p-6">
            <h3 className="font-display text-lg font-medium text-leaf-deep">The team</h3>
            <p className="mt-2 text-sm leading-relaxed text-moss">
              Students showcasing EcoBrew at Bal Vigyan. We&apos;re happy to talk about
              the science, the brand, and the next steps.
            </p>
          </div>
          <div className="rounded-biophilic bg-leaf-deep p-6 text-oat shadow-natural">
            <LeafIcon className="h-6 w-6 text-sprout" />
            <h3 className="mt-3 font-display text-lg font-medium">Reach us</h3>
            <ul className="mt-3 space-y-2 text-sm text-oat/80">
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-oat">{CONTACT_EMAIL}</a>
              </li>
              <li>{CONTACT_PHONE}</li>
            </ul>
          </div>
        </aside>
      </div>

      <AccountModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          refresh();
        }}
      />
    </Container>
  );
}
