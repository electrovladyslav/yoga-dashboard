# ADR-NNN: {Title}

- **Status:** {Proposed | Accepted | Deprecated | Superseded by ADR-XXX}
- **Date:** {YYYY-MM-DD}
- **Scope:** {Feature / subsystem this ADR covers}

## Context

What is the situation, constraint, or problem being addressed? What forces are at play? Reference exact code locations where relevant:

- [`file.ts:L10-L25`](../../../src/path/to/file.ts#L10-L25) — what this code does

## Decision

The implementation choice made, described at implementation level. Describe interfaces and types in prose; link to the source rather than pasting code. Describe the flow, the mechanism, and the specific patterns used.

### Key interfaces / types

- `TypeName` — purpose, key fields, where defined: [`models/foo.ts:L3-L11`](../../../src/models/foo.ts#L3-L11)

### Execution flow

```
Step 1 → Step 2 → Step 3
                    ↓
                  Side effect
```

## Edge cases & nuances

- What happens when input is empty / null / malformed?
- Silent behaviors that aren't obvious from reading the code
- Legacy compatibility paths
- Error recovery / fallback behavior

## Configuration

- Env vars, defaults, magic numbers
- Storage keys, route paths, timeouts

## Consequences

**Positive:**
- ...

**Negative / risks:**
- Debugging difficulty, performance implications, data integrity gaps

**Neutral:**
- Trade-offs accepted

## Related

- ADR-XXX (related decision in same feature)
- External: library docs, specs, issue links
