/**
 * Browser-side Supabase client — for use in Client Components.
 */
import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://sbfbdzgrljvxhfjqkucx.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiZmJkemdybGp2eGhmanFrdWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NzE2ODYsImV4cCI6MjEwMDQ0NzY4Nn0.hHQ_GdJhViWIZUjfgNSK1GNyaLJ-5WvEkyY8yFPQYfo";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  return createBrowserClient(url, key);
}
