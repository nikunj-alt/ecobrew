import type { CartItem, CustomerDetails, Order } from "../types";

/**
 * Order-building is isolated here so a real payment gateway / database can
 * slot in later without touching the UI. `placeOrder` persists through the
 * server-side /api/checkout route (which authenticates the caller via the
 * httpOnly session cookie), so no client-side code talks to the orders table.
 */

export function buildOrderFromCart(
  items: CartItem[],
  customer: CustomerDetails,
  subtotal: number,
): Omit<Order, "id" | "createdAt"> {
  return {
    items,
    subtotal,
    customer,
    status: "pending",
    deliveryDate: null,
  };
}

export async function placeOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order> {
  // SIMULATED payment — no real charge. The order is recorded by the server.
  await new Promise((resolve) => setTimeout(resolve, 600));

  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: order.items,
      subtotal: order.subtotal,
      customer: order.customer,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { order?: Order; error?: string };
  if (!res.ok || !data.order) {
    throw new Error(data.error || "Could not place your order.");
  }
  return data.order;
}
