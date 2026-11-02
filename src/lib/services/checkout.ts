import type { CartItem, CustomerDetails, Order } from "../types";
import { cartSubtotal } from "../utils";
import { getLoggedInUser, saveOrderToSupabase } from "./auth";

/**
 * Order-building is isolated here so a real payment gateway / database can
 * slot in later without touching the UI. `placeOrder` currently simulates
 * a successful order and returns a generated order reference.
 *
 * Clear seam for future integration:
 *   - Swap `buildOrderFromCart` internals to read from a real cart/DB.
 *   - Replace `placeOrder` with a call to a payment gateway or API route.
 */

let orderCounter = 0;

export function buildOrderFromCart(
  items: CartItem[],
  customer: CustomerDetails,
): Omit<Order, "id" | "createdAt"> {
  return {
    items,
    subtotal: cartSubtotal(items),
    customer,
  };
}

export function generateOrderId(): string {
  orderCounter += 1;
  const ts = Date.now().toString(36).toUpperCase();
  return `ECB-${ts}-${orderCounter}`;
}

export async function placeOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order> {
  // SIMULATED: a real implementation would call a payment gateway and persist
  // the order to a database here. No real charge is made.
  await new Promise((resolve) => setTimeout(resolve, 600));

  const user = getLoggedInUser();
  const finalOrder: Order = {
    ...order,
    userId: user?.userId,
    id: generateOrderId(),
    createdAt: new Date().toISOString(),
  };

  if (user) {
    await saveOrderToSupabase(finalOrder, user.userId);
  }

  return finalOrder;
}
