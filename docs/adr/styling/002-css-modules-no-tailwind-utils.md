# ADR-002: CSS modules for components; Tailwind only provides base reset

- **Status:** Accepted
- **Date:** 2026-04-22
- **Scope:** Styling

## Context

Tailwind is installed as a dev dependency (package.json line 22). But the design system is CSS-variable based and components have rich per-feature styles, so utility classes don't naturally fit.

## Decision

- Tailwind is invoked only via the three directives at the top of [`globals.css:1-3`](../../../src/app/globals.css#L1-L3): `@tailwind base; @tailwind components; @tailwind utilities;`. The `base` layer contributes the reset.
- The Tailwind config ([`tailwind.config.ts`](../../../tailwind.config.ts)) extends theme colors with `background` / `foreground` mapped to `var(--background)` / `var(--foreground)` — **but neither variable is defined in globals.css**. These theme extensions are vestigial.
- **No component source file uses Tailwind utility classes.** (Grep for `sm:`, `md:`, `lg:` returns nothing in components.) Every `className` in components refers to a CSS module.
- CSS modules:
  - [`training-page.module.css`](../../../src/components/pages/training-page/training-page.module.css)
  - [`training-step.module.css`](../../../src/components/training-step/training-step.module.css)
  - [`asana-card.module.css`](../../../src/components/asana-card/asana-card.module.css)
  - [`chat.module.css`](../../../src/components/chat/chat.module.css)

Modules consume `var(--color-*)` / `var(--space-*)` etc. directly.

## Edge cases & nuances

- **Tailwind's `utilities` layer still emits the full utility stylesheet** in dev builds unless purged — Tailwind 3 purges based on the `content` globs in [`tailwind.config.ts:4-8`](../../../tailwind.config.ts#L4-L8). Because no utility classes are present in any file, the purged output is empty, so there's negligible bundle impact.
- **`background` / `foreground` theme keys point at undefined CSS vars** (`--background`, `--foreground`). If anyone writes `class="bg-background"`, it resolves to `var(--background)` → invalid → computed as initial. Harmless until someone tries to use it.
- **Adding a Tailwind utility to any component would "just work"** — the build pipeline is intact — which is a footgun for contributors who don't realize the convention.

## Configuration

- [`tailwind.config.ts:4-8`](../../../tailwind.config.ts#L4-L8) content globs
- [`postcss.config.mjs`](../../../postcss.config.mjs) uses only `tailwindcss`

## Consequences

**Positive:**
- Clean separation: global tokens via vars, component styles in modules.
- No Tailwind learning curve to read component CSS.
- Scoped class names prevent cross-component collisions.

**Negative / risks:**
- Tailwind presence confuses new contributors ("should I use utilities?").
- Dead config entries (the undefined vars in `theme.extend.colors`) age poorly.

## Related

- ADR-001 (palette tokens)
- ADR-003 (responsive via @media)
