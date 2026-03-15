# Review Bootstrap Candidates

Generated on 2026-03-14 from the live Supabase catalog using the local `.env.local` values after applying the same angle-bracket sanitization logic used by the app's Supabase config.

## Ranking Method
- Included only active skills with `approved_review_count = 0`
- Required a cleaned `short_summary` of at least 40 characters
- Required a cleaned `long_description` so the page already has enough page depth for a real review to add leverage
- Boosted skills from recognizable sources such as OpenAI, Anthropic, Microsoft, Vercel, Flutter, Figma, Trail of Bits, Apify, and similar vendor or ecosystem-maintainer repos
- Balanced the final 10 for source and category diversity instead of taking the raw top 10 from one source

## Top 10

| Rank | Skill | Source | Category | Why it is a good first-review candidate | Live URL |
| --- | --- | --- | --- | --- | --- |
| 1 | `openai-docs` | `openai/skills` | Software Engineering | It already has unusually strong summary and description depth, comes from a first-party OpenAI source, and a real review would immediately make the page feel authoritative instead of purely imported. | [https://www.skilljury.com/skills/openai-docs](https://www.skilljury.com/skills/openai-docs) |
| 2 | `webapp-testing` | `anthropics/skills` | Testing and QA | This is an official Anthropic skill with a clear high-intent use case, so the first review would add trust to a page that is already content-complete and broadly useful. | [https://www.skilljury.com/skills/webapp-testing](https://www.skilljury.com/skills/webapp-testing) |
| 3 | `playwright-cli` | `microsoft/playwright-cli` | Testing and QA | The page already has enough content to support a substantive review, and the Microsoft-backed source makes it a strong credibility anchor for the first public testing reviews. | [https://www.skilljury.com/skills/playwright-cli](https://www.skilljury.com/skills/playwright-cli) |
| 4 | `vercel-react-best-practices` | `vercel-labs/agent-skills` | Frontend and Design | It comes from a well-known Vercel source, targets a large React audience, and is exactly the kind of page where one thoughtful review could improve both trust and click-through. | [https://www.skilljury.com/skills/vercel-react-best-practices](https://www.skilljury.com/skills/vercel-react-best-practices) |
| 5 | `create-design-system-rules` | `figma/mcp-server-guide` | Frontend and Design | This page already has one of the richest long descriptions in the catalog, and a review would turn a strong Figma-linked reference page into a genuinely useful evaluation page. | [https://www.skilljury.com/skills/create-design-system-rules](https://www.skilljury.com/skills/create-design-system-rules) |
| 6 | `flutter-performance` | `flutter/skills` | Software Engineering | Flutter is a recognizable source, the page has excellent description depth, and a first review would help establish SkillJury credibility for mobile and framework-specific skills. | [https://www.skilljury.com/skills/flutter-performance](https://www.skilljury.com/skills/flutter-performance) |
| 7 | `azure-postgres` | `microsoft/github-copilot-for-azure` | DevOps and Cloud | It is backed by an official Microsoft Copilot-for-Azure source, already has strong page depth, and fits a practical infrastructure use case that benefits from real-world review context. | [https://www.skilljury.com/skills/azure-postgres](https://www.skilljury.com/skills/azure-postgres) |
| 8 | `substrate-vulnerability-scanner` | `trailofbits/skills` | Testing and QA | Trail of Bits is a trust-heavy security source, so even one real review would add immediate signal to a page that already looks substantial enough to rank and convert. | [https://www.skilljury.com/skills/substrate-vulnerability-scanner](https://www.skilljury.com/skills/substrate-vulnerability-scanner) |
| 9 | `apify-audience-analysis` | `apify/agent-skills` | Data and Analytics | This page combines a known source with a concrete analytics use case, making it a good candidate for an early review that broadens SkillJury beyond core coding-only skills. | [https://www.skilljury.com/skills/apify-audience-analysis](https://www.skilljury.com/skills/apify-audience-analysis) |
| 10 | `account-research` | `anthropics/knowledge-work-plugins` | Research and Audits | It adds category diversity, comes from a strong Anthropic source, and already has enough summary and description depth that a first review would meaningfully change page quality. | [https://www.skilljury.com/skills/account-research](https://www.skilljury.com/skills/account-research) |

## Notes
- Categories above are the best-fit category chosen from the live category set for each skill when multiple categories were attached.
- This list is optimized for "first review leverage" rather than raw install count alone.
