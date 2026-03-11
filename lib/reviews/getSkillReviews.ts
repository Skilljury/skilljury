import "server-only";

import {
  calculateReviewAggregation,
  type ReviewAggregateSummary,
} from "@/lib/reviews/aggregateRatings";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { isMissingRelationError, logDataAccessError } from "@/lib/db/errors";

export type ReviewListItem = {
  body: string | null;
  cons: string;
  createdAt: string;
  documentationRating: number | null;
  experienceLevel: string | null;
  helpfulVotesCount: number;
  id: number;
  overallRating: number;
  outputQualityRating: number | null;
  proofOfUseType: string | null;
  proofOfUseUrl: string | null;
  pros: string;
  publishedAt: string | null;
  reliabilityRating: number | null;
  reviewTitle: string | null;
  setupRating: number | null;
  user: {
    avatarUrl: string | null;
    displayName: string | null;
    githubUsername: string | null;
    isGithubLinked: boolean;
    username: string | null;
  } | null;
  useCase: string | null;
  valueForEffortRating: number | null;
  wouldRecommend: "yes" | "no" | "with_caveats";
};

export type ReviewSort = "helpful" | "highest" | "lowest" | "newest";

export type SkillReviewBundle = {
  items: ReviewListItem[];
  page: number;
  pageSize: number;
  summary: ReviewAggregateSummary;
  totalPages: number;
  viewerReview: ReviewListItem | null;
};

type ReviewQueryRow = {
  cons: string;
  created_at: string;
  documentation_rating: number | null;
  experience_level: string | null;
  id: number;
  moderation_status: "approved" | "pending" | "rejected" | "escalated";
  overall_rating: number;
  output_quality_rating: number | null;
  proof_of_use_type: string | null;
  proof_of_use_url: string | null;
  pros: string;
  published_at: string | null;
  reliability_rating: number | null;
  review_body: string | null;
  review_title: string | null;
  review_votes:
    | Array<{
        vote_type: string;
      }>
    | null;
  setup_rating: number | null;
  use_case: string | null;
  user_profiles:
    | {
        avatar_url: string | null;
        display_name: string | null;
        github_username: string | null;
        is_github_linked: boolean;
        username: string | null;
      }
    | {
        avatar_url: string | null;
        display_name: string | null;
        github_username: string | null;
        is_github_linked: boolean;
        username: string | null;
      }[]
    | null;
  value_for_effort_rating: number | null;
  would_recommend: "yes" | "no" | "with_caveats";
};

function coerceObject<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeReviewRow(row: ReviewQueryRow): ReviewListItem {
  const user = coerceObject(row.user_profiles);
  const helpfulVotesCount =
    row.review_votes?.filter((vote) => vote.vote_type === "helpful").length ?? 0;

  return {
    id: row.id,
    reviewTitle: row.review_title ?? null,
    body: row.review_body ?? null,
    overallRating: row.overall_rating,
    setupRating: row.setup_rating ?? null,
    documentationRating: row.documentation_rating ?? null,
    outputQualityRating: row.output_quality_rating ?? null,
    reliabilityRating: row.reliability_rating ?? null,
    valueForEffortRating: row.value_for_effort_rating ?? null,
    useCase: row.use_case ?? null,
    experienceLevel: row.experience_level ?? null,
    wouldRecommend: row.would_recommend,
    pros: row.pros,
    cons: row.cons,
    proofOfUseType: row.proof_of_use_type ?? null,
    proofOfUseUrl: row.proof_of_use_url ?? null,
    publishedAt: row.published_at ?? null,
    createdAt: row.created_at,
    helpfulVotesCount,
    user: user
      ? {
          avatarUrl: user.avatar_url ?? null,
          displayName: user.display_name ?? null,
          githubUsername: user.github_username ?? null,
          isGithubLinked: user.is_github_linked,
          username: user.username ?? null,
        }
      : null,
  };
}

function sortReviews(items: ReviewListItem[], sort: ReviewSort) {
  const copy = [...items];

  switch (sort) {
    case "highest":
      return copy.sort(
        (a, b) =>
          b.overallRating - a.overallRating ||
          b.helpfulVotesCount - a.helpfulVotesCount,
      );
    case "lowest":
      return copy.sort(
        (a, b) =>
          a.overallRating - b.overallRating ||
          b.helpfulVotesCount - a.helpfulVotesCount,
      );
    case "newest":
      return copy.sort((a, b) => {
        const aDate = a.publishedAt ?? a.createdAt;
        const bDate = b.publishedAt ?? b.createdAt;
        return bDate.localeCompare(aDate);
      });
    case "helpful":
    default:
      return copy.sort((a, b) => {
        if (b.helpfulVotesCount !== a.helpfulVotesCount) {
          return b.helpfulVotesCount - a.helpfulVotesCount;
        }

        return (b.publishedAt ?? b.createdAt).localeCompare(
          a.publishedAt ?? a.createdAt,
        );
      });
  }
}

export async function getSkillReviews({
  page = 1,
  pageSize = 6,
  skillId,
  sort = "helpful",
  viewerUserId,
}: {
  page?: number;
  pageSize?: number;
  skillId: number;
  sort?: ReviewSort;
  viewerUserId?: string | null;
}): Promise<SkillReviewBundle> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, review_title, review_body, overall_rating, setup_rating, documentation_rating, output_quality_rating, reliability_rating, value_for_effort_rating, use_case, experience_level, would_recommend, pros, cons, proof_of_use_type, proof_of_use_url, moderation_status, published_at, created_at, user_profiles(username, display_name, avatar_url, github_username, is_github_linked), review_votes(vote_type)",
    )
    .eq("skill_id", skillId)
    .eq("moderation_status", "approved");

  if (error) {
    logDataAccessError("skill-reviews", error);

    if (isMissingRelationError(error.message)) {
      return {
        items: [],
        page: 1,
        pageSize,
        summary: calculateReviewAggregation([], 4),
        totalPages: 1,
        viewerReview: null,
      };
    }

    throw error;
  }

  let viewerReview: ReviewListItem | null = null;

  if (viewerUserId) {
    const { data: viewerReviewData, error: viewerReviewError } = await supabase
      .from("reviews")
      .select(
        "id, review_title, review_body, overall_rating, setup_rating, documentation_rating, output_quality_rating, reliability_rating, value_for_effort_rating, use_case, experience_level, would_recommend, pros, cons, proof_of_use_type, proof_of_use_url, moderation_status, published_at, created_at, user_profiles(username, display_name, avatar_url, github_username, is_github_linked), review_votes(vote_type)",
      )
      .eq("skill_id", skillId)
      .eq("user_id", viewerUserId)
      .maybeSingle();

    if (viewerReviewError && !isMissingRelationError(viewerReviewError.message)) {
      throw viewerReviewError;
    }

    if (viewerReviewData) {
      viewerReview = normalizeReviewRow(viewerReviewData as ReviewQueryRow);
    }
  }

  const normalized = (data ?? []).map((row) =>
    normalizeReviewRow(row as ReviewQueryRow),
  );
  const sorted = sortReviews(normalized, sort);
  const offset = (Math.max(page, 1) - 1) * pageSize;
  const paginated = sorted.slice(offset, offset + pageSize);

  return {
    items: paginated,
    page: Math.max(page, 1),
    pageSize,
    summary: calculateReviewAggregation((data ?? []) as ReviewQueryRow[]),
    totalPages: Math.max(1, Math.ceil(sorted.length / pageSize)),
    viewerReview,
  };
}
