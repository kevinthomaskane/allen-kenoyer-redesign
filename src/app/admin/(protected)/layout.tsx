import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { signOut } from "../actions";

// Admin chrome for the authenticated surface. The middleware (proxy.ts) already
// gates /admin/*; this server-side getClaims check is defense-in-depth and
// supplies the signed-in email for the header.
export default async function AdminProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/admin/login");

  const email =
    typeof data.claims.email === "string" ? data.claims.email : null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <Container className="flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-serif text-lg font-semibold">
              AKG Admin
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/admin/classes"
                className="text-muted-foreground hover:text-foreground"
              >
                Classes
              </Link>
              <Link
                href="/admin/bulletins"
                className="text-muted-foreground hover:text-foreground"
              >
                Bulletins
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {email && (
              <span className="text-muted-foreground hidden text-sm sm:inline">
                {email}
              </span>
            )}
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </Container>
      </header>
      <main className="flex-1">
        <Container className="py-8">{children}</Container>
      </main>
    </div>
  );
}
