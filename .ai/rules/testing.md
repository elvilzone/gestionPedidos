# Testing Engineering Rules

## Core Standards

Testing is not optional. All production code must meet minimum coverage thresholds and adhere to the test standards defined here. Tests are first-class citizens of this codebase.

---

## 1. Testing Pyramid

Follow the testing pyramid: many unit tests, fewer integration tests, minimal E2E tests.

```
         /\
        /E2E\         <- Few, slow, high confidence for critical flows
       /------\
      / Integr.\     <- Moderate, test boundaries and integrations
     /----------\
    /  Unit Tests \  <- Many, fast, isolated, fine-grained
   /--------------\
```

### Coverage Targets

| Layer | Minimum Coverage |
|---|---|
| Domain logic / Use Cases | 90% |
| Application services | 80% |
| Infrastructure adapters | 70% |
| Presentation / UI | 60% |
| **Overall project** | **80%** |

Coverage is measured in CI and PRs below threshold are blocked.

---

## 2. Unit Testing Rules

- Test **one behavior** per test. One assertion or a single logical group of assertions.
- Tests must be **FAST** — all unit tests complete in < 5 seconds.
- Tests must be **ISOLATED** — no shared state between tests.
- Tests must be **DETERMINISTIC** — same input always produces same output.
- Tests must be **INDEPENDENT** — no test depends on another test running first.
- Use **Arrange / Act / Assert** (AAA) structure for every test.

```ts
// GOOD: Clear AAA structure, single behavior
it('should return error when email is invalid', () => {
  // Arrange
  const invalidEmail = 'not-an-email';

  // Act
  const result = validateEmail(invalidEmail);

  // Assert
  expect(result.success).toBe(false);
  expect(result.error).toBe('INVALID_EMAIL_FORMAT');
});
```

---

## 3. Test Naming

- Test names must describe the **behavior under test**, not the implementation.
- Format: `should [expected behavior] when [condition]`
- Examples:
  - ✅ `should throw NOT_FOUND when order does not exist`
  - ✅ `should return paginated results when page size is specified`
  - ❌ `test1`, `handleOrder`, `checkUser`

---

## 4. Test Doubles (Mocks, Fakes, Stubs)

- Prefer **fakes** over mocks for repositories and external services.
- Use **mocks** only to verify specific interactions (e.g., that an event was published).
- Use **stubs** to return predetermined values for external dependencies.
- Never mock the system under test.
- Avoid over-mocking — if you mock everything, you test nothing.
- Fakes live in `/core/testing` (shared) or `/{feature}/testing` (feature-specific).

```kotlin
// Fake repository for testing
class FakeOrderRepository : OrderRepository {
    private val orders = mutableListOf<Order>()

    override fun getOrders(): Flow<List<Order>> = flow { emit(orders) }

    override suspend fun createOrder(order: Order): Result<Unit> {
        orders.add(order)
        return Result.success(Unit)
    }
}
```

---

## 5. Integration Testing Rules

- Integration tests verify that components work together correctly.
- Use real (in-memory or containerized) databases — not mocks.
- Use **Testcontainers** for PostgreSQL, Redis, and external services in integration tests.
- Each integration test must clean up its state (teardown or transaction rollback).
- Test the full use-case-to-database flow for all critical paths.

---

## 6. End-to-End Testing Rules

- E2E tests cover **critical user journeys** only: auth flow, payment, core business flow.
- Use **Playwright** (web) or **Espresso/Compose UI Testing** (Android).
- E2E tests run against a dedicated staging environment, not production.
- Use data seeders to set up deterministic test state before E2E runs.
- E2E tests must be tagged (`@smoke`, `@regression`) and run in appropriate CI stages.

---

## 7. Test Data Management

- Never use production data in tests.
- Use **factories/builders** to create test data:
  ```ts
  const order = OrderFactory.create({ status: 'PENDING' });
  ```
- Factories provide sensible defaults and allow overrides.
- Factories live in `/core/testing/factories/`.
- Seed scripts for integration/E2E tests live in `/test/seeds/`.

---

## 8. CI/CD Integration

- All tests run on every PR before merge.
- Test suite must complete in < 10 minutes (parallelize where needed).
- Coverage report generated on every run and published to PR.
- Flaky tests must be fixed or quarantined immediately — they erode trust.
- Separate CI stages: `unit` → `integration` → `e2e`.
- E2E tests run only on `main` branch merges or release candidates.

---

## 9. Test File Organization

- Test files co-located with source files or in a parallel `/test` directory.
- Naming: `{module}.test.ts`, `{Module}Test.kt`, `{Module}Spec.swift`.
- Group related tests in `describe` blocks (JS/TS) or nested test classes (Kotlin/Java).

---

## Anti-Patterns (FORBIDDEN)

| Anti-Pattern | Corrective Action |
|---|---|
| Testing implementation details | Test behavior and outputs |
| Shared mutable state between tests | Isolate each test with setup/teardown |
| Tests that depend on execution order | Each test must be independent |
| Production data in tests | Use factories and seed scripts |
| Skipping tests with `skip`/`@Ignore` | Fix or delete; document exceptions |
| No assertions in a test | Every test must assert something |
| Testing all at unit level | Mix levels per pyramid (unit, integration, E2E) |
