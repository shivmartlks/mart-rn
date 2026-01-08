import { supabase } from "../services/supabase";

export async function fetchStoreSettings() {
  // Select only structural/store metadata fields. Dynamic settings live in store_settings.
  const { data, error } = await supabase
    .from("stores")
    .select(
      "id, name, address, latitude, longitude, open_time, close_time, is_active"
    )
    .limit(1)
    .single();

  if (error) throw error;
  return data;
}

// New: fetch active home banners (limited to 4, ordered by position ascending)
export async function fetchHomeBanners() {
  const baseQuery = supabase
    .from("home_banners")
    .select("id, image_url, link_type, link_value")
    .eq("is_active", true);

  // Try ordered by position first
  let { data, error } = await baseQuery
    .order("position", { ascending: true })
    .limit(4);
  if (error) {
    // Fallback: fetch without order in case 'position' column is absent
    const res = await baseQuery.limit(4);
    if (res.error) throw res.error;
    return res.data || [];
  }
  return data || [];
}
