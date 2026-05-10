# ADR-001: CLAUDE.md references Supabase + migrate script that don't exist

- **Status:** Proposed (for cleanup)
- **Date:** 2026-04-22
- **Scope:** Documentation hygiene

## Context

`CLAUDE.md` at the repo root is the primary guidance file for AI agents working on this codebase. It describes features and files that are NOT present in the current source tree.

## Observations

### CLAUDE.md claims vs. reality

| CLAUDE.md says | Reality |
|---|---|
| "Supabase Integration: Configured but primarily used for data migration" | `@supabase/supabase-js` not in `package.json`; no imports of `supabase` anywhere in `src/`. |
| "`src/lib/` - External service configurations (Supabase)" | Directory does not exist. |
| "`npm run migrate` - Run asana migration script using ts-node" | No `migrate` script in `package.json` (verified scripts: `dev`, `build`, `start`, `lint`). No ts-node dependency. |
| "Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`" | No `process.env.*SUPABASE*` reads in source. No `.env.example` / `.env.local` in repo. |

The CLAUDE.md description of the **Training flow** and **Component Architecture** sections are accurate.

## Recommendation

Either:

1. **Remove the Supabase / migrate / env-var lines from CLAUDE.md** since they no longer reflect the code — preserves trust in the remaining accurate sections.
2. **Or restore the Supabase integration** if it was intentionally stubbed out and is planned to return.

Do NOT leave the drift as-is: future agents follow CLAUDE.md literally and may spend time looking for `src/lib/supabase.ts` or try to run `npm run migrate`.

## Consequences

**If left alone:**
- Onboarding friction for new contributors and AI agents.
- Confidence in the rest of CLAUDE.md erodes.

**If cleaned up:**
- Two minutes of editing; no code changes required.

## Related

- [persistence/001-localstorage-as-database.md](../persistence/001-localstorage-as-database.md) (the real persistence layer)
- [ai-chat/001-client-side-simulated-ai.md](../ai-chat/001-client-side-simulated-ai.md) (the real "AI" layer, also sometimes assumed to be server-backed)
