import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/** Cliente de Supabase para Client Components (solo clave publicable). */
export function createClient() {
  const { url, publishableKey } = getSupabaseEnv();
  return createBrowserClient(url, publishableKey);
}
