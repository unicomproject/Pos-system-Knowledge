<!-- title: Reports Exports -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Reports Exports

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| daily_sales_summaries | Daily sales dashboard summary by tenant/outlet/channel. | 15 |
| daily_payment_summaries | Daily payment totals by payment method. | 11 |
| daily_inventory_summaries | Daily inventory movement summary. | 11 |
| daily_discount_return_summaries | Daily discount, return and exchange summary. | 15 |
| report_export_jobs | PDF/Excel report export job tracking. | 12 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `daily_sales_summaries`

**Purpose:** Daily sales dashboard summary by tenant/outlet/channel.

**Source module:** Reporting, Exports and Notifications

**Data dictionary section:** `9.1`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| scope_type | varchar(20) | NOT NULL CHECK | tenant, outlet. |
| scope_key | varchar(80) | NOT NULL | TENANT or outlet id string. |
| outlet_id | uuid | NULL FK | Outlet when scope_type=outlet. |
| channel | varchar(20) | NOT NULL CHECK | pos, portable_pos, all. |
| business_date | date | NOT NULL | Business date. |
| gross_sales | numeric(12,2) | NOT NULL DEFAULT 0 | Gross sales. |
| discount_total | numeric(12,2) | NOT NULL DEFAULT 0 | Discount total. |
| tax_total | numeric(12,2) | NOT NULL DEFAULT 0 | Tax total. |
| net_sales | numeric(12,2) | NOT NULL DEFAULT 0 | Net sales. |
| return_total | numeric(12,2) | NOT NULL DEFAULT 0 | Return total. |
| transaction_count | int | NOT NULL DEFAULT 0 | Transaction count. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, scope_type, scope_key, channel, business_date) |

### Design Notes

- No explicit design note was provided.


## Entity: `daily_payment_summaries`

**Purpose:** Daily payment totals by payment method.

**Source module:** Reporting, Exports and Notifications

**Data dictionary section:** `9.2`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| scope_type | varchar(20) | NOT NULL CHECK | tenant, outlet. |
| scope_key | varchar(80) | NOT NULL | TENANT or outlet id string. |
| outlet_id | uuid | NULL FK | References outlets(id). |
| business_date | date | NOT NULL | Business date. |
| payment_method_type_id | smallint | NOT NULL FK | References payment_method_types(id). |
| payment_count | int | NOT NULL DEFAULT 0 | Payment count. |
| total_amount | numeric(12,2) | NOT NULL DEFAULT 0 | Total amount. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, scope_type, scope_key, business_date, payment_method_type_id) |

### Design Notes

- No explicit design note was provided.


## Entity: `daily_inventory_summaries`

**Purpose:** Daily inventory movement summary.

**Source module:** Reporting, Exports and Notifications

**Data dictionary section:** `9.3`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NOT NULL FK | References outlets(id). |
| variant_id | uuid | NOT NULL FK | References product_variants(id). |
| business_date | date | NOT NULL | Business date. |
| opening_qty | numeric(14,3) | NOT NULL DEFAULT 0 | Opening quantity. |
| in_qty | numeric(14,3) | NOT NULL DEFAULT 0 | Incoming quantity. |
| out_qty | numeric(14,3) | NOT NULL DEFAULT 0 | Outgoing quantity. |
| closing_qty | numeric(14,3) | NOT NULL DEFAULT 0 | Closing quantity. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, outlet_id, variant_id, business_date) |

### Design Notes

- No explicit design note was provided.


## Entity: `daily_discount_return_summaries`

**Purpose:** Daily discount, return and exchange summary.

**Source module:** Reporting, Exports and Notifications

**Data dictionary section:** `9.4`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| scope_type | varchar(20) | NOT NULL CHECK | tenant, outlet. |
| scope_key | varchar(80) | NOT NULL | TENANT or outlet id string. |
| outlet_id | uuid | NULL FK | References outlets(id). |
| channel | varchar(20) | NOT NULL CHECK | pos, portable_pos, all. |
| business_date | date | NOT NULL | Business date. |
| discount_count | int | NOT NULL DEFAULT 0 | Discount count. |
| discount_total | numeric(12,2) | NOT NULL DEFAULT 0 | Discount amount. |
| return_count | int | NOT NULL DEFAULT 0 | Return count. |
| return_total | numeric(12,2) | NOT NULL DEFAULT 0 | Return amount. |
| exchange_count | int | NOT NULL DEFAULT 0 | Exchange count. |
| exchange_difference_total | numeric(12,2) | NOT NULL DEFAULT 0 | Exchange difference total. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, scope_type, scope_key, channel, business_date) |

### Design Notes

- No explicit design note was provided.


## Entity: `report_export_jobs`

**Purpose:** PDF/Excel report export job tracking.

**Source module:** Reporting, Exports and Notifications

**Data dictionary section:** `9.5`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| requested_by | uuid | NOT NULL FK | References users(id). |
| report_type | varchar(80) | NOT NULL | sales, till, payment, inventory, product_sales, returns. |
| format | varchar(20) | NOT NULL CHECK | pdf, xlsx, csv. |
| filter_payload | jsonb | NOT NULL | Report filters. |
| status | varchar(30) | NOT NULL CHECK | queued, processing, completed, failed, expired. |
| file_storage_key | varchar(500) | NULL | Generated file key. |
| error_message | text | NULL | Failure reason. |
| requested_at | timestamptz | NOT NULL | Request time. |
| completed_at | timestamptz | NULL | Completion time. |
| expires_at | timestamptz | NULL | Download expiry. |

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
