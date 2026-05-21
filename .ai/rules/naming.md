# Naming Conventions

## Core Principle

Names must be **self-documenting**. A reader should understand the purpose of a variable, function, class, or module without reading its implementation. Clarity over brevity.

---

## 1. Universal Rules

- Use **English** for all identifiers, comments, and documentation.
- Names must be **intention-revealing**: `userEmail`, not `ue` or `e`.
- Avoid **abbreviations** unless universally understood: `id`, `url`, `api`, `dto`.
- Avoid **generic names**: `data`, `info`, `manager`, `helper`, `utils` (use specific names).
- No single-letter variables except loop counters (`i`, `j`) and lambda parameters.
- Be consistent — use the same name for the same concept everywhere.

---

## 2. Language-Specific Conventions

### TypeScript / JavaScript
| Construct | Convention | Example |
|---|---|---|
| Variables | `camelCase` | `userEmail`, `orderTotal` |
| Functions | `camelCase`, verb | `createOrder()`, `getUserById()` |
| Classes | `PascalCase` | `OrderService`, `UserRepository` |
| Interfaces | `PascalCase` | `OrderRepository`, `PaymentGateway` |
| Enums | `PascalCase`, SCREAMING_SNAKE values | `OrderStatus.PENDING` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_ATTEMPTS` |
| Files | `kebab-case` | `order-service.ts`, `use-orders.ts` |
| Types | `PascalCase` | `CreateOrderDto`, `PaginatedResult<T>` |

### Kotlin / Android
| Construct | Convention | Example |
|---|---|---|
| Variables / properties | `camelCase` | `userEmail`, `isLoading` |
| Functions | `camelCase`, verb | `createOrder()`, `mapToDomain()` |
| Classes | `PascalCase` | `OrderViewModel`, `UserRepositoryImpl` |
| Interfaces | `PascalCase` (no `I` prefix) | `OrderRepository`, `PaymentGateway` |
| Enums | `PascalCase`, SCREAMING_SNAKE | `OrderStatus.PENDING` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_ATTEMPTS` |
| Composables | `PascalCase` | `OrderCard()`, `UserProfileScreen()` |
| Files | `PascalCase` | `OrderViewModel.kt`, `OrderCard.kt` |

### SQL / Database
| Construct | Convention | Example |
|---|---|---|
| Tables | `snake_case`, plural | `orders`, `product_categories` |
| Columns | `snake_case`, singular | `created_at`, `user_id` |
| Foreign keys | `{table_singular}_id` | `order_id`, `user_id` |
| Indexes | `idx_{table}_{columns}` | `idx_orders_user_id` |
| Stored procs | `snake_case`, verb_noun | `get_active_orders` |

---

## 3. Function / Method Naming

- Functions must be **verbs**: `create`, `update`, `delete`, `get`, `find`, `validate`, `parse`, `transform`.
- Boolean functions/properties: prefix with `is`, `has`, `can`, `should`:
  - `isAuthenticated()`, `hasPermission()`, `canDelete()`, `shouldRetry()`.
- Event handlers: prefix with `on` or `handle`:
  - `onSubmit()`, `handlePaymentSuccess()`, `onOrderCreated()`.
- Async functions: do NOT suffix with `Async` — it's redundant. Use `await` at call site.

---

## 4. Class / Module Naming

- Name classes after their role in the architecture:
  - Use Cases: `CreateOrderUseCase`, `ProcessPaymentUseCase`
  - Repositories: `OrderRepository`, `OrderRepositoryImpl`
  - Services: `PaymentService`, `NotificationService`
  - ViewModels: `OrderListViewModel`, `CheckoutViewModel`
  - DTOs: `CreateOrderDto`, `OrderResponseDto`
  - Mappers: `OrderMapper`, `UserMapper`
  - Controllers: `OrderController`, `AuthController`

---

## 5. File & Folder Naming

- **Feature folders**: lowercase with hyphens: `/features/order-management/`.
- **Component files**: Match the exported component name: `OrderCard.tsx` exports `OrderCard`.
- **Test files**: `{name}.test.ts`, `{Name}Test.kt`.
- **Config files**: `{name}.config.ts`, `{name}.module.ts`.

---

## 6. Boolean Naming

- Never name booleans without a predicate word:
  - ❌ `active`, `loading`, `error`
  - ✅ `isActive`, `isLoading`, `hasError`
- Prefer positive framing:
  - ❌ `isNotLoading`, `isDisabled`
  - ✅ `isLoaded`, `isEnabled`

---

## 7. Event & Message Naming

- Domain events: past tense noun phrase: `OrderCreated`, `PaymentProcessed`, `UserRegistered`.
- Commands: imperative verb phrase: `CreateOrder`, `ProcessPayment`, `SendNotification`.
- Queue topics: `{domain}.{event}`: `orders.created`, `payments.failed`.

---

## Anti-Patterns (FORBIDDEN)

| Anti-Pattern | Example | Fix |
|---|---|---|
| Single-letter names | `e`, `d`, `x` | `error`, `data`, `coordinate` |
| Generic names | `data`, `manager`, `helper` | Specific, role-based names |
| Cryptic abbreviations | `usrMgr`, `ord_svc` | `userManager`, `orderService` |
| Inconsistent casing | `user_id` in JS code | `userId` (camelCase in JS) |
| Negative booleans | `isNotAuthenticated` | `isAuthenticated` (inverted usage) |
| Misleading names | `getUser()` that also updates | `getUserAndUpdateLastSeen()` |
