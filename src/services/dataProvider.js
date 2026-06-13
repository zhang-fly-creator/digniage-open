import { localStorageProvider } from "./providers/localStorageProvider";
import { supabaseProvider } from "./providers/supabaseProvider";
import { isSupabaseConfigured } from "../lib/supabaseClient";

export const REQUESTED_DATA_PROVIDER =
  import.meta.env.VITE_DATA_PROVIDER === "supabase" ? "supabase" : "localStorage";

export const DATA_PROVIDER =
  REQUESTED_DATA_PROVIDER === "supabase" && isSupabaseConfigured
    ? "supabase"
    : "localStorage";

export const dataProvider =
  DATA_PROVIDER === "supabase" ? supabaseProvider : localStorageProvider;

export function isUsingSupabaseProvider() {
  return DATA_PROVIDER === "supabase";
}

export function isSupabaseProviderRequested() {
  return REQUESTED_DATA_PROVIDER === "supabase";
}
