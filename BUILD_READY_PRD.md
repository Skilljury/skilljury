# BUILD_READY_PRD

This document converts the approved product plan into a build-ready implementation checklist.

Working assumptions:
- Working product name: `SkillJury`
- Fallback name if branding changes before build: `SkillIndex`
- Stack: Next.js, Supabase, Vercel, Cloudflare Turnstile
- Scope here is **v1 only**
- Explicitly deferred to v2: comparison pages, claim-skill flow, `/changelog`, `/blog`, `/docs/api`

## Phase 1: Foundation and Read-Only Catalog

### Goal
Stand up the project foundation, core database, and ingestion pipeline so the site can show real skill listings in a read-only public alpha.

### What gets built
- Next.js project structure and shared layout
- Supabase connection and initial database schema for catalog data
- `skills.sh` ingestion script with GitHub enrichment
- Raw sync snapshot storage for each ingestion run
- Homepage and read-only skill detail pages
- Global SEO plumbing: metadata helper, sitemap, robots, canonical URLs, Open Graph, Twitter Card defaults

### Files, routes, and components needed

#### App routes
- `app/layout.tsx`
- `app/page.tsx`
- `app/skills/[skillSlug]/page.tsx`
- `app/robots.ts`
- `app/sitemap.ts`
- `app/not-found.tsx`

#### API and background routes
- `app/api/cron/sync/route.ts`

#### Database and backend files
- `supabase/migrations/001_core_catalog.sql`
- `supabase/migrations/002_taxonomy_and_indexes.sql`
- `lib/supabase/server.ts`
- `lib/supabase/client.ts`
- `lib/db/skills.ts`
- `lib/db/sources.ts`
- `lib/seo/metadata.ts`
- `lib/ingestion/skillsShParser.ts`
- `lib/ingestion/githubRepoMeta.ts`
- `scripts/sync-skills-sh.ts`
- `scripts/run-manual-sync.ts`

#### Components
- `components/layout/SiteHeader.tsx`
- `components/layout/SiteFooter.tsx`
- `components/home/Hero.tsx`
- `components/skills/SkillCard.tsx`
- `components/skills/SkillHero.tsx`
- `components/skills/SkillMetaPanel.tsx`
- `components/skills/SkillEmptyReviewState.tsx`
- `components/ui/Badge.tsx`

### Database scope in this phase
Create these entities first:
- Sources
- Repositories
- Skills
- Agents
- Skill-Agent Compatibility
- Categories
- Tags
- Collection support can wait
- Sync Runs

Also decide where raw sync snapshots live:
- Preferred: Supabase Storage bucket such as `sync-raw`
- Minimum requirement: every sync run stores a recoverable raw input snapshot

### Dependencies
- None. This is the starting phase.

### Definition of done
- Local development environment runs cleanly
- Supabase schema is applied successfully
- A manual sync imports real skills from `skills.sh`
- Skill detail pages render real database content
- The homepage renders at least one live listing block
- Default metadata, sitemap, and robots output correctly

### What can be tested after this phase
- Manual ingestion run
- Broken parser handling
- Skill detail page rendering for existing and missing slugs
- SEO basics: page titles, descriptions, canonical tags, Open Graph tags

### What can be shipped after this phase
- A private or invite-only read-only alpha with real catalog data

## Phase 2: Discovery Surface and Public Browse

### Goal
Turn the catalog into a browsable public discovery site with search, taxonomy pages, and indexable landing pages.

### What gets built
- Search page with database-backed query and filtering
- Category, agent, and source pages
- Top-rated, new, and trending listing pages
- Programmatic metadata templates for major public page types
- Internal linking blocks that connect skills to categories, agents, and sources

### Files, routes, and components needed

#### App routes
- `app/search/page.tsx`
- `app/categories/[categorySlug]/page.tsx`
- `app/agents/[agentSlug]/page.tsx`
- `app/sources/[sourceSlug]/page.tsx`
- `app/top-rated/page.tsx`
- `app/new/page.tsx`
- `app/trending/page.tsx`

