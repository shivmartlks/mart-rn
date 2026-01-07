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
