import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AffiliateButton } from "@/components/agents/AffiliateButton";
import { PaginationNav } from "@/components/listing/PaginationNav";
import { SortButtonGroup } from "@/components/listing/SortButtonGroup";
import { JsonLd } from "@/components/seo/JsonLd";
import { ResultGrid } from "@/components/search/ResultGrid";
import { getAgentAffiliateLink } from "@/lib/catalog/agentAffiliateLinks";
import { getAgentDescription } from "@/lib/catalog/agentDescriptions";
import { getAgentBySlug } from "@/lib/db/agents";
import { searchSkills } from "@/lib/db/search";
import { normalizePageParam, normalizeSortParam } from "@/lib/routing/browseParams";
import { buildCanonicalUrl, buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd, buildItemListJsonLd } from "@/lib/seo/schema";
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

  const editorialDescription = getAgentDescription(agent.slug);
  const { title, description } = buildAgentMetadataText(agent.name);
  return buildPageMetadata({
    title,
    description: editorialDescription ?? description,
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
  const canonicalPath = `/agents/${agent.slug}`;
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: agent.name, path: canonicalPath },
  ];
  const affiliateLink = getAgentAffiliateLink(agentSlug);
  const editorialDescription = getAgentDescription(agent.slug);
  const resultItems = results.items.map((item) => ({
    name: item.name,
    url: buildCanonicalUrl(`/skills/${item.slug}`),
  }));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      {resultItems.length > 0 ? (
        <JsonLd
          data={buildItemListJsonLd({
            canonicalPath,
            itemName: `${agent.name} compatible skills on SkillJury`,
            items: resultItems,
          })}
        />
      ) : null}
      <section className="space-y-4">
        <Link
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-default hover:text-foreground"
          href="/"
        >
          <span aria-hidden="true">←</span>
          <span>Back to registry</span>
        </Link>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {agent.name}
          </h1>
          {(editorialDescription ?? agent.description) ? (
            <p className="max-w-3xl text-lg text-foreground/80">
              {editorialDescription ?? agent.description}
            </p>
          ) : null}
          {affiliateLink ? (
            <AffiliateButton link={affiliateLink} />
          ) : null}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.34em] text-muted-foreground">
            Skills compatible with {agent.name}
          </h2>
          <SortButtonGroup basePath={`/agents/${agent.slug}`} value={sort} />
        </div>
        {results.items.length < 3 ? (
          <div className="rounded-2xl border border-border bg-card/60 px-8 py-12 text-center">
            <p className="text-sm font-medium text-foreground">Early catalog</p>
            <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
              SkillJury only has a small number of skills tagged as compatible with {agent.name} so far.
              As the catalog grows, more skills will appear here.
            </p>
            <a
              href="/search"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2 text-sm text-foreground hover:border-primary/20 transition"
            >
              Browse all skills →
            </a>
          </div>
        ) : (
          <ResultGrid
            emptyCopy="No compatible skills found."
            emptyTitle="No compatible skills"
            items={results.items}
          />
        )}
      </section>

      {results.items.length >= 3 && (
        <PaginationNav
          basePath={`/agents/${agent.slug}`}
          page={results.page}
          query={{ sort }}
          totalPages={results.totalPages}
        />
      )}
    </div>
  );
}
