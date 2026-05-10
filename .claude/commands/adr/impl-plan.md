# Implementation Plan Generator

You are creating a detailed implementation plan for a codebase.

## Input

The user's request: $ARGUMENTS

## Step 0: Ensure Setup

Check if `docs/plans/000-template.md` exists. If NOT, run `bash .claude/scripts/init-plans.sh` first.

Read `docs/plans/000-template.md` as the format reference. Read any existing plans in `docs/plans/` to match their depth and style.

## Step 1: Research Phase

Before writing anything, thoroughly explore the codebase to understand:

1. **Feature scope** — find all files, modules, services, constants, entities related to the request
2. **Dependencies** — which modules import what, how services are wired, the module graph
3. **Current state** — what exists today that will be modified, extended, or removed
4. **Patterns** — how similar features are implemented in this codebase
5. **Existing ADRs** — read relevant ADRs from `docs/adr/` to understand architectural decisions and constraints that the plan must respect

Use the Explore agent. Read every file you plan to modify. Do NOT guess file contents.

## Step 2: Generate Plan

Follow the template from `docs/plans/000-template.md` exactly. Fill every section with real data from the codebase.

## Step 3: Quality Rules

- Every file path must be REAL and verified by reading the codebase
- **Existing code**: Do NOT copy-paste. Describe the logic and link with `[filename](./path/to/file#Lstart-Lend)` — paths relative to the plan so readers can click to open.
- **Modified files**: Link to the edit location and describe in prose what to change
- **New files** (to be created): Include complete, copy-pasteable code — no link possible yet
- If removing something, list ALL references across the entire codebase
- No over-engineering — keep it simple
- No new dependencies unless absolutely necessary
- Follow existing project conventions
- Respect existing architectural decisions documented in ADRs

## Step 4: Write the Plan

Save to: `docs/plans/{index}-{feature-name}.md` (kebab-case).

Confirm the file path with the user before writing.

## Step 5: Generate ADR

After the plan is written, invoke the `/adr` command to create an ADR documenting the architectural decisions from this plan. Pass the plan file path as input.

## Step 6: After Implementation — Update Plan

When implementation is complete, before merging:

1. Set plan **Status** to `Implemented`
2. Compare the plan's **File Change Summary** with actual changed files (`git diff main...HEAD --name-only`)
3. Update any plan sections that diverged from the implementation