#### Backend and query files
- `lib/db/search.ts`
- `lib/db/categories.ts`
- `lib/db/agents.ts`
- `lib/db/sourcePages.ts`
- `lib/seo/titleTemplates.ts`

#### Components
- `components/search/SearchBar.tsx`
- `components/search/FilterPanel.tsx`
- `components/search/ResultGrid.tsx`
- `components/listing/SortSelect.tsx`
- `components/categories/CategoryHero.tsx`
- `components/agents/AgentHero.tsx`
- `components/sources/SourceHero.tsx`
- `components/skills/RelatedSkills.tsx`
- `components/skills/TaxonomyLinks.tsx`

### Database scope in this phase
Use and refine the Phase 1 catalog tables. Add indexes needed for:
- Full-text search
- Slug lookups
- Category, agent, and source filtering

### Dependencies
- Depends on Phase 1 schema and imported data

### Definition of done
- Search returns real skill results from the database
- Category, agent, and source pages render correctly
- `top-rated`, `new`, and `trending` pages work with stable sorting rules
- Metadata templates apply correctly across all public browse pages
- Every skill page links back to its category, agent, and source context

### What can be tested after this phase
- Search relevance and empty-state behavior
- Filter combinations
- Slug routing for category, agent, and source pages
- Metadata output for each page template

### What can be shipped after this phase
- A public read-only beta that can already start getting indexed

## Phase 3: Auth, Reviews, and Moderation Core

### Goal
Add the trust layer: user auth, lightweight review creation, public review display, moderation workflow, and audit logging.

### What gets built
- Magic-link email login
- Optional GitHub account linking
- Review form with low-friction v1 required fields
- Optional advanced review fields behind a progressive disclosure section
- Public review feed and rating aggregation
- Moderation queue for new reviews and suspicious content
- Audit log for moderator and admin actions
- Turnstile, rate limits, and bounce-handling UI for failed magic-link delivery

### Files, routes, and components needed

#### App routes
- `app/login/page.tsx`
- `app/account/page.tsx`
- `app/skills/[skillSlug]/review/page.tsx`
- `app/skills/[skillSlug]/reviews/page.tsx`
- `app/admin/moderation/page.tsx`

#### API, auth, and backend files
- `app/auth/callback/route.ts`
- `app/api/reviews/route.ts`
- `app/api/moderation/route.ts`
- `lib/auth/session.ts`
- `lib/auth/guards.ts`
- `lib/reviews/createReview.ts`
- `lib/reviews/getSkillReviews.ts`
- `lib/reviews/aggregateRatings.ts`
- `lib/moderation/rateLimits.ts`
- `lib/moderation/auditLog.ts`
- `lib/moderation/queue.ts`

#### Database migrations
- `supabase/migrations/003_users_and_reviews.sql`
- `supabase/migrations/004_moderation_and_audit.sql`

#### Components
- `components/auth/MagicLinkForm.tsx`
- `components/auth/GitHubConnectButton.tsx`
- `components/reviews/ReviewForm.tsx`
- `components/reviews/OptionalDetailFields.tsx`
- `components/reviews/ReviewCard.tsx`
- `components/reviews/ReviewList.tsx`
- `components/reviews/RatingDistribution.tsx`
- `components/reviews/RecommendationSummary.tsx`
- `components/admin/ModerationQueueTable.tsx`
- `components/admin/ModerationActionBar.tsx`

### Database scope in this phase
Create these entities:
- Users
- Reviews
- Review Votes
- Moderation Queue
- Audit Log

Do not build comments yet.

### Dependencies
- Depends on Phase 1 skill pages and Phase 2 browse pages
- Review creation cannot ship before user auth, moderation queue, and audit log are working

### Definition of done
- Users can sign in with magic link
- GitHub linking works as an optional trust signal
- Review form requires only overall rating, would recommend, pros, and cons
- Optional review fields save correctly when used
- New-user review moderation rules work
- Approved reviews appear publicly on skill pages
- Moderator actions create audit-log entries
- Bounce and resend states are visible in the login flow

