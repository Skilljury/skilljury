export type SkillJuryAnalyticsEventName =
  | "agent_clicked"
  | "category_clicked"
  | "filter_applied"
  | "install_link_clicked"
  | "leaderboard_tab_clicked"
  | "login_clicked"
  | "outbound_github_clicked"
  | "outbound_source_clicked"
  | "report_submitted"
  | "request_review_clicked"
  | "review_submitted"
  | "search_performed"
  | "skill_card_clicked"
  | "skill_detail_viewed"
  | "skill_submission_created"
  | "sort_changed"
  | "submit_skill_clicked";

export type SkillJuryAnalyticsEvent = {
  event: SkillJuryAnalyticsEventName;
  properties: Record<string, unknown>;
  timestamp: string;
};

type GtagParameterValue = boolean | number | string;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: "config" | "event" | "js",
      target: Date | SkillJuryAnalyticsEventName | string,
      parameters?: Record<string, GtagParameterValue>,
    ) => void;
  }
}

function normalizeGtagParameters(
  properties: Record<string, unknown>,
): Record<string, GtagParameterValue> {
  return Object.entries(properties).reduce<Record<string, GtagParameterValue>>(
    (normalized, [key, value]) => {
      if (value === null || value === undefined) {
        return normalized;
      }

      if (
        typeof value === "boolean" ||
        typeof value === "number" ||
        typeof value === "string"
      ) {
        normalized[key] = value;
        return normalized;
      }

      if (value instanceof Date) {
        normalized[key] = value.toISOString();
        return normalized;
      }

      normalized[key] = JSON.stringify(value);
      return normalized;
    },
    {},
  );
}

export function buildAnalyticsEvent(
  event: SkillJuryAnalyticsEventName,
  properties: Record<string, unknown>,
): SkillJuryAnalyticsEvent {
  return {
    event,
    properties,
    timestamp: new Date().toISOString(),
  };
}

export function trackServerEvent(
  event: SkillJuryAnalyticsEventName,
  properties: Record<string, unknown>,
) {
  const payload = buildAnalyticsEvent(event, properties);

  if (process.env.NODE_ENV !== "production") {
    console.info(`[SkillJury analytics] ${payload.event}`, payload.properties);
  }

  return payload;
}

export function trackBrowserEvent(
  event: SkillJuryAnalyticsEventName,
  properties: Record<string, unknown>,
) {
  const payload = buildAnalyticsEvent(event, properties);

  if (typeof window !== "undefined") {
    const gtagParameters = normalizeGtagParameters(payload.properties);

    window.dispatchEvent(
      new CustomEvent("skilljury:analytics", {
        detail: payload,
      }),
    );

    if (typeof window.gtag === "function") {
      window.gtag("event", payload.event, gtagParameters);
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(`[SkillJury analytics] ${payload.event}`, payload.properties);
  }

  return payload;
}
