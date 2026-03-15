const styles: Record<string, string> = {
  pass: "bg-[hsl(142_71%_45%/0.15)] text-[hsl(142_76%_68%)] border-[hsl(142_71%_45%/0.25)]",
  safe: "bg-[hsl(142_71%_45%/0.15)] text-[hsl(142_76%_68%)] border-[hsl(142_71%_45%/0.25)]",
  warn: "bg-[hsl(38_92%_50%/0.15)] text-[hsl(45_93%_68%)] border-[hsl(38_92%_50%/0.25)]",
  fail: "bg-[hsl(0_72%_51%/0.15)] text-[hsl(0_80%_70%)] border-[hsl(0_72%_51%/0.25)]",
  high_risk:
    "bg-[hsl(0_72%_51%/0.15)] text-[hsl(0_80%_70%)] border-[hsl(0_72%_51%/0.25)]",
  critical:
    "bg-[hsl(0_72%_51%/0.15)] text-[hsl(0_80%_70%)] border-[hsl(0_72%_51%/0.25)]",
};

export function SecurityPill({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  const cls = styles[status] || styles.warn;

  return (
    <span
      className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${cls}`}
    >
      {label}
    </span>
  );
}
