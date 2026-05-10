# ADR-003: "Apply Sequence" callback flow; chat history is ephemeral

- **Status:** Accepted
- **Date:** 2026-04-22
- **Scope:** AI chat

## Context

When the service returns a plan, the chat needs to (a) present it as a normal message with an opt-in action, and (b) reach outside its own state to update the training editor.

## Decision

A prop callback from parent to child:

- `ChatProps.onTrainingPlanGenerated` ([`chat.tsx:16-18`](../../../src/components/chat/chat.tsx#L16-L18)) — optional; `(trainingSteps: TrainingSteps) => void`.
- `TrainingPage` wires it to `handleAITrainingPlan` at [`training-page.tsx:130`](../../../src/components/pages/training-page/training-page.tsx#L130).
- `handleAITrainingPlan` ([`training-page.tsx:90-95`](../../../src/components/pages/training-page/training-page.tsx#L90-L95)):
  1. `setTrainingSteps(aiTrainingSteps)` — REPLACES entire state
  2. `setShowAIAppliedNotification(true)` — toast
  3. `setTimeout(..., 4000)` — auto-hide

- Chat side, the Apply button is rendered only if `message.hasTrainingPlan && message.trainingSteps` ([`chat.tsx:141-148`](../../../src/components/chat/chat.tsx#L141-L148)). Click handler is `handleApplySequence` ([`chat.tsx:67-79`](../../../src/components/chat/chat.tsx#L67-L79)), which:
  1. Calls `onTrainingPlanGenerated(trainingSteps)`
  2. Appends a confirmation message to the chat transcript

### Message model

- `Message` interface at [`chat.tsx:7-14`](../../../src/components/chat/chat.tsx#L7-L14): `id`, `text`, `isUser`, `timestamp`, optional `hasTrainingPlan`, optional `trainingSteps`.
- Messages live in component state ([`chat.tsx:22-29`](../../../src/components/chat/chat.tsx#L22-L29)) — seeded with a greeting — and are **never persisted**. A refresh clears them.

### Send flow

- Enter (no Shift) sends via `handleKeyPress` ([`chat.tsx:111-116`](../../../src/components/chat/chat.tsx#L111-L116)).
- `handleSendMessage` ([`chat.tsx:81-109`](../../../src/components/chat/chat.tsx#L81-L109)): guards on empty/loading, pushes user message, awaits `generateAIResponse`, pushes AI message. Error path pushes a canned error message.
- `scrollToBottom` ([`chat.tsx:34-40`](../../../src/components/chat/chat.tsx#L34-L40)) runs on every `messages` change, scrolls to an anchor div at [`chat.tsx:168`](../../../src/components/chat/chat.tsx#L168).

## Edge cases & nuances

- **Applying a plan REPLACES the current training entirely.** No merge with whatever the user was composing — all step arrays are overwritten in a single `setTrainingSteps` call.
- **The Apply button can be clicked multiple times.** Each click re-applies the same plan (idempotent in effect) and appends another "Applied!" confirmation to the chat.
- **No feedback that a plan has already been applied.** The button doesn't disable after use.
- **Unsaved state warning: none.** If the user was editing and then applies an AI plan, their work is silently overwritten. Save button doesn't auto-fire.
- **Loading state** ([`chat.tsx:157-167`](../../../src/components/chat/chat.tsx#L157-L167)): three `<span>` dots animated via CSS. The textarea and send button disable while loading.
- **`onKeyPress` is deprecated.** Still works; future React versions may warn.

## Configuration

- Notification duration: 4000ms (hardcoded at [`training-page.tsx:94`](../../../src/components/pages/training-page/training-page.tsx#L94))
- Loading fake-think: 1000ms (see [001](./001-client-side-simulated-ai.md))

## Consequences

**Positive:**
- Clean unidirectional flow: Chat knows nothing about the editor except the callback.
- Testing the Chat in isolation is easy; stub the callback.

**Negative / risks:**
- No undo if the user accidentally applies over their edits.
- Chat history loss on refresh will surprise users who wrote a long prompt.
- Two separate toasts (AI notification + in-chat confirmation) for one action.

## Related

- ADR-001, ADR-004
- [drag-drop/003-ondragend-remove-then-add.md](../drag-drop/003-ondragend-remove-then-add.md)
