# ADR-004: `STEPS` constant drives UI order and phase taxonomy

- **Status:** Accepted
- **Date:** 2026-04-22
- **Scope:** Data model

## Context

A yoga session has phases. We need a single place to define them so the UI, the AI generator, and the stored data all agree.

## Decision

A single array literal in [`src/constants/steps.ts:1`](../../../src/constants/steps.ts#L1):

```
['set-up', 'warm-up', 'workout', 'cool-down', 'stretching', 'shavasanah']
```

Everything keys off this array:
- UI column order: `STEPS.map((step) => <TrainingStep ...>)` at [`training-page.tsx:108-112`](../../../src/components/pages/training-page/training-page.tsx#L108-L112)
- AI distribution: `STEPS.forEach(step => { ... })` at [`ai-yoga.service.ts:154-157`](../../../src/services/ai-yoga.service.ts#L154-L157)

## Edge cases & nuances

- **Array position IS the order.** Rearranging the literal rearranges the UI without any other change needed.
- **`'shavasanah'`** is a phonetic English spelling of Shavasana (final corpse pose). Canonical spelling is usually `'savasana'` or `'shavasana'`. Whatever the choice, it's stored in every saved training and in the AI's `stepCategories` ([`ai-yoga.service.ts:94`](../../../src/services/ai-yoga.service.ts#L94)) and distribution map ([`ai-yoga.service.ts:151`](../../../src/services/ai-yoga.service.ts#L151)). Renaming it here is a breaking change for persisted data.
- **No metadata.** No display label, no target duration, no color. `TrainingStep` renders the raw string as a header ([`training-step.tsx:23`](../../../src/components/training-step/training-step.tsx#L23)) — `'cool-down'` appears in the UI exactly like that, made uppercase by a CSS rule.
- **No type.** The array is a plain `string[]`, not a `readonly` tuple. TypeScript cannot narrow keys of `TrainingSteps` to members of `STEPS`.

## Configuration

File: [`src/constants/steps.ts`](../../../src/constants/steps.ts)

## Consequences

**Positive:**
- One-line configuration; impossible to get out of sync.
- Reordering phases is a one-character diff.

**Negative / risks:**
- Display strings leak into storage (rename = migration).
- No way to express a step that is optional, collapsed, or duration-bound.
- Typos in `stepCategories` keys inside the AI service would silently produce empty steps (`stepCategories[step] || []` at [`ai-yoga.service.ts:99`](../../../src/services/ai-yoga.service.ts#L99)).

## Related

- ADR-001 (TrainingSteps index signature)
- [ai-chat/004-asana-selection-and-distribution.md](../ai-chat/004-asana-selection-and-distribution.md)
