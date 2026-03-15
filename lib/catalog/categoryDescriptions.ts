export const categoryDescriptions: Record<string, string> = {
  "ai-automation":
    "AI and automation skills cover agent workflows, orchestration layers, MCP integrations, and repeatable task pipelines. Developers browsing this category will find tools for running assistants, connecting models to external systems, and automating work that would otherwise stay manual.",
  "data-analytics":
    "Data and analytics skills focus on querying, measuring, and interpreting product or operational data. This category includes SQL helpers, dashboard workflows, spreadsheet-oriented tools, and analytics automation that helps teams move from raw events to usable decisions.",
  "devops-cloud":
    "DevOps and cloud skills support deployment, infrastructure changes, platform operations, and environment management. Expect tools for CI/CD, cloud services, provisioning, incident-oriented workflows, and the operational tasks that keep production systems stable.",
  "frontend-design":
    "Frontend and design skills center on UI engineering, styling systems, interaction design, and design-to-code workflows. Developers here will find tools for React and web interfaces, component systems, visual polish, and collaboration between product, design, and implementation.",
  "general-automation":
    "General automation is the catch-all category for workflow helpers that do not yet fit a narrower lane. These skills usually handle broad productivity tasks, glue work between systems, or practical automations that support day-to-day developer operations.",
  "job-career":
    "Jobs and career skills are aimed at resumes, cover letters, interview prep, and application workflows. This category is useful for developers who want structured help presenting experience, tailoring applications, or preparing for hiring conversations.",
  "marketing-growth":
    "Marketing and growth skills support launch planning, conversion work, paid acquisition, lifecycle messaging, and go-to-market execution. Developers and technical founders will find tools here for turning product work into distribution, measurement, and growth experiments.",
  "research-audits":
    "Research and audit skills help with investigation, competitive analysis, due diligence, and structured reviews of a product, market, or codebase. Use this category when the job is to understand something deeply, compare options, or surface risks before acting.",
  "security-privacy":
    "Security and privacy skills are built for auth reviews, secret handling, vulnerability checks, compliance-sensitive workflows, and defensive engineering tasks. Developers browsing this category should expect tools that reduce risk and improve confidence before shipping.",
  "seo-geo":
    "SEO and GEO skills focus on crawlability, structured data, indexing, search performance, and AI-answer visibility. This category is for teams improving how pages rank in search engines and how product or content entities are understood by answer engines.",
  "software-engineering":
    "Software engineering skills cover the core work of building and maintaining code: implementation, refactoring, debugging, architecture, and developer workflows. This is the broadest category, so it often contains tools used across repositories, frameworks, and day-to-day engineering tasks.",
  "testing-qa":
    "Testing and QA skills are designed for regression checks, automated validation, browser testing, and release confidence. Developers here will find tools that help verify behavior, catch breakages early, and keep changes from shipping without evidence.",
  "video-media":
    "Video and media skills support audio, video, image, and presentation workflows used in content production. Expect tools for generating, editing, packaging, or automating media assets that sit outside the typical code-and-infrastructure toolchain.",
  "writing-content":
    "Writing and content skills help teams draft, edit, structure, and improve documentation or published content. This category includes tools for technical writing, editorial workflows, copy refinement, and content production that supports product communication.",
};

export function getCategoryDescription(categorySlug: string) {
  return categoryDescriptions[categorySlug] ?? null;
}
