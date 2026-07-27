# SkillJury Steward Learning Ledger

This file is the durable memory for autonomous product stewardship and incident response.

Future runs must read this ledger together with recent commits, pull requests, deployments, issues, logs, and reports before choosing work. The ledger does not override fresh evidence; it prevents repeated investigation and unmeasured activity.

## Operating rules

1. Record only evidence verified from connected tools in the current run.
2. Separate facts, inference, and unresolved questions.
3. Do not repeat a failed approach unless conditions have materially changed; record what changed.
4. Prefer one narrow, reversible experiment with a rollback path.
5. For bugs, add or update a regression test and verify RED before the fix where practical, then GREEN after it.
6. Do not mark a production incident resolved from code, tests, or preview alone. Require production verification and an appropriate observation window.
7. Link every learning entry to its issue, pull request, commit, deployment, report, or analytics evidence.
8. Update the decision after measurement: continue, narrow, reposition, pivot, pause, or retire.

## Entry template

### YYYY-MM-DD — Title

- **Area:** Incident / Product / Market / SEO / Trust / Reliability / Security
- **Status:** Proposed / Running / Positive / Negative / Inconclusive / Superseded
- **Hypothesis:**
- **Evidence before action:**
- **Action taken:**
- **Result and measurement window:**
- **What worked:**
- **What failed or was ruled out:**
- **Why it failed:**
- **Do not repeat unless:**
- **Remaining unknowns:**
- **Decision:** Continue / Narrow / Reposition / Pivot / Pause / Retire
- **Rollback:**
- **Links:**

---

## Durable learnings

### 2026-07-27 — Recurring Next.js PPR metadata-resume mismatch

- **Area:** Reliability / Incident
- **Status:** Running
- **Hypothesis:** The recurring metadata-resume mismatch is not fully explained by individual route behavior and may involve the framework runtime or emitted production artifacts.
- **Evidence before action:** GitHub issue #22 documents recurring successful HTTP 200 requests that fall back to client rendering with the same metadata-boundary resume mismatch. The issue also records prior route-level mitigations, a temporary resolution, later recurrence, and the need for a production observation window.
- **Action taken:** No new code change is recorded by this entry. This entry establishes the required next diagnostic sequence and prevents repetition of unchanged workarounds.
- **What worked:** Replacing unstable route-local `notFound()` behavior with stable recovery content resolved one confirmed tree-shape mismatch for missing snapshot records.
- **What failed or was ruled out:**
  - Treating every recurrence as a new route-specific defect.
  - Disabling cache components/PPR, which was tested and reverted because the application relies on `use cache`.
  - Assuming a source-level runtime patch is present in every emitted production runtime without inspecting production-equivalent build artifacts.
- **Why it failed:** Later recurrences showed that the broader signature could survive route-level fixes. The repository history also records a patch targeting both Next.js runtime bundle variants, so repeating the same source patch without emitted-artifact evidence would be unchanged work.
- **Do not repeat unless:** A framework version, build pipeline, runtime packaging path, route tree, or reproducible test has materially changed and the change is documented.
- **Remaining unknowns:**
  - Which exact emitted server artifact executes during affected production requests.
  - Whether every CommonJS and ESM app-render runtime contains the intended mitigation.
  - Whether a controlled Next.js version change removes the signature under production traffic.
- **Decision:** Continue investigation narrowly at the emitted-runtime/framework level. Do not apply another speculative route workaround.
- **Rollback:** Any future framework or runtime experiment must be isolated on a branch and revertible by commit.
- **Links:**
  - Issue: https://github.com/Skilljury/skilljury/issues/22
  - Prior dual-runtime patch commit: https://github.com/Skilljury/skilljury/commit/cbb95f932eeca09a468e2fd5209d5a3d664256b2
  - Cache/PPR reversion evidence is recorded in issue #22 and linked pull-request history.

## Stewardship decision log

Add one concise row after each measured experiment. Do not add rows for cosmetic work without a hypothesis and measurement plan.

| Date | Area | Hypothesis or problem | Result | Decision | Evidence |
|---|---|---|---|---|---|
| 2026-07-27 | Reliability | PPR mismatch requires emitted-runtime/framework diagnosis rather than repeated route workarounds | Investigation remains open | Continue narrowly | Issue #22 |
