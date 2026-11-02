import type { CartItem, OrderStatus } from "./types";

/** Tiny classnames joiner — filters falsy values and joins the rest. */
export function cn(...classes: Array<string | undefined | null | false>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  in_transit: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function formatShortDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** "in transit" ETA text for an active order. */
export function orderEta(order: { status: OrderStatus; deliveryDate?: string | null }): string {
  if (order.status === "delivered") return "Delivered";
  if (order.status === "cancelled") return "Cancelled";
  if (order.status === "in_transit") {
    return order.deliveryDate ? `ETA ${formatShortDate(order.deliveryDate)}` : "In transit";
  }
  return order.status === "approved" ? "Approved — shipping soon" : "Pending review";
}
