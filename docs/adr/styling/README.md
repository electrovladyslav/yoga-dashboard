# Styling

Design tokens in CSS variables, component styles in CSS modules, responsive behavior in raw `@media` queries. Tailwind is installed but unused for utility classes.

## Architecture

```
globals.css (:root design tokens)
    │
    ├─ --color-*     sage/warm-white/terracotta palette
    ├─ --space-*     4/8/12/16/24/32 px
    ├─ --radius-*    8/12/16/20 px
    ├─ --shadow-*    subtle, medium, prominent
    └─ element base (body, a, h1, h2, button)

*.module.css per component
    │
    └─ consume CSS vars; scope via module hashing

@media queries at three breakpoints:
    1024px   tablet
     640px   phone
     480px   chat-specific
```

## ADRs

| # | ADR | Topic |
|---|-----|-------|
| 1 | [001-calm-wellness-palette.md](./001-calm-wellness-palette.md) | Sage + warm-white + terracotta; CSS vars in `:root`; no dark mode |
| 2 | [002-css-modules-no-tailwind-utils.md](./002-css-modules-no-tailwind-utils.md) | Tailwind installed but only consumes `@tailwind base/components/utilities`; component styles via `*.module.css` |
| 3 | [003-responsive-breakpoints.md](./003-responsive-breakpoints.md) | Three media query breakpoints; grid collapses 6 → 3 → 2 columns |

## Key files

- [`src/app/globals.css`](../../../src/app/globals.css)
- [`tailwind.config.ts`](../../../tailwind.config.ts)
- [`src/components/pages/training-page/training-page.module.css`](../../../src/components/pages/training-page/training-page.module.css)
- [`src/components/asana-card/asana-card.module.css`](../../../src/components/asana-card/asana-card.module.css)
- [`src/components/training-step/training-step.module.css`](../../../src/components/training-step/training-step.module.css)
- [`src/components/chat/chat.module.css`](../../../src/components/chat/chat.module.css)
