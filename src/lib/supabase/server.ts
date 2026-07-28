/**
 * Server-side Supabase client — for use in Server Components and Route Handlers.
 * Reads/writes session cookies via next/headers.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseCredentials } from "./client";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseCredentials();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component context — cookies set via middleware refresh instead
        }
      },
    },
  });
}
