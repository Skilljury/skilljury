# SkillJury Review Architecture MVP Design

## Goal

Upgrade SkillJury's current skill-only review flow into an evidence-aware review system while creating a typed foundation for future agent, framework, and model reviews.

## Scope

This MVP implements:

1. A shared review architecture describing distinct metric sets for `skill`, `agent`, `framework`, and `model` entities.
2. New evidence fields for skill reviews:
   - execution outcome
   - number of attempts
   - tested version
   - tested date
   - permission risk
3. A server-computed review confidence score and label.
4. Display of the new evidence and confidence signals on public review cards.
5. A database migration that adds the new fields without changing the existing review ownership, moderation, or aggregation model.
6. Focused unit tests for weighted scoring and evidence-confidence calculation.

This MVP does not create separate agent, framework, or model listing tables or public review routes. Those require independent product specs once SkillJury has enough catalogue coverage and evaluation data.

## Product principles

- Do not combine community opinion, tested performance, and source/security metadata into one universal trust score.
- Preserve the existing 1–5 overall community rating.
- Treat evidence confidence as a separate 0–100 signal that describes how well-supported a review is, not whether the reviewed product is good.
- Keep the form quick: execution outcome and attempt count are required; version, tested date, permission risk, use case, and proof remain optional.
- Never trust a client-supplied confidence score. Compute it on the server from saved evidence fields and reviewer trust signals.

## Entity review architecture

### Skill

Question: Does this skill reliably perform the specific task it promises?

Metrics:

- task success: 25%
- output quality: 20%
- reliability: 20%
- setup experience: 10%
- documentation: 10%
- compatibility: 5%
- permission safety: 5%
- value for effort: 5%

### Agent

Question: Can this agent complete multi-step work reliably while remaining controllable?

Metrics:

- task completion: 25%
- tool-use reliability: 15%
- planning and reasoning: 15%
- human control: 15%
- transparency and logs: 10%
- safety and permissions: 10%
- speed: 5%
- cost efficiency: 5%

### Framework

Question: How effectively can a developer build, debug, and deploy agents with this framework?

Metrics:

- developer experience: 20%
- documentation: 15%
- stability: 15%
- debugging and observability: 15%
- extensibility: 10%
- deployment experience: 10%
- interoperability: 10%
- security controls: 5%

### Model

Question: How well does this exact model perform for a defined task category?

Metrics:

- task quality: 25%
- instruction following: 15%
- reliability across runs: 15%
- reasoning quality: 10%
- tool calling: 10%
- speed: 10%
- cost efficiency: 10%
- context handling: 5%

## Confidence calculation

The score totals at most 100 points:

- proof attached: +25
- exact version recorded: +15
- repeated tests: +10 for two attempts, +20 for three or more
- clear use case: +15
- recent test date within 90 days: +10
- GitHub-linked reviewer: +10
- reproducibility detail of at least 80 characters in the review body: +5

Labels:

- 70–100: high confidence
- 40–69: moderate confidence
- 0–39: low confidence

Confidence is evidence quality only. A high-confidence negative review is valuable and should remain negative.

## Data model

Add nullable columns to `public.reviews`:

- `execution_outcome text`
- `attempt_count integer`
- `skill_version text`
- `tested_at date`
- `permission_risk text`

Add a non-null column:

- `confidence_score integer not null default 0`

Constraints:

- `execution_outcome` is `worked`, `partially_worked`, or `failed` when present.
- `attempt_count` is between 1 and 20 when present.
- `permission_risk` is `low`, `medium`, `high`, or `unknown` when present.
- `confidence_score` is between 0 and 100.

Existing reviews remain valid and receive a default confidence score of 0 until edited or recomputed.

## Form behavior

Required fields remain:

- overall rating
- recommendation
- execution outcome
- attempt count
- pros
- cons
- Turnstile token

Optional detail fields add:

- tested version
- tested date
- permission risk

The existing use case, experience level, detailed ratings, review body, and proof fields remain unchanged.

## API and server behavior

The API validates the two new required fields and forwards all evidence fields to `createReview`.

`createReview`:

1. verifies the account and Turnstile token using existing behavior;
2. normalizes the evidence values;
3. calculates confidence from normalized values and reviewer profile signals;
4. saves all values in the same insert operation;
5. preserves existing moderation and aggregation behavior.

## Public display

Review cards show:

- execution outcome badge
- number of attempts
- tested version when provided
- tested date when provided
- permission risk when provided
- confidence label and numeric score

Existing title, overall rating, recommendation, pros, cons, use case, experience level, and proof indicators remain.

## Error handling

- Invalid execution outcomes, attempt counts, permission-risk values, or tested dates produce a 400 response.
- Confidence calculation treats absent optional evidence as zero contribution.
- A future-dated test date does not receive recency points.
- Existing missing-relation fallback behavior remains unchanged.

## Testing

Pure functions in `lib/reviews/reviewArchitecture.ts` are tested with Node's built-in test runner through `tsx --test`.

Tests cover:

- every entity's metric weights total 100;
- weighted scores ignore missing metrics and normalize against supplied weights;
- full evidence produces a 100 confidence score;
- sparse evidence remains low confidence;
- two attempts and three attempts receive different repeatability points;
- future test dates do not receive recency points.

## Rollout

1. Apply the Supabase migration.
2. Deploy the application changes.
3. Submit one test review in preview and confirm moderation behavior.
4. Confirm old reviews still render.
5. Monitor review-submission errors and confidence-score distribution.
