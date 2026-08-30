import { cookies } from "next/headers";
import { getServiceClient } from "./supabase";

const COOKIE_NAME = "admin_session";

export async function setAdminSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function getAdminSession(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function validateAdmin(
  email: string,
  password: string
): Promise<{ valid: boolean; userId?: string }> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, password_hash")
    .eq("email", email)
    .single();

  if (error || !data) return { valid: false };
  if (data.password_hash !== password) return { valid: false };

  return { valid: true, userId: data.id };
}
