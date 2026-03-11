import { SkillCard } from "@/components/skills/SkillCard";
import type { SkillListItem } from "@/lib/db/skills";

type RelatedSkillsProps = {
  title?: string;
  skills: SkillListItem[];
};

export function RelatedSkills({
  title = "More from this source",
  skills,
}: RelatedSkillsProps) {
  if (skills.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
          Internal links
        </div>
        <h2 className="mt-3 font-display text-4xl tracking-tight text-slate-950">
          {title}
        </h2>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
    </section>
  );
}
