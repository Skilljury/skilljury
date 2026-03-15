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
        <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
          Related skills
        </div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
    </section>
  );
}
