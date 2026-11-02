"use client";

import { useState } from "react";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/constants";
import { LeafIcon } from "@/components/icons";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const setField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = "Enter a valid email.";
    if (!form.message.trim()) errs.message = "Write a short message.";
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      // No backend: open the visitor's mail client with the message pre-filled.
      const subject = encodeURIComponent(`EcoBrew enquiry from ${form.name}`);
      const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      setSent(true);
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
          {sent && (
            <div className="rounded-xl border border-sprout/30 bg-sprout/10 p-4 text-sm text-leaf-deep">
              Thanks! Your email app should be opening with your message. If not,
              write to us directly at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-sprout-dark underline">
                {CONTACT_EMAIL}
              </a>.
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
              className={`rounded-xl border bg-white/60 px-4 py-3 text-sm text-leaf-deep placeholder:text-moss/50 focus:border-sprout focus:outline-2 focus:outline-sprout/40 ${
                errors.message ? "border-red-400" : "border-moss/25"
              }`}
            />
            {errors.message && <span className="text-xs text-red-500">{errors.message}</span>}
          </div>
          <Button type="submit">Send message</Button>
        </form>

        <aside className="space-y-5">
          <div className="rounded-2xl bg-white/50 p-6">
            <h3 className="font-display text-lg font-medium text-leaf-deep">The team</h3>
            <p className="mt-2 text-sm leading-relaxed text-moss">
              Students showcasing EcoBrew at Bal Vigyan. We're happy to talk about
              the science, the brand, and the next steps.
            </p>
          </div>
          <div className="rounded-2xl bg-leaf-deep p-6 text-oat">
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
    </Container>
  );
}
