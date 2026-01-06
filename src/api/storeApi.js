import { supabase } from "../services/supabase";

export async function fetchStoreSettings() {
  const { data, error } = await supabase
    .from("stores")
    .select("id, is_ordering_enabled")
    .limit(1)
    .single();

  if (error) throw error;
  return data;
}
