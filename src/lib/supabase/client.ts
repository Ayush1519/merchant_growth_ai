import { createClient } from "@supabase/supabase-js";

// Read environment variables (supports standard Vite env injection)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("placeholder") &&
  supabaseUrl.startsWith("http")
);

if (!isSupabaseConfigured) {
  console.info(
    "%c[Merchant Growth AI] Supabase credentials not detected in environment variables. Falling back to secure persistent offline store & Demo Mode. To connect your live Supabase database, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.",
    "color: #14b8a6; font-weight: bold;"
  );
}

// Create real Supabase client (or dummy URL if unconfigured to prevent initialization crash)
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : "https://placeholder.supabase.co",
  isSupabaseConfigured ? supabaseAnonKey : "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
