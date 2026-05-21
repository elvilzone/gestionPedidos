# Architecture Rules

## Core Principles

This document defines the architectural rules that MUST be followed across all layers of the system. Any violation of these rules must be documented and justified via RFC before being merged.

---

## 1. Clean Architecture

The system is organized in concentric layers. **Dependencies only point inward.** Outer layers depend on inner layers — never the reverse.

```
[ Presentation / UI ]
       ↓
[ Application / Use Cases ]
       ↓
[ Domain / Entities ]
       ↑
[ Infrastructure / Data ]  (depends inward via interfaces)
```

### Layer Responsibilities

| Layer | Responsibility | Allowed Dependencies |
|---|---|---|
| Domain | Business entities, value objects, domain events | None (pure logic) |
| Application | Use cases, orchestration, DTOs | Domain only |
| Infrastructure | DB, APIs, file system, external services | Application interfaces |
| Presentation | UI, controllers, ViewModels | Application use cases |

### Rules
- **NEVER** import infrastructure classes directly into domain or application layers.
- **NEVER** import UI logic into the domain or application layers.
- Use interfaces (ports) in the application layer; implement them in the infrastructure layer.
- Domain entities must be pure Kotlin/Swift/TypeScript classes — no framework annotations.

---

## 2. SOLID Principles

### S — Single Responsibility Principle (SRP)
- Every class/module must have **one and only one reason to change**.
- A class with more than 200 lines is a code smell — review for SRP violations.
- A class that both validates AND persists data violates SRP. Split immediately.

### O — Open/Closed Principle (OCP)
- Classes must be **open for extension, closed for modification**.
- Add behavior through new classes/modules, not by editing existing ones.
- Use strategy, decorator, or factory patterns to extend without modifying.

### L — Liskov Substitution Principle (LSP)
- Subclasses must be substitutable for their base classes without altering correctness.
- Never override a method to throw an exception when the parent doesn't.
- Avoid narrowing preconditions or widening postconditions in subclasses.

### I — Interface Segregation Principle (ISP)
- No client should be forced to depend on methods it does not use.
- Break fat interfaces into smaller, role-specific interfaces.
- A `UserRepository` should not have methods for invoices.

### D — Dependency Inversion Principle (DIP)
- High-level modules must not depend on low-level modules. Both must depend on abstractions.
- Inject dependencies via constructor injection — never instantiate dependencies inside a class.
- Use DI frameworks (Hilt, Koin, NestJS DI) to manage the dependency graph.

---

## 3. Module Structure

### Feature-First Modularization
Each feature is a self-contained module with its own:
- Domain models
- Use cases
- Repository interfaces
- Data sources
- ViewModels / Presenters
- UI components

```
/features
  /auth
    /domain
    /data
    /presentation
  /orders
    /domain
    /data
    /presentation
```

### Core Modules
Shared utilities, design system, and cross-cutting concerns live in `/core`:

```
/core
  /network
  /database
  /security
  /logging
  /analytics
  /designsystem
```

### Rules
- Features must not directly reference each other's internal classes.
- Cross-feature communication via shared domain interfaces or events only.
- `/core` modules must never depend on `/features` modules.

---

## 4. Dependency Injection

- All dependencies injected via constructor.
- No service locators (anti-pattern).
- DI container configured at the application entry point only.
- Interfaces registered in the DI container — never concrete classes as dependencies.

---

## 5. Scalability Rules

- Design for horizontal scaling from day one.
- Stateless services where possible. State externalized to Redis/DB.
- Event-driven architecture for cross-module communication.
- CQRS (Command Query Responsibility Segregation) for complex read/write patterns.
- Paginate all list endpoints. No unbounded queries.

---

## 6. Anti-Patterns (FORBIDDEN)

| Anti-Pattern | Action |
|---|---|
| God class | Immediate refactor required |
| Anemic domain model | Add behavior to domain entities |
| Spaghetti code | Refactor with SRP and layering |
| Direct DB access from UI | Route through repository and use case |
| Hardcoded configuration | Use environment variables and config modules |
| Business logic in controllers | Move to use cases / services |
| Circular dependencies | Resolve via interface or event |
| Global mutable state | Replace with scoped/injected state |

---

## 7. Architecture Decision Records (ADRs)

- All significant architecture changes must have an ADR in `/docs/decisions.md`.
- ADR must include: context, decision, alternatives considered, consequences.
- ADRs are immutable once approved. Create a new ADR to supersede an old one.

---

## Enforcement

These rules are enforced via:
- PR review checklist
- Automated linting rules
- Architecture tests (ArchUnit, Konsist, or equivalent)
- CI pipeline gates
