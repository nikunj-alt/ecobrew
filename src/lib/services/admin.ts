import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../supabase";
import type { ContactMessage, Order, OrderStatus } from "../types";
import type { ContactRow, OrderRow } from "../supabase-types";

const db = supabase as SupabaseClient;

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal ?? 0),
    customer: row.customer ?? ({} as Order["customer"]),
    createdAt: row.created_at,
    status: (row.status as OrderStatus) || "pending",
    deliveryDate: row.delivery_date ?? null,
  };
}

function mapContact(row: ContactRow): ContactMessage {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name || "",
    email: row.email || "",
    message: row.message || "",
    reply: row.reply || "",
    repliedAt: row.replied_at ?? null,
    createdAt: row.created_at,
  };
}

export async function fetchOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await db
      .from("ecobrew_orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("fetchOrders error:", error.message);
      return [];
    }
    return (data || []).map(mapOrder);
  } catch (e) {
    console.warn("fetchOrders failed:", e);
    return [];
  }
}

export async function fetchOrdersForUser(userId: string): Promise<Order[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await db
      .from("ecobrew_orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data || []).map(mapOrder);
  } catch {
    return [];
  }
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: "Supabase not configured." };
  try {
    const { error } = await db.from("ecobrew_orders").update({ status }).eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function setOrderDeliveryDate(
  id: string,
  date: string | null,
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: "Supabase not configured." };
  try {
    const { error } = await db
      .from("ecobrew_orders")
      .update({ delivery_date: date, status: date ? "in_transit" : "approved" })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function fetchContactsForUser(userId: string): Promise<ContactMessage[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await db
      .from("ecobrew_contacts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data || []).map(mapContact);
  } catch {
    return [];
  }
}

export async function fetchContacts(): Promise<ContactMessage[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await db
      .from("ecobrew_contacts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data || []).map(mapContact);
  } catch {
    return [];
  }
}

export async function submitContact(input: {
  userId?: string | null;
  name: string;
  email: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: "Supabase is not configured." };
  try {
    const { error } = await db.from("ecobrew_contacts").insert([
      {
        user_id: input.userId ?? null,
        name: input.name,
        email: input.email,
        message: input.message,
      },
    ]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function replyToContact(
  id: string,
  reply: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: "Supabase not configured." };
  try {
    const { error } = await db
      .from("ecobrew_contacts")
      .update({ reply, replied_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}
