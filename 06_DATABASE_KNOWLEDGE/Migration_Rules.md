<!-- title: Migration Rules -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# Migration Rules

## Purpose

This file defines migration rules for TM-EPOS MVP database changes.

## Core Rules

- Do not drop production data without an approved migration plan.
- Use `CHECK(...)` constraints for status/type/domain values.
- Do not use PostgreSQL enum datatypes.
- Apply tenant isolation to every tenant-owned table.
- Preserve idempotency constraints for checkout, payment, refund, order, and sync.
- Keep migrations module-scoped and readable.
- Backfill live data before adding `NOT NULL`.

## Safe Required Column Flow

1. Add column as nullable.
2. Backfill existing rows.
3. Add default if needed.
4. Add NOT NULL.
5. Add CHECK/FK/UNIQUE.
6. Add indexes after query review.

## Status / Type Change Flow

1. Update database CHECK constraint.
2. Update backend constants.
3. Update DTO validation.
4. Update seed data.
5. Update tests.
6. Update Markdown documentation.

## Offline Sync Migration Rule

Offline payloads can exist on devices while backend schema changes.

Breaking sync changes must include payload version support, backward compatibility,
or a forced device update decision.

## Related Files

- [[Database_Overview]]
- [[Status_And_Type_Check_Rules]]
