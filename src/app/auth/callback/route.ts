/**
 * Auth callback route — exchanges the OAuth code for a session.
 * Supabase redirects here after email confirmation or OAuth sign-in.
 * After exchanging the code, syncs the user to public.users and
 * redirects to the dashboard.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    // No code present — redirect to login with an error
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error("[Auth callback] Code exchange failed:", error?.message);
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
  }

  // Sync user to public.users (idempotent — safe on every login)
  try {
    await fetch(`${API_URL}/api/users/sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
        "Content-Type": "application/json",
      },
    });
  } catch (syncErr) {
    // Non-fatal — the Supabase trigger handles first signup
    console.warn("[Auth callback] User sync warning:", syncErr);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
