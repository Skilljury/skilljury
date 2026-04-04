/**
 * Affiliate and referral links for AI agent tools listed on SkillJury.
 *
 * HOW TO UPDATE:
 * 1. Sign up for the affiliate program at the URL in the comment
 * 2. Replace the placeholder href with your real affiliate/referral link
 * 3. Set enabled: true
 *
 * Cursor affiliate: https://www.cursor.com/affiliates (20% recurring 12mo)
 * GitHub Copilot: Microsoft affiliate network - no direct program currently
 * Windsurf: credits-only referral, not cash - skip for now
 * Replit: https://replit.com/refer
 * HubSpot: https://www.hubspot.com/partners/affiliates-program (30% recurring)
 */

export type AgentAffiliateLink = {
  label: string; // Button text e.g. "Try Cursor Free"
  href: string; // Your affiliate URL
  enabled: boolean; // Set false to hide while you get the affiliate link
  disclosure: string; // Short FTC disclosure text
};

export const agentAffiliateLinks: Record<string, AgentAffiliateLink> = {
  cursor: {
    label: "Try Cursor Free",
    href: "https://www.cursor.com/", // REPLACE with your affiliate link from cursor.com/affiliates
    enabled: false,
    disclosure:
      "Affiliate link — SkillJury may earn a commission if you subscribe.",
  },
  "claude-code": {
    label: "Try Claude Code",
    href: "https://claude.ai/", // No affiliate program yet — direct link for now
    enabled: true,
    disclosure: "",
  },
  windsurf: {
    label: "Try Windsurf Free",
    href: "https://windsurf.com/", // REPLACE with referral link from windsurf.com/refer
    enabled: true,
    disclosure: "",
  },
  "github-copilot": {
    label: "Try GitHub Copilot Free",
    href: "https://github.com/features/copilot",
    enabled: true,
    disclosure: "",
  },
  replit: {
    label: "Build on Replit",
    href: "https://replit.com/", // REPLACE with referral link
    enabled: true,
    disclosure: "",
  },
  cline: {
    label: "Install Cline Free",
    href: "https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev",
    enabled: true,
    disclosure: "",
  },
  codex: {
    label: "Try OpenAI Codex",
    href: "https://openai.com/codex/",
    enabled: true,
    disclosure: "",
  },
  continue: {
    label: "Install Continue Free",
    href: "https://continue.dev/",
    enabled: true,
    disclosure: "",
  },
  goose: {
    label: "Try Goose Free",
    href: "https://block.github.io/goose/",
    enabled: true,
    disclosure: "",
  },
  openclaw: {
    label: "Try OpenClaw",
    href: "https://openclaw.ai/",
    enabled: true,
    disclosure: "",
  },
};

export function getAgentAffiliateLink(
  agentSlug: string,
): AgentAffiliateLink | null {
  const link = agentAffiliateLinks[agentSlug];
  if (!link || !link.enabled) return null;
  return link;
}
