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
      <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-8">
        <h2 className="font-display text-3xl tracking-tight text-slate-950">
          {emptyTitle}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          {emptyCopy}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {items.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  );
}
