// @supabase/ssr session refresh + /admin gating (ADR-0006). Called from the
// root middleware for `/admin/*` requests. Refreshes the auth cookies on every
// request and redirects unauthenticated visitors to /admin/login.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { shouldRedirectToLogin } from "@/lib/auth-routes";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run code between createServerClient and getClaims().
  // getClaims() verifies and refreshes the session; skipping it can randomly
  // log users out under SSR (per Supabase SSR guidance).
  const { data } = await supabase.auth.getClaims();
  const hasUser = Boolean(data?.claims);

  if (shouldRedirectToLogin(request.nextUrl.pathname, hasUser)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Must return supabaseResponse as-is so the refreshed auth cookies propagate.
  return supabaseResponse;
}