### What can be tested after this phase
- Sign-in flow, resend flow, and bounced-email handling
- Review creation, validation, and moderation approval/rejection
- Aggregate rating and recommendation calculations
- Rate limits and Turnstile enforcement
- Audit-log creation for moderator actions

### What can be shipped after this phase
- A reviewer beta or limited public review launch

## Phase 4: Submission Loop, Safety Pages, and V1 Launch Readiness

### Goal
Make the product self-feeding and launch-safe by adding user submissions, request-review prompts, policy pages, and final launch checks.

### What gets built
- Skill submission form and moderation path
- Request-review CTA on every skill page
- Report/flag flow for bad reviews or bad listing data
- Public trust pages: how scoring works, review guidelines, moderation policy
- About, privacy, and terms pages
- Final launch QA for SEO, indexing, and operational safety

### Files, routes, and components needed

#### App routes
- `app/submit-skill/page.tsx`
- `app/how-scores-work/page.tsx`
- `app/review-guidelines/page.tsx`
- `app/moderation-policy/page.tsx`
- `app/about/page.tsx`
- `app/privacy/page.tsx`
- `app/terms/page.tsx`

#### API and backend files
- `app/api/submissions/route.ts`
- `app/api/reports/route.ts`
- `lib/submissions/createSubmission.ts`
- `lib/submissions/prefillFromUrl.ts`
- `lib/reports/createReport.ts`
- `lib/seo/schema.ts`
- `lib/analytics/events.ts`

#### Database migrations
- `supabase/migrations/005_submissions_and_reports.sql`

#### Components
- `components/submissions/SubmitSkillForm.tsx`
- `components/skills/RequestReviewButton.tsx`
- `components/reports/ReportDialog.tsx`
- `components/policies/PolicyPageLayout.tsx`
- `components/ui/EmptyStatePrompt.tsx`
- `components/ui/Toast.tsx`

### Database scope in this phase
Create these entities:
- Skill Submissions
- Reports / Flags

Make sure submission approvals and report resolutions feed into:
- Moderation Queue
- Audit Log

### Dependencies
- Depends on Phase 3 auth, moderation, and audit logging
- Submission flow should reuse the moderation tooling already built for reviews

### Definition of done
- Users can submit a new skill URL and repository URL
- Submissions land in moderation with prefilled metadata when available
- Every skill page shows a clear request-review CTA
- Users can report a bad review or incorrect listing data
- Trust and policy pages are public and linked in the footer
- All public pages have metadata, Open Graph tags, and Twitter Card tags
- V1 smoke tests pass on a production preview deployment

### What can be tested after this phase
- Submission form validation and moderator approval flow
- Request-review CTA behavior for logged-in and logged-out users
- Report/flag creation and moderation resolution
- Footer navigation and policy page rendering
- Preview deployment crawl check: sitemap, robots, canonical tags, metadata, social tags

### What can be shipped after this phase
- Public v1 launch

## Phase Dependencies Summary

### Phase 1 -> Phase 2
Phase 2 requires imported catalog data, slugs, and base routing from Phase 1.

### Phase 2 -> Phase 3
Phase 3 requires live skill pages and browse pages so reviews have real entities to attach to.

### Phase 3 -> Phase 4
Phase 4 depends on auth, moderation, and audit logging so submissions and reports can reuse the same trust workflow.

## V1 Done Checklist

V1 is done only when all of the following are true:
- Real skills are imported from `skills.sh`
- Search, category, agent, and source pages all work
- Users can sign in with magic link
- Users can leave lightweight reviews
- Moderation queue and audit log work
- Users can submit new skills
- Every skill page has a request-review CTA
- Public policy pages are live
- Public pages include metadata, Open Graph tags, Twitter Card tags, robots, and sitemap output
- The site can be deployed on Vercel with working Supabase integrations

## Explicitly Not in V1

Keep these out of the first build unless scope is intentionally expanded:
- Comparison pages
- Claim-skill flow
- Public comments
- Collections
- `/changelog`
- `/blog`
- `/docs/api`
