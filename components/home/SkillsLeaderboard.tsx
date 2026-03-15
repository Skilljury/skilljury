"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { SecurityPill } from "@/components/ui/SecurityPill";

type LeaderboardTab = "all" | "hot" | "trending";
type AuditStatus = "critical" | "fail" | "high_risk" | "pass" | "safe" | "warn";

type LeaderboardSkill = {
  createdAt: string | null;
  id: number;
  installCountLabel: string;
  name: string;
  securityAudits: {
    gen?: AuditStatus | null;
    scraped_at?: string | null;
    snyk?: AuditStatus | null;
    socket?: AuditStatus | null;
  };
  slug: string;
  source: {
    name: string;
    slug: string;
  } | null;
  weeklyInstalls: number | null;
};

type LeaderboardResult = {
  items: LeaderboardSkill[];
  page: number;
  pageSize: number;
  tab: LeaderboardTab;
  total: number;
};

type SkillsLeaderboardProps = {
  initialData: LeaderboardResult;
  tabTotals: Record<LeaderboardTab, number>;
};

const tabOrder: LeaderboardTab[] = ["all", "trending", "hot"];
const auditOrder = ["gen", "socket", "snyk"] as const;

function formatTabLabel(tab: LeaderboardTab, total: number) {
  if (tab === "trending") {
    return `Trending (7d | ${total.toLocaleString("en-US")})`;
  }

  if (tab === "hot") {
    return `Hot (${total.toLocaleString("en-US")})`;
  }

  return `All Time (${total.toLocaleString("en-US")})`;
}

function formatAuditLabel(vendor: (typeof auditOrder)[number], status: AuditStatus) {
  const vendorLabel =
    vendor === "gen" ? "GEN" : vendor === "socket" ? "SOCKET" : "SNYK";

  return `${vendorLabel} ${status.replace(/_/g, " ").toUpperCase()}`;
}

async function fetchLeaderboard(tab: LeaderboardTab, page: number, pageSize: number) {
  const response = await fetch(
    `/api/leaderboard?tab=${tab}&page=${page}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch ${tab} leaderboard data.`);
  }

  return (await response.json()) as LeaderboardResult;
}

