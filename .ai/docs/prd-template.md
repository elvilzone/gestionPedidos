# Product Requirements Document (PRD) Template

## Instructions

Copy this template for every new feature or product initiative. Fill all sections before development begins. Incomplete PRDs are returned to the author.

---

# PRD: {Feature / Initiative Name}

**Document ID**: PRD-{number}
**Author**: {Name}
**Product Owner**: {Name}
**Engineering Lead**: {Name}
**Status**: Draft | In Review | Approved | In Development | Done
**Created**: YYYY-MM-DD
**Last Updated**: YYYY-MM-DD
**Target Release**: vX.Y.Z

---

## 1. Executive Summary

{1–3 sentences summarizing what this feature does and why it matters. Non-technical stakeholders should understand this.}

---

## 2. Problem Statement

### Current Situation
{What is the current state? What pain does the user experience today?}

### Impact
{Quantify the problem. How many users are affected? What is the business impact?}

### Root Cause
{Why does this problem exist? What is preventing users from achieving their goal?}

---

## 3. Goals & Success Metrics

### Goals
- {Goal 1}
- {Goal 2}

### Non-Goals (Out of Scope)
- {What this feature explicitly does NOT address}

### Success Metrics (KPIs)
| Metric | Baseline | Target | Measurement Method |
|---|---|---|---|
| {Metric name} | {Current value} | {Target value} | {How to measure} |

---

## 4. User Stories

### Primary User Story
**As a** {user role},
**I want to** {action},
**So that** {benefit}.

### Acceptance Criteria
- [ ] Given {context}, when {action}, then {expected outcome}.
- [ ] Given {context}, when {action}, then {expected outcome}.
- [ ] {Error case}: Given {error condition}, when {action}, then {graceful error handling}.

### Additional User Stories
{Add more user stories as needed}

---

## 5. User Flow

{Describe the step-by-step user journey for the primary flow.}

1. User navigates to {screen/page}.
2. User {action}.
3. System {response}.
4. User {next action}.
5. ...

**Error Flows:**
- {Error scenario 1}: {What happens}
- {Error scenario 2}: {What happens}

---

## 6. Functional Requirements

### Must Have (P0)
- {Requirement 1}
- {Requirement 2}

### Should Have (P1)
- {Requirement 3}

### Nice to Have (P2)
- {Requirement 4}

---

## 7. Non-Functional Requirements

| Requirement | Specification |
|---|---|
| Performance | API response p99 < {N}ms under {X} concurrent users |
| Availability | {X}% uptime SLA |
| Scalability | Must handle {X} requests/second |
| Security | {Auth requirements, data classification} |
| Accessibility | WCAG AA compliance |
| Localization | {Supported languages/regions} |

---

## 8. Design & UX

{Link to Figma/design files}

**Key Screens:**
- {Screen 1}: {Description}
- {Screen 2}: {Description}

---

## 9. Technical Considerations

{High-level technical notes for engineering. NOT the engineering design — that goes in an RFC.}

- **Data requirements**: {New data entities or schema changes needed}
- **Integration dependencies**: {External services or APIs required}
- **Risks**: {Known technical risks or unknowns}

---

## 10. Dependencies

| Dependency | Type | Status |
|---|---|---|
| {Team/system} | {Blocking / Non-blocking} | {Status} |

---

## 11. Timeline

| Milestone | Target Date |
|---|---|
| PRD Approved | {Date} |
| RFC / Tech Design | {Date} |
| Development Start | {Date} |
| QA / Staging | {Date} |
| Production Release | {Date} |

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | {Question} | {Name} | Open / Resolved |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | {Date} | {Name} | Initial draft |
