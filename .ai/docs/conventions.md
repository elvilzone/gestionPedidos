# Engineering Conventions

## Overview

This document defines the engineering conventions that all contributors must follow. Consistency enables maintainability, reduces cognitive load, and makes onboarding faster.

---

## 1. Code Style

### General
- **Use a code formatter**: Prettier (TS/JS), ktlint (Kotlin), gofmt (Go). Auto-format on save.
- **Linter mandatory**: ESLint (TS/JS), Detekt (Kotlin). No PR merges with lint errors.
- **Max file length**: 300 lines. Files exceeding this are SRP violation candidates.
- **Max function length**: 30 lines. Extract if longer.
- **Max function arguments**: 4 parameters. Use an object/data class if more needed.
- **No magic numbers**: All literal values must be named constants or config values.

### Comments
- Code should be self-documenting. Comments explain **why**, not **what**.
- **Good comment**: `// Retry up to 3 times per GDPR compliance requirement.`
- **Bad comment**: `// Increment i by 1`
- Remove all TODO comments before merging to main. Create tickets instead.
- JSDoc/KDoc required for all public API functions and classes.

---

## 2. Git Conventions

### Branch Naming
```
feature/{ticket-id}-short-description    # New features
fix/{ticket-id}-short-description        # Bug fixes
refactor/{ticket-id}-short-description   # Refactoring
hotfix/{ticket-id}-short-description     # Critical production fixes
release/v{version}                       # Release branches
```

### Commit Messages (Conventional Commits)
```
<type>(<scope>): <short description>

[optional body — explain WHY, not WHAT]

[optional footer — BREAKING CHANGE, closes #ticket]
```

**Types**: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `ci`.

**Examples**:
```
feat(orders): add bulk export to CSV
fix(auth): prevent refresh token reuse after rotation
refactor(user): extract email validation to value object
perf(orders): add index on user_id to reduce query time
```

### PR Rules
- PRs must be reviewed and approved before merge.
- All CI checks must pass.
- Delete branch after merge.
- Squash commits if history is messy (individual commits acceptable if clean).

---

## 3. Project Structure Conventions

- Feature code lives in `/features/{feature-name}/`.
- Shared code lives in `/core/`.
- No cross-feature direct imports — communicate via events or shared interfaces.
- Test files co-located with source or in `/test` mirroring source structure.
- Config and environment-specific values in `/config/` or `/infrastructure/config/`.

---

## 4. Dependency Management

- **Never add a dependency without evaluating**:
  - Is it maintained (last commit < 6 months)?
  - License compatible?
  - Bundle size impact?
  - Security posture?
- Prefer standard library over third-party when reasonable.
- Pin exact versions in production. Use version ranges only for development tools.
- Review and update dependencies monthly.

---

## 5. Environment Management

- `.env` files never committed. Only `.env.example`.
- All env vars documented in `.env.example` with descriptions.
- Use typed config modules that fail fast on missing required vars.
- Separate config per environment: `development`, `test`, `staging`, `production`.

---

## 6. Error Handling Conventions

- Every error must be caught at the appropriate boundary.
- Application layer returns `Result<T, Error>` types — never throws.
- Infrastructure adapters translate external errors into domain errors.
- All unhandled rejections/exceptions logged with correlation ID.
- Production errors never expose internal details to clients.

---

## 7. API Conventions

- All APIs versioned: `/api/v1/`.
- Request/response bodies in `camelCase` (JavaScript convention).
- Database columns in `snake_case` (SQL convention).
- Dates in ISO 8601 UTC: `2024-01-15T12:00:00Z`.
- Money values as integers in the smallest unit (cents): `2500` = $25.00.
- IDs as strings (UUIDs) in API responses — never expose internal integer IDs.

---

## 8. Testing Conventions

- Test file: `{module}.test.ts` / `{Module}Test.kt`.
- Test name: `should {expected behavior} when {condition}`.
- Use factories for test data: `OrderFactory.create({ status: 'PENDING' })`.
- Each test file has its own setup — no shared mutable state.
- Integration tests clean up database state after each test.

---

## 9. Documentation Conventions

- README.md at root with: project overview, setup instructions, architecture overview.
- Architecture decisions documented in `/docs/decisions.md`.
- OpenAPI spec maintained for all APIs.
- Complex algorithms and non-obvious business rules explained in comments.
- Runbooks for all critical operational procedures.
