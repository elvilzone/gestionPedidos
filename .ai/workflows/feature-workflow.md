# Feature Development Workflow

## Overview

This workflow governs the end-to-end process for implementing any new feature. Following this workflow ensures alignment with architecture principles, quality standards, and production readiness.

---

## Phase 1: Discovery & Design

**Trigger**: Approved ticket in backlog (user story, feature request, or PRD section).

### Step 1.1 — Understand Requirements
- [ ] Read the full user story / PRD section.
- [ ] Clarify acceptance criteria with product owner if ambiguous.
- [ ] Identify affected user roles and permissions.
- [ ] Confirm edge cases and error scenarios are documented.

### Step 1.2 — Architecture Design
- [ ] Identify which module/feature this belongs to.
- [ ] Define new domain entities and relationships (if any).
- [ ] Design API contract (OpenAPI spec or endpoint spec).
- [ ] Identify repository interfaces needed.
- [ ] List use cases required.
- [ ] Identify cross-module interactions.
- [ ] Detect scalability concerns (data volume, concurrency, external deps).

### Step 1.3 — Reusability Planning
- [ ] Check if any existing component, hook, use case, or utility can be reused.
- [ ] Identify components that should be added to the design system.
- [ ] Define what new reusable pieces will be created and where they will live.

### Step 1.4 — Responsibility Assignment (SRP Check)
- [ ] Can each proposed class/module be described with a single sentence?
- [ ] Are UI, business logic, and data concerns separated?
- [ ] Is data access abstracted behind repository interfaces?

---

## Phase 2: Implementation

### Step 2.1 — Branch & Setup
```bash
git checkout -b feature/{ticket-id}-short-description
```
- Branch from `main` (or `develop` if using GitFlow).
- Small, focused commits. One logical change per commit.

### Step 2.2 — Domain Layer First
1. Define domain entities and value objects.
2. Define repository interfaces in the application/ports layer.
3. Write unit tests for domain logic (TDD recommended).

### Step 2.3 — Application Layer
1. Implement use cases.
2. Define DTOs and mappers.
3. Write unit tests for all use cases.

### Step 2.4 — Infrastructure Layer
1. Implement repository.
2. Add database migration (if schema changes needed).
3. Implement external service adapters.
4. Write integration tests for repository.

### Step 2.5 — Presentation Layer
1. Implement API controller / ViewModel / Composable.
2. Add input validation.
3. Add error handling.
4. Write component/UI tests.

---

## Phase 3: Self-Review

Before opening a PR, perform this self-review checklist:

### Architecture Review
- [ ] Are all dependencies pointing inward (domain ← application ← infrastructure)?
- [ ] Is business logic fully in the use case layer?
- [ ] Are all dependencies injected (no `new` in business logic)?
- [ ] Is there any duplicated logic that should be extracted?
- [ ] Does every new class have a single responsibility?

### Code Quality Review
- [ ] Are all names intention-revealing and consistent with conventions?
- [ ] Are all edge cases handled?
- [ ] Is error handling complete (no silent failures)?
- [ ] Are there any magic numbers or hardcoded values that should be constants?
- [ ] Is the code readable without needing comments to explain what it does?

### Testing Review
- [ ] Do all use cases have unit tests?
- [ ] Are critical paths covered by integration or E2E tests?
- [ ] Are all tests deterministic and isolated?
- [ ] Is coverage at or above threshold for this module?

### Security Review
- [ ] Is all user input validated?
- [ ] Are authorization checks in place?
- [ ] Are there any hardcoded credentials or secrets?
- [ ] Is sensitive data excluded from logs?

---

## Phase 4: Pull Request

### PR Requirements
- [ ] PR title: `feat({scope}): short description` (Conventional Commits).
- [ ] PR description includes: what changed, why, testing approach, screenshots (if UI).
- [ ] All CI pipeline stages passing.
- [ ] At least 1 code review approval from a peer.
- [ ] Architecture review for changes touching core or cross-module logic.

### PR Size Guidelines
- Ideal: < 400 lines changed.
- Large: 400–800 lines (justify in description).
- Too large: > 800 lines — split into smaller PRs.

---

## Phase 5: Post-Merge

- [ ] Monitor staging deployment logs.
- [ ] Verify feature in staging environment.
- [ ] Update documentation if API changed.
- [ ] Close and link related tickets.
- [ ] Add to release notes.
