# ADR-002: Asana schema and the frozen `ASANAS` catalog

- **Status:** Accepted
- **Date:** 2026-04-22
- **Scope:** Data model

## Context

The app needs a fixed catalog of yoga poses. There is no backend, so this must be in-code data.

## Decision

A single exported array `ASANAS: Asana[]` in [`src/constants/asana.ts`](../../../src/constants/asana.ts). The `Asana` interface is declared at [`asana.ts:1-12`](../../../src/constants/asana.ts#L1-L12).

### Fields

- `id: number` — numeric, not sequential (gaps exist).
- `english_name: string` — **canonical key**; used as drag id and as the stored value in `TrainingSteps`.
- `sanskrit_name_adapted: string` — transliteration without diacritics (e.g., `Navasana`).
- `sanskrit_name: string` — full diacritic form (e.g., `Nāvāsana`).
- `translation_name: string` — etymology (e.g., `nāva = boat, āsana = posture`).
- `pose_description: string` — multi-sentence instructions.
- `pose_benefits: string` — multi-sentence therapeutic benefits.
- `url_svg: string` — primary illustration, Cloudinary CDN.
- `url_png: string` — PNG fallback, Cloudinary CDN.
- `url_svg_alt: string` — legacy Dropbox SVG backup.

### Size

~48 entries in the array (non-contiguous ids). The file is ~590 lines.

## Edge cases & nuances

- **Ids are numeric but not used as keys.** `AsanaCard` renders `key={asana.id}` ([`training-page.tsx:67`](../../../src/components/pages/training-page/training-page.tsx#L67)), but every reference that persists (storage, drag id) is `english_name`. The `id` field is essentially ornamental (see [003-asana-reference-by-english-name.md](./003-asana-reference-by-english-name.md)).
- **Three URLs per asana, only one rendered.** [`asana-card.tsx:19`](../../../src/components/asana-card/asana-card.tsx#L19) always uses `url_svg`. `url_png` and `url_svg_alt` exist as fallback data but there is no runtime fallback logic.
- **No category / difficulty / style field.** Any grouping by workout type (strength, flexibility, balance, relaxation) lives in hardcoded lists inside the AI service — see [ai-chat/004-asana-selection-and-distribution.md](../ai-chat/004-asana-selection-and-distribution.md).
- **Uniqueness of `english_name` is assumed, not enforced.** If two entries shared the same english name, `getAsanaCard` ([`training-page.tsx:73-76`](../../../src/components/pages/training-page/training-page.tsx#L73-L76)) would hide both whenever one is placed, and `ASANAS.filter` ([`training-page.tsx:66`](../../../src/components/pages/training-page/training-page.tsx#L66)) would render both whenever one is in a step.

## Configuration

- Source of images: `res.cloudinary.com/...` for SVG/PNG, `dl.dropboxusercontent.com` for alt SVG.

## Consequences

**Positive:**
- Zero runtime dependency on an external data source.
- Content versioning = git history of `asana.ts`.

**Negative / risks:**
- Updating pose content requires a redeploy.
- External image URLs are not whitelisted in `next.config.mjs` — see [app-shell/003](../app-shell/003-path-alias-and-config.md).
- The redundant fields (`url_png`, `url_svg_alt`, `id`) are never exercised — dead data.

## Related

- ADR-003 (referencing by english_name)
- [ai-chat/004-asana-selection-and-distribution.md](../ai-chat/004-asana-selection-and-distribution.md)
