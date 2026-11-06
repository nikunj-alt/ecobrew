import { NextResponse } from "next/server";
import { getAccountSession } from "@/lib/auth/account";
import { getSessionUser } from "@/lib/auth/session";
import { getSupabaseServer, isSupabaseServerConfigured } from "@/lib/services/supabase-server";

type ProfileFields = {
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

/** Load delivery profile fields for a user from the ecobrew_users row. */
async function getProfile(userId: string): Promise<Partial<ProfileFields>> {
  if (!isSupabaseServerConfigured() || !userId) return {};
  try {
    const { data } = await getSupabaseServer()
      .from("ecobrew_users")
      .select("phone,address,city,state,pincode")
      .eq("user_id", userId)
      .maybeSingle();
    if (!data) return {};
    return {
      phone: data.phone ?? "",
      address: data.address ?? "",
      city: data.city ?? "",
      state: data.state ?? "",
      pincode: data.pincode ?? "",
    };
  } catch {
    return {};
  }
}

/** Return whichever server-verified identity is present (account or Google). */
export async function GET() {
  const account = await getAccountSession();
  const google = await getSessionUser();

  if (account) {
    const profile = await getProfile(account.userId);
    return NextResponse.json({ user: { ...account, ...profile, provider: "account" } });
  }
  if (google) {
    const profile = await getProfile(google.userId);
    return NextResponse.json({
      user: {
        userId: google.userId,
        name: google.name,
        email: google.email,
        ...profile,
        provider: "google",
      },
    });
  }
  return NextResponse.json({ user: null });
}
