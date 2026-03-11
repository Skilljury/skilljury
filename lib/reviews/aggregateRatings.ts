import "server-only";

import { isMissingRelationError, logDataAccessError } from "@/lib/db/errors";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export const REVIEW_SUBSCORE_FIELDS = [
  { key: "setupRating", column: "setup_rating", label: "Setup" },
  { key: "documentationRating", column: "documentation_rating", label: "Documentation" },
  { key: "outputQualityRating", column: "output_quality_rating", label: "Output quality" },
  { key: "reliabilityRating", column: "reliability_rating", label: "Reliability" },
  { key: "valueForEffortRating", column: "value_for_effort_rating", label: "Value for effort" },
] as const;

export type RecommendationChoice = "yes" | "no" | "with_caveats";

export type ReviewAggregationRow = {
  created_at?: string | null;
  documentation_rating?: number | null;
  moderation_status?: string;
  overall_rating: number;
  output_quality_rating?: number | null;
  published_at?: string | null;
  reliability_rating?: number | null;
  setup_rating?: number | null;
  value_for_effort_rating?: number | null;
  would_recommend: RecommendationChoice;
};

export type ReviewSubscoreSummary = {
  average: number | null;
  count: number;
  key: (typeof REVIEW_SUBSCORE_FIELDS)[number]["key"];
  label: string;
};

export type ReviewAggregateSummary = {
  approvedCount: number;
  confidenceAdjusted: number | null;
  distribution: Array<{
    count: number;
    percentage: number;
    rating: number;
  }>;
  lastApprovedReviewAt: string | null;
  overallAverage: number | null;
  recommendationBreakdown: {
    no: number;
    withCaveats: number;
    yes: number;
  };
  recommendationPercentage: number | null;
  subscores: ReviewSubscoreSummary[];
  totalCount: number;
};

function roundToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100;
}

function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return roundToTwoDecimals(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

async function getSiteWideBaselineRating() {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("skills")
    .select("overall_score, approved_review_count")
    .gt("approved_review_count", 0)
    .not("overall_score", "is", null)
    .limit(5000);

  if (error) {
    logDataAccessError("site-wide-baseline", error);

    if (isMissingRelationError(error.message)) {
      return 4;
    }

    throw error;
  }

  const rows = data ?? [];

  if (rows.length === 0) {
    return 4;
  }

  const totals = rows.reduce(
    (accumulator, row) => {
      const score = Number(row.overall_score ?? 0);
      const count = Number(row.approved_review_count ?? 0);

      return {
        weightedCount: accumulator.weightedCount + count,
        weightedScore: accumulator.weightedScore + score * count,
      };
    },
    { weightedScore: 0, weightedCount: 0 },
  );

  if (totals.weightedCount === 0) {
    return 4;
  }

  return roundToTwoDecimals(totals.weightedScore / totals.weightedCount);
}

export function calculateReviewAggregation(
  rows: ReviewAggregationRow[],
  siteWideBaseline = 4,
): ReviewAggregateSummary {
  const approvedRows = rows.filter((row) => row.moderation_status === "approved");
  const overallValues = approvedRows.map((row) => row.overall_rating);
  const overallAverage = average(overallValues);
  const priorWeight = 5;
  const confidenceAdjusted =
    overallAverage === null
      ? null
      : roundToTwoDecimals(
          (overallAverage * approvedRows.length + siteWideBaseline * priorWeight) /
            (approvedRows.length + priorWeight),
        );
  const distribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = approvedRows.filter((row) => row.overall_rating === rating).length;

    return {
      rating,
      count,
      percentage:
        approvedRows.length === 0
          ? 0
          : Math.round((count / approvedRows.length) * 100),
    };
  });
  const recommendationBreakdown = approvedRows.reduce(
    (accumulator, row) => {
      if (row.would_recommend === "yes") {
        accumulator.yes += 1;
      } else if (row.would_recommend === "with_caveats") {
        accumulator.withCaveats += 1;
      } else {
        accumulator.no += 1;
      }

      return accumulator;
    },
    { no: 0, withCaveats: 0, yes: 0 },
  );
  const recommendationPercentage =
    approvedRows.length === 0
      ? null
      : Math.round((recommendationBreakdown.yes / approvedRows.length) * 100);
  const lastApprovedReviewAt = approvedRows
    .map((row) => row.published_at ?? row.created_at ?? null)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) ?? null;
  const subscores = REVIEW_SUBSCORE_FIELDS.map((field) => {
    const values = approvedRows
      .map((row) => row[field.column] ?? null)
      .filter((value): value is number => typeof value === "number");

    return {
      key: field.key,
      label: field.label,
      count: values.length,
      average: average(values),
    };
  });

  return {
    approvedCount: approvedRows.length,
    confidenceAdjusted,
    distribution,
    lastApprovedReviewAt,
    overallAverage,
    recommendationBreakdown,
    recommendationPercentage,
    subscores,
    totalCount: rows.length,
  };
}

export async function recomputeSkillReviewStats(skillId: number) {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "overall_rating, would_recommend, setup_rating, documentation_rating, output_quality_rating, reliability_rating, value_for_effort_rating, moderation_status, published_at, created_at",
    )
    .eq("skill_id", skillId);

  if (error) {
    throw error;
  }

  const aggregation = calculateReviewAggregation(
    (data ?? []) as ReviewAggregationRow[],
    await getSiteWideBaselineRating(),
  );
  const { error: updateError } = await supabase
    .from("skills")
    .update({
      review_count: aggregation.totalCount,
      approved_review_count: aggregation.approvedCount,
      overall_score: aggregation.overallAverage,
      confidence_adjusted_score: aggregation.confidenceAdjusted,
    })
    .eq("id", skillId);

  if (updateError) {
    throw updateError;
  }

  return aggregation;
}
