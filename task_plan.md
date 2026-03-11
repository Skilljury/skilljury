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
