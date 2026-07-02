<!-- title: Table Naming Standards -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# Table Naming Standards

## Purpose

This file defines database naming standards for TM-EPOS MVP.

## Table Rule

Use lowercase plural `snake_case` table names.

Examples:

- `sales_orders`
- `checkout_sessions`
- `pickup_orders`
- `sync_batches`

## Column Rule

Use lowercase `snake_case` column names.

| Pattern | Meaning |
|---|---|
| `id` | Primary key |
| `*_id` | Foreign key/reference |
| `*_code` | Stable business code |
| `*_number` | Human-readable document number |
| `*_status` | CHECK-constrained status |
| `*_type` | CHECK-constrained type |
| `*_at` | Timestamp |
| `*_hash` | Stored hash, not raw value |

## Constraint Rule

Recommended physical constraint names:

```text
pk_<table>
fk_<table>_<column>_<ref_table>
uq_<table>_<columns>
ck_<table>_<column>
ix_<table>_<columns>
```

## Status And Type Rule

Use varchar/text + CHECK constraints.

Do not use database enum datatypes.

## Related Files

- [[Status_And_Type_Check_Rules]]
- [[Tenant_Id_Rules]]
