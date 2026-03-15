import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "default" | "accent" | "muted";
};

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default:
    "border border-white/10 bg-white/6 text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
  accent:
    "border border-white/15 bg-white text-zinc-950 shadow-[0_10px_30px_rgba(255,255,255,0.08)]",
  muted:
    "border border-zinc-800 bg-zinc-900 text-zinc-300",
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
