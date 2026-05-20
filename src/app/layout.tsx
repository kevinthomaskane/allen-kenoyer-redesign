import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Allen Kenoyer Glass",
  description: "Stained glass studio in Lawndale, California.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
