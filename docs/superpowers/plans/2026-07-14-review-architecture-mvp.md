# Review Architecture MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add evidence-aware skill reviews and a reusable typed scoring architecture for future skill, agent, framework, and model reviews.

**Architecture:** Keep the existing `reviews` table and skill routes, adding only evidence columns and a separate confidence score. Put all scoring definitions and confidence calculation in a pure TypeScript module so UI, server logic, and future entity review forms share one source of truth.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase PostgreSQL, Tailwind CSS, Node test runner through `tsx`.

## Global Constraints

- Preserve the existing 1–5 overall community rating and moderation flow.
- Confidence describes evidence quality only and must not change the overall rating.
- Confidence must be computed on the server; never accept a client-supplied confidence score.
- Execution outcome and attempt count are required for new reviews.
- Existing reviews must continue rendering after the migration.
- Do not create public agent, framework, or model review routes in this MVP.

---

### Task 1: Add pure review architecture and tests

**Files:**
- Create: `lib/reviews/reviewArchitecture.ts`
- Create: `tests/reviews/reviewArchitecture.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `REVIEW_METRIC_DEFINITIONS`, `calculateWeightedReviewScore`, `calculateReviewConfidence`, `getReviewConfidenceLabel`.
- Consumes: no application or database dependencies.

- [ ] **Step 1: Add a failing test script and tests**

Add `"test": "tsx --test tests/**/*.test.ts"` to `package.json`.

Create tests asserting:

```ts
import assert from "node:assert/strict";
import test from "node:test";

import {
  REVIEW_METRIC_DEFINITIONS,
  calculateReviewConfidence,
  calculateWeightedReviewScore,
  getReviewConfidenceLabel,
} from "../../lib/reviews/reviewArchitecture";

test("every review entity metric set totals 100", () => {
  for (const definitions of Object.values(REVIEW_METRIC_DEFINITIONS)) {
    assert.equal(definitions.reduce((sum, metric) => sum + metric.weight, 0), 100);
  }
});

test("full evidence produces maximum confidence", () => {
  const result = calculateReviewConfidence({
    attemptCount: 3,
    hasProof: true,
    hasReproducibilityDetail: true,
    hasUseCase: true,
    hasVersion: true,
    isGithubLinked: true,
    testedAt: "2026-07-14",
    now: new Date("2026-07-14T12:00:00Z"),
  });

  assert.equal(result, 100);
  assert.equal(getReviewConfidenceLabel(result), "high");
});
```

- [ ] **Step 2: Run tests and confirm RED**

Run: `npm test`

Expected: FAIL because `lib/reviews/reviewArchitecture.ts` does not exist.

- [ ] **Step 3: Implement the pure scoring module**

Define entity metric arrays whose weights total 100, normalize weighted scores against supplied ratings, and implement the evidence point rules from the design spec.

- [ ] **Step 4: Run tests and confirm GREEN**

Run: `npm test`

Expected: all review architecture tests pass.

- [ ] **Step 5: Commit**

```bash
git add package.json lib/reviews/reviewArchitecture.ts tests/reviews/reviewArchitecture.test.ts
git commit -m "feat: add review scoring architecture"
```

---

### Task 2: Add database evidence fields

**Files:**
- Create: `supabase/migrations/20260714090000_review_architecture_mvp.sql`

**Interfaces:**
- Produces database fields consumed by `createReview` and `getSkillReviews`.
- Preserves the existing unique key, RLS policies, and review moderation states.

- [ ] **Step 1: Write the migration**

Add:

```sql
alter table public.reviews
  add column if not exists execution_outcome text,
  add column if not exists attempt_count integer,
  add column if not exists skill_version text,
  add column if not exists tested_at date,
  add column if not exists permission_risk text,
  add column if not exists confidence_score integer not null default 0;
```

Then add named check constraints through guarded `do $$` blocks for the allowed values and ranges.

- [ ] **Step 2: Verify migration safety manually**

Confirm:

- every new evidence field except `confidence_score` is nullable;
- old rows remain valid;
- constraints allow only documented values;
- migration is idempotent.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260714090000_review_architecture_mvp.sql
git commit -m "feat: add review evidence fields"
```

---

### Task 3: Extend the form and API contract

