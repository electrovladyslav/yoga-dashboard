#!/usr/bin/env bash
set -euo pipefail

ADR_DIR="docs/adr"

if [[ -f "$ADR_DIR/000-template.md" ]]; then
  echo "ADR structure already exists at $ADR_DIR/"
  echo "Template: $ADR_DIR/000-template.md"
  exit 0
fi

echo "Creating ADR structure..."

mkdir -p "$ADR_DIR"

cat > "$ADR_DIR/000-template.md" << 'EOF'
# ADR-XXX: [Title]

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Context

Describe the problem or situation that requires a decision. Include relevant constraints, forces, and the "why now."

## Decision

Describe the decision in active voice ("We will…"). Include:
- The chosen approach and its key details
- Links to relevant source files: [filename](./path/to/file#Lstart-Lend)
- ASCII diagrams for flows and state machines where appropriate

## Alternatives Considered

### [Alternative Name]
- What it is
- Why it was rejected (specific technical reason)

## Consequences

### Positive
- ...

### Negative
- ...

## References

- Links to relevant source files
- Links to related ADRs
- Links to tickets / PRs
EOF

echo "Created $ADR_DIR/000-template.md"
echo ""
echo "Usage:"
echo "  Top-level ADR:  $ADR_DIR/NNN-kebab-case-title.md"
echo "  Module ADR:     $ADR_DIR/{module}/NNN-kebab-case-title.md"
echo "  Module README:  $ADR_DIR/{module}/README.md"
