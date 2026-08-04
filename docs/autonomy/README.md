# SkillJury Founder OS v2

SkillJury stewardship is split into specialized loops instead of one monolithic hourly agent.

## Architecture

### Hourly — Incident Sentinel

Purpose: detect production deltas, verify pending deployments, diagnose material incidents, and exit quickly when nothing changed.

Fast gate inputs:
- GitHub main SHA
- production deployment ID/status
- open critical incident state
- grouped runtime-error fingerprints and rates when denominators exist
- HTTP 5xx rate
- Supabase state
- failed sync/security signals
- verification queue

If there is no meaningful delta and no due verification, NOOP is success.

### Daily — Founder Stewardship

Purpose: product learning and PMF progress.

Rules:
- at most one product-changing experiment per day outside incidents
- no new experiment while the current one is still inside its measurement window unless invalidated by new evidence
- record baseline, hypothesis, metrics, thresholds, observation window, rollback and decision before shipping
- prefer maximum learning per change

### Weekly — Strategy Review

Purpose: full market/ecosystem scan and strategic synthesis.

The weekly loop updates competitor/research memory, reviews experiments, and decides whether to continue, narrow, reposition, pivot, pause or retire product directions.

## Shared durable memory

- `STEWARD_STATE.yaml` — compact machine-readable operating state and fast-gate inputs
- `EXPERIMENTS.md` — active/completed experiment registry
- `MARKET_WATCH.md` — weekly market-delta memory
- `../STEWARD_LEARNING_LEDGER.md` — durable incident/product lessons and failed approaches

## Operating principles

1. Evidence before action.
2. Delta-first reads instead of full rescans.
3. NOOP is a valid successful run.
4. Diagnose root cause before code changes.
5. Never repeat an unchanged failed approach.
6. One narrow reversible change at a time.
7. RED/GREEN regression evidence where practical.
8. Preview/tests are not production proof.
9. Require live verification and an appropriate observation window.
10. Prefer rates to raw error counts when denominators exist.
11. Never invent analytics, incidents, users or verification.
12. Preserve owner approval for paid, legal, secret-bearing, destructive or irreversible actions.

## Bootstrap behavior

The state files intentionally start conservatively. The first successful specialized runs must populate runtime values using connected-tool evidence rather than guesses.

Related implementation issue: #63.
