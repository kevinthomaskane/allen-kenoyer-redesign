// Server-side Supabase client for Server Components, Server Actions, and Route
// Handlers. Cookie-backed session via @supabase/ssr (ADR-0005/0006). The
// session refresh + `/admin/*` gating that consumes these cookies lands in
// task 02-auth-and-admin-shell; this factory is the shared foundation.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` is called from a Server Component, where cookies are
            // read-only. Safe to ignore — the middleware added in task
            // 02-auth-and-admin-shell refreshes the session on every request.
          }
        },
      },
    },
  );
}
