import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Newsreader } from "next/font/google";

import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { rootMetadata } from "@/lib/seo/metadata";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = rootMetadata;
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f1114",
};
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="en">
      <head>{gaMeasurementId ? <GoogleAnalytics measurementId={gaMeasurementId} /> : null}</head>
      <body
        className={`${manrope.variable} ${newsreader.variable} ${jetbrainsMono.variable} bg-background text-foreground antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <a
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
            href="#main-content"
          >
            Skip to main content
          </a>
          <SiteHeader />
          <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12" id="main-content">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
