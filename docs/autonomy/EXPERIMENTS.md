# SkillJury Experiment Registry

This is the durable registry for product experiments. It exists to stop the autonomous founder from shipping faster than SkillJury can learn.

## Rules

- Outside an active incident, start at most one product-changing experiment per calendar day.
- Do not start a new experiment while the current one is still inside its defined observation window unless new evidence invalidates it.
- NOOP is a valid successful daily outcome.
- Every experiment must have a falsifiable hypothesis, verified baseline, primary metric, guardrail, observation/sample threshold, success threshold, failure threshold, and rollback.
- Never invent missing analytics. If a metric cannot be observed, mark the experiment unmeasurable and treat measurement restoration as a candidate bottleneck.
- Prefer maximum learning per change, not maximum commits.

## Status values

`proposed` · `running` · `awaiting-production` · `observing` · `positive` · `negative` · `inconclusive` · `stopped` · `superseded`

## Experiment template

### EXP-YYYY-MM-DD-N — Title

- **Status:**
- **Hypothesis:**
- **Why this is the highest-leverage bottleneck:**
- **Verified baseline:**
- **Change:**
- **Primary metric:**
- **Guardrail metric:**
- **Observation period / sample threshold:**
- **Success threshold:**
- **Failure threshold:**
- **Rollback:**
- **Evidence links:**
- **Result:**
- **Confidence:**
- **Decision:** Continue / Narrow / Reposition / Pivot / Pause / Retire
- **Next eligible action:**

---

## Active experiment

None recorded at bootstrap. The next daily founder run must reconcile this file against recent PRs, issues, deployments, and production observations before starting new work.

## Completed experiments

Use this section for concise final records; keep detailed evidence in the linked PR/issue.
