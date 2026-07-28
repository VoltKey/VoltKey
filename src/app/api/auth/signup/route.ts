import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const DEFAULT_SUPABASE_URL = "https://sbfbdzgrljvxhfjqkucx.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiZmJkemdybGp2eGhmanFrdWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NzE2ODYsImV4cCI6MjEwMDQ0NzY4Nn0.hHQ_GdJhViWIZUjfgNSK1GNyaLJ-5WvEkyY8yFPQYfo";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

    const supabase = createServerClient(
      url,
      key,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              const opts = { ...options, maxAge: 30 * 24 * 60 * 60 };
              cookieStore.set(name, value, opts);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Sync user to public.users table (idempotent)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    try {
      await fetch(`${apiUrl}/api/users/sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data.session?.access_token}`,
          "Content-Type": "application/json",
        },
      });
    } catch {
      // Non-fatal — the auth callback or next login will retry
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
