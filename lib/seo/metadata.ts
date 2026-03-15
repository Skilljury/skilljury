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
];
const defaultDescription =
  "SkillJury is a live directory of AI agent skills with reviews, install context, source repositories, and compatibility pages.";

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
          alt: `${siteName} social card`,
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
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      shortcut: ["/icon.svg"],
    },
  };
}

export const rootMetadata = buildPageMetadata({
  title: "SkillJury | AI agent skill reviews, ratings, and discovery",
  description:
    "Browse AI agent skill reviews, install commands, source repositories, and compatibility pages across the live SkillJury directory.",
  pathname: "/",
});
