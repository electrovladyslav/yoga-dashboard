# ADR-004: Hardcoded per-step pools; duration drives a fixed distribution

- **Status:** Accepted
- **Date:** 2026-04-22
- **Scope:** AI chat

## Context

Given a parsed `YogaRequest`, we need to produce a `TrainingSteps` object with plausible asanas in each phase.

## Decision

Two fixed maps plus a small random shuffle:

### Total asanas

`totalAsanas = Math.max(8, Math.floor(request.duration / 3))` at [`ai-yoga.service.ts:144`](../../../src/services/ai-yoga.service.ts#L144). Minimum 8; otherwise 1 asana per 3 minutes.

### Distribution (fraction of `totalAsanas`)

- `set-up`: `max(1, floor(total * 0.1))`
- `warm-up`: `max(2, floor(total * 0.2))`
- `workout`: `max(3, floor(total * 0.4))`
- `cool-down`: `max(2, floor(total * 0.15))`
- `stretching`: `max(2, floor(total * 0.1))`
- `shavasanah`: `1` (constant)

See [`ai-yoga.service.ts:145-152`](../../../src/services/ai-yoga.service.ts#L145-L152). Note: percentages sum to 0.95, not 1.0 — accepted as approximate.

### Per-step pools

`stepCategories` in [`ai-yoga.service.ts:76-97`](../../../src/services/ai-yoga.service.ts#L76-L97) maps step name → array of english names:
- `'set-up'`: 5 names (Mountain, Easy Pose, Standing Forward Bend, Child's Pose, Cat Cow)
- `'warm-up'`: 6 names
- `'cool-down'`: 5 names
- `'stretching'`: 6 names
- `'shavasanah'`: 3 names
- `'workout'`: dynamic via `getWorkoutAsanas(request)` ([`:103-138`](../../../src/services/ai-yoga.service.ts#L103-L138))

### `getWorkoutAsanas` per focus

- `strength` → 10 poses (Warriors, Chair, Plank, Chaturanga, Crow…)
- `flexibility` → 8 poses
- `balance` → 7 poses
- `relaxation` → 5 poses
- `general` → first 15 of `[strength, flexibility, balance]` concatenation

### Selection

`selectAsanasForStep(step, request, count)` ([`:64-70`](../../../src/services/ai-yoga.service.ts#L64-L70)):
1. Look up pool (`getAsanasForStep`).
2. Intersect with `ASANAS.map(a => a.english_name)` — prunes any typo to avoid dangling references ([`:100`](../../../src/services/ai-yoga.service.ts#L100)).
3. Shuffle via `sort(() => Math.random() - 0.5)`.
4. Return `slice(0, Math.min(count, shuffled.length))`.

## Execution flow

```
request = { level, duration=45, focus='strength' }
    │
    ▼ totalAsanas = max(8, 15) = 15
    ▼
distribution:
    set-up=1, warm-up=3, workout=6, cool-down=2, stretching=1, shavasanah=1
    │
    ▼ for each step:
      pool = stepCategories[step] (workout pool depends on focus)
      pool ∩ ASANAS names
      shuffle + slice(count)
    │
    ▼
TrainingSteps { 'set-up': [...], 'warm-up': [...], ... }
```

## Edge cases & nuances

- **Shuffle is not uniformly random.** `sort(() => Math.random() - 0.5)` is biased, but for pools of 5–10 it's visibly "mixed" enough.
- **Missing asanas prune silently.** A name in `stepCategories` that's not in `ASANAS` is dropped at [`:100`](../../../src/services/ai-yoga.service.ts#L100). This matters because pool strings are hand-typed and not type-checked against the catalog.
- **Small pools cap counts.** Asking for 45 minutes with focus=relaxation requests many workout poses but the pool has only 5 — `Math.min` caps at 5, shorting the plan.
- **`shavasanah` always gets exactly 1.** The override at [`:151`](../../../src/services/ai-yoga.service.ts#L151) ignores duration and focus.
- **"Cat Cow Pose" appears in both `set-up` and `warm-up` pools** ([`:79`, `:82`](../../../src/services/ai-yoga.service.ts#L79)). The outer step loop prevents same-step duplicates (via the shuffle-once-then-slice), but a given plan can pick the same pose for both steps — and then the Apply Sequence flow writes it into both, but the first render in TrainingPage keeps it in whichever step comes later in the iteration because `getAsanaCard` hides the library copy once it's present anywhere, while `getDraggableChildren` renders it in every step where it's listed. Effectively the user can see the same card in two steps after applying.
- **`level` is parsed but only used by `generateTips`** ([`:176-214`](../../../src/services/ai-yoga.service.ts#L176-L214)) and `generateDescription` — NOT by the pose selector. A "beginner" and an "advanced" plan of the same duration/focus produce the same pool of poses.

## Configuration

All constants inline in [`ai-yoga.service.ts`](../../../src/services/ai-yoga.service.ts).

## Consequences

**Positive:**
- Completely deterministic given a seed; easy to unit-test.
- Curation encoded in one file.

**Negative / risks:**
- Pool strings are magic constants not verified against `ASANAS` at build time.
- The data model invariant "one asana in at most one step" (enforced by drag-drop) is *not* enforced at generation time, creating the cross-step visibility oddity above.
- Level is parsed but has no effect on pose choice — a misleading parameter.

## Related

- ADR-002 (parsing produces the request)
- [data-model/003-asana-reference-by-english-name.md](../data-model/003-asana-reference-by-english-name.md)
- [drag-drop/003-ondragend-remove-then-add.md](../drag-drop/003-ondragend-remove-then-add.md)
