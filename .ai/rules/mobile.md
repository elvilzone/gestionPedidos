# Mobile Engineering Rules (Android / Kotlin)

## Core Standards

All Android development must follow these rules to ensure a scalable, testable, and production-grade codebase. These rules apply to all Kotlin/Compose Android projects.

---

## 1. Module Structure

The project must be structured as a **multi-module Android project** following feature-first modularization:

```
/app                   # App entry point, DI graph root, navigation host
/core
  /network             # Retrofit, OkHttp, interceptors
  /database            # Room database, DAOs, type converters
  /datastore           # DataStore preferences
  /security            # KeyStore, encryption utilities
  /ui                  # Shared Composables, theme, design tokens
  /common              # Extensions, utils, base classes
  /testing             # Test utilities, fakes, base test classes
/domain                # Pure domain layer (no Android deps)
  /models              # Domain entities and value objects
  /repositories        # Repository interfaces (ports)
  /usecases            # Business use cases
/data                  # Data layer (implements domain interfaces)
  /repositories        # Repository implementations
  /remote              # API services, response DTOs
  /local               # Room DAOs, entity mappers
/features
  /auth
    /domain
    /data
    /presentation
  /orders
    /domain
    /data
    /presentation
/designsystem          # Atomic components, tokens, typography, colors
/navigation            # NavGraph, NavHost, route definitions
```

### Module Rules
- `domain` module has **zero Android dependencies** — pure Kotlin only.
- `core` modules never depend on `features` modules.
- Feature modules must not depend on each other directly.
- Cross-feature navigation via the `navigation` module only.
- Cross-feature data sharing via `domain` interfaces only.

---

## 2. MVVM + Clean Architecture

### ViewModel Rules
- ViewModels expose **StateFlow<UiState>** for UI state.
- ViewModels expose **SharedFlow<UiEvent>** for one-time events (navigation, dialogs).
- ViewModels contain **zero Android View references** — no Context, no View.
- ViewModels call use cases only — never repositories or data sources directly.
- One ViewModel per screen.

```kotlin
@HiltViewModel
class OrderListViewModel @Inject constructor(
    private val getOrdersUseCase: GetOrdersUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(OrderListUiState())
    val uiState: StateFlow<OrderListUiState> = _uiState.asStateFlow()

    private val _events = MutableSharedFlow<OrderListEvent>()
    val events: SharedFlow<OrderListEvent> = _events.asSharedFlow()

    init {
        loadOrders()
    }

    private fun loadOrders() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            getOrdersUseCase()
                .onSuccess { orders ->
                    _uiState.update { it.copy(orders = orders, isLoading = false) }
                }
                .onFailure { error ->
                    _uiState.update { it.copy(error = error.message, isLoading = false) }
                }
        }
    }
}
```

### UiState Rules
- UiState is a **sealed class** or a **data class** — never mutable.
- Always include `isLoading`, `error`, and data fields.
- Never embed navigation logic in UiState.

---

## 3. Jetpack Compose Rules

- Composables are **pure functions of state** — no side effects in the composable body.
- Side effects only via `LaunchedEffect`, `SideEffect`, `DisposableEffect`.
- Collect StateFlow with `collectAsStateWithLifecycle()` (not `collectAsState()`).
- Extract `@Preview` functions for all UI components.
- All Composables must be **stateless** where possible — hoist state up.
- Use `remember { }` and `rememberSaveable { }` appropriately.
- Avoid heavy computation in Composables — use `derivedStateOf` or `remember`.

```kotlin
@Composable
fun OrderCard(
    order: Order,
    onOrderClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.clickable { onOrderClick(order.id) },
    ) {
        Text(text = order.title)
    }
}
```

---

## 4. Dependency Injection (Hilt)

- Use **Hilt** for all dependency injection.
- Modules defined per layer: `NetworkModule`, `DatabaseModule`, `RepositoryModule`.
- Use `@Singleton` for application-scoped dependencies.
- Use `@ViewModelScoped` for ViewModel-scoped dependencies.
- Never use `Hilt.component()` directly — rely on `@HiltViewModel` and `@Inject`.

---

## 5. Coroutines & Flows

- All async work via **Kotlin Coroutines**. No callbacks, no RxJava.
- Long-running work in `viewModelScope` or `lifecycleScope`.
- CPU-bound work on `Dispatchers.Default`.
- IO-bound work on `Dispatchers.IO`.
- Never hardcode dispatcher in use cases — inject `CoroutineDispatcher`.
- Use `Flow` for reactive streams. Use `StateFlow` for UI state.
- Prefer `flow { }` builder over `channelFlow` unless concurrency is required.
- Always handle `CancellationException` properly — never catch `Exception` blindly.

---

## 6. Room Database

- Define entities with proper indices for all query patterns.
- DAOs return `Flow<T>` for reactive queries, `suspend fun` for write operations.
- Use `@Transaction` for multi-table operations.
- Migrations must be versioned and tested. Never use `fallbackToDestructiveMigration` in production.
- Type converters for complex types (enums, dates, JSON).

---

## 7. Repository Pattern

```kotlin
// Domain layer (pure interface)
interface OrderRepository {
    fun getOrders(): Flow<List<Order>>
    suspend fun getOrderById(id: String): Result<Order>
    suspend fun createOrder(order: Order): Result<Unit>
}

// Data layer (implementation)
class OrderRepositoryImpl @Inject constructor(
    private val remoteDataSource: OrderRemoteDataSource,
    private val localDataSource: OrderLocalDataSource,
    private val mapper: OrderMapper
) : OrderRepository {
    override fun getOrders(): Flow<List<Order>> =
        localDataSource.getOrders().map { entities -> entities.map(mapper::toDomain) }
}
```

---

## 8. Testing Requirements

- **Unit tests**: All use cases, ViewModels, mappers, and utilities.
- **Integration tests**: Repository implementations with in-memory Room database.
- **UI tests**: Critical flows with Compose testing APIs.
- Use `TestCoroutineDispatcher` / `UnconfinedTestDispatcher` for coroutine testing.
- Use fakes over mocks for repository testing.
- Avoid Robolectric — prefer instrumented tests for Android-specific logic.

---

## Anti-Patterns (FORBIDDEN)

| Anti-Pattern | Corrective Action |
|---|---|
| Activity/Fragment with business logic | Move to ViewModel and use cases |
| Context in ViewModel | Inject application-scoped alternatives |
| Global singleton state | Use DI-scoped instances |
| Synchronous network calls on main thread | Coroutines on IO dispatcher |
| Direct Room access from ViewModel | Use repositories |
| LiveData in new code | Migrate to StateFlow |
| Raw Thread / AsyncTask | Coroutines |
