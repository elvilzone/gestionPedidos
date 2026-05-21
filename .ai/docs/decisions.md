# Architecture Decision Records (ADRs)

## Overview

This document maintains the history of significant architecture decisions made during the project's lifecycle. Each decision includes context, the chosen option, alternatives considered, and consequences.

ADRs are **immutable once approved**. To supersede a decision, create a new ADR that explicitly references and overrides the old one.

---

## ADR Template

```markdown
## ADR-{number}: {Title}

**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-{N}
**Author(s)**: {Names}

### Context
{What is the situation that requires this decision? What problem are we solving?}

### Decision
{What was decided? Be specific.}

### Alternatives Considered
- **{Option A}**: {Brief description and why it was rejected}
- **{Option B}**: {Brief description and why it was rejected}

### Consequences
**Positive:**
- {Benefit 1}

**Negative / Trade-offs:**
- {Trade-off 1}

### References
- {Links to related tickets, documents, or research}
```

---

## ADR-001: Clean Architecture as Foundation

**Date**: {Project Start Date}
**Status**: Accepted
**Author(s)**: Engineering Team

### Context
The project needs a scalable, testable architecture that can support multiple delivery targets (REST API, mobile app, web frontend) without coupling business logic to any specific framework or infrastructure.

### Decision
Adopt **Clean Architecture** (Robert C. Martin) as the foundational architectural style. Domain and application layers will have zero framework dependencies. Infrastructure details will be hidden behind interfaces defined in the application layer.

### Alternatives Considered
- **MVC (traditional)**: Simple for small projects but leads to fat controllers and tight coupling at scale.
- **Layered Architecture**: Similar but without strict dependency inversion — allows upward dependencies.

### Consequences
**Positive:**
- Business logic is fully testable without any IO.
- UI, DB, and external services are swappable.
- Clear module boundaries reduce merge conflicts.

**Negative / Trade-offs:**
- More initial boilerplate (interfaces, mappers, DTOs).
- Steeper learning curve for engineers unfamiliar with the pattern.

---

## ADR-002: Feature-First Modularization

**Date**: {Project Start Date}
**Status**: Accepted

### Context
As the codebase grows, a flat structure becomes hard to navigate and reason about. Teams need clear ownership boundaries.

### Decision
Organize code into self-contained **feature modules**, each containing its own domain, data, and presentation layers. Shared code lives in `/core` modules.

### Alternatives Considered
- **Layer-first structure**: `/controllers`, `/services`, `/repositories` at root. Becomes hard to navigate as features grow.

### Consequences
**Positive:**
- Feature teams have clear ownership.
- Features can be developed and tested in isolation.
- Easy to extract a feature into a separate service if needed.

**Negative / Trade-offs:**
- Some duplication of boilerplate across features.
- Cross-feature code sharing requires discipline (through `/core`).

---

## ADR-003: Dependency Injection via Container

**Date**: {Project Start Date}
**Status**: Accepted

### Context
Classes have dependencies. How those dependencies are provided affects testability and modularity.

### Decision
All dependencies injected via **constructor injection** using the project's DI container (Hilt for Android, NestJS DI for Node, etc.). No service locators. No `new` instantiation of dependencies inside business classes.

### Consequences
**Positive:**
- Dependencies explicit and visible.
- Easy to substitute fakes/mocks in tests.
- No hidden global state.

**Negative / Trade-offs:**
- DI container configuration required at application entry point.
- Circular dependencies become visible (a good thing — they must be resolved).

---

## ADR-004: JWT with Refresh Token Rotation

**Date**: {Project Start Date}
**Status**: Accepted

### Context
The system requires stateless authentication that scales horizontally without shared session state.

### Decision
Use **JWT access tokens** (15-minute expiry) with **refresh tokens** stored in HttpOnly cookies. Implement refresh token rotation — each use of a refresh token invalidates it and issues a new one.

### Alternatives Considered
- **Session-based auth**: Requires shared session store (Redis) for horizontal scaling.
- **Long-lived JWTs**: Higher security risk if token is compromised.

### Consequences
**Positive:**
- Stateless API servers — scales horizontally.
- Short-lived access tokens limit blast radius of token compromise.
- Refresh token rotation detects token theft.

**Negative / Trade-offs:**
- Client must handle token refresh logic.
- Requires refresh token storage with fast lookup (Redis).

---

*Add new ADRs below this line as decisions are made.*
