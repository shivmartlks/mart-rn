import { supabase } from "../services/supabase";
import { cacheGet, cacheSet, cacheClear } from "./cache";

export async function getProfile() {
  const cached = cacheGet("profile");
  if (cached) return cached;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  cacheSet("profile", data, 5 * 60 * 1000); // 5 min TTL
  return data;
}

export async function updateProfile(updates) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) throw error;
  cacheClear("profile");
  return true;
}
