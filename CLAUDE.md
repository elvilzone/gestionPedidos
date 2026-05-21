# CLAUDE.md — AI Assistant Engineering Guide

## Purpose

This file instructs AI assistants (Claude, Gemini, GPT, etc.) on the architecture, conventions, and engineering standards of this project. Read this file completely before generating any code, suggesting changes, or answering questions about this codebase.

---

## Project Overview

{Replace with your project description}

This project follows **Clean Architecture**, **SOLID principles**, and **feature-first modularization**. All code must adhere to the engineering standards defined in `.ai/rules/`.

---

## Architecture Mental Model

Before generating any code, internalize this architecture:

```
[ Presentation ]  ←  only calls use cases, never repositories directly
       ↓
[ Application / Use Cases ]  ←  orchestrates domain, never talks to DB directly
       ↓
[ Domain / Entities ]  ←  pure business logic, zero framework dependencies
       ↑
[ Infrastructure ]  ←  implements interfaces defined in Application layer
```

**The dependency rule is inviolable.** Dependencies point inward. Infrastructure depends on Application. Application depends on Domain. Domain depends on nothing.

---

## What You Must Always Do

### Before Writing Code
1. Analyze the full request — understand the business requirement, not just the technical ask.
2. Identify which architectural layer this code belongs to.
3. Check if any existing use cases, repositories, or utilities can be reused.
4. Plan the component breakdown — what classes/functions are needed?
5. Identify which design patterns apply (Repository, Factory, Strategy, etc.).
6. Detect potential SRP violations — can each proposed class be described with one sentence?

### When Writing Code
1. Write domain layer code with zero framework imports.
2. Write use cases that accept DTOs and return `Result<T>` — never throw exceptions for domain errors.
3. Define repository **interfaces** in the application/domain layer — implementations go in infrastructure.
4. Inject ALL dependencies via constructor — never instantiate services inside business logic.
5. Validate all input at the presentation/API boundary — never in use cases or domain.
6. Handle all error cases explicitly — no silent failures.
7. Write self-documenting code — names reveal intent.

### After Writing Code
1. Review for SRP violations — does any class do more than one thing?
2. Review for DRY violations — is any logic duplicated?
3. Review for tight coupling — can each class be tested independently?
4. Verify error handling is complete — what happens when things go wrong?
5. Confirm all dependencies are injected (not instantiated).
6. Check that no business logic leaked into the presentation layer.

---

## Naming Conventions

| Construct | Convention | Example |
|---|---|---|
| Use Cases | `{Verb}{Noun}UseCase` | `CreateOrderUseCase` |
| Repositories (interface) | `{Noun}Repository` | `OrderRepository` |
| Repositories (impl) | `{Noun}RepositoryImpl` | `OrderRepositoryImpl` |
| DTOs | `{Verb}{Noun}Dto` | `CreateOrderDto`, `OrderResponseDto` |
| Domain Events | `{Noun}{PastTense}` | `OrderCreated`, `PaymentFailed` |
| ViewModels | `{Noun}ViewModel` | `OrderListViewModel` |
| Composables | `PascalCase` | `OrderCard`, `CheckoutScreen` |
| API Controllers | `{Noun}Controller` | `OrderController` |

---

## Code Generation Rules

### ALWAYS
- Use constructor injection for all dependencies.
- Return `Result<T, Error>` from use cases (never throw for domain errors).
- Define types/interfaces explicitly — no `any` in TypeScript.
- Use sealed classes/interfaces for state and events in Kotlin.
- Write pure domain entities with zero framework annotations.
- Use `StateFlow` for UI state and `SharedFlow` for one-time events (Android).
- Paginate all list queries — never return unbounded results.

### NEVER
- Import infrastructure classes into domain or application layers.
- Access the database from a controller or ViewModel directly.
- Store passwords in plaintext or use weak hashing (MD5, SHA1).
- Use `SELECT *` in database queries.
- Hardcode secrets, API keys, or credentials.
- Create a class that has more than one responsibility.
- Write business logic inside a controller, ViewModel, or Composable.
- Use global mutable state.
- Write a function longer than 30 lines without justification.

---

## Testing Standards You Must Follow

- Every use case must have a corresponding unit test.
- Tests follow AAA: Arrange / Act / Assert.
- Test names: `should {expected behavior} when {condition}`.
- Use test factories for all test data — never hardcode test values inline.
- Use fakes (not mocks) for repositories in unit tests.
- Never test implementation details — test behavior.

---

## When in Doubt

1. Check the relevant rule file: `.ai/rules/{domain}.md`.
2. Check for an existing pattern in the codebase — prefer consistency over novelty.
3. If a new pattern is needed, document it in `.ai/docs/decisions.md` as an ADR.
4. Prefer explicit over implicit. Prefer simple over clever.

---

## Forbidden Patterns — Detect and Refuse

If asked to generate code that violates these patterns, explain the violation and offer the correct approach:

- Spaghetti code (no clear structure or separation of concerns)
- God classes (one class doing everything)
- Business logic in controllers or ViewModels
- Direct database access from UI layer
- Hardcoded credentials or secrets
- Untested use cases
- Missing error handling
- Circular dependencies between modules
- Tight coupling without abstractions
