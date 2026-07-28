import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseCredentials } from "@/lib/supabase/client";

export async function GET() {
  try {
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
