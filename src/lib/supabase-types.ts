import type { CartItem, Category, CustomerDetails, OrderStatus } from "./types";

/** Row shape of `ecobrew_users`. */
export interface UserRow {
  user_id: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  created_at: string;
}

/** Row shape of `ecobrew_orders`. */
export interface OrderRow {
  id: string;
  user_id: string | null;
  items: CartItem[];
  subtotal: number;
  customer: CustomerDetails;
  status: OrderStatus;
  delivery_date: string | null;
  created_at: string;
}

/** Row shape of `ecobrew_products`. */
export interface ProductRow {
  slug: string;
  name: string;
  category: Category;
  price: number;
  short_description: string;
  description: string;
  image: string;
  impact: string;
  in_stock: boolean;
  featured: boolean;
  related: unknown[];
  created_at: string;
}

/** Row shape of `ecobrew_contacts`. */
export interface ContactRow {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  message: string;
  reply: string;
  replied_at: string | null;
  created_at: string;
}
