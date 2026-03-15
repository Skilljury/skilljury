import { SecurityPill } from "@/components/ui/SecurityPill";
import type { SkillSecurityAudits } from "@/lib/db/skills";

type SecurityAuditsProps = {
  audits: SkillSecurityAudits | null | undefined;
};

const vendorLabels = {
  gen: "Gen Agent Trust Hub",
  socket: "Socket",
  snyk: "Snyk",
} as const;

const vendorOrder = ["gen", "socket", "snyk"] as const;

export function SecurityAudits({ audits }: SecurityAuditsProps) {
  const rows = vendorOrder.flatMap((vendorKey) => {
    const status = audits?.[vendorKey];

    if (!status) {
      return [];
    }

    return [
      {
        label: vendorLabels[vendorKey],
        status,
      },
    ];
  });

  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="text-[11px] font-bold uppercase tracking-[0.34em] text-muted-foreground">
        Security audits
      </div>
      <div className="divide-y divide-border border-y border-border">
        {rows.map((row) => (
          <div className="flex items-center justify-between gap-4 py-3" key={row.label}>
            <span className="text-sm text-foreground">{row.label}</span>
            <SecurityPill
              label={row.status.replace(/_/g, " ").toUpperCase()}
              status={row.status}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
