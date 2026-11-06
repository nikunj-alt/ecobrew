export const SITE_NAME = "EcoBrew";
export const SITE_TAGLINE = "Spent tea leaves make useful things.";
export const CONTACT_EMAIL = "hello@ecobrew.in";
export const CONTACT_PHONE = "+91 98765 43210";

export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Market" },
  { href: "/guides", label: "Guides" },
  { href: "/journal", label: "Journal" },
  { href: "/find-us", label: "Find Us" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Help" },
];

export const HOME_STATS = [
  { value: "10,000+", label: "Cups of chaipatti rescued" },
  { value: "1,200+", label: "Products shaped" },
  { value: "0", label: "New materials added" },
  { value: "7", label: "Steps, leaf to product" },
];
