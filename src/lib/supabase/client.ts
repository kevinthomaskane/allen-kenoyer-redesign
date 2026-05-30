// Browser-side Supabase client for Client Components and direct browser writes
// (e.g. the admin image upload in task 03). Uses the publishable key, which is
// safe to ship to the browser. Per ADR-0005 (supabase-js + @supabase/ssr).
import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
