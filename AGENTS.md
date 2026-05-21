# AGENTS.md — AI Agent System Configuration

## Purpose

This file configures and instructs autonomous AI agents operating on this codebase. Agents must read this file completely before executing any task, generating code, or making modifications.

---

## Agent Identity & Roles

Agents operating on this codebase take on one of the following roles based on the task at hand. Each role has defined responsibilities, access scope, and quality gates.

### Available Agent Roles

| Role | Skill File | Scope |
|---|---|---|
| Backend Architect | `.ai/skills/backend-architect.md` | Server-side, APIs, data layer |
| Frontend Architect | `.ai/skills/frontend-architect.md` | Web UI, components, state |
| Mobile Architect | `.ai/skills/mobile-architect.md` | Android/Kotlin/Compose |
| Database Architect | `.ai/skills/database-architect.md` | Schema, queries, migrations |
| Security Engineer | `.ai/skills/security-engineer.md` | Auth, security review |
| Performance Engineer | `.ai/skills/performance-engineer.md` | Optimization, profiling |
| Testing Engineer | `.ai/skills/testing-engineer.md` | Tests, coverage, CI |
| DevOps Engineer | `.ai/skills/devops-engineer.md` | CI/CD, infra, deployment |
| UI/UX Engineer | `.ai/skills/ui-ux-engineer.md` | Design system, accessibility |

---

## Mandatory Pre-Task Protocol

Before executing ANY task, agents MUST:

1. **Read the task description completely.**
2. **Identify the relevant role(s)** and load the corresponding skill file(s).
3. **Load applicable rule files** from `.ai/rules/`:
   - Always: `architecture.md`, `naming.md`
   - Based on task: `backend.md`, `frontend.md`, `mobile.md`, `database.md`, `security.md`
4. **Identify the relevant workflow** from `.ai/workflows/`:
   - New feature: `feature-workflow.md`
   - Bug fix: `bugfix-workflow.md`
   - Refactor: `refactor-workflow.md`
   - Release: `release-workflow.md`
5. **Analyze the task against the architecture** — which layer(s) are affected?
6. **Check for reuse opportunities** — is there existing code that should be reused or extended?
7. **Plan the implementation** before writing a single line of code.

---

## Task Execution Standards

### Phase 1: Analysis (REQUIRED before any code)
```
□ Business requirement understood
□ Affected architectural layers identified
□ Existing code patterns checked for reuse
□ New classes/modules planned with single responsibilities
□ Dependencies identified (what will be injected)
□ Test plan defined (unit, integration, E2E)
□ Edge cases and error scenarios identified
```

### Phase 2: Implementation
```
□ Domain layer (if needed) — pure, no framework deps
□ Repository interface (if needed) — in application layer
□ Use case(s) — one class per operation
□ Repository implementation (if needed) — in infrastructure
□ Presentation layer — thin, delegates to use cases only
□ Tests — written alongside or before code (TDD preferred)
```

### Phase 3: Self-Review (REQUIRED before completing)
```
□ SRP check: does every class have one and only one reason to change?
□ DRY check: is any logic duplicated?
□ Dependency check: all deps injected, none instantiated in business logic?
□ Error handling: all failure paths handled explicitly?
□ Security check: no hardcoded secrets, input validated, auth enforced?
□ Test check: all use cases tested, coverage meets threshold?
□ Naming check: all names intention-revealing and consistent with conventions?
□ Architecture check: no layer violations (infra in domain, business in UI)?
```

---

## Code Quality Gates

Agents must NOT submit code that fails these gates:

| Gate | Requirement |
|---|---|
| Architecture | No layer dependency violations |
| SRP | Every class has a single responsibility |
| DI | All dependencies constructor-injected |
| Tests | All use cases have unit tests |
| Types | No `any` in TypeScript, no unchecked casts in Kotlin |
| Error Handling | All error paths handled |
| Security | No hardcoded secrets, no SQL injection risk |
| Naming | Consistent with conventions in `naming.md` |

---

## Prohibited Actions

Agents are FORBIDDEN from:

- Generating code with hardcoded secrets, passwords, or API keys.
- Writing business logic inside controllers, ViewModels, or Composables.
- Accessing the database directly from the presentation layer.
- Creating classes with more than one responsibility without documenting the trade-off.
- Using `any` type in TypeScript or unchecked casts in Kotlin without justification.
- Skipping error handling for any async operation.
- Introducing circular dependencies between modules.
- Writing tests that depend on other tests' state.
- Making breaking API changes without versioning.
- Modifying an existing migration file.

---

## Agent Communication Standards

When reporting task completion, agents MUST provide:

1. **Summary**: What was done and why.
2. **Files Created/Modified**: List all changed files.
3. **Architecture Impact**: What changed in the architecture (if anything).
4. **Testing**: What tests were written and what they cover.
5. **Quality Review**: Results of the self-review checklist.
6. **Follow-up Recommendations**: Refactoring opportunities or risks noticed.

---

## Escalation Triggers

Agents must pause and request human review when:

- A task requires breaking an established architecture rule.
- A significant data migration is required.
- A security-sensitive change is needed (auth, encryption, permissions).
- A decision affects multiple teams or external API consumers.
- Conflicting requirements are detected in the task description.
- The task scope expands beyond the original request.
