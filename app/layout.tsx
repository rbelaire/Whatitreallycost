import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Outfit } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { activeSponsor } from "@/lib/queries";
import { SITE_NAME, siteUrl } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME} — real bills for AI-built apps`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "What people actually spent to build apps on Lovable, Bolt, Replit, Cursor, v0, Claude Code, Windsurf, and Base44. Credits, tokens, and dollars, with the source linked.",
  openGraph: {
    title: SITE_NAME,
    description: "Sticker prices show the plan. This shows the bill.",
    url: siteUrl(),
    siteName: SITE_NAME,
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sponsor = await activeSponsor();
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable} ${plex.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <SiteHeader sponsor={sponsor} />
        <div className="flex-1">{children}</div>
        <SiteFooter sponsor={sponsor} />
      </body>
    </html>
  );
}
