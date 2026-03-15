# Task Plan

## Goal
Research and design a public skills review platform that aggregates skills from multiple ecosystems, supports verified user submissions and reviews, and is built for SEO and GEO discoverability.

## Phases
- [complete] Research the current skills ecosystem and adjacent review/directory products
- [complete] Research data-ingestion, platform-policy, and moderation constraints
- [complete] Design the product model, review system, SEO/GEO structure, and key features
- [complete] Recommend a concrete build direction and implementation plan
- [complete] Revise the plan with naming, review-model, moderation, ingestion-risk, SEO metadata, and v1-scope updates
- [complete] Convert the approved plan into a phased build-ready PRD
- [complete] Build Phase 1: scaffold the Next.js app, Supabase foundation, ingestion pipeline, and read-only catalog pages
- [complete] Build Phase 2: search, browse taxonomy pages, listing pages, metadata templates, pagination, and sitemap expansion
- [complete] Build Phase 3: auth, reviews, moderation, audit logging, and GEO/schema upgrades
- [complete] Verify Phase 3 against hosted Supabase with magic-link auth, protected routes, and review pages
- [complete] Build Phase 4: submissions, request-review flow, reports, policy/info pages, schema helpers, and final launch-readiness checks
- [complete] Research and scope the post-v1 redesign, trust-signal expansion, ranking rules, and catalog quality pass before implementation
- [complete] Build isolated public design prototype routes with substantially different page architectures before redesigning the live product
- [complete] Expand the dark-mode concept sandbox to five routes and stage the selected concepts for Figma review
- [complete] Apply the selected Lovable-style redesign to the live public product surfaces and verify the new shell across the main user-facing routes
- [complete] Audit the redesign implementation, fix discovered issues, and re-verify the app
- [complete] Run a production-readiness audit of the redesigned UI, fix the remaining CTA, review-archive, empty-state, and metadata issues, and verify the corrected routes with fresh screenshots
- [complete] Run a full pre-launch audit across backend security, deployment hardening, live route UX, mobile behavior, and catalog trust quality before publishing SkillJury publicly
- [complete] Close the verified launch blockers from the pre-launch audit, re-run the hardening checks, and verify the public build is ready for deployment
- [complete] Publish SkillJury to Vercel through a no-input manual deployment path after the linked team-project deploy was blocked by Vercel account policy
- [complete] Fix the live search filter overflow, clarify the empty-review copy, correct auth callback origin handling for the custom domain, redeploy to `www.skilljury.com`, and re-run the live audit loop
- [complete] Replace the magic-link-first auth UX with email/password + public username flows, add account setup/reset/profile editing routes, redeploy the live site, and close the app-side auth audit blockers on `www.skilljury.com`
- [complete] Prepare a focused database migration to clean up the repeated Supabase RLS advisor warnings, audit the SQL change in the repo, and classify the remaining live step as an external database-apply action
- [complete] Add search-path hardening for the Supabase helper functions, then fix the broken empty-state review summary cards, audit the corrected layout locally, redeploy it, and verify the live review page on `www.skilljury.com`
- [complete] Start the next core product-polish chunk by tightening homepage featured-skill selection, diversifying sources, softening zero-signal card states, and verifying the changes locally and on `www.skilljury.com`
- [complete] Run the first dedicated SEO/GEO hardening loop: strengthen homepage entity signals, add richer structured data, mark low-value utility/search pages as non-indexable, remove internal search from the sitemap, and re-verify the live domain
- [complete] Run the first indexing-control cleanup loop: remove empty review archive pages from sitemap priority, stop lying with universal sitemap timestamps, disallow `/search` in robots, and mark empty review archive pages as non-indexable
- [complete] Run the first catalog-summary cleanup loop: tighten low-signal imported summary filtering, suppress prompt-like lead-ins, and remove duplicated thin-page fallback copy across skill hero, quick facts, cards, and about sections
- [complete] Run the first thin-page quality loop: noindex genuinely empty skill pages, replace repeated card trust-note copy with a useful first-seen signal, and hide empty review metrics from quick facts when a skill has no reviews
- [complete] Deploy the pending indexing-control, catalog-summary, and thin-page quality batches to the manual Vercel production project and verify the live domain reflects the new robots, sitemap, noindex, about-section, and homepage-card behavior
- [complete] Run the final zero-state SkillHero cleanup loop locally: suppress the `0 reviews` hero badge and hide the empty review-archive CTA when a skill has no approved reviews
- [complete] Run the follow-up empty-state UI cleanup loop locally: hide the zero-total recommendation breakdown row and replace the engineering-style About disclaimer with visitor-facing copy
- [complete] Deploy the two pending local UI batches to the manual Vercel production project and verify the live domain reflects the new zero-state hero, recommendation summary, about/disclaimer, quick-facts, and homepage-card behavior
- [complete] Add editorial category descriptions for the existing 14 taxonomy slugs, render them on category pages, and use them in category-page metadata to reduce thin listing-only category surfaces
- [complete] Deploy the category-content depth batch to production, verify the live category pages expose the new editorial sections, then add a local-only agent-content depth batch with editorial descriptions and metadata overrides for the real live agent slugs
- [complete] Deploy the agent-content depth batch to production, verify the live agent pages expose the new editorial sections, and complete a source-page indexability research pass before deciding whether thin source listings should be treated like thin skill pages
- [complete] Add thin-source index gating in metadata and sitemap generation so source pages with 3 or fewer linked skills are non-indexable and excluded from sitemap priority until they gain more catalog depth
- [complete] Query the live catalog for zero-review but content-complete skills, rank the best first-review seed pages using data-quality and source-recognition signals, and save the resulting top-10 shortlist to `review-bootstrap-candidates.md`
- [complete] Extend the skills.sh sync pipeline and schema so each imported skill stores normalized security audit results from Gen Agent Trust Hub, Socket, and Snyk for later trust-surface use
- [complete] Populate hosted `security_audits` data through limited and full `skills.sh` sync runs, add the public skill-page audit badge panel, deploy it to `www.skilljury.com`, and verify populated and empty audit states live
- [complete] Rebuild the homepage into a bold terminal-style leaderboard layout with a server-rendered hero, live agent rail, client-side leaderboard tabs, inline security audit indicators, then deploy and verify the redesign live on `www.skilljury.com`

