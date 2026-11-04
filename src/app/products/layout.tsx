import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Products — EcoBrew",
  description: "Hand-shaped from reclaimed tea leaves — the full EcoBrew range, each piece made from spent chai leaves.",
  openGraph: {
    title: "Products — EcoBrew",
    description: "Browse the full EcoBrew range — pen stands, stationery, mini furniture, and decor, all made from spent chai leaves.",
  },
};

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
