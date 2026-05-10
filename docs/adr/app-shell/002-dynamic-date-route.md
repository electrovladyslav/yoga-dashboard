# ADR-002: Dynamic `[date]` route with silent fallback

- **Status:** Accepted
- **Date:** 2026-04-22
- **Scope:** App shell

## Context

Users want to view and edit past/future trainings by URL. Trainings are keyed by ISO date strings in localStorage, so the URL becomes the natural identifier.

## Decision

Use a single-segment dynamic route `[date]` that accepts any string, parses it as a `Date`, and falls back to today when invalid — without surfacing an error to the user.

- Route: [`src/app/[date]/page.tsx:3-10`](../../../src/app/[date]/page.tsx#L3-L10)
- Validation: `const urlDate = new Date(params.date); const isUrlDateValid = !isNaN(urlDate.getTime());` — only rejects dates the `Date` constructor cannot parse at all.
- On invalid: renders `<TrainingPage />` (no prop), so `TrainingPage` defaults to `new Date()` ([`training-page.tsx:20`](../../../src/components/pages/training-page/training-page.tsx#L20)).
- On valid: renders `<TrainingPage trainingDate={urlDate} />`. The `useEffect` in `TrainingPage` ([`training-page.tsx:30-34`](../../../src/components/pages/training-page/training-page.tsx#L30-L34)) then calls `setTrainingFromTheDate`, which reads from localStorage.

## Execution flow

```
GET /2025-03-15
    ↓
new Date("2025-03-15") → valid
    ↓
<TrainingPage trainingDate={Date} />
    ↓
useEffect → getTrainings(formatDate(date))
    ↓
localStorage lookup → Training | undefined
    ↓
if found: setTrainingSteps(stored.steps)
if not: trainingSteps stays {} (empty editor)
```

## Edge cases & nuances

- `new Date("anything")` is permissive. `new Date("hello")` returns Invalid Date, but `new Date("2025")` parses as Jan 1 UTC, and `new Date("2025-13-40")` may or may not parse depending on the engine. The validation only catches the NaN case.
- `formatDate` uses `toISOString().split('T')[0]` ([`date.utils.ts:5-6`](../../../src/utils/date.utils.ts#L5-L6)), which converts to UTC. A user at UTC-8 visiting `/2025-03-15` late at night might see today's local date inside the editor header (the `<input type="date">`) while URL is yesterday. Document this in [data-model/003](../data-model/003-asana-reference-by-english-name.md) context.
- Invalid URL dates are silently swallowed — the user sees today's editor and has no indication the URL was malformed. No toast, no 404.
- There's no `generateStaticParams` — every `[date]` URL is dynamic at request time.

## Configuration

- Route: `/[date]` (any single-segment string)
- Expected format: `YYYY-MM-DD` (ISO 8601 date)

## Consequences

**Positive:**
- Shareable URLs for specific training dates.
- Graceful UX: a typo in the URL doesn't break the app.

**Negative / risks:**
- Silent fallback hides bugs (e.g., a broken link from an email) — the user won't know the URL was wrong.
- Timezone mismatch between `toISOString()` (UTC) and `<input type="date">` (local) can produce off-by-one-day storage/lookup bugs for users in non-UTC zones.
- URL validation is loose; `/2025` happily resolves to Jan 1.

## Related

- ADR-001 (app router structure)
- [persistence/001-localstorage-as-database.md](../persistence/001-localstorage-as-database.md)
- [data-model/001-training-and-trainingsteps.md](../data-model/001-training-and-trainingsteps.md)
