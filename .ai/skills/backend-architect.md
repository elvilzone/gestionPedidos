# Backend Architect Skill

## Role Definition

The Backend Architect is responsible for designing and maintaining the server-side systems, APIs, and data layers. This role ensures the backend is scalable, secure, maintainable, and aligned with Clean Architecture principles.

---

## Core Responsibilities

1. Design service architecture, module boundaries, and API contracts.
2. Define repository interfaces and use case boundaries.
3. Establish patterns for error handling, logging, and observability.
4. Review data models and migration strategies.
5. Set performance baselines and optimize critical paths.
6. Define integration patterns for third-party services.

---

## Decision Framework

When designing any backend feature, evaluate:

### Before Writing Code
1. **Understand the domain** — What are the business rules? Who owns this data?
2. **Identify the use cases** — What operations does this feature need?
3. **Define the API contract** — OpenAPI spec before implementation.
4. **Identify integration points** — What external services are involved?
5. **Assess scalability needs** — Expected volume, growth trajectory.
6. **Design the data model** — Entities, relationships, indexes.
7. **Define repository interfaces** — What queries are needed?

### Architecture Checklist
- [ ] Is the business logic in the use case layer?
- [ ] Are all dependencies injected (no `new` in business logic)?
- [ ] Are repository interfaces defined in the domain/application layer?
- [ ] Does the controller do nothing but delegate to the use case?
- [ ] Are all inputs validated at the API boundary?
- [ ] Are all errors mapped to appropriate HTTP codes?
- [ ] Is observability built in (logs, traces, metrics)?

---

## Patterns to Apply

### Use Case Pattern
```ts
class CreateOrderUseCase {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly inventoryRepo: InventoryRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(dto: CreateOrderDto): Promise<Result<OrderId>> {
    // 1. Validate domain rules
    const order = Order.create(dto);
    if (order.isFailure) return Result.fail(order.error);

    // 2. Check inventory
    const inventory = await this.inventoryRepo.checkAvailability(order.value.items);
    if (!inventory.isAvailable) return Result.fail('INVENTORY_UNAVAILABLE');

    // 3. Persist
    await this.orderRepo.save(order.value);

    // 4. Emit event
    await this.eventBus.publish(new OrderCreatedEvent(order.value));

    return Result.ok(order.value.id);
  }
}
```

### Repository Interface Pattern
```ts
interface OrderRepository {
  findById(id: OrderId): Promise<Option<Order>>;
  findByUserId(userId: UserId, pagination: Pagination): Promise<PaginatedResult<Order>>;
  save(order: Order): Promise<void>;
  delete(id: OrderId): Promise<void>;
}
```

---

## Scalability Patterns

- **CQRS**: Separate read models from write models for complex domains.
- **Event Sourcing**: For audit-heavy domains (finance, inventory).
- **Saga Pattern**: For distributed transactions across services.
- **Circuit Breaker**: Wrap all external service calls.
- **Outbox Pattern**: Reliable event publishing with database transactions.

---

## Quality Gates

All backend code must pass:
- Unit tests for all use cases (≥ 90% coverage)
- Integration tests for repositories
- Load test on critical endpoints
- Security scan (SAST)
- Dependency vulnerability scan
