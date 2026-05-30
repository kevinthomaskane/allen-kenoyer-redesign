import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renamed the `middleware` convention to `proxy` (file `proxy.ts`,
// export `proxy`). Same behavior; scoped to the admin surface below.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// The public site is anon-only and needs no session refresh. ADR-0006.
export const config = {
  matcher: ["/admin/:path*"],
};
