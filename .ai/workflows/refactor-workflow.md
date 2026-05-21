# Refactor Workflow

## Overview

Refactoring improves internal code structure without changing external behavior. Refactoring must be disciplined: test-covered, focused, and incremental.

---

## Guiding Principle

> "Make it work, make it right, make it fast." — Kent Beck

Refactoring addresses "make it right." It is never an excuse to change behavior, rename APIs, or add features simultaneously.

---

## When to Refactor

Refactor when you detect:
- A class with more than 200 lines (SRP violation candidate).
- A function with more than 30 lines.
- Duplicated logic across two or more modules.
- Business logic inside a controller, ViewModel, or UI component.
- Direct database access from the presentation layer.
- A class that needs multiple reasons to change.
- Code that is difficult to unit-test (usually indicates tight coupling).
- A design smell that slows feature development or causes frequent bugs.

---

## Phase 1: Plan

### Step 1.1 — Identify the Smell
Document the specific refactoring target:
- What is the current problem?
- Which files and classes are affected?
- What pattern/principle is being violated?

### Step 1.2 — Ensure Test Coverage First
**Never refactor without tests.** If the code has no tests:
1. Write characterization tests that capture current behavior.
2. These tests are not testing the design — they are capturing behavior.
3. Once covered, proceed with refactoring.
4. After refactoring, remove characterization tests and replace with proper unit tests.

### Step 1.3 — Define the Target Architecture
- What will the code look like after the refactoring?
- What design pattern or structure will be applied?
- What are the new responsibilities of each class/module?

---

## Phase 2: Execute (Incrementally)

### Golden Rules
1. **One refactoring at a time.** Don't rename AND restructure AND extract in the same commit.
2. **Tests must pass at every commit.** Never have a "broken intermediate state."
3. **No behavior changes.** If behavior changes are needed, do them in a separate PR.
4. **Small, reviewable PRs.** Max 400 lines per refactor PR.

### Common Refactoring Patterns

**Extract Method / Function**
```ts
// BEFORE: Large function with multiple responsibilities
function processOrder(order: Order) {
  // 30 lines of validation
  // 20 lines of inventory check
  // 15 lines of payment processing
  // 25 lines of notification sending
}

// AFTER: Delegating functions with single responsibilities
function processOrder(order: Order) {
  validateOrder(order);
  checkInventory(order.items);
  processPayment(order.paymentDetails);
  sendConfirmationNotification(order);
}
```

**Extract Class**
```ts
// BEFORE: Fat service doing too many things
class UserService {
  createUser() { ... }
  sendWelcomeEmail() { ... }
  generateAvatar() { ... }
  processSubscription() { ... }
}

// AFTER: SRP-compliant classes
class UserCreationService { createUser() { ... } }
class UserNotificationService { sendWelcomeEmail() { ... } }
class SubscriptionService { processSubscription() { ... } }
```

**Introduce Repository / Separate Concerns**
```ts
// BEFORE: Controller with DB access
class OrderController {
  async createOrder(req, res) {
    const order = await db.query('INSERT INTO orders...');
    res.json(order);
  }
}

// AFTER: Layered architecture
class OrderController {
  constructor(private createOrderUseCase: CreateOrderUseCase) {}
  async createOrder(req, res) {
    const result = await this.createOrderUseCase.execute(req.body);
    res.json(result);
  }
}
```

---

## Phase 3: Validate

- [ ] All existing tests still pass after refactoring.
- [ ] Coverage has not decreased.
- [ ] Manual testing confirms no behavioral change.
- [ ] The new structure satisfies the design target from Phase 1.
- [ ] No new SRP violations introduced.

---

## Phase 4: PR

### PR Requirements
- [ ] PR title: `refactor({scope}): description` (Conventional Commits).
- [ ] PR description: what smell was fixed, what pattern was applied, why.
- [ ] PR explicitly states: "No behavioral changes."
- [ ] All CI stages passing.
- [ ] Architecture review for large refactors.

---

## Phase 5: Post-Refactor

- [ ] Update any outdated documentation.
- [ ] Note the refactoring in the team's engineering log.
- [ ] If the refactoring uncovers additional smells, ticket them for future refactors.
- [ ] Celebrate — you made the codebase better for everyone.
