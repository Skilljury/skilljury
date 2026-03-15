import { SkillCard } from "@/components/skills/SkillCard";
import type { SkillListItem } from "@/lib/db/skills";

type ResultGridProps = {
  items: SkillListItem[];
  emptyTitle?: string;
  emptyCopy?: string;
};

export function ResultGrid({
  items,
  emptyTitle = "No matching skills yet",
  emptyCopy = "Try broadening the query or clearing one of the filters.",
}: ResultGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/40 p-8 text-center">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
          {emptyTitle}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          {emptyCopy}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  );
}
