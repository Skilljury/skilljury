export type PrototypeSkill = {
  category: string;
  installs: string;
  lastUpdated: string;
  name: string;
  rating: string;
  reviewCount: number;
  safety: "High" | "Moderate" | "Needs review";
  source: string;
  stars: string;
  summary: string;
};

export const prototypeSkills: PrototypeSkill[] = [
  {
    category: "Software Engineering",
    installs: "4.8k",
    lastUpdated: "2 days ago",
    name: "Azure AI",
    rating: "4.7",
    reviewCount: 26,
    safety: "High",
    source: "microsoft/azure",
    stars: "2.4k",
    summary:
      "Enterprise-grade Azure workflows, model access, and deployment helpers for agent builders who need clear docs and reliable updates.",
  },
  {
    category: "Marketing",
    installs: "3.1k",
    lastUpdated: "5 days ago",
    name: "Campaign Brief Builder",
    rating: "4.4",
    reviewCount: 18,
    safety: "Moderate",
    source: "growthkit/marketing-skills",
    stars: "1.1k",
    summary:
      "Drafts campaign plans, landing page angles, and messaging systems with a strong bias toward reusable growth playbooks.",
  },
  {
    category: "Research",
    installs: "2.7k",
    lastUpdated: "1 day ago",
    name: "Signal Scout",
    rating: "4.6",
    reviewCount: 31,
    safety: "High",
    source: "analyst-labs/research-suite",
    stars: "3.6k",
    summary:
      "Fast multi-source research assistant for briefs, market scans, and source-backed summaries with cleaner citations than generic prompts.",
  },
  {
    category: "Security",
    installs: "1.2k",
    lastUpdated: "8 days ago",
    name: "Dependency Watch",
    rating: "4.1",
    reviewCount: 11,
    safety: "High",
    source: "secops/check-skill",
    stars: "940",
    summary:
      "Checks package metadata, changelog drift, and repo freshness so teams can catch obviously risky dependencies before installing.",
  },
  {
    category: "Software Engineering",
    installs: "960",
    lastUpdated: "14 days ago",
    name: "Prompt QA Harness",
    rating: "4.2",
    reviewCount: 9,
    safety: "Moderate",
    source: "devtools/quality-kit",
    stars: "780",
    summary:
      "Runs structured prompt evaluations and stores diffs so engineers can compare output quality across prompt revisions.",
  },
  {
    category: "Operations",
    installs: "420",
    lastUpdated: "37 days ago",
    name: "Legacy Import Helper",
    rating: "3.6",
    reviewCount: 4,
    safety: "Needs review",
    source: "community/misc-tools",
    stars: "120",
    summary:
      "Sparse documentation and weak maintenance history, but still used for one-off migration workflows in older agent stacks.",
  },
];

export const prototypeFilters = [
  "Software engineering",
  "Marketing",
  "Research",
  "Security",
  "Reviewed only",
  "GitHub-backed",
  "High safety",
  "English first",
];

export const prototypeSkillDetail = {
  alternatives: ["Signal Scout", "Prompt QA Harness", "Dependency Watch"],
  installCommand: "npx skills add microsoft/azure@azure-ai -g -y",
  lastUpdated: "Mar 11, 2026",
  name: "Azure AI",
  quickFacts: [
    ["SkillJury rating", "4.7 / 5 from 26 reviews"],
    ["Recommendation rate", "88% would recommend"],
    ["GitHub stars", "2.4k"],
    ["Source", "microsoft/azure"],
    ["Primary category", "Software Engineering"],
    ["Agent coverage", "Claude Code, Codex, OpenClaw"],
  ],
  reviewHighlights: [
    {
      author: "Ops engineer, Helsinki",
      body:
        "The docs are unusually clear for an enterprise skill. The install path is predictable and the repo is actively maintained.",
    },
    {
      author: "AI consultant, Berlin",
      body:
        "I trust it more than most catalog imports because the source repo, release cadence, and docs all line up cleanly.",
    },
  ],
  safetyChecks: [
    ["Repository exists", "Pass"],
    ["License published", "Pass"],
    ["Documentation present", "Pass"],
    ["Recent updates", "Pass"],
    ["Source reputation", "Strong"],
    ["Open issues review", "Needs human review"],
  ],
  summary:
    "Azure AI is a well-documented agent skill for Azure model access, deployment helpers, and workflow automation. It combines strong repo signals with above-average community confidence, making it a good benchmark for a trust-first skill page.",
};
