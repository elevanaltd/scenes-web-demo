# Archived Test Files

This directory contains test files that are no longer valid after schema refactoring.

## Pre-Migration Characterization Tests (Archived 2025-10-28)

**Context:** Database schema refactored from `shots.scene_id` (FK to intermediate table) to `shots.script_component_id` (direct FK).

**Migration:** `20251027120000_simplify_shots_schema.sql`

**Archived Files:**
- `useShotMutations.pre-migration.test.ts` - Characterized behavior of shot mutations before schema refactor
- `useShots.pre-migration.test.ts` - Characterized behavior of shots query before schema refactor

**Why Archived:**
These tests were created as characterization tests to document existing behavior before the schema change. After the migration completed successfully, these tests became invalid because:

1. They assert against the old schema (`scene_id` field)
2. They test hooks with deprecated query logic
3. The actual production hooks have been updated to use `script_component_id`

**Purpose:**
These files are preserved for historical reference to understand the pre-refactor behavior, but they are not executed in the test suite.

**Related Work:**
- Production tests: `src/hooks/useShotMutations.test.ts`, `src/hooks/useShots.test.ts`
- Migration: `supabase/migrations/20251027120000_simplify_shots_schema.sql`
- Branch: `feat/scenes-planning-update`