export function SkillsLeaderboard({
  initialData,
  tabTotals,
}: SkillsLeaderboardProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>(initialData.tab);
  const [datasets, setDatasets] = useState<Record<LeaderboardTab, LeaderboardResult>>({
    all: initialData,
    trending: {
      items: [],
      page: 0,
      pageSize: initialData.pageSize,
      tab: "trending",
      total: tabTotals.trending,
    },
    hot: {
      items: [],
      page: 0,
      pageSize: initialData.pageSize,
      tab: "hot",
      total: tabTotals.hot,
    },
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const activeDataset = datasets[activeTab];
  const canLoadMore = activeDataset.items.length < activeDataset.total;

  function handleTabChange(tab: LeaderboardTab) {
    if (tab === activeTab) {
      return;
    }

    setActiveTab(tab);
    setErrorMessage(null);

    if (datasets[tab].page > 0) {
      return;
    }

    startTransition(() => {
      void fetchLeaderboard(tab, 1, initialData.pageSize)
        .then((nextData) => {
          setDatasets((current) => ({
            ...current,
            [tab]: nextData,
          }));
        })
        .catch((error: unknown) => {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not load the requested leaderboard tab.",
          );
        });
    });
  }

  function handleLoadMore() {
    if (isPending || !canLoadMore) {
      return;
    }

    setErrorMessage(null);
    const nextPage = Math.max(activeDataset.page, 1) + 1;

    startTransition(() => {
      void fetchLeaderboard(activeTab, nextPage, activeDataset.pageSize)
        .then((nextData) => {
          setDatasets((current) => ({
            ...current,
            [activeTab]: {
              ...nextData,
              items: [...current[activeTab].items, ...nextData.items],
            },
          }));
        })
        .catch((error: unknown) => {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not load more leaderboard rows.",
          );
        });
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
            Skills leaderboard
          </div>
          <h2 className="text-balance text-2xl font-semibold uppercase tracking-[0.14em] text-foreground sm:text-3xl">
            Live catalog rankings
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          Ranked from the current SkillJury catalog using install activity, sync
          freshness, and source-linked trust signals that help developers narrow
          the shortlist quickly.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Leaderboard time range">
        {tabOrder.map((tab) => {
          const isActive = tab === activeTab;
          const isHot = tab === "hot";

          return (
            <button
              aria-selected={isActive}
              className={`transition-default inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.28em] ${
                isActive
                  ? "border-white/20 bg-white/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-white/15 hover:text-foreground"
              }`}
              key={tab}
              onClick={() => handleTabChange(tab)}
              role="tab"
              type="button"
            >
              {isHot ? <span className="pulse-dot" /> : null}
              {formatTabLabel(tab, tabTotals[tab])}
            </button>
          );
        })}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border bg-card/85 md:block">
        <div className="hidden grid-cols-[72px_minmax(0,1fr)_132px] gap-4 px-5 py-4 text-[11px] uppercase tracking-[0.34em] text-muted-foreground md:grid">
          <div>#</div>
          <div>Skill</div>
          <div className="text-right">Installs</div>
        </div>

        {activeDataset.items.length > 0 ? (
          <div className="divide-y divide-border/60">
            {activeDataset.items.map((skill, index) => {
              const rank = index + 1;
              const auditChips = auditOrder.flatMap((vendor) => {
                const status = skill.securityAudits[vendor];

                if (!status) {
                  return [];
                }

                return [
                  <SecurityPill
                    key={`${skill.id}-${vendor}`}
                    label={formatAuditLabel(vendor, status)}
                    status={status}
                  />,
                ];
              });

              return (
                <div
                  className="row-reveal px-4 py-4 md:grid md:grid-cols-[72px_minmax(0,1fr)_132px] md:items-center md:gap-4 md:px-5"
                  key={skill.id}
                  style={{ animationDelay: `${index * 35}ms` }}
                >
                  <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.34em] text-muted-foreground md:mb-0">
                    #{rank}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <Link
                        className="text-sm uppercase tracking-[0.16em] text-foreground transition-default hover:text-white"
                        href={`/skills/${skill.slug}`}
                      >
                        {skill.name}
                      </Link>
                      {skill.source ? (
                        <Link
                          className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground transition-default hover:text-foreground"
                          href={`/sources/${encodeURIComponent(skill.source.slug)}`}
                        >
                          {skill.source.name}
                        </Link>
                      ) : null}
                    </div>

                    {auditChips.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">{auditChips}</div>
                    ) : null}
                  </div>

                  <div className="mt-4 font-mono text-left text-sm uppercase tracking-[0.16em] text-foreground md:mt-0 md:text-right">
                    {skill.installCountLabel}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-5 py-10 text-sm leading-7 text-muted-foreground">
            No skills are available for this leaderboard view yet.
          </div>
        )}
      </div>

      <div className="grid gap-4 md:hidden">
        {activeDataset.items.length > 0
          ? activeDataset.items.slice(0, 10).map((skill, index) => {
              const auditChips = auditOrder.flatMap((vendor) => {
                const status = skill.securityAudits[vendor];

                if (!status) {
                  return [];
                }

                return [
                  <SecurityPill
                    key={`mobile-${skill.id}-${vendor}`}
                    label={formatAuditLabel(vendor, status)}
                    status={status}
                  />,
                ];
              });

              return (
                <div
                  className="row-reveal rounded-lg border border-border bg-card/70 p-4"
                  key={`mobile-${skill.id}`}
                  style={{ animationDelay: `${index * 35}ms` }}
                >
                  <div className="flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
                    <span>#{index + 1}</span>
                    <span>{skill.installCountLabel}</span>
                  </div>
                  <Link
                    className="mt-3 block text-sm uppercase tracking-[0.16em] text-foreground transition-default hover:text-white"
                    href={`/skills/${skill.slug}`}
                  >
                    {skill.name}
                  </Link>
                  {skill.source ? (
                    <Link
                      className="mt-2 inline-block text-[11px] uppercase tracking-[0.24em] text-muted-foreground transition-default hover:text-foreground"
                      href={`/sources/${encodeURIComponent(skill.source.slug)}`}
                    >
                      {skill.source.name}
                    </Link>
                  ) : null}
                  {auditChips.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">{auditChips}</div>
                  ) : null}
                </div>
              );
            })
          : null}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
          Showing {activeDataset.items.length.toLocaleString("en-US")} of{" "}
          {activeDataset.total.toLocaleString("en-US")}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}

          {canLoadMore ? (
            <button
              className="transition-default inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-foreground hover:border-white/20 hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              onClick={handleLoadMore}
              type="button"
            >
              {isPending ? "Loading..." : "Load more"}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
