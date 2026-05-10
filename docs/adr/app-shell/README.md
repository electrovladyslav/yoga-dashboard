# App Shell

The Next.js 14 App Router shell — how pages, layouts, and the root module graph are wired. There is only one interactive page (the training editor); the rest of the shell is minimal.

## Architecture

```
RootLayout (server)
 ├─ next/font/local (Geist Sans + Mono)
 ├─ globals.css (design tokens)
 └─ children
     ├─ / (Home, server)           → <TrainingPage />
     └─ /[date] (server)           → <TrainingPage trainingDate={...} />
                                       │
                                       └─ 'use client' boundary
                                           ├─ DndContext
                                           ├─ Chat
                                           └─ Notification toast
```

## ADRs

| # | ADR | Topic |
|---|-----|-------|
| 1 | [001-app-router-structure.md](./001-app-router-structure.md) | Server layout, server pages, single client boundary at TrainingPage |
| 2 | [002-dynamic-date-route.md](./002-dynamic-date-route.md) | `[date]` segment + silent fallback to today on invalid dates |
| 3 | [003-path-alias-and-config.md](./003-path-alias-and-config.md) | `@/*` alias, empty `next.config.mjs`, Geist local fonts, strict TS |

## Key files

- [`src/app/layout.tsx`](../../../src/app/layout.tsx)
- [`src/app/page.tsx`](../../../src/app/page.tsx)
- [`src/app/[date]/page.tsx`](../../../src/app/[date]/page.tsx)
- [`tsconfig.json`](../../../tsconfig.json)
- [`next.config.mjs`](../../../next.config.mjs)
