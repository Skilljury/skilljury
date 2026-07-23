import type { Metadata } from "next";

import { getSiteUrl } from "@/lib/supabase/config";
import { buildSeoTitle, normalizeMetadataTitle } from "@/lib/seo/titleTemplates";

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
  "SkillJury is a read-only recovery catalog for AI agent skills, with 25 fully browsable verified records from an aggregate snapshot covering 4,274 skills and 784 sources.";

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
  const normalizedTitle = normalizeMetadataTitle(title);

  return {
    metadataBase: getMetadataBase(),
    title: normalizedTitle,
    description,
    keywords: siteKeywords,
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
      title: normalizedTitle,
      description,
      url: canonical,
      siteName,
      images: [
        {
          url: imagePath,
          width: 1200,
          height: 630,
          alt: `${siteName} - verified AI agent skill recovery catalog`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: normalizedTitle,
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
  title: buildSeoTitle("AI agent skill recovery catalog and rankings"),
  description:
    "SkillJury is a read-only recovery catalog for AI agent skills. Explore 25 fully browsable verified records from an aggregate snapshot covering 4,274 skills and 784 sources while live reviews, sign-in, submissions, and sync are temporarily unavailable.",
  pathname: "/",
});
