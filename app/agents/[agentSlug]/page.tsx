import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AgentHero } from "@/components/agents/AgentHero";
import { PaginationNav } from "@/components/listing/PaginationNav";
import { SortSelect } from "@/components/listing/SortSelect";
import { ResultGrid } from "@/components/search/ResultGrid";
import { getAgentBySlug } from "@/lib/db/agents";
import { searchSkills } from "@/lib/db/search";
import { normalizePageParam, normalizeSortParam } from "@/lib/routing/browseParams";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildAgentMetadataText } from "@/lib/seo/titleTemplates";

type AgentPageProps = {
  params: Promise<{
    agentSlug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: AgentPageProps): Promise<Metadata> {
  const { agentSlug } = await params;
  const agent = await getAgentBySlug(agentSlug);

  if (!agent) {
    return buildPageMetadata({
      title: "Agent not found | SkillJury",
      description: "The requested agent compatibility page could not be found.",
      pathname: `/agents/${agentSlug}`,
    });
  }

  const { title, description } = buildAgentMetadataText(agent.name);
  return buildPageMetadata({
    title,
    description,
    pathname: `/agents/${agent.slug}`,
  });
}

export default async function AgentPage({
  params,
  searchParams,
}: AgentPageProps) {
  const { agentSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const agent = await getAgentBySlug(agentSlug);

  if (!agent) {
    notFound();
  }

  const page = normalizePageParam(resolvedSearchParams.page);
  const sort = normalizeSortParam(resolvedSearchParams.sort);
  const results = await searchSkills({
    agentId: agent.id,
    page,
    sort,
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <AgentHero agent={agent} />

      <form
        action={`/agents/${agent.slug}`}
        className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_20px_55px_rgba(15,23,42,0.08)]"
        method="get"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
              Compatibility catalog
            </div>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-slate-950">
              {results.totalCount.toLocaleString("en-US")} linked skills
            </h2>
          </div>
          <div className="w-full max-w-xs">
            <SortSelect value={sort} />
          </div>
        </div>
      </form>

      <ResultGrid items={results.items} />

      <PaginationNav
        basePath={`/agents/${agent.slug}`}
        page={results.page}
        query={{ sort }}
        totalPages={results.totalPages}
      />
    </div>
  );
}
