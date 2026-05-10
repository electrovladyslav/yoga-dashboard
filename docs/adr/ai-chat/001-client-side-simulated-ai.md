# ADR-001: Client-side simulated AI — no LLM, no API, no env vars

- **Status:** Accepted
- **Date:** 2026-04-22
- **Scope:** AI chat

## Context

The UI surface looks and behaves like an AI assistant (chat window, typing dots, "thinking" delay, structured responses). The backend reality is much simpler.

## Decision

Implement the "AI" entirely client-side as a singleton class with deterministic logic.

- File: [`src/services/ai-yoga.service.ts`](../../../src/services/ai-yoga.service.ts)
- Class: `AIYogaService` at [`ai-yoga.service.ts:25-249`](../../../src/services/ai-yoga.service.ts#L25-L249)
- Singleton: `export const aiYogaService = new AIYogaService()` at [`ai-yoga.service.ts:251`](../../../src/services/ai-yoga.service.ts#L251)
- Public surface: `generateResponse(userMessage): Promise<AIResponse>` at [`ai-yoga.service.ts:216-234`](../../../src/services/ai-yoga.service.ts#L216-L234); legacy `generateResponseText` at [`:237-240`](../../../src/services/ai-yoga.service.ts#L237-L240); `generateYogaPlan` at [`:242-248`](../../../src/services/ai-yoga.service.ts#L242-L248).
- No `fetch`, no `process.env`, no SDK imports. The service only depends on `ASANAS`, `STEPS`, and `TrainingSteps`.

The 1000ms artificial delay is inside the *Chat* component, not the service:

- [`chat.tsx:42-45`](../../../src/components/chat/chat.tsx#L42-L45): `await new Promise(resolve => setTimeout(resolve, 1000));` before calling the service.

### Interface contracts

- `YogaRequest` ([`ai-yoga.service.ts:5-11`](../../../src/services/ai-yoga.service.ts#L5-L11)) — `level`, `duration`, `focus`, optional `injuries`, `preferences`. Preferences and injuries are declared but never populated by the parser.
- `YogaPlan` ([`ai-yoga.service.ts:13-17`](../../../src/services/ai-yoga.service.ts#L13-L17)) — `description`, `trainingSteps`, `tips[]`.
- `AIResponse` ([`ai-yoga.service.ts:19-23`](../../../src/services/ai-yoga.service.ts#L19-L23)) — `message`, `hasTrainingPlan`, optional `trainingPlan`.

## Edge cases & nuances

- **The CLAUDE.md in the repo mentions Supabase environment variables** — irrelevant to this feature. See [stale-docs/001](../stale-docs/001-claude-md-supabase-drift.md).
- **Error path:** the service can throw (shouldn't, since it's synchronous under the `async` wrapper), but Chat's `generateAIResponse` wraps it in `try/catch` ([`chat.tsx:46-64`](../../../src/components/chat/chat.tsx#L46-L64)) and shows a canned fallback.
- **The `async` keyword on `generateResponse`** ([`ai-yoga.service.ts:216`](../../../src/services/ai-yoga.service.ts#L216)) is cosmetic — the body performs no awaits. It exists so Chat can `await` uniformly.

## Configuration

- Artificial delay: 1000ms (hardcoded at [`chat.tsx:44`](../../../src/components/chat/chat.tsx#L44))
- No env vars
- No API keys

## Consequences

**Positive:**
- Offline-capable; no outage surface.
- Zero cost, zero rate limiting, zero prompt-injection risk.
- Swapping to a real LLM later is non-breaking: the interface contract (`AIResponse`) is already in place — only the body of `generateResponse` changes.

**Negative / risks:**
- Users who expect an AI get a thin keyword matcher. Misleading branding.
- All "intelligence" is frozen in code; adding new intents = new code.
- The 1s delay burns user time for no benefit.

## Related

- ADR-002 (parser)
- ADR-004 (distribution)
- [stale-docs/001-claude-md-supabase-drift.md](../stale-docs/001-claude-md-supabase-drift.md)
