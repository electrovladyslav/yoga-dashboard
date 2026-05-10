# ADR-002: `parseUserMessage` — regex/keyword extraction with a yoga-topic gate

- **Status:** Accepted
- **Date:** 2026-04-22
- **Scope:** AI chat

## Context

The "AI" needs to turn freeform user text into a structured `YogaRequest`. We also want to politely deflect non-yoga chatter without generating a full plan.

## Decision

One method, `parseUserMessage` ([`ai-yoga.service.ts:26-62`](../../../src/services/ai-yoga.service.ts#L26-L62)). Returns `YogaRequest` or `null`.

### Extraction rules

- **Level** ([`:30-35`](../../../src/services/ai-yoga.service.ts#L30-L35)): default `'beginner'`. `'intermediate'` or `'moderate'` → `intermediate`. `'advanced'` or `'expert'` → `advanced`. (Advanced is checked with `else if`, so `'intermediate advanced'` resolves as `intermediate`.)
- **Duration** ([`:38-39`](../../../src/services/ai-yoga.service.ts#L38-L39)): regex `/(\d+)\s*(?:min|minute)/i`. Default 30 minutes if no match.
- **Focus** ([`:42-51`](../../../src/services/ai-yoga.service.ts#L42-L51)): default `'general'`. Priority order: strength → flexibility → balance → relaxation (each with 1–2 trigger words). First match wins (else-if chain).
- **Topic gate** ([`:54-59`](../../../src/services/ai-yoga.service.ts#L54-L59)): message must contain one of `['yoga', 'asana', 'pose', 'practice', 'sequence', 'training', 'plan']`. Otherwise returns `null`.

All comparisons are case-insensitive via a single `toLowerCase()` at [`:27`](../../../src/services/ai-yoga.service.ts#L27).

## Execution flow

```
"Create an advanced 45 minute strength yoga sequence"
    ↓ lowercase
"create an advanced 45 minute strength yoga sequence"
    ↓ level: contains 'advanced' → advanced
    ↓ duration: regex → 45
    ↓ focus: contains 'strength' → strength
    ↓ topic gate: contains 'yoga' → pass
    ↓
{ level: 'advanced', duration: 45, focus: 'strength' }
```

## Edge cases & nuances

- **"Stretch" maps to flexibility** ([`:45`](../../../src/services/ai-yoga.service.ts#L45)) — not `stretching` (the step). No confusion at runtime because `focus` and `step` live in different namespaces, but a reader might assume they're related.
- **"strong" maps to strength** ([`:43`](../../../src/services/ai-yoga.service.ts#L43)) — "I'm feeling strong today, show me a stretch" resolves as `strength`, not `flexibility`, because of the else-if order.
- **Durations without "min"/"minute" are ignored.** "60 seconds" matches nothing, defaults to 30 minutes. "90-minute session" works because of the non-greedy whitespace matcher.
- **Huge durations are accepted.** "90000 minute yoga" parses as 90000, feeds into distribution as `max(8, 30000)` asanas per plan. The `selectAsanasForStep` shuffle truncates to the available pool (see [004](./004-asana-selection-and-distribution.md)), so outputs stay bounded. No explicit cap.
- **Returns `null`** for any message without a yoga keyword. Chat falls back to a canned "tell me about your practice" reply at [`ai-yoga.service.ts:220-223`](../../../src/services/ai-yoga.service.ts#L220-L223).
- **`injuries` and `preferences` in `YogaRequest` are never populated** — the parser ignores them despite the type declaring them optional.

## Configuration

Keyword lists are hardcoded; see source.

## Consequences

**Positive:**
- Predictable, testable, no network.
- Easy to extend one keyword at a time.

**Negative / risks:**
- Substring matching is brittle — `"advanced"` inside `"I've advanced in yoga"` hits; `"ad-vanced"` misses.
- No handling of conflicting signals (e.g., "beginner advanced yoga").
- No support for the `injuries`/`preferences` fields the type exposes.

## Related

- ADR-001 (overall simulated AI)
- ADR-004 (how the parsed request becomes a plan)
