# Architecture Decision Records

Feature-based subdirectories, each with a local README and per-aspect ADRs.

## Index

| Feature | ADRs | Scope |
|---|---|---|
| [app-shell/](./app-shell/README.md) | 3 | Next.js App Router, dynamic date route, path alias & config |
| [data-model/](./data-model/README.md) | 4 | `Training`, `Asana`, `STEPS`, english-name referencing |
| [persistence/](./persistence/README.md) | 3 | localStorage as database; append semantics; no versioning |
| [drag-drop/](./drag-drop/README.md) | 5 | `@dnd-kit/core` minimal config; drag ids; onDragEnd behavior |
| [ai-chat/](./ai-chat/README.md) | 4 | Simulated AI; parser; apply-sequence flow; asana distribution |
| [styling/](./styling/README.md) | 3 | Calm-wellness palette; CSS modules over Tailwind; responsive breakpoints |
| [stale-docs/](./stale-docs/README.md) | 1 | CLAUDE.md drift (Supabase, migrate script) |

## Template

All ADRs follow [000-template.md](./000-template.md).

## Conventions

- Links to source use root-relative paths: `../../../src/path/file.ts#Lstart-Lend`.
- Each ADR covers a single aspect; broader context lives in the per-feature README.
- Code is referenced via links, never copy-pasted.
