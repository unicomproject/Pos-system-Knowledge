<!-- title: Receipts And Refunds -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Receipts And Refunds

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| refunds | Business refund header linked to original payment and optional outbound payment. | 15 |
| receipt_templates | Receipt template configuration for sale, return and exchange documents. | 14 |
| receipts | Stored receipt output with frozen payload and barcode. | 20 |
| receipt_print_logs | Print/reprint/email/download history. | 11 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `refunds`

**Purpose:** Business refund header linked to original payment and optional outbound payment.

**Source module:** Sales, Payments and Receipts

**Data dictionary section:** `6.10`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| original_payment_id | uuid | NOT NULL FK | References payments(id). |
| refund_payment_id | uuid | NULL FK | References payments(id). |
| reason | text | NULL | Refund reason. |
| refund_status | varchar(30) | NOT NULL CHECK | pending, approved, paid, failed, cancelled. |
| refund_channel | varchar(30) | NOT NULL CHECK | pos, admin. |
| refund_method | varchar(40) | NOT NULL CHECK | original_payment, cash, store_credit. |
| amount | numeric(12,2) | NOT NULL CHECK > 0 | Refund amount. |
| created_by | uuid | NULL FK | References users(id). |
| approved_by | uuid | NULL FK | References users(id). |
| approved_at | timestamptz | NULL | Approval time. |
| created_at | timestamptz | NOT NULL | Creation time. |
| completed_at | timestamptz | NULL | Completion time. |
| updated_at | timestamptz | NOT NULL | Update time. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- No explicit design note was provided.


## Entity: `receipt_templates`

**Purpose:** Receipt template configuration for sale, return and exchange documents.

**Source module:** Sales, Payments and Receipts

**Data dictionary section:** `6.11`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NULL FK | References outlets(id). |
| name | varchar(150) | NOT NULL | Template name. |
| document_type | varchar(30) | NOT NULL CHECK | sale, return, exchange. |
| format_type | varchar(30) | NOT NULL CHECK | thermal, pdf, email, a4. |
| paper_width | varchar(20) | NOT NULL CHECK | 58mm, 80mm, a4. |
| template_payload | jsonb | NOT NULL | Layout/render config. |
| barcode_enabled | boolean | NOT NULL DEFAULT true | Barcode/QR flag. |
| barcode_type | varchar(20) | NULL CHECK | code128, qr, ean13. |
| is_default | boolean | NOT NULL DEFAULT false | Default flag. |
| is_active | boolean | NOT NULL DEFAULT true | Active flag. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- No explicit design note was provided.


## Entity: `receipts`

**Purpose:** Stored receipt output with frozen payload and barcode.

**Source module:** Sales, Payments and Receipts

**Data dictionary section:** `6.12`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NULL FK | References outlets(id). |
| customer_id | uuid | NULL FK | References customers(id). |
| template_id | uuid | NULL FK | References receipt_templates(id). |
| document_type | varchar(30) | NOT NULL CHECK | sale, return, exchange. |
| sale_id | uuid | NULL FK | References sales(id). |
| return_id | uuid | NULL FK | References returns(id). |
| exchange_id | uuid | NULL FK | References exchanges(id). |
| receipt_number | varchar(80) | NOT NULL | Business receipt number. |
| barcode_value | varchar(160) | NULL | Scannable lookup. |
| barcode_type | varchar(20) | NULL | code128, qr, ean13. |
| format_type | varchar(30) | NOT NULL CHECK | thermal, pdf, email, a4. |
| print_status | varchar(30) | NOT NULL CHECK | generated, printed, failed, reprinted. |
| source_device_id | uuid | NULL FK | References pos_devices(id). |
| issued_at | timestamptz | NOT NULL | Issue time. |
| printed_at | timestamptz | NULL | Print time. |
| printed_by | uuid | NULL FK | References users(id). |
| reprint_count | int | NOT NULL DEFAULT 0 | Reprint count. |
| payload | jsonb | NOT NULL | Frozen rendered payload. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, receipt_number) |
| Unique / Index | UNIQUE(tenant_id, barcode_value) WHERE barcode_value IS NOT NULL |

### Design Notes

- No explicit design note was provided.


## Entity: `receipt_print_logs`

**Purpose:** Print/reprint/email/download history.

**Source module:** Sales, Payments and Receipts

**Data dictionary section:** `6.13`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| receipt_id | uuid | NOT NULL FK | References receipts(id). |
| outlet_id | uuid | NULL FK | References outlets(id). |
| till_id | uuid | NULL FK | References tills(id). |
| device_id | uuid | NULL FK | References pos_devices(id). |
| printed_by | uuid | NULL FK | References users(id). |
| print_action | varchar(30) | NOT NULL CHECK | print, reprint, email, download. |
| status | varchar(30) | NOT NULL CHECK | success, failed. |
| error_message | text | NULL | Failure reason. |
| printed_at | timestamptz | NOT NULL | Action time. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- No explicit design note was provided.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
