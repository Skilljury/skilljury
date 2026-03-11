import { JsonLd } from "@/components/seo/JsonLd";
import { Hero } from "@/components/home/Hero";
import { SkillCard } from "@/components/skills/SkillCard";
import { EmptyStatePrompt } from "@/components/ui/EmptyStatePrompt";
import { getFeaturedSkills, getSkillCount } from "@/lib/db/skills";
import { getSourceCount } from "@/lib/db/sources";
import { buildOrganizationJsonLd } from "@/lib/seo/schema";

export default async function Home() {
  const [featuredSkills, liveSkillCount, liveSourceCount] = await Promise.all([
    getFeaturedSkills(6),
    getSkillCount(),
    getSourceCount(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-10 lg:px-10 lg:py-14">
      <JsonLd
        data={buildOrganizationJsonLd({
          liveSkillCount,
          liveSourceCount,
        })}
      />
      <Hero liveSkillCount={liveSkillCount} liveSourceCount={liveSourceCount} />

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
              Featured
            </div>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-slate-950">
              Featured AI Agent Skills
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Explore top-rated AI agent skills vetted by real user reviews across
            coding, marketing, research, and more.
          </p>
        </div>

        {featuredSkills.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {featuredSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        ) : (
          <EmptyStatePrompt
            actionHref="/submit-skill"
            actionLabel="Submit a skill"
            description="No skills are available yet. Once the catalog is live, this homepage will surface the strongest public entries from the imported dataset."
            title="The catalog is still empty"
          />
        )}
      </section>
    </div>
  );
}
