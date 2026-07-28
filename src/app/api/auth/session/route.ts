import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const DEFAULT_SUPABASE_URL = "https://sbfbdzgrljvxhfjqkucx.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiZmJkemdybGp2eGhmanFrdWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NzE2ODYsImV4cCI6MjEwMDQ0NzY4Nn0.hHQ_GdJhViWIZUjfgNSK1GNyaLJ-5WvEkyY8yFPQYfo";

export async function GET() {
  try {
    const cookieStore = await cookies();
    let response = NextResponse.json({ success: true });

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
              cookieStore.set(name, value, options);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    let accessToken = session?.access_token;

    // Fallback 1: Check getUser()
    if (!accessToken) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        // Refresh session
        const { data: refreshed } = await supabase.auth.getSession();
        accessToken = refreshed.session?.access_token;
      }
    }

    // Fallback 2: Direct cookie parsing if token exists in cookieStore
    if (!accessToken) {
      const allCookies = cookieStore.getAll();
      for (const c of allCookies) {
        if (c.name.includes("-auth-token")) {
          try {
            const raw = c.value.startsWith("base64-")
              ? Buffer.from(c.value.replace("base64-", ""), "base64").toString("utf-8")
              : c.value;
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed[0]) {
              accessToken = parsed[0];
              break;
            } else if (parsed?.access_token) {
              accessToken = parsed.access_token;
              break;
            }
          } catch {
            // Ignore parse error
          }
        }
      }
    }

    if (!accessToken) {
      return NextResponse.json({ error: "No active session" }, { status: 401 });
    }

    return NextResponse.json({ access_token: accessToken });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
