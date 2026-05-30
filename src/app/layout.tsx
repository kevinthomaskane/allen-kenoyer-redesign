import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Allen Kenoyer Glass",
    template: "%s | Allen Kenoyer Glass",
  },
  description:
    "Stained glass studio in Lawndale, California. Custom commissions, restoration, supplies, and classes.",
  metadataBase: new URL("https://allenkenoyerglass.com"),
};

// Bare root shell. Public marketing chrome lives in (public)/layout.tsx; the
// admin chrome lives in admin/(protected)/layout.tsx. Keeping the root layout
// free of either lets the two surfaces diverge cleanly.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${playfairDisplay.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
