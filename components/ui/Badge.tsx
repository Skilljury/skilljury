import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "default" | "accent" | "muted";
};

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default:
    "border border-white/15 bg-white/8 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
  accent:
    "border border-amber-300/30 bg-amber-300/12 text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
  muted:
    "border border-slate-800 bg-slate-100 text-slate-700",
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