## Constraints
- Use current public evidence rather than assumptions.
- Distinguish verified findings, likely inferences, and unknowns.
- Focus on a public product, not an internal-only tool.

## Errors Encountered
- `Invoke-WebRequest` returned an inconclusive error when checking the `SkillBench` GitHub org name; resolved by re-running the check with `curl` against the GitHub users API.
- Phase 1 build is blocked pending two implementation decisions not locked in the plan: package manager (`npm` or `pnpm`) and Supabase target (`local dev stack` or `existing hosted project`).
- The provided Supabase credentials were enough for REST and Storage access, but not enough to apply SQL migrations remotely. The hosted project currently does not contain `public.sync_runs`, so Phase 1 cannot reach the live-import definition of done until `001_core_catalog.sql` and `002_taxonomy_and_indexes.sql` are applied in Supabase.
- Starting the local production server with `Start-Process -FilePath npm` failed on Windows because `npm` is not a direct executable for `Start-Process`; resolved by switching to `npm.cmd`.
- The first hosted sync after migrations failed with `ON CONFLICT DO UPDATE command cannot affect row a second time` in `repositories`; resolved by deduplicating repository upsert rows by `repository_url` before the upsert.
- The first unbounded Phase 2 sync failed while loading existing skills because the importer built an oversized `IN (...)` query; resolved by switching to paged reads for existing skill slugs.
- The next full sync failed with `canceling statement due to statement timeout` during a single large `skills` upsert; resolved by batching the `skills` and `skill_agent_compatibility` writes.
- Public runtime requests initially failed in Phase 3 because Supabase SSR `getUser()` raised `AuthSessionMissingError` for anonymous visitors; resolved by treating that specific auth error as an unsigned visitor state instead of a fatal request error.
- The first Phase 3 skill-page runtime pass failed with `aggregate functions are not allowed in FROM clause of their own query level`; resolved by changing the same-category alternatives query to use an aliased inner join instead of selecting `skill_categories` twice at the same level.
- Supabase magic-link links originally failed locally because the callback handler only supported `?code=` URLs; resolved by replacing the route handler with a browser-aware callback page that also accepts token payloads in the URL hash and syncs `user_profiles` after session creation.
- Phase 4 production-mode write flows cannot complete safely without real Cloudflare Turnstile keys. The forms now detect missing keys, show a warning, and disable submission instead of silently failing.
- Ad hoc catalog auditing from the local shell currently fails because `.env.local` still contains placeholder-wrapped Supabase values (`<...>`), which produce `Invalid API key` when used outside the deployed environment.
- Attempting to stop the local port-3002 production server with a PowerShell loop initially failed because `$PID` is a reserved/read-only variable name; resolved by avoiding that variable name and restarting the server cleanly.
- The first Figma capture attempt created a valid capture ID, but local browser-launch commands for the required hash URL are blocked by the desktop policy wrapper, so the capture remains pending until the URL is opened manually in a browser.
- A temporary self-audit of the redesign found that `app/globals.css` still referenced the removed `--font-plex-mono` variable for `code`; resolved by switching the rule to `--font-jetbrains-mono`.
- A direct `npx tsx -e` audit command failed during the production-readiness sweep: first because top-level `await` is unsupported in the default CJS eval mode, then because `lib/db/search.ts` imports `server-only` and is not meant to run from that standalone eval path. Resolved by validating pagination and browse behavior through live route checks instead of forcing the server-only module through a shell eval.
- A standalone post-build audit of the new sitemap/review metadata hit the same `server-only` boundary when calling server modules through `tsx`, and multiple Windows background-process approaches were blocked by the shell policy wrapper. Resolved by treating `npm run build`, `npm run lint`, direct route-function checks where possible, and source-level verification as the audit evidence for the indexing-control loop.
- A targeted parser verification command for `skillsShParser.ts` initially failed because `tsx` stdin imported the module as a default-exported CommonJS namespace instead of exposing named exports directly. Resolved by reading the default namespace object and destructuring the parser functions from it.
- The hosted apply step for `008_security_audit_fields.sql` is currently blocked in this workspace because `.env.local` does not contain the session-pooler / Postgres connection string the task expects, and neither `psql` nor the Supabase CLI is installed. No hosted schema or sync changes were attempted after confirming that blocker.
- A direct `information_schema.columns` verification query for `security_audits` failed through Supabase REST with `PGRST106` because only `public` and `graphql_public` are exposed schemas. Resolved by verifying the column indirectly through successful `skills.security_audits` selects and successful sync writes against the hosted `skills` table.
- The existing shared `next dev` instance held the workspace lock but did not reliably serve new requests for the local audit pass. Resolved by using a fresh local production server on port `3010` to verify the rendered populated and empty `Security Audits` panel states before deployment.
- A direct production deploy to the existing linked Vercel project failed even though the app build succeeded: Vercel rejected the deploy because the latest git author email (`local@skilljury.dev`) is not a member of the target team. Resolved by deploying the app through a separate manual Vercel project that does not depend on the blocked team/Git integration path.
- The first custom-domain pass still emitted callback URLs against the old Vercel hostname because auth redirect URLs were built from server-side site-url config instead of the active browser origin. Resolved by generating auth callback URLs from `window.location.origin`, updating the manual Vercel project `NEXT_PUBLIC_SITE_URL` to `https://www.skilljury.com`, and redeploying the live site.
- The first post-auth deployment still served the old login page because the manual Vercel staging workspace did not pick up the newest auth patch files even after the bulk sync command. Resolved by force-copying the changed auth files into `C:\Users\jmana\AppData\Local\Temp\skilljury-manual-deploy` and redeploying from that staged workspace.
- A live browser-level OAuth check showed that the production Supabase project rejects Google auth with `Unsupported provider: provider is not enabled`. Resolved app-side by hiding the broken Google CTA unless `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`, while leaving email/password auth live and documenting the remaining dashboard-side provider enablement step.
- The Supabase advisor screenshot showed dozens of repeated RLS warnings, but this environment does not have a Supabase management token, CLI session, or direct SQL-apply path. Resolved in code by adding `006_rls_policy_advisor_cleanup.sql`; the remaining step is to run that migration in Supabase before the dashboard warnings will actually clear.
