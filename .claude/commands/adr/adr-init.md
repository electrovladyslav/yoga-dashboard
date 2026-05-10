# ADR Init — Deep Codebase Architecture Discovery

You are performing a comprehensive, DEEP architecture audit of an existing codebase. Your goal is to document every significant implementation decision, pattern, nuance, and edge case as ADRs.

## Input

Optional scope filter: $ARGUMENTS

If the user provides a scope (e.g., "only auth", "skip database"), respect it. Otherwise, audit the ENTIRE codebase.

## Step 0: Ensure Setup

Check if `docs/adr/000-template.md` exists. If NOT, run `bash .claude/scripts/init-adr.sh` first.

Read `docs/adr/000-template.md` as the format reference. Read existing ADRs to calibrate depth and style.

## Step 1: Understand the Project

Determine the project type by reading entry points, config files, and package manifests. This tells you:
- Language, framework, ORM/data layer
- Project structure conventions
- Key directories to explore

## Step 2: Parallel Deep Discovery

Launch exploration agents **in parallel**. Each agent must go DEEP — read actual source files, extract real interfaces, trace execution flows, find edge cases. The goal is implementation-level understanding, not high-level summaries.

Adapt agents to the actual project. The domains below are guidelines, not a rigid list.

### Agent 1: Project Structure & Module Graph
- Entry point, module/package organization, dependency wiring
- Layering (e.g., controllers → services → repositories) and shared abstractions
- Read actual module files — list every import, provider, export

Report: module graph with real imports, circular dependency workarounds, global vs scoped modules.

### Agent 2: Data Layer — Deep Dive
- Read EVERY entity/model file — document each field, type, default, constraint
- Read migration files — document schema evolution
- Document indexes: field(s), type, and purpose for each
- Relationships and foreign keys
- Query patterns: how data is actually fetched and filtered
- Connection pooling config with exact values

Report: full entity schemas, index catalog, query pattern examples with links.

### Agent 3: Core Business Logic — Feature by Feature
- Identify each distinct feature/workflow
- For EACH feature, trace the full execution path: entry point → service → side effects
- Document state machines, handler patterns, lifecycle hooks
- Find the nuances: silent transitions, auto-routing, recursive calls, fallback behavior
- Find edge cases: empty inputs, legacy compatibility, error recovery
- Document every interface/type that handlers or workflows use

Report: per-feature breakdown with execution flow, interface definitions, edge cases, and things that are easy to miss.

### Agent 4: External Integrations — Per Integration
- For EACH external service (APIs, webhooks, queues, storage):
  - Auth mechanism (API keys, OAuth, webhook verification)
  - Request/response types
  - Error handling and retry strategy
  - Rate limiting approach
  - Webhook processing flow

Report: per-integration breakdown with error handling and resilience patterns.

### Agent 5: API Layer & Security
- Endpoints — list all with methods, paths, and guards
- Auth flow: token generation, validation, refresh, middleware chain
- Authorization: roles, guards, decorators
- Input validation: DTOs, pipes, schemas
- Rate limiting, CORS, security headers — exact config values

Report: endpoint catalog, auth chain, validation patterns with real config.

### Agent 6: Background Processing & Scheduling
- List EVERY scheduled job with exact schedule, purpose, and implementation details
- Queue consumers, async processing pipelines
- Event-driven patterns, retries
- Idempotency handling, duplicate prevention

Report: job inventory with schedules, orchestration patterns, duplicate prevention strategies.

### Agent 7: Configuration & Operational Patterns
- List all env vars with defaults and purpose
- Feature flags
- Logging: levels, structured logging, context propagation
- Error handling: global filters, custom exceptions, error codes
- Testing: patterns, fixtures, mocking strategies

Report: env var catalog, error handling chain, testing approach.

## Step 3: Plan ADR Structure

After all agents return, organize findings into **feature-based subdirectories**. Each subdirectory covers one major feature/subsystem and contains multiple ADRs — one per significant aspect.

**Target structure:**
```
docs/adr/
├── 000-template.md
├── {feature-1}/
│   ├── README.md              ← Feature overview + ADR index
│   ├── 001-{aspect}.md
│   ├── 002-{aspect}.md
│   └── ...
├── {feature-2}/
│   ├── README.md
│   ├── 001-{aspect}.md
│   └── ...
```

Each ADR covers ONE specific aspect, not a whole feature.

## Step 4: Present Discovery Report

Present the user a structured plan:

```
## Proposed ADR Structure

### {feature-1}/ (N ADRs)
| # | ADR | What it documents |
|---|-----|-------------------|

### {feature-2}/ (N ADRs)
| # | ADR | What it documents |
|---|-----|-------------------|
```

Ask the user:
- Which features to document (all, or select)
- Any aspects to add or skip
- Naming preferences

## Step 5: Generate ADRs

For each approved ADR, follow `docs/adr/000-template.md` format.

### Depth Requirements

Every ADR MUST include:

1. **Interface/type definitions** — describe in prose and link to the source file and line range
2. **Code references** — every claim backed by a link to the actual code, not copy-pasted snippets
3. **Edge cases and nuances** — what happens with empty input, null values, missing config, legacy data
4. **Usage patterns** — HOW the thing is used; link to usage sites
5. **Flow diagrams** — ASCII art for any state machine, pipeline, or multi-step process
6. **Configuration** — exact env vars, default values, magic numbers
7. **Consequences** — honest positives AND negatives

### Per-feature README

Each feature directory gets a `README.md` with:
- One-paragraph feature overview
- Architecture diagram (ASCII)
- ADR index table linking to each file
- Key files in the codebase

Generate ADRs sequentially — confirm each file path before writing.

## Step 6: Summary

After all ADRs are written, print a summary of everything created with file paths.
