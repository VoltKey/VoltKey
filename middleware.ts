/**
 * Next.js Edge Middleware — session refresh + route protection.
 *
 * - Refreshes the Supabase session on every request (keeps tokens alive).
 * - Redirects unauthenticated users away from /dashboard/* to /auth/login.
 * - Redirects authenticated users away from /auth/* to /dashboard.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseCredentials } from "@/lib/supabase/client";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { url, key: anonKey } = getSupabaseCredentials();

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Guard dashboard routes
    if (!user && pathname.startsWith("/dashboard")) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from auth pages
    if (user && pathname.startsWith("/auth")) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      return NextResponse.redirect(dashboardUrl);
    }
  } catch (err) {
    console.warn("Supabase middleware error:", err);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Run on all paths except Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
