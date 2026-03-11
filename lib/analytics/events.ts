export type SkillJuryAnalyticsEventName =
  | "report_submitted"
  | "request_review_clicked"
  | "review_submitted"
  | "skill_submission_created";

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
