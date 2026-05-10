# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a yoga dashboard application built with Next.js 14 that allows users to create and manage yoga training sequences by dragging and dropping asanas (yoga poses) into different training steps.

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run migrate` - Run asana migration script using ts-node
- `npm test` - Run Vitest once (CI-style)
- `npm run test:watch` - Run Vitest in watch mode

## Architecture & Key Components

### Core Application Structure
- **Next.js 14 App Router**: Uses the modern app directory structure with TypeScript
- **Drag & Drop Interface**: Built with `@dnd-kit/core` for asana card interactions
- **Local Storage**: Training data is persisted locally via browser localStorage
- **Supabase Integration**: Configured but primarily used for data migration

### Key Directories
- `src/app/` - Next.js app router pages and API routes
- `src/components/` - Reusable React components organized by feature
- `src/constants/` - Static data including asana definitions and training steps
- `src/models/` - TypeScript interfaces and type definitions
- `src/services/` - Business logic and data persistence layer
- `src/lib/` - External service configurations (Supabase)
- `src/utils/` - Utility functions

### Data Models
- **Asana**: Complete yoga pose definition with English/Sanskrit names, descriptions, benefits, and image URLs
- **Training**: Date-based training with steps containing arrays of asana identifiers
- **TrainingSteps**: Key-value mapping of step names to asana identifier arrays

### Training Flow
1. Users select a training date
2. Drag asanas from the available pool into training steps (set-up, warm-up, workout, cool-down, stretching, shavasanah)
3. Training data is automatically saved to localStorage
4. Previous trainings can be loaded by changing the date

### Component Architecture
- **TrainingPage**: Main container managing drag/drop state and training persistence
- **TrainingStep**: Droppable containers for each phase of training
- **AsanaCard**: Draggable cards representing individual yoga poses
- Components use CSS modules for styling

### Path Aliases
Uses `@/*` alias pointing to `src/*` directory for cleaner imports.

### Environment Variables
Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Supabase integration.

## Engineering Discipline (OpenSpec + Superpowers)

### Planning routing
For any new feature or non-trivial change, the planning entry point is
`/opsx:propose`. Skip Superpowers' `brainstorming` and `writing-plans` skills
by default — OpenSpec's `proposal.md`, `design.md`, and `tasks.md` replace them.

Exception: if the change is UI-heavy (new page, drag-and-drop interaction,
asana flow redesign) and the design is unclear, you MAY run
`/superpowers:brainstorming` first with Visual Companion for HTML mockups,
then feed the resulting design spec into `/opsx:propose`.

Never produce both a Superpowers `docs/superpowers/specs/...-design.md` AND
an OpenSpec `openspec/changes/<id>/design.md` for the same feature.

### Implementation discipline (during `/opsx:apply`)
When using `/opsx:apply`, ALWAYS apply these Superpowers skills:

1. **using-git-worktrees**: Create an isolated git worktree for each
   OpenSpec change before any file edits. Never modify `main` directly.

2. **test-driven-development**: Strictly follow RED-GREEN-REFACTOR.
   Write a failing test FIRST, then minimum code to pass it, then refactor.
   Never write implementation before the test exists.
   - Unit/component tests: place next to the file as `<name>.test.ts(x)`
   - Service-layer tests: cover both `ok` and `error` branches of Result types
   - Component tests: assert on user-visible behavior, not implementation

3. **verification-before-completion**: Before marking any task complete, run:
   - `npm run lint` — must pass with zero warnings
   - `npx tsc --noEmit` — must pass with zero errors
   - `npm test` — must pass (when tests exist for the changed area)

   Do not claim "done" until all three are green.

4. **code-reviewer**: After each batch of 3-5 tasks, invoke the
   code-reviewer agent. Address all CRITICAL and HIGH findings before
   continuing. Document MEDIUM/LOW for follow-up in the change folder.

### Debugging
When tests fail, builds break, or behavior is unexpected, use
**systematic-debugging**: investigate root cause across the 4 phases
before applying any fix. No guess-fixes, no "let me try this and see".

### Archival
After deploy and manual sanity check, ALWAYS run `/opsx:archive` as the
last action of the change. Never start the next `/opsx:propose` with an
unarchived previous change still open.

### Project-specific gotchas (update as we learn)
- localStorage shape changes are breaking — bump a version key and
  add a migration in `src/services/` rather than silently overwriting.
- Drag-and-drop state lives in `TrainingPage`; never duplicate it into
  `TrainingStep` or `AsanaCard`.
- Supabase keys are public-anon only — never put service-role keys in
  `NEXT_PUBLIC_*` envs.

## Note on AGENTS.md
Code style, naming conventions, error handling patterns, and the Result
type are defined in `AGENTS.md`. This file (`CLAUDE.md`) covers project
architecture and engineering process. Both files are loaded together;
when they conflict, `CLAUDE.md` wins for process and `AGENTS.md` wins
for code style.