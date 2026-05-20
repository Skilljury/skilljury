"use client";

import { useEffect } from "react";

import { trackBrowserEvent } from "@/lib/analytics/events";

type SkillDetailViewTrackerProps = {
  skillSlug: string;
  sourceName: string;
};

export function SkillDetailViewTracker({ skillSlug, sourceName }: SkillDetailViewTrackerProps) {
  useEffect(() => {
    trackBrowserEvent("skill_detail_viewed", {
      skill: skillSlug,
      source: sourceName,
    });
  }, [skillSlug, sourceName]);

  return null;
}
