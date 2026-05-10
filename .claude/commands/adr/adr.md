# ADR (Architecture Decision Record) Generator

You are creating a detailed Architecture Decision Record for a codebase. ADRs must be DEEP — describe logic and link to source files, edge cases, and nuances. Not high-level summaries. **Do NOT copy-paste code** — use Markdown links to the actual files.

## Input

The user's request: $ARGUMENTS

## Step 0: Ensure Setup

Check if `docs/adr/000-template.md` exists. If NOT, run `bash .claude/scripts/init-adr.sh` first.

Read `docs/adr/000-template.md` as the format reference. Read 2–3 existing ADRs in subdirectories to calibrate depth. If none exist, target implementation-guide depth with descriptions and file links.

## Step 1: Determine Source

### Option A: From Implementation Plan
If the user specifies a plan file or the request mentions a plan:
1. Read the plan file from `docs/plans/`
2. Extract: architecture decisions, new modules, interfaces, data flows, removed components
3. Each distinct aspect may become a SEPARATE ADR

### Option B: From Git Branch Changes
If the user specifies a branch name or says "from current branch":
1. Run `git diff main...HEAD --stat` to see all changed files
2. Run `git diff main...HEAD` to see actual changes
3. Run `git log main..HEAD --oneline` to see commit messages
4. Read key modified/created files to understand what decisions were made

If neither is clear, ask the user.

## Step 2: Determine Scope

Identify which **feature subdirectory** this ADR belongs to in `docs/adr/`. Check what subdirectories already exist.

If the decision spans multiple aspects, create MULTIPLE ADRs — one per aspect. Ask the user if scope is unclear.

## Step 3: Research Phase

Before writing anything:

1. Find the next available ADR number in the target directory
2. Read the feature's `README.md` if it exists
3. Read EVERY source file related to the decision
4. Trace execution paths — from entry point through to side effects
5. Find the nuances — edge cases, fallback behavior, legacy compatibility, error handling

Use the Explore agent. Go DEEP into implementation details.

## Step 4: Generate ADR

Follow `docs/adr/000-template.md` format. Additional rules:

### Status
- **Proposed** — generating from a plan (not yet implemented)
- **Accepted** — generating from a branch (already implemented)

### Depth Requirements

Every ADR MUST include:

1. **Interface/type definitions** — describe in prose and link to the source file and line range. Use Markdown: `[file](../path/to/file#Lstart-Lend)`, paths relative to the ADR.
2. **Code references** — every claim backed by a link to the actual code, not copy-pasted snippets
3. **Edge cases and nuances** — what happens with empty input, null values, missing config, legacy data. These are the most valuable parts.
4. **Usage patterns** — HOW the thing is used, not just defined. Link to usage sites.
5. **Flow diagrams** — ASCII art for any multi-step process or state machine
6. **Configuration** — exact env vars, default values, magic numbers
7. **Consequences** — honest positives AND negatives, including debugging difficulty

### Alternatives Considered
- From plan: extract from research or infer from what was rejected
- From branch: analyze what WASN'T done — the alternatives are in what was not implemented

## Step 5: Update Feature README

If the feature directory has a `README.md`, add the new ADR to its index table. If this is a new subdirectory, create a `README.md` with:
- One-paragraph feature overview
- Architecture diagram (ASCII)
- ADR index table linking to each file
- Key source files in the codebase

### When Modifying Code That Has an ADR

1. **Minor updates** (refactors, same behavior): Update file links and line ranges to match current code
2. **Significant changes** (new approach, reversed decision): Create a new ADR; mark old as `Superseded by ADR-NNN`
3. **Obsolete decision**: Mark as `Deprecated` with a brief note

ADRs are append-only for the decision body; only **Status** and cross-references evolve.

## Step 6: Write the ADR

Filename: `docs/adr/{feature}/{NNN}-{kebab-case-aspect}.md`

Confirm the file path and ADR number with the user before writing.
