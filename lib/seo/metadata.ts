import type { Metadata } from "next";

import { getSiteUrl } from "@/lib/supabase/config";

const siteName = "SkillJury";
const defaultDescription =
  "SkillJury is the public review and discovery layer for AI agent skills.";

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
};

export function buildPageMetadata({
  title,
  description = defaultDescription,
  pathname,
  imagePath = "/opengraph-image",
}: PageMetadataOptions): Metadata {
  const canonical = buildCanonicalUrl(pathname);

  return {
    metadataBase: getMetadataBase(),
    title,
    description,
    alternates: {
      canonical,
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
  };
}

export const rootMetadata = buildPageMetadata({
  title: "SkillJury | AI agent skill reviews and discovery",
  description:
    "Browse live AI agent skill listings, inspect source repositories, and read structured user reviews on SkillJury.",
  pathname: "/",
});
