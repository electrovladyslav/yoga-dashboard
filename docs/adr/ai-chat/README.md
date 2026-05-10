# AI Chat

The "AI Yoga Assistant" is a floating-action-button chat that generates yoga sequences. Despite the name, there is **no LLM, no API call, and no environment variable**. It's a deterministic client-side service that parses keywords and composes templated replies.

## Architecture

```
FAB (🧘‍♀️) → opens Chat drawer (fixed bottom-right)
    │
    └─ user sends message
           │
           ▼
     setTimeout 1000ms (fake "thinking")
           │
           ▼
    aiYogaService.generateResponse(text)
           │
           ├─ parseUserMessage → regex keywords → {level, duration, focus} | null
           │
           └─ if request: generateYogaPlan
                 ├─ generateTrainingSteps → per-step count from distribution → selectAsanasForStep → random shuffle from hardcoded pools
                 ├─ generateDescription → string template
                 └─ generateTips → 5 tips from baseTips + levelTips[level] + focusTips[focus]
           │
           ▼
    Chat renders "Apply Sequence" button if hasTrainingPlan
           │
           └─ onClick → onTrainingPlanGenerated(plan.trainingSteps)
                 │
                 └─ TrainingPage.handleAITrainingPlan
                        setTrainingSteps(plan) + 4s notification toast
```

## ADRs

| # | ADR | Topic |
|---|-----|-------|
| 1 | [001-client-side-simulated-ai.md](./001-client-side-simulated-ai.md) | No LLM; rule-based, offline, zero env vars, 1s artificial delay |
| 2 | [002-parseusermessage-extraction.md](./002-parseusermessage-extraction.md) | Regex/keyword extraction; yoga-keyword gate returns `null` for off-topic |
| 3 | [003-apply-sequence-callback-flow.md](./003-apply-sequence-callback-flow.md) | Chat → callback → TrainingPage state; ephemeral chat history |
| 4 | [004-asana-selection-and-distribution.md](./004-asana-selection-and-distribution.md) | Hardcoded per-step pools; `max(8, floor(duration/3))` total; per-focus workout pools |

## Key files

- [`src/components/chat/chat.tsx`](../../../src/components/chat/chat.tsx)
- [`src/services/ai-yoga.service.ts`](../../../src/services/ai-yoga.service.ts)
