<!-- title: Table Naming Standards -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Table Naming Standards

## Purpose

This file defines database naming standards for SCS-TIX EPOS Release 1.

The updated database design uses PostgreSQL-friendly names.

## Table Naming Rule

Use lowercase `snake_case` plural names for tables.

| Correct | Incorrect |
|---|---|
| `platform_users` | `PlatformUser` |
| `tenant_subscriptions` | `TenantSubscription` |
| `product_variants` | `ProductVariant` |
| `sale_lines` | `SaleItems` |
| `cash_movements` | `CashMovement` |

## Column Naming Rule

Use lowercase `snake_case` for columns.

| Pattern | Example |
|---|---|
| Primary key | `id` |
| Tenant foreign key | `tenant_id` |
| Foreign key | `product_id`, `outlet_id`, `sale_id` |
| Status column | `status`, `payment_status`, `refund_status` |
| Timestamp | `created_at`, `updated_at`, `completed_at` |
| Actor column | `created_by`, `approved_by`, `opened_by` |
| Hash column | `token_hash`, `activation_code_hash` |

## ID Rule

Most business tables use UUID primary keys.

Small stable reference tables may use `smallint`, such as
`payment_method_types`, `discount_types`, `discount_scopes`,
`stock_movement_types`, and `cash_movement_types`.

## Business Number Naming

Business numbers use descriptive columns such as `sale_number`,
`return_number`, `exchange_number`, `receipt_number`, `invoice_number`,
`credit_number`, `stocktake_number`, and `adjustment_number`.

## Avoid Wrong Names

The updated database uses `sale_lines`.

Do not document or implement this as `sale_items`.

Use the names from the updated database design exactly.

## Related Files

- [[Database_Overview]]
- [[Migration_Rules]]
- [[../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
