# Testing Engineer Skill

## Role Definition

The Testing Engineer designs and maintains the testing strategy, frameworks, and quality gates. This role champions testability in system design and ensures comprehensive test coverage at all layers.

---

## Core Responsibilities

1. Define and enforce the testing strategy across all layers.
2. Design test frameworks, factories, and utilities in `/core/testing`.
3. Set up and maintain CI test pipelines.
4. Identify and eliminate flaky tests.
5. Champion Test-Driven Development (TDD) practices.
6. Review and enforce coverage thresholds.

---

## Testing Strategy

### Layer-by-Layer Approach

**Unit Tests** — Test logic in isolation.
- Scope: Use cases, domain entities, utilities, hooks, ViewModels.
- Framework: Jest, Vitest (TS), JUnit + Turbine (Kotlin).
- Speed: < 5s for entire unit suite.

**Integration Tests** — Test component interactions.
- Scope: Repositories + real DB (in-memory or Testcontainers), API routes.
- Framework: Supertest (Node), Testcontainers, Room in-memory.
- Speed: < 2 minutes for integration suite.

**E2E Tests** — Test complete user flows.
- Scope: Critical user journeys only.
- Framework: Playwright (web), Compose UI Test (Android).
- Speed: < 10 minutes for E2E suite.

---

## TDD Cycle

```
1. Write a failing test (RED)
2. Write the minimum code to pass (GREEN)
3. Refactor without breaking tests (REFACTOR)
```

Apply TDD for:
- All use cases and domain logic.
- All bug fixes (write a test that reproduces the bug first).
- All complex utility functions.

---

## Test Design Patterns

### AAA (Arrange / Act / Assert)
```ts
it('should reject order when inventory is insufficient', async () => {
  // Arrange
  const repo = new FakeOrderRepository();
  const inventory = new FakeInventoryRepository({ available: false });
  const useCase = new CreateOrderUseCase(repo, inventory, new FakeEventBus());
  const dto = CreateOrderDtoFactory.create();

  // Act
  const result = await useCase.execute(dto);

  // Assert
  expect(result.isFailure).toBe(true);
  expect(result.error).toBe('INVENTORY_UNAVAILABLE');
  expect(repo.orders).toHaveLength(0);
});
```

### Test Factory Pattern
```ts
// OrderFactory.ts — in /core/testing/factories/
export const OrderFactory = {
  create(overrides: Partial<CreateOrderDto> = {}): CreateOrderDto {
    return {
      userId: 'user-1',
      items: [{ productId: 'prod-1', quantity: 2 }],
      shippingAddress: AddressFactory.create(),
      ...overrides,
    };
  },
};
```

---

## Flaky Test Management

A flaky test is worse than no test — it erodes trust in the entire suite.

**Detection**: Tag flaky tests as they are discovered.
**Policy**:
1. Fix within 1 business day of discovery.
2. If not fixable immediately, quarantine in `__flaky__` folder (excluded from CI gate).
3. Document in issue tracker with reproduction steps.
4. Root cause analysis required before unquarantining.

---

## CI Pipeline Configuration

```yaml
# CI Test Stages
stages:
  - unit:       # Fastest - runs on every commit
      command: npm run test:unit
      coverage: true
      threshold: 80%
  - integration:  # Slower - runs on PRs
      command: npm run test:integration
      requires: [unit]
  - e2e:          # Slowest - runs on main branch only
      command: npm run test:e2e
      environment: staging
      requires: [integration]
```

---

## Quality Gates

- All PRs blocked if coverage drops below threshold.
- All PRs blocked if any test is failing.
- E2E suite must pass before any production deployment.
- Flaky test count tracked on dashboard — target: 0.
