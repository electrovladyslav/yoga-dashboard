# ADR-003: Build-time configuration — `@/*` alias, empty Next config, local Geist fonts

- **Status:** Accepted
- **Date:** 2026-04-22
- **Scope:** App shell

## Context

Small codebase; build tooling should be boring. No custom webpack, no image domains, no experimental flags.

## Decision

- **Path alias:** `@/*` → `src/*` in [`tsconfig.json:21-23`](../../../tsconfig.json#L21-L23). Used everywhere except one place: [`training-step.tsx:1`](../../../src/components/training-step/training-step.tsx#L1) uses a root-relative `src/components/...` path instead (inconsistency, not a bug).
- **Next.js config:** [`next.config.mjs`](../../../next.config.mjs) is an empty object — all defaults.
- **TypeScript:** strict mode on ([`tsconfig.json:6`](../../../tsconfig.json#L6)), `moduleResolution: "bundler"` ([`tsconfig.json:10`](../../../tsconfig.json#L10)), Next plugin registered ([`tsconfig.json:16-20`](../../../tsconfig.json#L16-L20)).
- **Fonts:** `next/font/local` loads `GeistVF.woff` and `GeistMonoVF.woff` ([`layout.tsx:5-14`](../../../src/app/layout.tsx#L5-L14)) as CSS variables `--font-geist-sans` / `--font-geist-mono`, applied to `<body>`.

## Edge cases & nuances

- **Font variables are declared but not referenced in CSS.** [`globals.css:35`](../../../src/app/globals.css#L35) sets `--font-heading: 'Inter', ...` and uses that at [`globals.css:37`](../../../src/app/globals.css#L37). The Geist variables are injected into the body className but no rule reads them. The effective font is whatever the system provides for Inter → system-ui.
- Next/image is used for asana SVGs ([`asana-card.tsx:18-23`](../../../src/components/asana-card/asana-card.tsx#L18-L23)) with Cloudinary URLs. Since `next.config.mjs` does not configure `images.remotePatterns`, this works only because Next 14 allows external images by default when the component uses `src` as a string URL — but it does NOT optimize them. A production build with strict image config would need `remotePatterns` for `res.cloudinary.com` and `dl.dropboxusercontent.com`.

## Configuration

- Alias: `@/*` → `src/*`
- Strict TS: enabled
- Next config: defaults

## Consequences

**Positive:**
- Imports read cleanly: `@/components/...`, `@/services/...`.
- No build surprises from experimental flags.

**Negative / risks:**
- Geist fonts are loaded (extra bytes) but never used — dead weight.
- External image domains aren't whitelisted; any future Next upgrade that tightens defaults could break `<Image>` rendering.

## Related

- [styling/001-calm-wellness-palette.md](../styling/001-calm-wellness-palette.md)
