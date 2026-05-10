# Data Model

The domain types that drive the entire app: what a training is, what an asana is, and how they link.

## Architecture

```
Training { date: string, steps: TrainingSteps }
            │
            └─ TrainingSteps = { [stepName]: UniqueIdentifier[] }
                                      │              │
                           string from │              │ asana.english_name (string)
                             STEPS[]  ─┘              └──── resolved against ASANAS[]
                                                             at render time
```

## ADRs

| # | ADR | Topic |
|---|-----|-------|
| 1 | [001-training-and-trainingsteps.md](./001-training-and-trainingsteps.md) | Minimal `Training` / `TrainingSteps` shape; date as ISO string; `UniqueIdentifier` reuse |
| 2 | [002-asana-schema.md](./002-asana-schema.md) | 10-field asana record, 48 items, non-sequential ids, Cloudinary image URLs |
| 3 | [003-asana-reference-by-english-name.md](./003-asana-reference-by-english-name.md) | Asanas referenced by `english_name` string; rename/deletion breaks saved trainings silently |
| 4 | [004-steps-constant-ordering.md](./004-steps-constant-ordering.md) | Fixed 6-step phase list; order drives the UI; `'shavasanah'` phonetic spelling |

## Key files

- [`src/models/training.model.ts`](../../../src/models/training.model.ts)
- [`src/constants/asana.ts`](../../../src/constants/asana.ts)
- [`src/constants/steps.ts`](../../../src/constants/steps.ts)
