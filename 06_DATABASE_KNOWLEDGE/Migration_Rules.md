<!-- title: Migration Rules -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-02 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# Migration Rules

## Purpose

This file defines migration rules for OneVerz POS MVP database changes.

## Core Rules

- Do not drop production data without an approved migration plan.
- Use `CHECK(...)` constraints for status/type/domain values.
- Do not use PostgreSQL enum datatypes.
- Apply tenant isolation to every tenant-owned table.
- Preserve idempotency constraints for checkout, payment, refund, order, and sync.
- Keep migrations module-scoped and readable.
- Treat an applied migration and every SQL payload it consumes as immutable.
  Do not change shared-helper behaviour consumed by an already-applied migration;
  use a new forward-only migration for corrections so fresh and upgraded databases
  converge deterministically.
- Backfill live data before adding `NOT NULL`.
- Before replacing a unique index or alternate key referenced by foreign keys,
  explicitly drop each dependent foreign key, replace the key/index, and
  recreate every foreign key with its original columns and delete behaviour.
  Do not use `DROP ... CASCADE` as a dependency-order shortcut.

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
