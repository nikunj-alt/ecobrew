export const SITE_NAME = "EcoBrew";
export const SITE_TAGLINE = "Spent tea leaves make useful things.";
export const CONTACT_EMAIL = "hello@ecobrew.in";
export const CONTACT_PHONE = "+91 98765 43210";

/** Fallback admin password; overridable via NEXT_PUBLIC_ADMIN_PASSWORD. */
export const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "SDPS1212";
export const ADMIN_SESSION_KEY = "ecobrew_admin_auth";

export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "Our Story" },
  { href: "/process", label: "Process" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact" },
];

export const HOME_STATS = [
  { value: "10,000+", label: "Cups of chaipatti rescued" },
  { value: "1,200+", label: "Products shaped" },
  { value: "0", label: "New materials added" },
  { value: "7", label: "Steps, leaf to product" },
];
