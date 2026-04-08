import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/supabase/config";
 
export const siteName = "SkillJury";
export const siteKeywords = [
  "AI agent skills",
  "agent skill reviews",
  "AI skill directory",
  "Claude Code skills",
  "Codex skills",
  "Cursor skills",
  "AI tool reviews",
  "developer workflow tools",
  "MCP skills",
  "AI coding assistant plugins",
  "Cline skills",
  "GitHub Copilot extensions",
  "AI agent marketplace",
  "coding agent tools",
];
const defaultDescription =
  "SkillJury is a live directory of AI agent skills for Claude Code, Cursor, Windsurf, Codex, and Cline with community reviews, install rankings, security audits, and compatibility data.";
function trimSlashes(pathname: string) {
  if (!pathname || pathname === "/") {
    return "";
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}
export function getMetadataBase() {
  return new URL(getSiteUrl());
}
export function buildCanonicalUrl(pathname: string) {
  return new URL(trimSlashes(pathname), getMetadataBase()).toString();
}
type PageMetadataOptions = {
  title: string;
  description?: string;
  pathname: string;
  imagePath?: string;
  indexable?: boolean;
};
export function buildPageMetadata({
  title,
  description = defaultDescription,
  pathname,
  imagePath = "/opengraph-image",
  indexable = true,
}: PageMetadataOptions): Metadata {
  const canonical = buildCanonicalUrl(pathname);
  return {
    metadataBase: getMetadataBase(),
    title,
    description,
    keywords: siteKeywords,
    verification: {
      other: {
        "msvalidate.01": "C27279987F6775A9CF3CF281E03D186A",
      },
    },
    alternates: {
      canonical,
    },
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName,
      images: [
        {
          url: imagePath,
          width: 1200,
          height: 630,
          alt: `${siteName} — AI agent skill reviews and install rankings`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imagePath],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      shortcut: ["/favicon.ico"],
      apple: [{ url: "/favicon.ico" }],
    },
  };
}
export const rootMetadata = buildPageMetadata({
  title: "SkillJury — AI Agent Skill Reviews, Ratings & Install Rankings",
  description:
    "SkillJury is a live directory of AI agent skills for Claude Code, Cursor, Windsurf, Codex, and Cline. Browse community reviews, weekly install rankings, security audit signals, and compatibility data across thousands of skills and hundreds of sources.",
  pathname: "/",
});
