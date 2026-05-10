#!/usr/bin/env bash
set -euo pipefail

PLANS_DIR="docs/plans"

if [[ -f "$PLANS_DIR/000-template.md" ]]; then
  echo "Plans structure already exists at $PLANS_DIR/"
  echo "Template: $PLANS_DIR/000-template.md"
  exit 0
fi

echo "Creating plans structure..."

mkdir -p "$PLANS_DIR"

cat > "$PLANS_DIR/000-template.md" << 'EOF'
# [Feature Name] - Implementation Plan

## Status

[Draft | In Progress | Implemented]

## Overview

What is being built and WHY (business value).
Scope boundaries (what's included, what's NOT).

---

## Current State Analysis

| Component | File | Current Behavior |
|-----------|------|------------------|
| ... | `src/...` | ... |

---

## Architecture Design

### High-Level Flow

```
ASCII diagram of the data/control flow
```

### Module Dependencies

```
ASCII diagram of module relationships
```

### Data Structures

Tables for enums, interfaces, types, and layer definitions.

---

## Implementation Tasks

### Task 1: [Task Name]

**Purpose:** Why this task exists.

#### Files to Delete (if any)
Exact file paths.

#### Files to Create (if any)
Full file path + complete code blueprint.

#### Files to Modify (if any)
- File path: [filename](./path/to/file#Lstart-Lend)
- What to ADD and WHERE
- What to REMOVE and WHERE

---

## File Change Summary

| File | Change Type |
|------|-------------|
| `path/to/file` | **Create** / Modify / **Delete** |

---

## Acceptance Criteria

| # | Criteria | Implementation |
|---|----------|----------------|
| 1 | ... | Task N |

---

## Testing Plan

### Unit Tests
- ...

### Integration Tests
- ...

### Manual Testing
- ...

---

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
No new dependencies unless absolutely necessary.

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| ... | ... |
EOF

echo "Created $PLANS_DIR/000-template.md"
echo ""
echo "Usage:"
echo "  Plan file: $PLANS_DIR/{NNN}-{feature-name}.md"
