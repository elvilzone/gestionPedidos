# Mobile Architect Skill (Android / Kotlin)

## Role Definition

The Mobile Architect designs and maintains the Android application architecture, ensuring it is modular, testable, performant, and follows Jetpack best practices.

---

## Core Responsibilities

1. Define module boundaries and feature module structure.
2. Establish ViewModel / UiState / UiEvent patterns.
3. Enforce Hilt DI graph design.
4. Define navigation architecture and deep link strategy.
5. Maintain performance standards (60 FPS, < 2s cold start).
6. Define offline-first strategy and local/remote sync.

---

## Decision Framework

### Before Writing Code
1. **Identify the feature** — Which module does this belong to?
2. **Define UiState** — What data does the screen need?
3. **Identify use cases** — What business operations does the screen trigger?
4. **Define repository interface** — What data does the use case need?
5. **Plan data flow** — Remote → Repository → UseCase → ViewModel → Composable.
6. **Assess offline needs** — Should data be cached in Room?

### Architecture Checklist
- [ ] ViewModel contains zero Android View references.
- [ ] UiState is a sealed class or immutable data class.
- [ ] Use cases injected into ViewModel via Hilt.
- [ ] Repositories return domain entities, not ORM entities.
- [ ] All IO on `Dispatchers.IO`, UI on `Dispatchers.Main`.
- [ ] No callbacks — coroutines and Flow throughout.
- [ ] Navigation routes defined in `navigation` module.

---

## Patterns to Apply

### Screen Pattern
```kotlin
@Composable
fun OrderListScreen(
    viewModel: OrderListViewModel = hiltViewModel(),
    onNavigateToDetail: (String) -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        viewModel.events.collect { event ->
            when (event) {
                is OrderListEvent.NavigateToDetail -> onNavigateToDetail(event.orderId)
            }
        }
    }

    OrderListContent(
        uiState = uiState,
        onOrderClick = viewModel::onOrderClicked
    )
}

@Composable
private fun OrderListContent(
    uiState: OrderListUiState,
    onOrderClick: (String) -> Unit
) {
    when {
        uiState.isLoading -> LoadingScreen()
        uiState.error != null -> ErrorScreen(message = uiState.error)
        else -> LazyColumn {
            items(uiState.orders) { order ->
                OrderCard(order = order, onClick = { onOrderClick(order.id) })
            }
        }
    }
}
```

### UiState Pattern
```kotlin
data class OrderListUiState(
    val orders: List<OrderUiModel> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

sealed interface OrderListEvent {
    data class NavigateToDetail(val orderId: String) : OrderListEvent
    data object ShowErrorDialog : OrderListEvent
}
```

---

## Module Dependency Rules

```
:app → :features:* → :domain → nothing
:app → :navigation
:features:* → :core:*
:core:* → nothing (except :core:common)
```

Never introduce a reverse or circular dependency.

---

## Quality Gates

- All ViewModels have unit tests with `UnconfinedTestDispatcher`.
- All repositories have integration tests with in-memory Room database.
- Critical flows covered with Compose UI tests.
- No memory leaks validated with LeakCanary in debug builds.
- Release build profiled for startup time and frame rate.
