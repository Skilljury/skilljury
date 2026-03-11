# PRODUCT_PLAN

This document is a planning deliverable only. It does not start implementation.

## 1. NAMING AND DOMAIN

### Naming method and confidence note
- Domain checks below are **likely availability checks**, not guarantees.
- I checked them on **2026-03-09** using DNS resolution. If a domain had no DNS A record, I marked it as **likely available**. A registrar could still have it reserved or parked.
- I ran a focused naming re-check on **2026-03-10** for `SkillVerdict`, `SkillJury`, `SkillBench`, `SkillIndex`, and `SkillScorecard` using the same DNS A-record method plus the public GitHub users API.
- GitHub org checks were done against the public GitHub user/org endpoint. A `404` means the org name **appears available**.
- X/Twitter checks are **low confidence** because X often returns generic responses. I used public web search for exact-match handle discovery. Where no exact result surfaced, I marked it **appears available / unverified**.

### 10 strong product names

| Name | Brand fit | `.com` | `.io` | `.sh` | `.co` | GitHub org | X handle | Notes |
|---|---|---|---|---|---|---|---|---|
| **SkillIndex** | Strong for discovery, catalog, ranking | Likely available | Likely available | Likely available | Likely available | Appears available | Appears available / unverified | Best all-round naming result from the checks |
| **SkillScorecard** | Strong for trust, reviews, scoring | Likely taken | Likely available | Likely available | Likely available | Appears available | Appears available / unverified | Very clear review-site meaning |
| **SkillNotebook** | Strong for editorial, reviews, collections | Likely available | Likely available | Likely available | Likely available | Appears available | Appears available / unverified | Friendly, memorable, slightly softer brand |
| **SkillPatch** | Good for updates and curation | Likely taken | Likely available | Likely available | Likely available | Appears available | Appears available / unverified | Good backup option |
| **SkillPeer** | Good for peer reviews and community trust | Likely taken | Likely available | Likely available | Likely available | Appears available | Appears available / unverified | Good community angle |
| **SkillRelay** | Good for discovery and sharing | Likely taken | Likely available | Likely available | Likely available | Appears available | Appears available / unverified | More neutral brand |
| **SkillNorth** | Distinctive, directional, brandable | Likely available | Likely available | Likely available | Likely available | Appears available | Appears available / unverified | Good if you want a more brand-like name |
| **AgentScorecard** | Good if the brand should expand beyond skills later | Likely taken | Likely available | Likely available | Likely available | Appears available | Appears available / unverified | Broader, but less focused than skill-first names |
| **SkillWatcher** | Good for monitoring and trending | Likely taken | Likely available | Likely available | Likely available | Appears available | Appears available / unverified | More news/tracking flavored |
| **SkillVector** | More technical, could work for a power-user audience | Likely taken | Likely available | Likely available | Likely available | Appears available | Appears available / unverified | Stronger on the technical side than the review side |

### Focused comparison update (2026-03-10)

| Name | `.com` | `.io` | `.sh` | `.co` | GitHub org | Naming fit | Summary |
|---|---|---|---|---|---|---|---|
| **SkillVerdict** | Likely taken | Likely available | Likely available | Likely available | Appears available | Strong review/trust signal | Good meaning, but the `.com` collision weakens it |
| **SkillJury** | Likely available | Likely available | Likely available | Likely available | Appears available | Very strong review/trust signal | Best mix of brand fit and likely availability |
| **SkillBench** | Likely taken | Likely taken | Likely available | Likely taken | Taken | More benchmarking than review | Too many availability collisions |
| **SkillIndex** | Likely available | Likely available | Likely available | Likely available | Appears available | Strong discovery/catalog signal | Safest broad brand, but less review-specific |
| **SkillScorecard** | Likely taken | Likely available | Likely available | Likely available | Appears available | Strong scoring/review signal | Clear meaning, but longer and weaker on `.com` |

### Updated top 3

#### 1. SkillJury
Why:
- Best fit for a product built around reviews, trust, and public judgment.
- All four tested domains were **likely available** using the DNS check method.
- The matching GitHub org name **appears available**.
- More distinctive than `SkillIndex` while still being easy to understand.

#### 2. SkillIndex
Why:
- Still the safest broad brand for discovery, ranking, and future data/API expansion.
- All four tested domains were **likely available**.
- The matching GitHub org name **appears available**.
- Slightly weaker than `SkillJury` only because it sounds more like a catalog than a review destination.

#### 3. SkillScorecard
Why:
- Very clear about ratings and evaluation.
- GitHub org **appears available** and three of four tested domains were **likely available**.
- The downside is length and the fact that `.com` looks **likely taken**.

### My recommendation
Recommend **SkillJury** as the final name.

Reasoning:
- The product is not just a directory. It is a review and trust layer, and `SkillJury` communicates that immediately.
- Its availability picture is stronger than `SkillVerdict`, `SkillBench`, and `SkillScorecard`.
- `SkillIndex` remains the best fallback if you decide you want a more neutral, data-product style brand.

Availability note:
- These are still **best-effort checks**, not registrar guarantees.
- I cannot verify actual registrar availability or trademark safety from DNS and GitHub checks alone.

