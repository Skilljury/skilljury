import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "default" | "accent" | "muted";
};

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default:
    "border border-border/70 bg-card/70 text-foreground",
  accent:
    "border border-primary/20 bg-primary/10 text-foreground",
  muted:
    "border border-border bg-background text-muted-foreground",
};

export function Badge({ children, tone = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
