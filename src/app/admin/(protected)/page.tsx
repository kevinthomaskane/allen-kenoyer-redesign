import type { Metadata } from "next";
import Link from "next/link";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard" };

// Plain navigation cards only — no activity feed, counts, or needs-attention
// prompts (ADR-0021 decision K).
const sections = [
  {
    href: "/admin/classes",
    title: "Classes",
    description: "Create and publish classes, cohorts, and sessions.",
  },
  {
    href: "/admin/bulletins",
    title: "Bulletins",
    description: "Post and schedule homepage announcements.",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="font-serif text-2xl font-semibold">Studio dashboard</h1>
        <p className="text-muted-foreground">
          Manage the two kinds of content on the site.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="block">
            <Card className="hover:border-primary h-full transition-colors">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
