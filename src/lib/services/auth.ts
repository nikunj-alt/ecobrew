import { supabase, isSupabaseConfigured } from "../supabase";
import type { CustomerDetails } from "../types";

export interface UserAccount {
  userId: string;
  password?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

/** Normalize a user-chosen ID: lowercase, trimmed, restricted charset. */
export function normalizeUserId(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidUserId(id: string): boolean {
  return /^[a-z0-9_.-]{3,24}$/.test(id);
}

const LOCAL_USERS_KEY = "ecobrew_users_db";
const LOCAL_SESSION_KEY = "ecobrew_current_user";

function getLocalUsers(): Record<string, UserAccount> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalUsers(users: Record<string, UserAccount>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch {}
}

/** Check whether a user ID is already taken (Supabase first, local fallback). */
export async function checkUserIdExists(userId: string): Promise<boolean> {
  const cleanId = normalizeUserId(userId);
  if (!cleanId) return false;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase as any)
        .from("ecobrew_users")
        .select("user_id")
        .eq("user_id", cleanId)
        .maybeSingle();
      if (error) {
        console.warn("Supabase ID check error, falling back to local:", error.message);
      } else if (data) {
        return true;
      }
    } catch (e) {
      console.warn("Supabase ID check failed, falling back to local:", e);
    }
  }

  return Boolean(getLocalUsers()[cleanId]);
}

export async function registerUser(account: UserAccount): Promise<{ success: boolean; error?: string }> {
  const cleanId = normalizeUserId(account.userId);
  if (!isValidUserId(cleanId)) {
    return { success: false, error: "User ID must be 3–24 chars: lowercase letters, numbers, _ . - only." };
  }
  if (!account.password || account.password.length < 4) {
    return { success: false, error: "Password must be at least 4 characters." };
  }

  // Uniqueness is enforced at the DB level (PRIMARY KEY on user_id) AND checked here.
  if (await checkUserIdExists(cleanId)) {
    return { success: false, error: `User ID "${cleanId}" is already taken. Every user must have a unique ID.` };
  }

  // 1. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { error: insertError } = await (supabase as any).from("ecobrew_users").insert([
        {
          user_id: cleanId,
          password: account.password, // demo only — Supabase Auth or a hashed column should be used in production
          name: account.name,
          email: account.email,
          phone: account.phone,
          address: account.address,
          city: account.city,
          state: account.state,
          pincode: account.pincode,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        // Postgres unique_violation (23505) means the ID was taken between check and insert
        if (insertError.code === "23505") {
          return { success: false, error: `User ID "${cleanId}" is already taken. Every user must have a unique ID.` };
        }
        console.warn("Supabase insert user error, falling back to local:", insertError.message);
      } else {
        const stored: UserAccount = { ...account, userId: cleanId };
        setLoggedInUser(stored);
        return { success: true };
      }
    } catch (e) {
      console.warn("Supabase register error, falling back to local:", e);
    }
  }

  // 2. Local fallback storage ensuring unique ID
  const users = getLocalUsers();
  if (users[cleanId]) {
    return { success: false, error: `User ID "${cleanId}" is already taken. Every user must have a unique ID.` };
  }

  users[cleanId] = { ...account, userId: cleanId };
  saveLocalUsers(users);
  setLoggedInUser(users[cleanId]);
  return { success: true };
}

export async function loginUser(userId: string, password: string): Promise<{ success: boolean; error?: string; user?: UserAccount }> {
  const cleanId = normalizeUserId(userId);
  if (!cleanId || !password) {
    return { success: false, error: "Please enter both User ID and Password." };
  }

  // 1. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase as any)
        .from("ecobrew_users")
        .select("*")
        .eq("user_id", cleanId)
        .maybeSingle();

      if (data) {
        if (data.password === password) {
          const userAccount: UserAccount = {
            userId: data.user_id,
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            pincode: data.pincode || "",
          };
          setLoggedInUser(userAccount);
          return { success: true, user: userAccount };
        } else {
          return { success: false, error: "Incorrect password for this User ID." };
        }
      }
      if (error) {
        console.warn("Supabase login error, checking local fallback:", error.message);
      }
    } catch (e) {
      console.warn("Supabase login error, checking local fallback:", e);
    }
  }

  // 2. Local fallback storage
  const users = getLocalUsers();
  const user = users[cleanId];
  if (!user) {
    return { success: false, error: `User ID "${cleanId}" not found. Please register an account first.` };
  }
  if (user.password !== password) {
    return { success: false, error: "Incorrect password for this User ID." };
  }

  setLoggedInUser(user);
  return { success: true, user };
}

export function getLoggedInUser(): UserAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LOCAL_SESSION_KEY) || localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLoggedInUser(user: UserAccount | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      sessionStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(LOCAL_SESSION_KEY);
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  } catch {}
}

export async function saveOrderToSupabase(order: any, userId: string) {
  if (!isSupabaseConfigured()) return;
  try {
    await (supabase as any).from("ecobrew_orders").insert([
      {
        id: order.id,
        user_id: userId,
        items: order.items,
        subtotal: order.subtotal,
        customer: order.customer,
        created_at: order.createdAt,
        status: order.status ?? "pending",
        delivery_date: order.deliveryDate ?? null,
      },
    ]);
  } catch (e) {
    console.warn("Failed to persist order to Supabase:", e);
  }
}

/** Initiate Google Sign-In via Supabase Auth */
export async function signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured. Google Sign-In requires Supabase connection." };
  }
  try {
    const { error } = await (supabase as any).auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Google Sign-In failed." };
  }
}

/** Check Supabase Auth session and sync user account */
export async function syncSupabaseAuthUser(): Promise<UserAccount | null> {
  if (!isSupabaseConfigured()) return getLoggedInUser();
  try {
    const { data: { session }, error } = await (supabase as any).auth.getSession();
    if (error || !session?.user) return getLoggedInUser();

    const authUser = session.user;
    const email = authUser.email || "";
    const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || email.split("@")[0] || "google_user";
    const cleanId = normalizeUserId(name.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase());

    const { data: existing } = await (supabase as any)
      .from("ecobrew_users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      const userAccount: UserAccount = {
        userId: existing.user_id,
        name: existing.name || name,
        email: existing.email || email,
        phone: existing.phone || "",
        address: existing.address || "",
        city: existing.city || "",
        state: existing.state || "",
        pincode: existing.pincode || "",
      };
      setLoggedInUser(userAccount);
      return userAccount;
    } else {
      const newAccount: UserAccount = {
        userId: cleanId.length >= 3 ? cleanId : `user_${Math.random().toString(36).substring(2, 8)}`,
        name,
        email,
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      };
      await (supabase as any).from("ecobrew_users").upsert([
        {
          user_id: newAccount.userId,
          password: "oauth_google_secure",
          name: newAccount.name,
          email: newAccount.email,
          created_at: new Date().toISOString(),
        },
      ]);
      setLoggedInUser(newAccount);
      return newAccount;
    }
  } catch (e) {
    console.warn("Error syncing Supabase Auth user:", e);
    return getLoggedInUser();
  }
}
