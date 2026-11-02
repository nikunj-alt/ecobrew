export type Category = "pen-stands" | "stationery" | "furniture" | "decor";

export interface Product {
  slug: string;
  name: string;
  category: Category;
  price: number; // in INR
  shortDescription: string;
  description: string;
  image: string; // path under /public/products
  impact?: string; // e.g. "≈ 40 cups of chaipatti per stand"
  inStock: boolean;
  featured?: boolean;
  related?: string[];
}

export interface CartItem {
  slug: string;
  qty: number;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus = "pending" | "approved" | "in_transit" | "delivered" | "cancelled";

export interface Order {
  id: string;
  userId?: string; // owning account's unique ID (when logged in)
  items: CartItem[];
  subtotal: number;
  customer: CustomerDetails;
  createdAt: string;
  status: OrderStatus; // lifecycle, managed from the admin panel
  deliveryDate?: string | null; // ISO date set by admin when approved/shipped
}

export interface ContactMessage {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  message: string;
  reply?: string;
  repliedAt?: string | null;
  createdAt: string;
}

export interface ProcessStep {
  n: number;
  title: string;
  body: string;
}