**Files:**
- Modify: `components/reviews/ReviewForm.tsx`
- Modify: `components/reviews/OptionalDetailFields.tsx`
- Modify: `app/api/reviews/route.ts`

**Interfaces:**
- Produces validated payload fields: `executionOutcome`, `attemptCount`, `skillVersion`, `testedAt`, `permissionRisk`.
- Consumes existing form submission and Turnstile behavior.

- [ ] **Step 1: Add required execution fields to the form**

Add selects for:

- execution outcome: `worked`, `partially_worked`, `failed`;
- attempt count: integer 1–10 plus `10+` represented as 10.

- [ ] **Step 2: Add optional evidence fields**

Add inputs for tested version and tested date, plus permission-risk values `unknown`, `low`, `medium`, and `high`.

- [ ] **Step 3: Extend the request body**

Include all five fields in the JSON payload.

- [ ] **Step 4: Validate the API payload**

Require execution outcome and a numeric attempt count. Reject unsupported outcomes, permission values, counts outside 1–20, and invalid dates with a 400 `invalid_review_payload` error.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit --pretty false`

Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add components/reviews/ReviewForm.tsx components/reviews/OptionalDetailFields.tsx app/api/reviews/route.ts
git commit -m "feat: collect review execution evidence"
```

---

### Task 4: Save and retrieve evidence with confidence

**Files:**
- Modify: `lib/reviews/createReview.ts`
- Modify: `lib/reviews/getSkillReviews.ts`

**Interfaces:**
- Consumes the API evidence fields and `viewer.profile.isGithubLinked`.
- Produces persisted evidence, `confidenceScore`, and normalized public review fields.

- [ ] **Step 1: Extend `ReviewPayload`**

Add typed evidence values and `reviewerIsGithubLinked`.

- [ ] **Step 2: Normalize values**

Implement small local normalizers for attempt count, ISO date, execution outcome, permission risk, and optional text.

- [ ] **Step 3: Calculate confidence**

Call `calculateReviewConfidence` with:

- proof presence;
- normalized version;
- attempts;
- use case;
- tested date;
- GitHub-linked reviewer;
- review body length of at least 80 characters.

- [ ] **Step 4: Insert new columns**

Save evidence and confidence in the existing review insert.

- [ ] **Step 5: Retrieve new fields**

Extend `ReviewListItem`, `ReviewQueryRow`, both Supabase select strings, and `normalizeReviewRow`.

- [ ] **Step 6: Run tests and type-check**

Run:

```bash
npm test
npx tsc --noEmit --pretty false
```

Expected: both exit 0.

- [ ] **Step 7: Commit**

```bash
git add lib/reviews/createReview.ts lib/reviews/getSkillReviews.ts
git commit -m "feat: persist review evidence confidence"
```

---

### Task 5: Display evidence and verify the complete branch

**Files:**
- Modify: `components/reviews/ReviewCard.tsx`
- Create: `.github/workflows/review-architecture-ci.yml`

**Interfaces:**
- Consumes the new `ReviewListItem` fields.
- Produces evidence badges and a CI verification result for the draft pull request.

- [ ] **Step 1: Add confidence display**

Show `High confidence`, `Moderate confidence`, or `Low confidence` with the numeric score. Do not imply the confidence label is a recommendation.

- [ ] **Step 2: Add execution evidence badges**

Render execution result, attempts, tested version, tested date, and permission risk when available.

- [ ] **Step 3: Add CI workflow**

Run:

```yaml
- run: npm ci
- run: npm test
- run: npm run lint
- run: npx tsc --noEmit --pretty false
- run: npm run build
```

- [ ] **Step 4: Run full verification**

Run or confirm in GitHub Actions:

```bash
npm test
npm run lint
npx tsc --noEmit --pretty false
npm run build
```

Expected: every command exits 0.

- [ ] **Step 5: Review the diff against the design**

Confirm:

- all five evidence fields flow from form to database to display;
- confidence is server-calculated;
- old reviews remain compatible;
- no agent/framework/model routes were added;
- metrics for all four entity types are represented in the shared module.

- [ ] **Step 6: Open a draft PR**

Title: `Add evidence-aware review architecture`

The PR body must include the migration requirement, verification results, manual preview checklist, and explicit deferred scope.
