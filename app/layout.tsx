import type { Metadata, Viewport } from "next";
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { yearsExperience } from "@/lib/data";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  title: "Alwin Rivera — Front-End Developer",
  description: `Alwin Rivera is a Cebu-based front-end developer with ${yearsExperience}+ years building accessible, high-performance websites, reusable UI components and high-converting landing pages.`,
  openGraph: {
    title: "Alwin Rivera — Front-End Developer",
    description: "Enterprise-grade front-end engineering, with an edge.",
    type: "website",
    url: "/",
    siteName: "Alwin Rivera",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#07080a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script adds the "js" class before React hydrates.
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Runs before first paint, so scroll-reveal hiding only applies when JS is available. */}
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add("js")` }} />
      </head>
      <body>
        {children}
        {/* Real-visitor Core Web Vitals, reported to Vercel's Speed Insights dashboard. */}
        <SpeedInsights />
      </body>
    </html>
  );
}
