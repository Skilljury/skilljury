"use client";

import { useEffect } from "react";

import { trackBrowserEvent, type SkillJuryAnalyticsEventName } from "@/lib/analytics/events";

function readDatasetProperties(dataset: DOMStringMap) {
  return Object.entries(dataset).reduce<Record<string, string>>((properties, [key, value]) => {
    if (!value || key === "sjEvent") {
      return properties;
    }

    if (key.startsWith("sj")) {
      const propertyName = key.slice(2);
      const normalizedName = propertyName.charAt(0).toLowerCase() + propertyName.slice(1);
      properties[normalizedName] = value;
    }

    return properties;
  }, {});
}

function readFormProperties(form: HTMLFormElement) {
  const formData = new FormData(form);
  const properties: Record<string, string> = {};

  for (const key of ["q", "agent", "category", "source", "sort"]) {
    const value = formData.get(key);

    if (typeof value === "string" && value.trim()) {
      properties[key] = value.trim();
    }
  }

  return properties;
}

export function AnalyticsEventBridge() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const element = target.closest<HTMLElement>("[data-sj-event]");

      if (!element) {
        return;
      }

      trackBrowserEvent(element.dataset.sjEvent as SkillJuryAnalyticsEventName, {
        ...readDatasetProperties(element.dataset),
        href: element instanceof HTMLAnchorElement ? element.href : undefined,
      });
    }

    function handleSubmit(event: SubmitEvent) {
      const target = event.target;

      if (!(target instanceof HTMLFormElement) || !target.dataset.sjEvent) {
        return;
      }

      trackBrowserEvent(target.dataset.sjEvent as SkillJuryAnalyticsEventName, {
        ...readDatasetProperties(target.dataset),
        ...readFormProperties(target),
      });
    }

    window.addEventListener("click", handleClick);
    window.addEventListener("submit", handleSubmit);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("submit", handleSubmit);
    };
  }, []);

  return null;
}
