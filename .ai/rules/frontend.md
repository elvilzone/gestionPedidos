# Frontend Engineering Rules

## Core Standards

All frontend code must follow these rules to ensure consistency, maintainability, and performance across web and mobile web applications.

---

## 1. Architecture

### Component Architecture
- Follow **Atomic Design**: atoms → molecules → organisms → templates → pages.
- Components must be **single-responsibility**: one concern per component.
- Presentational components have no business logic — only render props.
- Container components handle state and pass data to presentational components.
- Smart components connect to state management; dumb components are pure.

### State Management
- **Local state**: UI-only concerns (open/closed, hover, focus).
- **Feature state**: Feature-scoped store slices (Zustand, Redux Toolkit).
- **Server state**: Use React Query / SWR / TanStack Query for all server data.
- **Global state**: Only for truly global concerns (auth, theme, locale).
- Never store server-fetched data in local state — use a server state library.

### Folder Structure
```
/src
  /components
    /ui          # Design system atoms (Button, Input, Badge)
    /shared      # Shared molecules across features
  /features
    /auth
      /components
      /hooks
      /store
      /types
      /api
    /dashboard
      /...
  /pages         # Route-level components only
  /hooks         # Global reusable hooks
  /lib           # Third-party wrappers, utilities
  /styles        # Global CSS, design tokens
  /types         # Global TypeScript types
  /store         # Global state (auth, app config)
  /constants     # App-wide constants
```

---

## 2. Component Rules

- All components written with **TypeScript** — no `any` type.
- Props interfaces defined explicitly: `interface ButtonProps { ... }`.
- Use `React.FC` only if you need children typing; otherwise prefer plain functions.
- Default exports for pages. Named exports for reusable components.
- Max component file length: **300 lines**. Split if exceeded.
- Extract complex logic into custom hooks: `useOrderForm`, `useAuthFlow`.

### Component Template
```tsx
interface CardProps {
  title: string;
  description?: string;
  className?: string;
}

export function Card({ title, description, className }: CardProps) {
  return (
    <div className={cn('card', className)}>
      <h3 className="card__title">{title}</h3>
      {description && <p className="card__description">{description}</p>}
    </div>
  );
}
```

---

## 3. Styling Rules

- Use **CSS Modules** or a **Design System** for all styling.
- No inline styles except for dynamic values (width, color from props/state).
- Design tokens for all colors, spacing, typography, and border-radius.
- Follow BEM naming for CSS classes: `.block__element--modifier`.
- Mobile-first responsive design: base styles for mobile, then breakpoints upward.
- No magic numbers in CSS — use CSS custom properties (variables).

```css
/* Design tokens */
:root {
  --color-primary: #6366f1;
  --color-surface: #1e1e2e;
  --spacing-md: 1rem;
  --radius-lg: 0.75rem;
  --font-size-lg: 1.125rem;
}
```

---

## 4. Data Fetching Rules

- Use **TanStack Query** (React Query) for all server state management.
- Define API functions in `/features/{name}/api/` — never in components.
- Never fetch data directly in a component body — use hooks.
- Handle loading, error, and empty states for ALL data-fetching flows.
- Use optimistic updates for better UX in mutation flows.
- Set appropriate `staleTime` and `gcTime` for cache strategy.

```ts
// /features/orders/api/orders.api.ts
export const fetchOrders = async (params: OrderParams): Promise<Order[]> => {
  const response = await apiClient.get('/orders', { params });
  return response.data;
};

// /features/orders/hooks/useOrders.ts
export function useOrders(params: OrderParams) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => fetchOrders(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

---

## 5. Forms

- Use **React Hook Form** + **Zod** for all form handling and validation.
- Define Zod schemas in `/features/{name}/schemas/` — reuse across frontend and backend.
- Never use uncontrolled inputs outside of RHF.
- Implement field-level validation messages.
- Disable submit button while submitting. Show loading state.

---

## 6. Accessibility (a11y)

- All interactive elements must be keyboard navigable.
- Use semantic HTML: `<button>`, `<nav>`, `<main>`, `<section>`, `<article>`.
- All images must have meaningful `alt` text (empty string for decorative).
- ARIA attributes only when semantic HTML is insufficient.
- Color contrast minimum 4.5:1 for normal text, 3:1 for large text (WCAG AA).
- Focus indicators must be visible. Never `outline: none` without replacement.
- Test with screen readers (NVDA, VoiceOver) on critical flows.

---

## 7. Performance Rules

- Lazy load all routes with `React.lazy` and `Suspense`.
- Memoize expensive computations with `useMemo`.
- Prevent unnecessary re-renders with `React.memo` and `useCallback`.
- Optimize images: use WebP, specify `width`/`height`, use `loading="lazy"`.
- Bundle analyze before each major release. No unused dependencies.
- Core Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1.

---

## 8. Testing Requirements

- **Unit tests** for all hooks, utilities, and pure functions.
- **Component tests** with React Testing Library (test behavior, not implementation).
- **E2E tests** with Playwright or Cypress for critical user flows.
- Test IDs via `data-testid` attributes — never select by CSS class in tests.
- Never test implementation details. Test what the user sees.

---

## Anti-Patterns (FORBIDDEN)

| Anti-Pattern | Corrective Action |
|---|---|
| Business logic in components | Move to custom hooks or use cases |
| Direct API calls in components | Use feature-specific hooks |
| Prop drilling > 3 levels | Use context, state management, or composition |
| CSS class magic strings | Use design tokens or CSS Modules |
| `useEffect` for derived state | Use `useMemo` or derived values |
| Mutating state directly | Always use immutable updates |
| Unhandled async errors | Wrap in try/catch or React Query error handling |
