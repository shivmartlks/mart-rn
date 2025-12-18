import "react-native-url-polyfill/auto";
import "react-native-get-random-values";
import { createClient } from "@supabase/supabase-js";

// IMPORTANT: replace with your real values
export const SUPABASE_URL = "https://enjimxeifkptjueqapyz.supabase.co";
const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuamlteGVpZmtwdGp1ZXFhcHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MTU0NDYsImV4cCI6MjA3NzM5MTQ0Nn0.KhS53cflSr2o1yZk9E_JU3pPj8XFtpUSaljevExyWzE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
