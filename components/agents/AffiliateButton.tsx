import type { AgentAffiliateLink } from "@/lib/catalog/agentAffiliateLinks";

type AffiliateButtonProps = {
  link: AgentAffiliateLink;
};

export function AffiliateButton({ link }: AffiliateButtonProps) {
  return (
    <div className="mt-6 space-y-2">
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        {link.label}
        <span aria-hidden="true">↗</span>
      </a>
      {link.disclosure ? (
        <p className="text-xs text-muted-foreground">{link.disclosure}</p>
      ) : null}
    </div>
  );
}
