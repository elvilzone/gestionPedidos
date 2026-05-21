# Release Workflow

## Overview

This workflow governs the process for releasing software to production. It ensures every release is planned, tested, documented, and reversible.

---

## Release Types

| Type | Trigger | Example |
|---|---|---|
| **Major** | Breaking changes, major feature set | v2.0.0 |
| **Minor** | New features, backward compatible | v1.5.0 |
| **Patch** | Bug fixes, performance improvements | v1.4.2 |
| **Hotfix** | Critical production bug | v1.4.1 |

Version format: **Semantic Versioning (SemVer)** — `MAJOR.MINOR.PATCH`.

---

## Phase 1: Release Preparation

### Step 1.1 — Release Cut (1 week before)
- [ ] All features for this release merged to `main`.
- [ ] Create release branch: `git checkout -b release/v{version}`.
- [ ] Freeze feature additions to release branch — bug fixes only.
- [ ] Notify team of release freeze.

### Step 1.2 — Release Candidate Build
- [ ] CI pipeline produces release candidate artifact/image.
- [ ] Image tagged: `{service}:{version}-rc.1`.
- [ ] Deployed to staging environment.

### Step 1.3 — Release Checklist
- [ ] All acceptance criteria for release tickets verified in staging.
- [ ] Full E2E test suite passing on staging.
- [ ] Performance test results meet SLO targets.
- [ ] Security scan clean (no high/critical CVEs).
- [ ] All database migrations tested in staging.
- [ ] API contract changes are backward compatible (or versioned).
- [ ] Breaking changes documented with migration guide.
- [ ] Release notes drafted.
- [ ] Rollback plan documented.

---

## Phase 2: Release Approval

### Step 2.1 — Go/No-Go Meeting
Participants: Engineering lead, QA lead, Product owner.

Evaluate:
- All release criteria met (checklist above).
- No open critical or high severity bugs.
- Monitoring and alerting in place for new features.
- On-call engineer assigned and briefed for release window.

### Step 2.2 — Release Notes Finalization
```markdown
## Release v1.5.0 — 2024-01-15

### New Features
- Order tracking with real-time status updates (#TICKET-123)
- Bulk order export to CSV (#TICKET-145)

### Bug Fixes
- Fixed incorrect total calculation for multi-currency orders (#TICKET-134)

### Performance
- Improved order list API p99 latency from 450ms to 120ms

### Breaking Changes
- None

### Migration
- Run migration: `npm run migrate` (or automatic on deploy)

### Known Issues
- None
```

---

## Phase 3: Deployment

### Step 3.1 — Pre-Deployment
- [ ] Take database backup immediately before deployment.
- [ ] Confirm rollback procedure is ready.
- [ ] Confirm monitoring dashboards are open.
- [ ] Confirm on-call engineer is available.
- [ ] Notify stakeholders of maintenance window (if required).

### Step 3.2 — Deploy
```bash
# Tag the release
git tag -a v{version} -m "Release v{version}"
git push origin v{version}

# CI/CD pipeline deploys tagged commit
# Blue/green or canary strategy per service
```

Deployment order for multi-service systems:
1. Database migrations (backward compatible — never ahead of code).
2. Backend services.
3. Frontend applications.
4. Post-deployment smoke tests.

### Step 3.3 — Post-Deployment Validation
- [ ] Smoke test suite passes on production.
- [ ] Error rate normal (no spike).
- [ ] Latency normal (no degradation).
- [ ] Key business metrics normal (orders, signups, etc.).
- [ ] Logs clean (no unexpected errors).

Monitor for **30 minutes** post-deployment before declaring success.

---

## Phase 4: Rollback Procedure

### When to Rollback
- Error rate spikes > 2x baseline.
- P99 latency exceeds 2x baseline.
- Critical functionality broken in production.
- Data integrity issue detected.

### Rollback Steps
1. **Immediate**: Revert traffic to previous version (blue/green switch or canary abort).
2. **If DB migration ran**: Assess reversibility. Run rollback migration if prepared.
3. **Communicate**: Notify stakeholders of rollback and ETA for resolution.
4. **Diagnose**: Identify root cause before attempting re-deployment.

---

## Phase 5: Post-Release

### Step 5.1 — Merge Back
```bash
git checkout main
git merge release/v{version} --no-ff -m "Release v{version}"
git branch -d release/v{version}
```

### Step 5.2 — Documentation
- [ ] API documentation updated.
- [ ] CHANGELOG.md updated.
- [ ] Release notes published to team.

### Step 5.3 — Retrospective (Major Releases)
- What went well?
- What could be improved in the release process?
- Were there any close calls or near-misses?
- Process improvements ticketed.
