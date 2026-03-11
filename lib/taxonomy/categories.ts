export type SkillCategoryDefinition = {
  slug: string;
  name: string;
  description: string;
  keywords: string[];
};

export type SkillCategoryInput = {
  name: string | null;
  shortSummary: string | null;
  longDescription: string | null;
  installCommand: string | null;
  sourceSlug: string | null;
  repositoryUrl: string | null;
  repositoryTopics?: string[] | null;
  agentNames?: string[] | null;
};

export const skillCategoryDefinitions: SkillCategoryDefinition[] = [
  {
    slug: "software-engineering",
    name: "Software Engineering",
    description:
      "Coding, architecture, refactoring, developer workflows, and code quality.",
    keywords: [
      "code",
      "coding",
      "developer",
      "development",
      "engineering",
      "typescript",
      "javascript",
      "python",
      "refactor",
      "architecture",
      "git",
      "pull request",
      "pr review",
      "api",
      "backend",
      "full stack",
    ],
  },
  {
    slug: "frontend-design",
    name: "Frontend and Design",
    description:
      "UI engineering, web design, CSS systems, React, and Figma-adjacent workflows.",
    keywords: [
      "frontend",
      "front-end",
      "design",
      "ui",
      "ux",
      "react",
      "next.js",
      "nextjs",
      "tailwind",
      "css",
      "html",
      "figma",
      "web design",
      "animation",
      "design system",
    ],
  },
  {
    slug: "testing-qa",
    name: "Testing and QA",
    description:
      "Automated testing, QA, regression checks, browser testing, and validation.",
    keywords: [
      "test",
      "testing",
      "qa",
      "quality assurance",
      "playwright",
      "jest",
      "cypress",
      "e2e",
      "end-to-end",
      "regression",
      "compatibility",
      "assertion",
    ],
  },
  {
    slug: "devops-cloud",
    name: "DevOps and Cloud",
    description:
      "Deployment, infrastructure, cloud platforms, ops, CI/CD, and platform tooling.",
    keywords: [
      "deploy",
      "deployment",
      "devops",
      "infrastructure",
      "infra",
      "cloud",
      "aws",
      "azure",
      "gcp",
      "vercel",
      "docker",
      "kubernetes",
      "terraform",
      "ci/cd",
      "serverless",
      "platform",
    ],
  },
  {
    slug: "data-analytics",
    name: "Data and Analytics",
    description:
      "Analytics, tracking, SQL, spreadsheets, dashboards, and data workflows.",
    keywords: [
      "data",
      "analytics",
      "tracking",
      "ga4",
      "sql",
      "database",
      "postgres",
      "spreadsheet",
      "excel",
      "dashboard",
      "metrics",
      "warehouse",
    ],
  },
  {
    slug: "research-audits",
    name: "Research and Audits",
    description:
      "Research, competitive analysis, audits, due diligence, and investigation workflows.",
    keywords: [
      "research",
      "audit",
      "analysis",
      "investigation",
      "benchmark",
      "competitive",
      "competitor",
      "due diligence",
      "deep research",
      "discovery",
      "review",
    ],
  },
  {
    slug: "marketing-growth",
    name: "Marketing and Growth",
    description:
      "Marketing strategy, ads, CRO, lifecycle growth, and go-to-market execution.",
    keywords: [
      "marketing",
      "growth",
      "ads",
      "paid media",
      "campaign",
      "cro",
      "conversion",
      "launch",
      "pricing",
      "referral",
      "onboarding",
      "retention",
      "product hunt",
      "go-to-market",
      "affiliate",
      "social media",
    ],
  },
  {
    slug: "seo-geo",
    name: "SEO and GEO",
    description:
      "Search optimization, schema, technical SEO, and AI discoverability workflows.",
    keywords: [
      "seo",
      "geo",
      "schema",
      "structured data",
      "search console",
      "keyword",
      "organic search",
      "ranking",
      "sitemap",
      "indexing",
    ],
  },
  {
    slug: "writing-content",
    name: "Writing and Content",
    description:
      "Writing, editing, documentation, copy, and content production workflows.",
    keywords: [
      "writing",
      "copywriting",
      "copy editing",
      "copy-editing",
      "content",
      "documentation",
      "technical writing",
      "blog",
      "editorial",
      "email",
      "storytelling",
    ],
  },
  {
    slug: "job-career",
    name: "Jobs and Career",
    description:
      "Job applications, cover letters, resumes, interview prep, and career workflows.",
    keywords: [
      "job",
      "career",
      "cover letter",
      "resume",
      "cv",
      "interview",
      "job application",
      "ats",
      "application",
    ],
  },
  {
    slug: "security-privacy",
    name: "Security and Privacy",
    description:
      "Security reviews, auth, privacy, compliance, and vulnerability workflows.",
    keywords: [
      "security",
      "privacy",
      "auth",
      "oauth",
      "authentication",
      "authorization",
      "compliance",
      "vulnerability",
      "threat",
      "secret",
    ],
  },
  {
    slug: "video-media",
    name: "Video and Media",
    description:
      "Video, audio, image, and media production workflows.",
    keywords: [
      "video",
      "audio",
      "media",
      "remotion",
      "sora",
      "podcast",
      "image",
      "thumbnail",
      "animation",
    ],
  },
  {
    slug: "ai-automation",
    name: "AI and Automation",
    description:
      "Agent workflows, MCP integrations, automation, orchestration, and AI operations.",
    keywords: [
      "agent",
      "agents",
      "automation",
      "workflow",
      "mcp",
      "prompt",
      "llm",
      "openrouter",
      "bot",
      "assistant",
      "orchestration",
      "tool calling",
    ],
  },
  {
    slug: "general-automation",
    name: "General Automation",
    description:
      "Broad workflow helpers that do not fit a more specific starter category yet.",
    keywords: [],
  },
];

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function buildSearchText(input: SkillCategoryInput) {
  return normalizeText(
    [
      input.name,
      input.shortSummary,
      input.longDescription,
      input.installCommand,
      input.sourceSlug,
      input.repositoryUrl,
      ...(input.repositoryTopics ?? []),
      ...(input.agentNames ?? []),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function classifySkillCategories(input: SkillCategoryInput) {
  const haystack = buildSearchText(input);
  const matches = skillCategoryDefinitions
    .filter(
      (category) =>
        category.slug !== "general-automation" &&
        category.keywords.some((keyword) => haystack.includes(keyword)),
    )
    .map((category) => category.slug);

  if (matches.length === 0) {
    return ["general-automation"];
  }

  if (!matches.includes("ai-automation") && haystack.includes("skill")) {
    matches.push("ai-automation");
  }

  return matches.slice(0, 4);
}
