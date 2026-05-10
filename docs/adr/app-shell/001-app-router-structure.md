# ADR-001: App Router structure with a single client boundary

- **Status:** Accepted
- **Date:** 2026-04-22
- **Scope:** App shell

## Context

The app uses Next.js 14 App Router. Nearly all UX lives inside a single interactive training editor. Everything outside that editor (metadata, fonts, routing) can stay on the server; everything inside it needs state, drag-and-drop, and `localStorage` access.

## Decision

Keep the shell server-rendered and concentrate `'use client'` at a single component — `TrainingPage`. The route pages are thin wrappers that import it.

- Root layout: [`src/app/layout.tsx:21-35`](../../../src/app/layout.tsx#L21-L35) — server component; loads Geist Sans/Mono via `next/font/local` ([`layout.tsx:5-14`](../../../src/app/layout.tsx#L5-L14)) and exports `metadata` ([`layout.tsx:16-19`](../../../src/app/layout.tsx#L16-L19)).
- Home page: [`src/app/page.tsx`](../../../src/app/page.tsx) — server component, renders `<TrainingPage />` with no props.
- Dynamic page: [`src/app/[date]/page.tsx`](../../../src/app/[date]/page.tsx) — server component, parses `params.date` and passes a `Date` prop.
- Client boundary: [`src/components/pages/training-page/training-page.tsx:1`](../../../src/components/pages/training-page/training-page.tsx#L1) — the only `'use client'` in the render tree for the main flow. `Chat` ([`chat.tsx:1`](../../../src/components/chat/chat.tsx#L1)) is also `'use client'` but is rendered *from within* `TrainingPage`.

`AsanaCard` and `TrainingStep` don't declare `'use client'` themselves; they inherit the client context from `TrainingPage`. This works because App Router treats everything rendered inside a client component as client-side.

## Edge cases & nuances

- No `loading.tsx`, `error.tsx`, or `not-found.tsx` anywhere. An error thrown in the client component surfaces as the default Next.js error overlay in dev and a generic 500 in prod.
- No `Suspense` boundaries; not needed since no async server components exist.
- `TrainingStep` imports its CSS module via a root-relative path (`src/components/training-step/...`) instead of the `@/` alias used elsewhere — see [`training-step.tsx:1`](../../../src/components/training-step/training-step.tsx#L1). Both resolve, but it's an inconsistency.

## Configuration

- `next.config.mjs`: empty object — all Next.js defaults.
- `metadata.title`: `"Yoga dashboard"`; `metadata.description`: `"A simple dashboard to plan your future yoga trainings"`.

## Consequences

**Positive:**
- Zero per-page client overhead for the home route shell (fonts, metadata) — they stream from the server.
- Single place to reason about state and side effects (`TrainingPage`).

**Negative / risks:**
- If a second page is added that also needs interactivity, the "one big client component" pattern doesn't scale — it will need to be split.
- No error boundary means a thrown exception during hydration (e.g., malformed `localStorage`) takes down the entire editor silently in prod.

## Related

- ADR-002 (dynamic date route)
- [persistence/003-no-versioning-or-error-recovery.md](../persistence/003-no-versioning-or-error-recovery.md)
