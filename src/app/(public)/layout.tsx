import { InfoBar } from "@/components/info-bar";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

// Public marketing chrome — the sticky InfoBar + SiteNav header and the footer
// that wrap every public route. The (public) route group does not change URLs;
// it only scopes this layout to the marketing site so the admin can carry its
// own chrome (admin/(protected)/layout.tsx).
export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50">
        <InfoBar />
        <SiteNav />
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
