import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { isMissingRelationError, logDataAccessError } from "@/lib/db/errors";
import { normalizeUsername } from "@/lib/auth/username";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import {
  getAdminEmail,
  getPublicSupabaseConfig,
} from "@/lib/supabase/config";

export type ViewerProfile = {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  githubUsername: string | null;
  isGithubLinked: boolean;
  role: "user" | "moderator" | "admin";
  trustScore: number;
  badgeSummary: unknown[];
  accountStatus: "active" | "limited" | "suspended" | "banned";
  joinedAt: string;
  lastActiveAt: string | null;
};

export type Viewer = {
  adminEmail: string | null;
  profile: ViewerProfile | null;
  user: User | null;
};

type ProfileRow = {
  account_status: ViewerProfile["accountStatus"];
  avatar_url: string | null;
  badge_summary: unknown[] | null;
  bio: string | null;
  display_name: string | null;
  github_username: string | null;
  id: string;
  is_github_linked: boolean;
  joined_at: string;
  last_active_at: string | null;
  role: ViewerProfile["role"];
  trust_score: number;
  username: string | null;
};

type GitHubIdentity = {
  avatarUrl: string | null;
  name: string | null;
  username: string | null;
};

function isAuthSessionMissingError(error: { message?: string; name?: string }) {
  return (
    error.name === "AuthSessionMissingError" ||
    error.message?.includes("Auth session missing") === true
  );
}

function isUniqueViolation(error: { code?: string; message?: string }) {
  return (
    error.code === "23505" ||
    error.message?.includes("duplicate key value violates unique constraint") === true
  );
}

function mapProfile(row: ProfileRow | null): ViewerProfile | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    githubUsername: row.github_username,
    isGithubLinked: row.is_github_linked,
    role: row.role,
    trustScore: row.trust_score,
    badgeSummary: row.badge_summary ?? [],
    accountStatus: row.account_status,
    joinedAt: row.joined_at,
    lastActiveAt: row.last_active_at,
  };
}

export function extractGitHubIdentity(user: User | null): GitHubIdentity | null {
  const githubIdentity = user?.identities?.find(
    (identity) => identity.provider === "github",
  );

  if (!githubIdentity) {
    return null;
  }

  const identityData = githubIdentity.identity_data as Record<string, unknown> | null;
  const usernameCandidate =
    typeof identityData?.user_name === "string"
      ? identityData.user_name
      : typeof identityData?.preferred_username === "string"
        ? identityData.preferred_username
        : typeof identityData?.login === "string"
          ? identityData.login
          : null;

  return {
    username: usernameCandidate,
    name:
      typeof identityData?.full_name === "string"
        ? identityData.full_name
        : typeof identityData?.name === "string"
          ? identityData.name
          : null,
    avatarUrl:
      typeof identityData?.avatar_url === "string"
        ? identityData.avatar_url
        : null,
  };
}

export async function createAuthServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getPublicSupabaseConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookieValues) {
        try {
          cookieValues.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server components can read cookies but cannot always write them.
        }
      },
    },
  });
}

export async function syncUserProfileFromAuthUser(user: User) {
  const serviceSupabase = createServiceRoleSupabaseClient();
  const githubIdentity = extractGitHubIdentity(user);
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const { data: existingProfile, error: existingProfileError } = await serviceSupabase
    .from("user_profiles")
    .select(
      "id, username, display_name, avatar_url, bio, github_username, is_github_linked, role, trust_score, badge_summary, account_status, joined_at, last_active_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfileError && !isMissingRelationError(existingProfileError.message)) {
    throw existingProfileError;
  }

  const existing = existingProfile as ProfileRow | null;
  const derivedDisplayName =
    typeof metadata?.display_name === "string"
      ? metadata.display_name
      : typeof metadata?.full_name === "string"
      ? metadata.full_name
      : typeof metadata?.name === "string"
        ? metadata.name
        : githubIdentity?.name ?? user.email?.split("@")[0] ?? "SkillJury user";
  const derivedAvatarUrl =
    typeof metadata?.avatar_url === "string"
      ? metadata.avatar_url
      : githubIdentity?.avatarUrl;
  const derivedUsername = normalizeUsername(
    typeof metadata?.username === "string"
      ? metadata.username
      : typeof metadata?.user_name === "string"
        ? metadata.user_name
        : githubIdentity?.username ?? user.email?.split("@")[0] ?? null,
  );
  const basePayload = {
    id: user.id,
    avatar_url: existing?.avatar_url ?? derivedAvatarUrl ?? null,
    display_name: existing?.display_name ?? derivedDisplayName,
    github_username: githubIdentity?.username ?? existing?.github_username ?? null,
    is_github_linked: Boolean(githubIdentity),
    last_active_at: new Date().toISOString(),
  };
  const preferredUsername = existing?.username ?? derivedUsername ?? null;

  const writeProfile = async (username: string | null) => {
    const payload = username ? { ...basePayload, username } : basePayload;
    return serviceSupabase.from("user_profiles").upsert(payload, { onConflict: "id" });
  };

  const { error } = await writeProfile(preferredUsername);

  if (error && preferredUsername && !existing?.username && isUniqueViolation(error)) {
    const fallbackWrite = await writeProfile(null);

    if (fallbackWrite.error) {
      throw fallbackWrite.error;
    }

    return;
  }

  if (error) {
    throw error;
  }
}

export async function getCurrentViewer(): Promise<Viewer> {
  const adminEmail = getAdminEmail();
  const supabase = await createAuthServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    if (isAuthSessionMissingError(userError)) {
      return {
        adminEmail,
        profile: null,
        user: null,
      };
    }

    throw userError;
  }

  if (!user) {
    return {
      adminEmail,
      profile: null,
      user: null,
    };
  }

  const serviceSupabase = createServiceRoleSupabaseClient();
  const { data, error } = await serviceSupabase
    .from("user_profiles")
    .select(
      "id, username, display_name, avatar_url, bio, github_username, is_github_linked, role, trust_score, badge_summary, account_status, joined_at, last_active_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    logDataAccessError("current-viewer", error);

    if (isMissingRelationError(error.message)) {
      return {
        adminEmail,
        profile: null,
        user,
      };
    }

    throw error;
  }

  return {
    adminEmail,
    profile: mapProfile(data as ProfileRow | null),
    user,
  };
}
