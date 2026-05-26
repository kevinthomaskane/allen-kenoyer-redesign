"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, Phone } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Container } from "@/components/container";
import { cn } from "@/lib/utils";
import { headerNav, siteContact } from "@/lib/site-config";

// Sticky nav directly below the InfoBar. Desktop: logo + horizontal links
// (with click-to-toggle dropdowns) + phone CTA. Mobile: logo + phone CTA +
// hamburger that opens a Sheet with a nested accordion.
//
// Older-audience considerations:
//   - Dropdowns are click-to-toggle, not hover (avoids accidental hover triggers).
//   - Tap/click targets are 44px+ vertically.
//   - Active dropdown is explicit (chevron rotates, panel visible).
//   - Mobile accordion expands in place (no further sliding chrome).
//   - Phone CTA mirrors the InfoBar so the most-important action is always reachable.
export function SiteNav() {
  return (
    <nav className="bg-cream/95 border-b border-black/5 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 md:h-20">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="Allen Kenoyer Glass — home"
          >
            <Image
              src="/logo-allen-kenoyer-glass.png"
              alt=""
              width={549}
              height={207}
              className="h-10 w-auto md:h-12"
              priority
            />
          </Link>

          <DesktopLinks />

          <div className="flex items-center gap-2">
            <a
              href={siteContact.phoneHref}
              className="bg-primary text-primary-foreground hover:bg-primary-light hidden items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors md:inline-flex"
            >
              <Phone className="size-4" aria-hidden />
              <span>{siteContact.phone}</span>
            </a>
            <MobileMenu />
          </div>
        </div>
      </Container>
    </nav>
  );
}

function DesktopLinks() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape.
  useEffect(() => {
    if (openIndex === null) return;
    function onDocPointer(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpenIndex(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIndex(null);
    }
    document.addEventListener("pointerdown", onDocPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDocPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [openIndex]);

  return (
    <div
      ref={containerRef}
      className="hidden items-center gap-1 md:flex"
      role="menubar"
    >
      {headerNav.map((item, i) => {
        if ("href" in item) {
          return (
            <Link
              key={item.label}
              href={item.href}
              className="hover:text-primary px-3 py-2 text-base font-medium transition-colors"
              role="menuitem"
            >
              {item.label}
            </Link>
          );
        }
        const isOpen = openIndex === i;
        return (
          <div key={item.label} className="relative">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-haspopup="menu"
              className="hover:text-primary flex items-center gap-1 px-3 py-2 text-base font-medium transition-colors"
            >
              {item.label}
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  isOpen && "rotate-180",
                )}
                aria-hidden
              />
            </button>
            {isOpen && (
              <div
                role="menu"
                className="bg-card absolute top-full left-0 z-50 mt-1 min-w-56 rounded-md border border-black/5 py-2 shadow-lg"
              >
                {item.children.map((child) => (
                  <Link
                    key={child.label}
                    href={child.href}
                    role="menuitem"
                    onClick={() => setOpenIndex(null)}
                    className="hover:bg-muted hover:text-primary block px-4 py-2.5 text-base transition-colors"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="hover:bg-muted inline-flex size-11 items-center justify-center rounded-md md:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-6" aria-hidden />
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-80">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4 pb-6">
          {headerNav.map((item) =>
            "href" in item ? (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="hover:bg-muted hover:text-primary rounded-md px-4 py-3 text-lg font-medium transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <MobileGroup
                key={item.label}
                label={item.label}
                children_={item.children}
                onLinkClick={() => setOpen(false)}
              />
            ),
          )}
          <a
            href={siteContact.phoneHref}
            className="bg-primary text-primary-foreground hover:bg-primary-light mt-4 flex items-center justify-center gap-2 rounded-md px-4 py-3 text-lg font-medium transition-colors"
          >
            <Phone className="size-5" aria-hidden />
            {siteContact.phone}
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function MobileGroup({
  label,
  children_,
  onLinkClick,
}: {
  label: string;
  children_: { label: string; href: string }[];
  onLinkClick: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="hover:bg-muted hover:text-primary flex w-full items-center justify-between rounded-md px-4 py-3 text-lg font-medium transition-colors"
      >
        {label}
        <ChevronDown
          className={cn("size-5 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open && (
        <div className="ml-4 flex flex-col gap-1 border-l border-black/10 py-1 pl-2">
          {children_.map((child) => (
            <Link
              key={child.label}
              href={child.href}
              onClick={onLinkClick}
              className="hover:bg-muted hover:text-primary rounded-md px-4 py-2.5 text-base transition-colors"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
