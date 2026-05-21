# Bug Fix Workflow

## Overview

This workflow governs the process for diagnosing, fixing, and validating bug fixes. A bug fix without a reproducing test is not a fix — it's a guess.

---

## Phase 1: Triage

### Step 1.1 — Classify Severity

| Severity | Criteria | SLA |
|---|---|---|
| Critical | Production down, data loss, security breach | Immediate hot-fix |
| High | Core feature broken, significant user impact | Same day |
| Medium | Feature degraded, workaround available | 1–3 days |
| Low | Minor UX issue, cosmetic | Next sprint |

### Step 1.2 — Gather Information
- [ ] What is the exact user-reported behavior?
- [ ] What is the expected behavior?
- [ ] Is this reproducible? On which environments?
- [ ] What are the reproduction steps?
- [ ] When did this first occur? What changed recently?
- [ ] How many users are affected?

---

## Phase 2: Diagnosis

### Step 2.1 — Reproduce the Bug
- Reproduce locally using the exact reproduction steps.
- If not reproducible locally, reproduce in staging.
- If only in production, gather logs and traces with correlation ID.

### Step 2.2 — Root Cause Analysis
- Follow the bug to its origin — not just where it surfaces.
- Check: recent changes, logs, traces, database state.
- Ask "why" 5 times (5 Whys technique) until the root cause is clear.
- Identify whether this is a symptom of a broader architectural issue.

### Step 2.3 — Impact Assessment
- [ ] Are there other code paths affected by the same root cause?
- [ ] Is data integrity compromised? (May need data migration to fix affected records)
- [ ] Are there other users/tenants silently impacted?

---

## Phase 3: Fix Implementation

### Step 3.1 — Write a Failing Test First
Before writing any fix code:
```ts
// This test must FAIL before the fix and PASS after
it('should not process duplicate orders when idempotency key is reused', async () => {
  const dto = CreateOrderDtoFactory.create({ idempotencyKey: 'key-123' });
  await createOrderUseCase.execute(dto);
  const result = await createOrderUseCase.execute(dto); // duplicate

  expect(result.isSuccess).toBe(true); // returns same result, no duplicate
  expect(await orderRepo.count()).toBe(1); // only one order created
});
```

### Step 3.2 — Implement the Minimal Fix
- Fix the root cause, not the symptom.
- Keep the fix as small and focused as possible.
- Do not refactor unrelated code in the same PR.

### Step 3.3 — Verify No Regression
- Run the full test suite.
- Manually test adjacent functionality.
- Check all identified impacted code paths.

---

## Phase 4: Branch & PR

```bash
git checkout -b fix/{ticket-id}-short-description
```

### PR Requirements
- [ ] PR title: `fix({scope}): short description` (Conventional Commits).
- [ ] Include: root cause explanation, fix description, reproduction steps, test added.
- [ ] The new failing test is included in the PR.
- [ ] All CI stages passing.
- [ ] If Critical/High severity: escalated review from senior engineer.

---

## Phase 5: Hot-Fix Process (Critical Only)

For Critical severity bugs affecting production:

```bash
git checkout -b hotfix/{ticket-id}-short-description main
# Fix applied
git tag -a hotfix-v{version} -m "Hotfix: {description}"
```

1. Fix applied to `main` (or `hotfix` branch merged to `main`).
2. Deployment to production with expedited approval.
3. Post-mortem written within 24 hours.
4. Preventive measures identified and ticketed.

---

## Phase 6: Data Remediation

If the bug caused corrupted or missing data:
- [ ] Write a one-off migration script to repair affected records.
- [ ] Test migration in staging with production data snapshot.
- [ ] Run migration in production with backup taken immediately before.
- [ ] Verify data integrity after migration.
- [ ] Document in post-mortem.

---

## Phase 7: Post-Fix

- [ ] Bug closed in issue tracker with fix version and root cause.
- [ ] Added to release notes.
- [ ] Affected users notified if applicable.
- [ ] If Critical/High: post-mortem written within 48 hours.
- [ ] Preventive refactors ticketed if root cause reveals systemic issue.
