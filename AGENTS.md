# AGENTS.md

A yoga dashboard application built with Next.js, TypeScript, and Tailwind CSS.

## Setup commands

- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Build for production: `npm run build`
- Start production server: `npm start`
- Run linting: `npm run lint`

## Code style

### TypeScript Configuration
- TypeScript strict mode enabled
- Explicit return types required for top-level functions
- Use `import type` for type-only imports to ensure proper tree-shaking

### Naming Conventions
- **Files**: Use kebab-case (e.g., `my-component.tsx`)
- **Variables & Functions**: Use camelCase (e.g., `myVariable`, `myFunction()`)
- **Classes, Types, Interfaces**: Use PascalCase (e.g., `MyClass`, `MyInterface`)
- **Constants & Enum Values**: Use ALL_CAPS (e.g., `MAX_COUNT`, `Color.RED`)
- **Generic Type Parameters**: Prefix with `T` (e.g., `TKey`, `TValue`)

### Import Guidelines
- Prefer top-level `import type` over inline `import { type ... }`
- Use `import type { User } from "./user"` instead of `import { type User } from "./user"`

### Error Handling
- Prefer Result types over throwing errors for code that requires manual try-catch
- Use the Result pattern for better error handling:

```ts
type Result<T, E extends Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

### Enums and Constants
- Do not introduce new enums into the codebase
- Use `as const` objects for enum-like behavior:

```ts
const backendToFrontendEnum = {
  xs: "EXTRA_SMALL",
  sm: "SMALL",
  md: "MEDIUM",
} as const;
```

### Documentation
- Use JSDoc comments for functions and types when behavior is not self-evident
- Be concise in JSDoc comments
- Use `@link` tags to reference other functions and types within the same file

### Generic Functions
- Use `any` sparingly, only when TypeScript inference fails in generic functions
- Outside of generic functions, avoid `any` type usage

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable React components
│   ├── asana-card/     # Yoga pose cards
│   ├── chat/           # Chat interface
│   ├── pages/          # Page-specific components
│   └── training-step/  # Training step components
├── constants/          # Application constants
├── models/             # TypeScript type definitions
├── services/           # Business logic and API services
└── utils/              # Utility functions
```

## Development Guidelines

### Component Development
- Use functional components with hooks
- Components return JSX (no need to declare return type)
- Follow the established component structure with separate CSS modules

### Service Layer
- Keep business logic in the services directory
- Use Result types for error handling in service functions
- Document service functions with JSDoc when behavior is complex

### Type Safety
- Always use explicit return types for top-level functions
- Leverage TypeScript's type system for better code quality
- Use proper import types to ensure tree-shaking

## Testing

- Run `npm run lint` before committing
- Ensure all TypeScript types are properly defined
- Test error handling paths with Result types

## Key Technologies

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit/core
- **Linting**: ESLint with Next.js config

## Notes

- This is a yoga dashboard application focused on training and asana management
- The project uses modern React patterns with hooks and functional components
- Error handling follows a Result pattern for better type safety
- All coding rules are enforced through the `.cursor/rules/` directory
