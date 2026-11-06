import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Bricolage_Grotesque, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { ProductCatalogProvider } from "@/components/product/ProductCatalogProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import CookieConsent from "@/components/cookie/CookieConsent";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

import { AppSettingsProvider } from "@/context/AppSettingsContext";

export const metadata: Metadata = {
  title: "EcoBrew — Spent tea leaves make useful things",
  description:
    "EcoBrew is an independent brand that upcycles waste tea leaves into pen stands, stationery, mini furniture, and decor. Circular home & desk goods, made in India.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AppSettingsProvider>
          <AuthProvider>
            <ProductCatalogProvider>
              <CartProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <CartDrawer />
                <CookieConsent />
              </CartProvider>
            </ProductCatalogProvider>
          </AuthProvider>
        </AppSettingsProvider>
      </body>
    </html>
  );
}
