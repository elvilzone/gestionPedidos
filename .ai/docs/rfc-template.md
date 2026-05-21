# Request for Comments (RFC) Template

## Instructions

RFCs are used for significant technical decisions that affect architecture, APIs, data models, or cross-team concerns. An RFC must be approved before implementation begins on anything that falls into these categories.

**When to write an RFC:**
- New module or service introduction.
- API contract changes (especially breaking changes).
- Schema changes affecting multiple services.
- Replacing a core dependency or framework.
- Changes to authentication or security architecture.
- Performance optimization strategies for critical paths.

---

# RFC: {Title}

**RFC ID**: RFC-{number}
**Author(s)**: {Name(s)}
**Created**: YYYY-MM-DD
**Last Updated**: YYYY-MM-DD
**Status**: Draft | In Review | Accepted | Rejected | Implemented | Superseded

**Related PRD**: PRD-{number} *(if applicable)*
**Related ADR**: ADR-{number} *(if this creates a decision record)*

---

## 1. Summary

{1–3 sentences. What is being proposed and why? This is the TL;DR.}

---

## 2. Motivation

### Problem
{What problem does this proposal solve? Why does the current approach fail at scale, maintainability, or correctness?}

### Why Now?
{Why is this the right time to address this? What is the cost of not addressing it?}

---

## 3. Detailed Design

### Overview
{High-level description of the proposed solution.}

### Architecture Impact
{How does this change the existing architecture? Which layers are affected? Draw diagrams if helpful.}

```
{ASCII diagram or description of new architecture/flow}
```

### API Changes
{If applicable, show new or modified API contracts.}

```
{OpenAPI snippet, function signatures, or interface definitions}
```

### Data Model Changes
{If applicable, show new or modified schemas.}

```sql
{SQL DDL for new/modified tables}
```

### Implementation Plan
{Step-by-step breakdown of how this will be implemented.}

1. {Step 1}
2. {Step 2}
3. {Step 3}

### Migration Strategy
{If existing data or behavior changes, how will migration be handled?}

---

## 4. Alternatives Considered

### Alternative A: {Name}
**Description**: {Brief description}
**Why rejected**: {Reason}

### Alternative B: {Name}
**Description**: {Brief description}
**Why rejected**: {Reason}

---

## 5. Drawbacks & Risks

{What are the downsides of this proposal? What could go wrong?}

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| {Risk 1} | High/Medium/Low | High/Medium/Low | {Mitigation strategy} |

---

## 6. Impact Analysis

### Performance Impact
{Expected performance change. If unsure, note what benchmarks will be run.}

### Security Impact
{Any security implications? New attack surface? Authentication/authorization changes?}

### Breaking Changes
{Does this break any existing contracts (API, data, behavior)?}

| Breaking Change | Affected Consumers | Migration Required |
|---|---|---|
| {Change} | {Who is affected} | {Yes/No — description} |

---

## 7. Rollout Plan

| Phase | Description | Criteria to Proceed |
|---|---|---|
| 1 | {e.g., Deploy to 10% of traffic} | {Success metrics} |
| 2 | {e.g., Deploy to 50%} | {Success metrics} |
| 3 | {e.g., Full rollout} | {Success metrics} |

**Rollback Plan**: {How to roll back if the rollout fails.}

---

## 8. Open Questions

| # | Question | Owner | Resolution |
|---|---|---|---|
| 1 | {Question} | {Name} | {Answer or "Open"} |

---

## 9. Review

| Reviewer | Role | Decision | Date | Notes |
|---|---|---|---|---|
| {Name} | {Engineering Lead / Architect / Security / DBA} | Approve / Request Changes / Reject | {Date} | {Notes} |

**Final Decision**: {Approved / Rejected / Deferred}
**Decision Date**: YYYY-MM-DD
**Rationale**: {Brief explanation of the final decision}

---

## 10. Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | {Date} | {Name} | Initial draft |
