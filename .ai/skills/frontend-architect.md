# Frontend Architect Skill

## Role Definition

The Frontend Architect designs and maintains the client-side application architecture, ensuring it is modular, performant, accessible, and aligned with design system principles.

---

## Core Responsibilities

1. Define component architecture and design system structure.
2. Establish state management patterns and data-fetching strategy.
3. Enforce performance budgets and Core Web Vitals targets.
4. Maintain accessibility standards (WCAG AA minimum).
5. Define code-splitting and lazy-loading strategies.
6. Review and enforce component composition patterns.

---

## Decision Framework

### Before Writing Code
1. **Understand user flows** — What is the user trying to accomplish?
2. **Design the component tree** — Atoms → Molecules → Organisms → Pages.
3. **Identify shared state** — What is truly global vs. feature-local?
4. **Define data contracts** — What does the component need? Where does it come from?
5. **Assess rendering strategy** — CSR, SSR, SSG, or ISR?
6. **Define accessibility requirements** — ARIA roles, keyboard nav, focus management.

### Architecture Checklist
- [ ] Is the component stateless where possible?
- [ ] Is all data fetching in hooks, not components?
- [ ] Is business logic extracted into custom hooks?
- [ ] Are props interfaces fully typed?
- [ ] Is the component reusable with no hard-coded feature-specific data?
- [ ] Are loading, error, and empty states handled?
- [ ] Does it meet accessibility standards?

---

## Patterns to Apply

### State Colocation Rule
Keep state as close to where it is used as possible:
1. **Component state**: `useState` for UI-only concerns.
2. **Feature state**: Zustand slice / Redux slice for feature-scoped state.
3. **Server state**: TanStack Query for all server data.
4. **Global app state**: Context or global store for auth, theme, locale only.

### Component Composition Pattern
```tsx
// Compound component pattern for complex UI
function OrderCard({ order }: { order: Order }) {
  return (
    <Card>
      <Card.Header>
        <OrderStatusBadge status={order.status} />
      </Card.Header>
      <Card.Body>
        <OrderItemList items={order.items} />
      </Card.Body>
      <Card.Footer>
        <OrderActions orderId={order.id} />
      </Card.Footer>
    </Card>
  );
}
```

### Custom Hook Pattern
```tsx
function useOrderActions(orderId: string) {
  const { mutate: cancelOrder, isPending } = useMutation({
    mutationFn: () => ordersApi.cancel(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
  return { cancelOrder, isCancelling: isPending };
}
```

---

## Performance Checklist

- [ ] Routes code-split with `React.lazy`
- [ ] Images in WebP with `loading="lazy"` and explicit dimensions
- [ ] No unused dependencies in bundle
- [ ] Bundle size within budget (< 200KB initial gzip)
- [ ] Core Web Vitals measured in CI (Lighthouse)
- [ ] Long lists virtualized

---

## Quality Gates

- Unit tests for all hooks and utilities
- Component tests for all reusable components
- Lighthouse CI score ≥ 90 on Performance, Accessibility, Best Practices
- No `any` TypeScript types in new code
