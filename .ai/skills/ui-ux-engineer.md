# UI/UX Engineer Skill

## Role Definition

The UI/UX Engineer bridges design and engineering, ensuring the product is visually excellent, accessible, consistent, and delightful to use. This role owns the design system and ensures all UI implementation matches design intent.

---

## Core Responsibilities

1. Maintain and evolve the design system (tokens, components, patterns).
2. Ensure accessibility (WCAG AA minimum) across all interfaces.
3. Implement and enforce consistent micro-animations and transitions.
4. Validate UI implementation against design specifications.
5. Define interaction patterns and user flow standards.
6. Conduct usability reviews before feature releases.

---

## Design System Architecture

### Token Hierarchy

```css
/* Level 1: Primitive tokens */
--color-purple-500: #6366f1;
--color-gray-900: #111827;
--spacing-4: 1rem;

/* Level 2: Semantic tokens */
--color-primary: var(--color-purple-500);
--color-background: var(--color-gray-900);
--spacing-md: var(--spacing-4);

/* Level 3: Component tokens */
--button-primary-bg: var(--color-primary);
--button-padding: var(--spacing-md);
```

### Component Library Structure

```
/designsystem
  /tokens       # CSS custom properties, JS theme constants
  /atoms        # Button, Input, Badge, Icon, Avatar
  /molecules    # Card, Modal, Dropdown, SearchBar
  /organisms    # Navbar, DataTable, Form, Sidebar
  /layouts      # PageLayout, GridLayout, SplitLayout
  /patterns     # Common UX patterns (empty states, error states, loading)
```

---

## Design Standards

### Typography
- Define a type scale: display, h1–h4, body-lg, body, body-sm, caption.
- Use system fonts with a web-safe fallback or load from Google Fonts with `font-display: swap`.
- Line height: 1.4–1.6 for body text. 1.1–1.2 for headings.
- Max line length: 65–75 characters for readability.

### Color
- Every color must have a semantic name — no magic hex codes in components.
- Maintain 4.5:1 contrast ratio for normal text (WCAG AA).
- Design for both light and dark modes from the start.
- Use HSL for defining color palettes — easier to derive shades.

### Spacing
- Use a base-8 spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Apply spacing via design tokens — never raw pixel values in components.

### Animation
- Micro-animations: 100–200ms, ease-out.
- Page transitions: 200–300ms, ease-in-out.
- Never animate properties that trigger layout (width, height, padding). Animate `transform` and `opacity` only.
- Respect `prefers-reduced-motion` media query.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility Standards

### Requirements (WCAG AA)
- Color contrast: ≥ 4.5:1 normal text, ≥ 3:1 large text.
- All interactive elements keyboard accessible.
- Focus indicators always visible.
- All images have meaningful `alt` text.
- Forms have associated `<label>` elements.
- Error messages associated with fields via `aria-describedby`.

### Keyboard Navigation
- Tab order follows logical reading order.
- Modal dialogs trap focus when open.
- Escape key closes modals and dropdowns.
- Arrow keys navigate within menus, tabs, and selects.

---

## Responsive Design

- Mobile-first: base styles for 320px, then breakpoints up.
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px).
- Touch targets minimum 44x44px on mobile.
- No horizontal scrolling at any breakpoint.

---

## Quality Gates

- Lighthouse Accessibility score ≥ 90 on all pages.
- All components have Storybook stories with all states.
- Design tokens used exclusively — no hardcoded colors or spacing.
- Cross-browser testing: Chrome, Firefox, Safari, Edge.
- Mobile testing on real devices (iOS and Android).
