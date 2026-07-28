import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseCredentials } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    let response = NextResponse.json({ success: true });

    const { url, key } = getSupabaseCredentials();

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
              response.cookies.set(name, value, opts);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
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

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
