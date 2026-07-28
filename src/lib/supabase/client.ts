/**
 * Browser-side Supabase client — for use in Client Components.
 */
import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseCredentials() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const url =
    envUrl && envUrl !== "undefined" && envUrl !== "null" && envUrl.length > 5
      ? envUrl
      : "https://sbfbdzgrljvxhfjqkucx.supabase.co";

  const key =
    envKey && envKey !== "undefined" && envKey !== "null" && envKey.length > 10
      ? envKey
      : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiZmJkemdybGp2eGhmanFrdWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NzE2ODYsImV4cCI6MjEwMDQ0NzY4Nn0.hHQ_GdJhViWIZUjfgNSK1GNyaLJ-5WvEkyY8yFPQYfo";

  return { url, key };
}

export function createClient() {
  const { url, key } = getSupabaseCredentials();
  return createBrowserClient(url, key);
}
