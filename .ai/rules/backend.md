# Backend Engineering Rules

## Core Standards

All backend services must conform to the following rules. These are non-negotiable requirements for any service entering the production pipeline.

---

## 1. Project Structure

Every backend service must follow this layout:

```
/src
  /domain
    /entities          # Pure domain objects, no framework deps
    /valueobjects      # Immutable value types
    /events            # Domain events
    /exceptions        # Domain-specific exceptions
  /application
    /usecases          # One class per use case
    /dtos              # Data Transfer Objects (input/output)
    /ports             # Repository and service interfaces
    /mappers           # DTO ↔ Domain conversion
  /infrastructure
    /persistence       # Repository implementations, ORM entities
    /http              # HTTP clients, third-party API adapters
    /messaging         # Queues, event buses
    /config            # App configuration, DI setup
  /presentation
    /controllers       # Route handlers, thin controllers
    /middleware        # Auth, logging, validation middleware
    /validators        # Request validation schemas
```

---

## 2. API Design Rules

### RESTful Conventions
- Use **nouns for resources**, not verbs: `/orders`, not `/getOrders`.
- Use HTTP verbs correctly: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- Use plural nouns for collections: `/users`, `/products`.
- Nest resources max **one level deep**: `/orders/{id}/items`.
- Return `201 Created` for successful POST with `Location` header.
- Return `204 No Content` for successful DELETE.

### Versioning
- All APIs must be versioned: `/api/v1/`, `/api/v2/`.
- Never break an existing version. Deprecate and sunset with notice.
- Version via URL path, not headers (for discoverability).

### Pagination
- ALL list endpoints must support pagination.
- Use cursor-based pagination for large, frequently-updated datasets.
- Use offset pagination only for stable, small datasets.
- Standard response shape:
  ```json
  {
    "data": [...],
    "meta": {
      "total": 1000,
      "page": 1,
      "perPage": 20,
      "nextCursor": "abc123"
    }
  }
  ```

### Error Responses
- Use RFC 7807 Problem Details format:
  ```json
  {
    "type": "https://api.example.com/errors/validation",
    "title": "Validation Error",
    "status": 422,
    "detail": "Email field is required",
    "instance": "/api/v1/users"
  }
  ```
- Never expose stack traces in production responses.
- Log full error details server-side with correlation ID.

---

## 3. Service Layer Rules

- Use cases are the only entry point into business logic.
- One class = one use case. `CreateOrderUseCase`, not `OrderService` with 15 methods.
- Use cases accept DTOs, return DTOs or domain events.
- Use cases must not have direct database access — only via repositories.
- Side effects (emails, notifications) triggered via domain events, not embedded in use cases.

---

## 4. Repository Pattern

- Define repository interfaces in `/application/ports/`.
- Implement repositories in `/infrastructure/persistence/`.
- Repositories return **domain entities**, not ORM models.
- ORM models are an infrastructure detail — never leak into domain.
- Use the Unit of Work pattern for transactional operations.

---

## 5. Data Validation

- Validate ALL input at the presentation layer before reaching use cases.
- Use schema-based validation (Zod, class-validator, Joi).
- Never trust client data inside use cases or domain entities.
- Validate business rules inside domain entities/value objects.

---

## 6. Configuration Management

- ALL configuration via environment variables. No hardcoded values.
- Use a typed config module that validates env vars at startup.
- Application must fail fast if required env vars are missing.
- Separate configs per environment: `development`, `staging`, `production`.
- Never commit `.env` files. Commit `.env.example` only.

---

## 7. Logging Standards

- Use structured logging (JSON format) in all environments.
- Every request must log: method, path, status, latency, correlation ID.
- Every error must log: error type, message, stack trace, correlation ID, user ID (if available).
- Log levels: `DEBUG` (dev), `INFO` (staging), `WARN`/`ERROR` (production).
- Never log PII (passwords, tokens, SSNs, credit card numbers).

---

## 8. Performance Rules

- All database queries must be indexed for their access patterns.
- N+1 queries are forbidden — use eager loading or data loaders.
- Use caching (Redis) for frequently-read, infrequently-updated data.
- Set timeouts on ALL external HTTP calls (max 10s default, 30s max).
- Use connection pooling for all database connections.
- Implement circuit breakers for all third-party service dependencies.

---

## 9. Security Rules

- Input sanitization on ALL user-supplied data.
- SQL injection prevention: ORM parameterized queries only, never string concatenation.
- Authentication: JWT with short expiry + refresh token rotation.
- Authorization: Role-based access control (RBAC) enforced at use case layer.
- Rate limiting on all public endpoints.
- CORS policy explicitly configured. Wildcard `*` is forbidden in production.

---

## 10. Testing Requirements

- Minimum 80% unit test coverage on use cases and domain logic.
- Integration tests for all repository implementations.
- E2E tests for critical API flows (auth, payment, core business flows).
- All tests must be deterministic and isolated (no shared state).
- Use test factories/builders, never production data in tests.

---

## Anti-Patterns (FORBIDDEN)

| Anti-Pattern | Description |
|---|---|
| Fat controllers | Controllers with business logic |
| Anemic services | Services that only delegate with no logic |
| Direct ORM in controllers | Bypasses use case and repository layers |
| Synchronous external calls in hot paths | Blocks event loop / thread |
| Missing error boundaries | Unhandled promise rejections / exceptions |
| Magic numbers | Replace with named constants or config |