### Sources
- [skills.sh homepage](https://skills.sh/)
- [GitHub Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service)

## 2. PRODUCT DEFINITION

### Product vision
Build the public trust and discovery layer for AI agent skills: a place where people can find skills, compare them, review them, understand what they actually do, and decide which ones are worth installing. The product should feel like the missing layer between raw skill repositories and real user confidence. It is not just a directory. It is a reputation system, review system, comparison engine, and SEO/GEO content platform for the skills ecosystem.

### Who uses it

#### Persona 1: The skill user
- A developer, operator, founder, marketer, or power user working with Claude Code, Codex, Copilot, OpenCode, Goose, or other agent environments.
- Their problem: they can find skills, but they cannot easily tell which ones are good, maintained, useful, or safe to try.
- What they want: trusted ratings, real reviews, install guidance, comparisons, and “best skill for X” recommendations.

#### Persona 2: The skill maintainer
- A person or team publishing skills from a GitHub repo or a curated skill collection.
- Their problem: discovery is shallow, reputation is weak, and there is no profile page where community trust can accumulate.
- What they want: a claimed profile, better visibility, user feedback, and proof that their skills are actually valued.

#### Persona 3: The evaluator or buyer
- A team lead, educator, researcher, or technically curious non-coder.
- Their problem: they cannot compare skill options cleanly across sources, and Reddit/GitHub threads are too messy.
- What they want: simple summaries, use-case pages, comparison pages, and confidence signals.

### What makes it different

#### Different from skills.sh
- `skills.sh` is already a useful discovery and telemetry-driven leaderboard, but it does not appear to offer public user reviews, public ratings, public comments, or a trust system built around reviewer quality and maintainer response. It focuses on discovery and install telemetry, not trust or community evaluation. [skills.sh](https://skills.sh/), [skills.sh docs](https://skills.sh/docs), [example skill page](https://skills.sh/onewave-ai/claude-skills/job-application-optimizer)

#### Different from GitHub search
- GitHub search is raw infrastructure, not a decision tool.
- It does not normalize skills into one catalog, does not give structured review data, and does not help non-technical users compare alternatives. [GitHub rate limits docs](https://docs.github.com/en/rest/rate-limit/rate-limit)

#### Different from Reddit threads
- Reddit is scattered, inconsistent, and hard to trust.
- Good advice is buried in old threads with weak structure and poor long-term discoverability.
- Your site turns that messy conversation into structured, searchable, durable pages.

### Core value proposition in one sentence
**The easiest place to discover, compare, and trust AI agent skills before you install them.**

## 3. PAGE ARCHITECTURE (full sitemap plan)

### Public core pages

| Page type | URL structure | What goes on the page | SEO/GEO priority |
|---|---|---|---|
| Homepage | `/` | Value proposition, search bar, trending skills, top-rated skills, newest reviews, featured comparisons, editorial collections | High |
| Search results | `/search?q=...` | Search results with filters for agent, category, source, rating, popularity, review count | High |
| Trending skills | `/trending` | Skills rising in installs, reviews, or engagement | Medium |
| Top rated | `/top-rated` | Highest-rated skills overall and by category/agent | High |
| New skills | `/new` | Recently added or recently synced skills | Medium |
| Skill detail | `/skills/[skill-slug]` | Full metadata, summary, install info, agent compatibility, rating summary, review list, alternatives, comparisons, maintainer block, FAQ | Very high |
| Skill reviews tab/page | `/skills/[skill-slug]/reviews` | Full review feed, filters, rating breakdown, review sorting | High |
| Write review | `/skills/[skill-slug]/review` | Structured review form | Low |
| Compare page (v2) | `/compare/[skill-a]-vs-[skill-b]` | Structured comparison, strengths, use cases, ratings, source metadata, review quotes | Very high |
| Category page | `/categories/[category-slug]` | Top skills in a category, category explainer, comparisons, best-of links | Very high |
| Use-case page | `/use-cases/[use-case-slug]` | Best skills for a practical task such as SEO audit, cover letters, web design, testing | Very high |
| Agent page | `/agents/[agent-slug]` | Best skills for a specific agent environment, compatibility notes, top-rated skills | Very high |
| Source page | `/sources/[source-slug]` | Skills from one ecosystem or source, quality trends, newest additions | Medium |
| Tag page | `/tags/[tag-slug]` | Cross-cutting topic pages such as `open-source`, `marketing`, `frontend`, `job-search` | Medium |
| Collection page | `/collections/[collection-slug]` | Curated lists by site editors or trusted users | High |
| Best-of editorial page | `/best/[topic-slug]` | Editorial + data-backed “best skills for X” pages | Very high |
| Review detail | `/reviews/[review-id]` | Standalone review page for sharing and indexing | Medium |

### User and maintainer pages

| Page type | URL structure | What goes on the page | SEO/GEO priority |
|---|---|---|---|
| User profile | `/users/[username]` | Public profile, reviews written, helpful votes, badges, joined date | Medium |
| Maintainer profile | `/maintainers/[slug]` | Claimed skills, maintainer bio, response history, links | Medium |
| Submit skill | `/submit-skill` | User submission form for new skills | Low |
| Claim skill (v2) | `/claim/[skill-slug]` | Maintainer claim flow | Low |
| Login | `/login` | Magic link sign-in and optional GitHub connect | Low |
| Account dashboard | `/account` | User reviews, submissions, saved skills, badges | No |

### Trust, policy, and education pages

| Page type | URL structure | What goes on the page | SEO/GEO priority |
|---|---|---|---|
| How scoring works | `/how-scores-work` | Explain rating logic, confidence adjustment, review requirements | Medium |
| Review guidelines | `/review-guidelines` | What counts as a useful review, anti-spam rules | Medium |
| Moderation policy | `/moderation-policy` | What gets removed, appealed, or flagged | Medium |
| About | `/about` | Product mission and difference from other discovery methods | Low |
| Privacy | `/privacy` | Privacy policy | No |
| Terms | `/terms` | Terms of use | No |

### Private admin pages

| Page type | URL structure | What goes on the page |
|---|---|---|
| Admin dashboard | `/admin` | High-level moderation and sync metrics |
| Moderation queue | `/admin/moderation` | Pending reviews, comments, claims, submissions, reports |
| Source syncs | `/admin/sources` | Source status, sync runs, errors |
| Users | `/admin/users` | User trust and abuse actions |

### Planned v2 page types

| Page type | URL structure | What goes on the page | SEO/GEO priority | Version |
|---|---|---|---|---|
| Changelog | `/changelog` | Site updates, shipped features, fixes, and public product notes | Medium | v2 |
| Blog | `/blog` and `/blog/[slug]` | Editorial SEO content, ecosystem analysis, best-practice guides, and founder updates | High | v2 |
| API docs placeholder | `/docs/api` | Placeholder page for future API scope, access model, and waitlist/signup CTA | Low | v2 |

### SEO/GEO priority page types
- Skill detail pages
- Comparison pages (v2)
- Category pages
- Use-case pages
- Agent pages
- Best-of editorial pages
- Collection pages with real commentary
- Blog articles (v2)

### Example URLs
- `/skills/job-application-optimizer`
- `/compare/job-application-optimizer-vs-cover-letter` (v2)
- `/categories/job-search`
- `/use-cases/write-a-cover-letter`
- `/agents/claude-code`
- `/sources/skills-sh`
- `/best/best-skills-for-seo-audits`
- `/blog/how-to-review-an-ai-agent-skill`
- `/changelog`
- `/docs/api`

## 4. DATABASE SCHEMA

Below is the plain-English data model. You do not need every feature exposed in the first version, but the database should be designed so you do not need to rebuild it later.

### Users
Purpose:
- Stores the public profile and trust profile for each person using the site.

Fields:
- User ID
- Email
- Username
- Display name
- Avatar URL
- Bio
- GitHub username
- Whether GitHub is linked
- Role (`user`, `moderator`, `admin`)
- Trust score
- Badge summary
- Account status (`active`, `limited`, `suspended`, `banned`)
- Joined date
- Last active date

Relationships:
- One user can write many reviews
- One user can write many comments
- One user can submit many skills
- One user can claim many skills if they are a maintainer
- One user can own many collections

### Sources
Purpose:
- Stores each upstream ecosystem or catalog you ingest from.

Fields:
- Source ID
- Name
- Slug
- Source type (`directory`, `repository`, `marketplace`, `manual`)
- Homepage URL
- Sitemap URL
- API URL if one exists
- Terms URL
- Robots URL
- Attribution text
- Active/inactive status
- Last synced date
- Sync notes

Relationships:
- One source contains many skills
- One source has many sync runs

### Repositories
Purpose:
- Stores GitHub or other repository-level metadata, separate from the skill record.

Fields:
- Repository ID
- Source ID
- Owner name
- Repository name
- Repository URL
- Default branch
- License
- Stars
- Forks
- Open issues count
- Last pushed date
- README excerpt
- Topics/tags from repo
- Last repo sync date

Relationships:
- One repository can back one or many skills
- One repository may be linked to one maintainer org or many maintainers

### Skills
Purpose:
- The central entity of the entire product.

Fields:
- Skill ID
- Name
- Slug
- Short summary
- Long description
- Canonical source URL
- Repository URL
- Documentation URL
- Install command
- Primary source ID
- Repository ID
- Source-specific skill ID
- Status (`active`, `hidden`, `pending`, `deprecated`)
- First seen date
- Last synced date
- Weekly installs, if available publicly
- Total installs, if available publicly
- Review count
- Approved review count
- Overall score
- Confidence-adjusted score
- Claimed/unclaimed status
- FAQ block or generated FAQ content

Relationships:
- One skill belongs to one primary source
- One skill can have many reviews
- One skill can have many comments, comparisons, tags, categories, and collections
- One skill can support many agents

### Agents
Purpose:
- Stores the agent environments the skill works with.

Fields:
- Agent ID
- Name
- Slug
- Vendor name
- Website URL
- Short description
- Logo URL
- Status

Relationships:
- Many agents can connect to many skills through a join table

### Skill-Agent Compatibility
Purpose:
- Connects skills to agents and stores the quality of support.

Fields:
- Skill ID
- Agent ID
- Support type (`listed by source`, `community confirmed`, `maintainer confirmed`)
- Notes
- Last confirmed date

### Categories
Purpose:
- High-level navigation groups such as `job-search`, `seo`, `frontend`, `testing`, `research`.

Fields:
- Category ID
- Name
- Slug
- Description
- Parent category ID if nested
- Display order

Relationships:
- Many categories can connect to many skills

### Tags
Purpose:
- Flexible labels such as `open-source`, `marketing`, `claude-code`, `writing`, `beginner-friendly`.

Fields:
- Tag ID
- Name
- Slug
- Tag type (`topic`, `task`, `agent`, `pricing`, `language`, `signal`)
- Description

Relationships:
- Many tags can connect to many skills
- Many tags can connect to many reviews if you want review-level use-case tagging later

### Reviews
Purpose:
- Stores the structured review itself.

Fields:
- Review ID
- Skill ID
- User ID
- Review title
- Overall rating
- Setup rating
- Documentation rating
- Output quality rating
- Reliability rating
- Value-for-effort rating
- Agent used
- Use case selected
- User experience level (`beginner`, `intermediate`, `advanced`)
- How often they used it
- Would recommend (`yes`, `no`, `with caveats`)
- Pros
- Cons
- Main review body
- Proof-of-use type
- Proof-of-use link or file
- Moderation status
- Published date
- Updated date
- Helpful votes count
- Not helpful votes count
- Maintainer reply count

Relationships:
- One review belongs to one skill and one user
- One review can have many helpful votes, flags, and comments

### Review Votes
Purpose:
- Tracks whether other users found a review helpful.

Fields:
- Vote ID
- Review ID
- User ID
- Vote type (`helpful`, `not_helpful`)
- Created date

### Comments
Purpose:
- Lightweight discussion on reviews or skill pages.

Fields:
- Comment ID
- Target type (`review`, `skill`)
- Target ID
- User ID
- Comment body
- Parent comment ID if threaded later
- Status
- Created date

### Comparisons
Purpose:
- Stores comparison pages and reusable comparison data.

Fields:
- Comparison ID
- Slug
- Skill A ID
- Skill B ID
- Comparison summary
- Best-for-use-case summary
- Score snapshot
- Review count snapshot
- Status
- Last updated date

Relationships:
- Each comparison belongs to two skills

### Collections
Purpose:
- Curated lists such as `Best writing skills for Claude Code`.

Fields:
- Collection ID
- Title
- Slug
- Description
- Owner type (`site`, `user`)
- Owner user ID if user-owned
- Visibility
- Editorial flag
- Featured flag
- Created date
- Updated date

### Collection Items
Purpose:
- The ordered skills inside a collection.

Fields:
- Collection item ID
- Collection ID
- Skill ID
- Sort order
- Short note

### Skill Submissions
Purpose:
- Stores user-submitted skills before or after approval.

Fields:
- Submission ID
- Submitted by user ID
- Source URL
- Repository URL
- Proposed name
- Proposed summary
- Proposed category
- Proposed agent support
- Notes
- Status
- Reviewed by
- Created date

### Maintainer Claims
Purpose:
- Lets maintainers claim a skill profile.

Fields:
- Claim ID
- Skill ID
- User ID
- GitHub username
- Proof method
- Proof text or proof URL
- Status
- Reviewed by
- Created date
- Resolved date

### Reports / Flags
Purpose:
- Stores abuse reports on reviews, comments, skills, or users.

Fields:
- Report ID
- Reporter user ID
- Target type
- Target ID
- Reason
- Notes
- Status
- Created date
- Reviewed by

### Moderation Queue
Purpose:
- The operating table for all human review decisions.

Fields:
- Queue item ID
- Item type (`review`, `comment`, `submission`, `claim`, `report`)
- Item ID
- Priority
- Queue reason
- Suggested action
- Status (`pending`, `approved`, `rejected`, `escalated`)
- Assigned moderator
- Decision notes
- Created date
- Resolved date

### Audit Log
Purpose:
- Stores moderator and admin actions for transparency, debugging, and appeal review.

Fields:
- Audit log ID
- Actor user ID
- Action type
- Target type
- Target ID
- Before summary
- After summary
- Timestamp

Relationships:
- Many audit log entries can belong to one actor user
- Audit log entries can point to users, reviews, comments, submissions, claims, reports, or other moderated records through `target type` and `target ID`

### Sync Runs
Purpose:
- Tracks imports, updates, failures, and source health.

Fields:
- Sync run ID
- Source ID
- Start time
- End time
- Status
- Items found
- Items created
- Items updated
- Errors count
- Notes

## 5. REVIEW SYSTEM DESIGN

### What a review should collect
For v1, the review form should optimize for completion rate first and detail second. The public trust layer only works if enough people actually finish the review form.

Required fields:
- Overall rating (**5 stars**)
- Would recommend (`yes`, `no`, `with caveats`)
- Pros (text)
- Cons (text)

Optional but valuable fields:
- Review title
- Main review text
- Setup rating
- Documentation rating
- Output quality rating
- Reliability rating
- Value-for-effort rating
- Agent used
- Use case
- Experience level
- Proof-of-use screenshot or link
- Approximate date used
- Install method
- Whether the skill is still in use

### Rating system
Use **5-star overall rating** as the only required score in v1.

Why 5 stars:
- Familiar to almost everyone
- Easier for non-technical users
- Works well for aggregate ratings and review snippets
- Better for consumer-style browsing than a 1-10 score
- Keeps the form light enough for early review volume

Optional v1 subratings:
- Overall
- Setup
- Documentation
- Output quality
- Reliability
- Value for effort

### How reviews should display on skill pages
At the top of the skill page:
- Overall score
- Review count
- Rating distribution chart
- “Would recommend” percentage
- Low-confidence warning if review count is small
- Subscore bars only when enough optional subratings exist

Below that:
- Filtered review feed
- Featured review snippets
- Verified or proof-backed review badges
- Maintainer responses where available

### Aggregation logic
Use two numbers:

#### 1. Public headline rating
- Based primarily on the **average overall star rating**
- Apply a **confidence adjustment** when review counts are low, so one 5-star review does not make a skill look “perfect”

Simple plain-English rule:
- If a skill has many reviews, trust the average more
- If a skill has very few reviews, pull the score closer to the site-wide average until more evidence exists

#### 2. Recommendation rate
- Based on the share of users choosing `yes`, `no`, or `with caveats`

Optional subscores:
- Show setup, docs, output quality, reliability, and value-for-effort averages only when enough users filled them in
- Recommended display rule: do not show a subscore until at least **5 approved reviews** include that field

### Review sorting
Default sort:
- `Most helpful`

Other sort options:
- Newest
- Highest rated
- Lowest rated
- Best for beginners
- Best for a chosen agent
- Verified/proof-backed first

### Review filtering
Filters:
- Agent used
- Use case
- Reviewer experience level
- Rating range
- Verified/proof-backed only
- With maintainer responses

Implementation note:
- Agent, use-case, and experience filters should appear only once enough optional review data exists to make them useful.

## 6. TRUST AND MODERATION SYSTEM

### User registration flow
Recommended flow:
1. User enters email
2. User receives a magic link email
3. User creates username and display name after first login
4. User can optionally connect GitHub for stronger trust signals
5. User must pass Turnstile on sensitive actions like posting reviews or submissions

If magic link delivery fails or bounces:
- Show a clear retry message in the UI instead of silently failing
- Allow resend after a short cooldown
- Ask the user to correct the email or try a different address
- Suppress repeated sends to hard-bounced addresses
- Direct the user to contact `[admin email]` if the problem continues

Why this works:
- Very low friction for a solo founder audience
- No password support needed at first
- GitHub connection adds credibility without making it mandatory

Relevant docs:
- [Supabase passwordless email login](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Cloudflare Turnstile plans](https://developers.cloudflare.com/turnstile/plans/)
- [Cloudflare Turnstile get started](https://developers.cloudflare.com/turnstile/get-started/)

### Rate limits
Recommended v1 limits:
- 1 review per skill per user
- 3 new reviews per user per day
- 3 comments per user per day
- 2 skill submissions per user per day for new users
- 5 reports per user per day

Higher-trust users can be relaxed later.

### First-review moderation queue
Recommended rule:
- New accounts have their **first 2 reviews** sent to moderation
- New accounts have their **first 3 comments** sent to moderation
- Accounts younger than 7 days have stricter spam rules

This gives you day-one quality control without moderating every single action forever.

### Spam detection approach
Use layered defenses:
- Email verification
- Turnstile on review, comment, and submission forms
- Daily rate limits
- Duplicate-text similarity checks
- Link count limits
- Disposable email detection
- Repeated submissions from the same IP or browser fingerprint
- Keyword and profanity rules
- Hidden “honeypot” fields on forms
- Manual review queue for suspicious content

### Report / flag system
Let users report:
- Spam
- Fake review
- Off-topic
- Abuse/harassment
- Wrong listing data
- Copyright issue
- Other

Each report becomes a moderation queue item.

### Maintainer claim and response system
Recommended v2 claim flow:
1. User signs in
2. User links GitHub
3. User requests to claim a skill
4. System generates a verification token
5. User proves control by placing the token in a public place tied to the repo or maintainer identity

Proof methods:
- Add the token to the repo README temporarily
- Add it to the maintainer profile README
- Put it in a public GitHub issue or gist from the maintainer account

Once approved, the maintainer can:
- Edit profile details through a change request flow
- Reply publicly to reviews
- Suggest metadata fixes

Why v2:
- Claiming and verification add meaningful moderation and product complexity
- The launch version can work without it as long as listings, reviews, submissions, and moderation are solid

### Badge system
Recommended starting badges:
- Verified maintainer
- GitHub linked
- Proof-backed reviewer
- Top reviewer
- Early contributor
- Trusted reviewer

### What happens when abuse is detected
Sequence:
1. Hide the content from public view
2. Queue it for moderation
3. Warn the user or limit posting
4. Suspend the account if abuse continues
5. Ban the account and block future posting if needed

For serious abuse:
- Remove the content
- Lock the account immediately
- Preserve moderation logs for appeal review

### Appeal process
Keep the first version simple:
- Suspended or banned users can appeal by emailing `[admin email]`
- The appeal should include the account email, approximate action date, and why the user believes the decision was wrong
- Each appeal becomes a moderation queue item and should also create an audit-log entry

### Inspiration from large review platforms
- Trustpilot publicly explains multiple review sources and fraud detection as part of review quality management. [Trustpilot review sources](https://support.trustpilot.com/hc/en-us/articles/4406174222482-What-are-the-different-review-sources-on-Trustpilot), [Trustpilot fake review detection](https://support.trustpilot.com/hc/en-us/articles/360001389867-How-does-Trustpilot-detect-fake-reviews)
- G2 emphasizes authenticity and moderation in its review ecosystem. [G2 + SAP review syndication](https://learn.g2.com/g2-partners-with-sap)

## 7. DATA INGESTION PLAN

### How to get initial skill listings
Phase 1 source strategy:
- Start with **skills.sh** because it already aggregates broadly and exposes a public sitemap plus public skill pages. [skills.sh sitemap](https://skills.sh/sitemap.xml), [skills.sh docs](https://skills.sh/docs)
- Pull each skill page URL from the sitemap
- Parse the public metadata from each page
- Enrich with GitHub repository metadata where available

### Initial ingestion method
Recommended approach:
- Build one import script that:
  - pulls the sitemap
  - fetches skill page URLs
  - extracts public fields
  - stores a raw snapshot
  - normalizes the fields into your database

Automation level:
- Semi-automated from day one
- Fully automated daily sync after the first clean import works

### How to keep listings updated
Daily sync process:
- Run one daily sync job
- Re-fetch changed sitemap items
- Re-sync public metadata
- Pull updated repo metadata from GitHub
- Store a sync log with failures

Why daily is enough at first:
- You do not need real-time sync for a review/discovery product
- Vercel Hobby cron jobs can run daily, which fits the current budget and scale. [Vercel cron pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing)

### Dependency risk: `skills.sh` availability
Important risk:
- The initial ingestion pipeline depends on `skills.sh` keeping its sitemap public and parseable
- If `skills.sh` changes its structure, rate limits more aggressively, or blocks access, the catalog pipeline can break

Mitigation:
- Store raw sync snapshots from every ingestion run so parser changes can be debugged without losing historical input
- Build the user-submission flow early so the catalog can keep growing even if the upstream source changes
- Plan direct GitHub-based skill discovery as a **v2** secondary source rather than relying on one upstream catalog forever

### How to handle user-submitted skills
Flow:
1. User submits skill URL and repository URL
2. System attempts to prefill metadata
3. Submission enters moderation queue
4. Admin approves, edits, or rejects
5. Approved skill becomes public

### Metadata to pull from source repos
Recommended fields:
- Repo owner and name
- Description
- Stars
- Forks
- Open issues count
- License
- Default branch
- Last commit date
- README excerpt
- Topics/tags
- Homepage/docs URL

Optional later:
- Releases
- Contributors
- Commit frequency trend
- Repository health score

### Legal and rights considerations
Recommended operating rule:
- Store and display **facts, links, summaries, and limited excerpts**
- Do **not** mirror full README content or other full texts unless the license clearly permits it
- Always link back to the canonical source
- Respect robots files, rate limits, and source terms
- Offer a takedown/correction request flow

Important limit:
- I cannot verify public reuse rights for every possible source platform without checking each platform and repo license individually.

Relevant references:
- [GitHub rate limit docs](https://docs.github.com/en/rest/rate-limit/rate-limit)
- [GitHub Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service)

## 8. TECH STACK RECOMMENDATION

### Frontend framework: Next.js
Why it fits:
- Best fit for Vercel
- Strong SEO support
- One codebase for public pages, dashboards, APIs, and admin pages
- Easy for Codex to generate and maintain over time

### Backend/API approach: Next.js Route Handlers + Server Actions
Why it fits:
- Keeps frontend and backend in one project
- Simpler for a solo founder than managing a separate backend service
- Good enough for CRUD, auth flows, moderation tools, and sync endpoints

### Database: Supabase Postgres
Why it fits:
- Postgres is flexible enough for catalog data, reviews, moderation, and search
- Supabase is one of the simplest ways to get hosted Postgres plus auth and storage without wiring many separate services
- It has a generous free plan for early-stage work. [Supabase pricing](https://supabase.com/pricing)

### Auth provider: Supabase Auth
Why it fits:
- Supports magic-link email login and GitHub OAuth
- Integrates tightly with Postgres and row-level permissions
- Removes the need for a separate auth vendor at launch

Relevant docs:
- [Supabase Auth overview](https://supabase.com/docs/guides/auth)
- [Supabase passwordless email login](https://supabase.com/docs/guides/auth/auth-email-passwordless)

### Hosting: Vercel Hobby first, Pro later
Why it fits:
- You already use Vercel
- Great developer workflow with Next.js
- Free for personal projects
- Upgrade to Pro once the site becomes commercial or traffic grows

Important caveat:
- Vercel’s Hobby plan is described as being for personal, non-commercial use. Once you start monetizing seriously, plan to upgrade. [Vercel pricing](https://vercel.com/pricing), [Vercel Hobby plan](https://vercel.com/docs/plans/hobby)

### Search functionality: Postgres full-text search first
Why it fits:
- No extra search bill
- Good enough for v1 and early growth
- Supports name, summary, tags, categories, agents, and review text search

Relevant docs:
- [Supabase full-text search](https://supabase.com/docs/guides/database/full-text-search)

### Spam protection: Cloudflare Turnstile
Why it fits:
- Free plan available
- Less annoying than old-style CAPTCHAs
- Works independently of Cloudflare hosting

Relevant docs:
- [Turnstile overview](https://developers.cloudflare.com/turnstile/)
- [Turnstile plans](https://developers.cloudflare.com/turnstile/plans/)

### Scheduled syncs: Vercel Cron or GitHub Actions
Recommendation:
- Start with **one daily Vercel cron job**
- If you later need more complex sync logic, move heavy sync jobs to GitHub Actions

Why:
- Daily sync is enough at first
- Vercel Hobby supports daily cron jobs, which fits the use case. [Vercel cron pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing)

### File and image storage: Supabase Storage
Use it for:
- Proof-of-use uploads
- Skill logos or cached assets
- Small moderation evidence attachments

### Analytics
Recommendation:
- Keep analytics simple at first
- Track key events in your database and use Vercel logs
- Add a dedicated analytics product later if needed

### Final stack recommendation
- **Frontend:** Next.js
- **Backend:** Next.js Route Handlers + Server Actions
- **Database:** Supabase Postgres
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Spam protection:** Cloudflare Turnstile
- **Hosting:** Vercel
- **Search:** Postgres full-text search
- **Scheduled jobs:** Vercel daily cron

This stack is the best fit for a solo non-coder using Codex because it keeps the system small, cheap, and understandable.

## 9. SEO AND GEO STRATEGY

### Target keyword categories
Primary keyword families:
- `[skill name] review`
- `[skill name] rating`
- `[skill name] alternative`
- `[skill A] vs [skill B]`
- `best skills for [task]`
- `best [agent] skills`
- `[category] skills`
- `top rated [category] skills`
- `[source] skills`

Examples:
- `job application optimizer review`
- `best skills for cover letters`
- `best claude code skills`
- `seo audit skill reviews`
- `cover letter skill vs job application optimizer`

### Page types that will rank
Highest-value pages:
- Skill detail pages
- Comparison pages (v2)
- Use-case pages
- Category pages
- Agent pages
- Best-of editorial pages
- Collection pages with original commentary
- Blog posts (v2)

### Programmatic meta title and description templates

#### Homepage
- Title: `AI Agent Skill Reviews, Ratings & Discovery | [SiteName]`
- Description: `Discover AI agent skills, read user reviews, compare options, and find the best skills for coding, marketing, research, writing, and more.`

#### Skill detail pages
- Title: `[Skill Name] Review - Ratings, Alternatives & User Reviews | [SiteName]`
- Description: `Read [Skill Name] reviews, overall rating, pros and cons, agent compatibility, and alternatives before you install it.`

#### Category pages
- Title: `Best [Category Name] Skills - Reviews, Ratings & Top Picks | [SiteName]`
- Description: `Browse top [Category Name] skills, compare ratings, and discover the best-reviewed options for your workflow.`

#### Use-case pages
- Title: `Best Skills for [Use Case] - Reviews, Comparisons & Top Picks | [SiteName]`
- Description: `Find the best skills for [Use Case], with ratings, review summaries, and alternatives across the skills ecosystem.`

#### Agent pages
- Title: `Best [Agent Name] Skills - Reviews, Ratings & Compatibility | [SiteName]`
- Description: `Explore skills that work with [Agent Name], including ratings, compatibility notes, and top reviewed options.`

#### Source pages
- Title: `[Source Name] Skills - Reviews, Ratings & Directory | [SiteName]`
- Description: `See skills sourced from [Source Name], with review coverage, popularity signals, and category breakdowns.`

#### Review detail pages
- Title: `[Skill Name] Review by [Reviewer Name] | [SiteName]`
- Description: `Read a detailed user review of [Skill Name], including rating, pros, cons, and recommendation status.`

#### Comparison pages (v2)
- Title: `[Skill A] vs [Skill B] - Reviews, Ratings & Differences | [SiteName]`
- Description: `Compare [Skill A] and [Skill B] side by side using ratings, review summaries, and use-case fit.`

#### Blog posts (v2)
- Title: `[Article Title] | [SiteName] Blog`
- Description: `[Article excerpt or manually written summary for the specific post.]`

### Social sharing metadata
Add Open Graph and Twitter Card tags to all public pages.

Recommended baseline tags:
- `og:title`
- `og:description`
- `og:url`
- `og:type`
- `og:image`
- `og:site_name`
- `twitter:card`
- `twitter:title`
- `twitter:description`
- `twitter:image`

Implementation note:
- Use one default social image first, then add dynamic images for skill pages and editorial pages later if time allows.

### Schema markup plan
Use schema carefully and honestly.

#### Skill pages
- `SoftwareApplication`
- `Review`
- `AggregateRating`
- `FAQPage`
- `BreadcrumbList`

#### Category and best-of pages
- `ItemList`
- `BreadcrumbList`
- `FAQPage`

#### Organization/site pages
- `Organization`

Important note:
- Only show `AggregateRating` and `Review` markup where there are genuine first-party reviews and the page clearly matches Google’s structured data expectations. [Google review snippet docs](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)

### Internal linking strategy
Every skill page should link to:
- its source page
- its agent pages
- related categories
- related tags
- comparison pages
- alternative skills
- collections it appears in
- its maintainer page if claimed

Every category and use-case page should link down to:
- top skills
- comparisons
- related categories
- best-of pages

This creates a strong internal graph for both search engines and AI answer systems.

### Content strategy for empty-state pages
Before reviews exist, pages should still be useful.

Use these content blocks:
- clear summary of what the skill does
- install information
- source metadata
- repo metadata
- agent compatibility
- category placement
- editorial note explaining who it may help
- “No community reviews yet” prompt
- comparison links

This avoids “thin page” problems.

### GEO / AI discoverability approach
Make pages easy for AI systems to summarize.

Do this by:
- using clean headings
- giving each page a short plain-language summary
- adding structured pros/cons
- adding “best for” and “not ideal for” blocks
- showing source provenance
- showing last updated date
- creating comparison pages with direct answers
- including FAQs that answer natural-language questions

The goal is that an AI system can answer:
- what this skill does
- who it is for
- whether users like it
- how it compares with alternatives
- what agent it works with

## 10. MONETIZATION PLAN

### Phase 1: €0 revenue, build trust first
Goal:
- Build listings, reviews, and search traffic
- Prove users will submit reviews and return

Allowed monetization in this phase:
- None, or only a very light waitlist for future premium features

What matters most:
- review quality
- page quality
- trust
- indexation

### Phase 2: first revenue streams
Best early options:
- Clearly labeled sponsored placements
- Premium claimed profiles for maintainers
- Paid featured collections or category placement
- Affiliate links where the skill connects to a paid platform or tool
- Newsletter sponsorships

Why these are good:
- Low operational complexity
- High fit for a discovery product
- No need for a sales team at first

### Phase 3: scaling revenue
Options:
- Pro maintainer accounts
- API access for catalog and review data
- Paid alerts and analytics
- Sponsored comparison pages
- Data exports for research teams
- Display ads only if traffic becomes large enough

### Specific monetization options

#### Ads
Good later, not early.

Why:
- Small traffic does not pay much
- Too many ads will damage trust before the brand is established

#### Premium listings
Good if:
- clearly labeled
- they do not change the organic rating logic

#### Sponsored placements
Good if:
- marked as sponsored
- placed in separate slots
- never mixed into “top rated” or “best reviewed” without labels

#### Affiliate links
Good if:
- the affiliate relationship is disclosed
- the destination is relevant

#### Pro accounts
Good later for:
- maintainers
- agencies
- researchers

#### API access
Very promising later:
- skill catalog API
- review summary API
- trend API
- source comparison API

### What to avoid early
- Selling ratings
- “Pay to remove bad reviews”
- Unlabeled sponsored rankings
- Heavy display ads
- Gated reviews
- Fake scarcity or fake trust badges

Trust is the business. Do not damage it for short-term revenue.

## 11. MVP SCOPE DEFINITION

Even though the long-term vision is large, you still need a first version that is usable, impressive, and realistic.

### What goes in v1
- Homepage
- Search page
- Skill detail pages
- Category pages
- Agent pages
- Source pages
- Review submission flow
- Structured review display
- Rating aggregation
- "I want to review this skill" / "Request a review" CTA on every skill page
- User login with magic link
- Optional GitHub connect
- Skill submission form
- Admin moderation queue
- Daily ingestion from skills.sh
- Basic SEO setup:
  - sitemap
  - robots
  - meta tags
  - schema on skill pages

### What is explicitly v2 and later
- Comparison pages
- Claim skill flow
- Public comments
- Public reviewer profiles with deeper stats
- Rich maintainer dashboards
- User-owned collections
- Follower system
- Email notifications
- Public API
- `/changelog`
- `/blog` and blog post pages
- `/docs/api`
- Advanced analytics pages
- Reputation scoring beyond basic badges
- Multi-source ingestion beyond the initial core pipeline
- Rich trend charts

### Estimated number of pages/components Codex needs to build
Estimated v1 route groups:
- 10 to 13 public route groups
- 3 to 4 private/admin route groups

Estimated reusable components:
- 28 to 38 reusable UI components

Examples:
- search bar
- filter sidebar
- skill card
- rating summary
- review card
- review form
- request-review CTA
- source badge
- review distribution chart
- moderation queue table
- submission form

### Suggested build order

#### First
- Name decision
- Database schema
- Auth setup
- Core ingestion pipeline
- Basic homepage and skill pages

#### Second
- Search and filtering
- Review form and rating aggregation
- Category, agent, and source pages

#### Third
- Admin moderation tools
- Skill submission flow
- Request-review CTA and lightweight engagement tracking
- SEO schema and sitemap polish

#### Fourth
- Comparison pages
- Claim skill flow
- `/changelog`, `/blog`, and `/docs/api`
- Editorial best-of pages
- Collections

## 12. RISKS AND HONEST CONCERNS

| Risk | Why it matters | Mitigation |
|---|---|---|
| Cold start: no reviews yet | A review site with empty pages feels dead | Seed pages with strong source metadata, editorial summaries, and visible request-review CTAs; recruit first reviewers manually |
| Legal risk from aggregation | Public data does not mean unlimited reuse rights | Store facts and short summaries, link back to source, respect robots/terms, add takedown flow |
| Spam and fake reviews | This can destroy trust quickly | Use magic link auth, Turnstile, rate limits, moderation queue, proof-backed reviews, abuse actions |
| Solo maintenance burden | Public directories and moderation both create ongoing work | Keep v1 scope tight, automate daily syncs, keep moderation simple and visible |
| Too much complexity too early | A bloated first version may never launch | Build the trust core first: listings, reviews, moderation, search, and submissions |
| Weak differentiation | If it feels like a clone of skills.sh, it will not matter | Lead with reviews, trust signals, comparisons, maintainer claims, and best-of/use-case pages |
| Monetizing too early | Users will distrust rankings if money appears before trust | Delay paid placement until the review system feels real and transparent |
| Vercel Hobby limitation | Hobby is for personal, non-commercial use and has limited cron behavior | Build on Hobby first, then upgrade to Pro once monetization or traffic becomes real |

### What could kill this project
- No one submits reviews
- Review quality is poor
- The product becomes a shallow mirror of existing listings
- You cannot keep moderation under control
- You monetize in a way that makes the site feel untrustworthy

### Best mitigation
Treat trust as the core product, not a feature.

## 13. COMPETITIVE POSITIONING

### How this is different from skills.sh
- `skills.sh` is a strong catalog and telemetry leaderboard
- Your product would be the **trust, review, and comparison layer**
- That means:
  - real user reviews
  - ratings
  - proof-backed trust signals
  - maintainer claims
  - comparison pages
  - use-case pages
  - review-driven SEO/GEO pages

### How this is different from GitHub search
- GitHub search finds repositories
- Your site helps people decide what to use

### How this is different from Reddit/forum threads
- Reddit is conversational but fragmented
- Your site is structured, searchable, durable, and designed for decision-making

### One-line positioning statement
**The trusted review and discovery platform for AI agent skills.**

## NEXT STEPS

Before building starts, review and approve these decisions:

1. **Name and domain**
- Default recommendation: `SkillJury`
- Fallback if you want a more neutral brand: `SkillIndex`

2. **v1 scope**
- v1 should stay focused on:
  - listings
  - reviews
  - moderation
  - submissions
  - request-review CTAs
- Keep comparisons, claim flow, comments, collections, `/blog`, `/changelog`, and `/docs/api` in v2

3. **Review model**
- Approve the simplified v1 review form:
  - required: overall rating, would recommend, pros, cons
  - optional: subratings, agent used, use case, experience level, proof of use, long-form body

4. **Trust model**
- Approve:
  - magic-link login
  - optional GitHub linking
  - 3 comments/day
  - 3 reviews/day
  - first reviews in moderation
  - magic-link bounce handling
  - appeals by email to `[admin email]`

5. **Data source policy**
- Approve starting with `skills.sh` plus GitHub enrichment, while planning:
  - raw sync snapshots on every run
  - early user-submission coverage
  - direct GitHub-based discovery as a v2 fallback source

6. **Tech stack**
- Approve:
  - Next.js
  - Supabase
  - Vercel
  - Cloudflare Turnstile

7. **Commercial policy**
- Approve the rule that paid placement can never directly change review scores or unlabeled rankings.

Once you approve those seven items, the next planning step should be a **build-ready PRD plus phased implementation checklist**, and then I can start scaffolding the actual product.

