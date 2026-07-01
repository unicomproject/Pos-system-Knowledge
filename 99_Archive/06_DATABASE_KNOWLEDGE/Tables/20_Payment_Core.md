<!-- title: Payment Core -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Payment Core

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| payment_method_types | Global payment method reference values. | 3 |
| tenant_payment_methods | Tenant-enabled POS payment methods. | 9 |
| payment_provider_configs | Tenant payment provider configuration with secret references only. | 9 |
| payments | Unified POS payment record. | 19 |
| payment_transactions | Gateway/provider event log per payment. | 9 |
| sale_payment_allocations | Allocates payments to POS sales for split payment support. | 6 |
| payment_webhook_events | Idempotent storage of payment provider webhook events. | 12 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `payment_method_types`

**Purpose:** Global payment method reference values.

**Source module:** Sales, Payments and Receipts

**Data dictionary section:** `6.3`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | smallint | PK | Primary key. |
| code | varchar(40) | NOT NULL UNIQUE | cash, card, qr, store_credit. |
| name | varchar(150) | NOT NULL | Display label. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(code) |

### Design Notes

- No explicit design note was provided.


## Entity: `tenant_payment_methods`

**Purpose:** Tenant-enabled POS payment methods.

**Source module:** Sales, Payments and Receipts

**Data dictionary section:** `6.4`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| payment_method_type_id | smallint | NOT NULL FK | References payment_method_types(id). |
| payment_provider_config_id | uuid | NULL FK | References payment_provider_configs(id). |
| provider_code | varchar(80) | NULL | Gateway/provider code. |
| enabled | boolean | NOT NULL DEFAULT true | Enabled flag. |
| config | jsonb | NULL | Non-secret config. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, payment_method_type_id, provider_code) |

### Design Notes

- No explicit design note was provided.


## Entity: `payment_provider_configs`

**Purpose:** Tenant payment provider configuration with secret references only.

**Source module:** Sales, Payments and Receipts

**Data dictionary section:** `6.5`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| provider_code | varchar(80) | NOT NULL | Provider code. |
| environment | varchar(30) | NOT NULL CHECK | test, live. |
| config | jsonb | NULL | Non-secret config. |
| secret_ref | varchar(255) | NULL | Reference to secret manager. |
| status | varchar(30) | NOT NULL CHECK | active, inactive. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, provider_code, environment) |

### Design Notes

- No explicit design note was provided.


## Entity: `payments`

**Purpose:** Unified POS payment record.

**Source module:** Sales, Payments and Receipts

**Data dictionary section:** `6.6`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NULL FK | References outlets(id). |
| customer_id | uuid | NULL FK | References customers(id). |
| till_session_id | uuid | NULL FK | References till_sessions(id). |
| tenant_payment_method_id | uuid | NULL FK | References tenant_payment_methods(id). |
| source_device_id | uuid | NULL FK | References pos_devices(id). |
| payment_direction | varchar(20) | NOT NULL CHECK | inbound, outbound. |
| payment_purpose | varchar(40) | NOT NULL CHECK | sale, refund, exchange_difference. |
| payment_status | varchar(30) | NOT NULL CHECK | pending, authorized, captured, failed, cancelled, voided, refunded. |
| method_type | varchar(40) | NOT NULL | Frozen method code. |
| provider_code | varchar(80) | NULL | Frozen provider code. |
| currency | char(3) | NOT NULL | Currency. |
| amount | numeric(12,2) | NOT NULL CHECK > 0 | Payment amount. |
| captured_amount | numeric(12,2) | NOT NULL DEFAULT 0 | Captured amount. |
| reference_no | varchar(150) | NULL | External reference. |
| idempotency_key | varchar(160) | NULL | Tenant-scoped idempotency key. |
| created_at | timestamptz | NOT NULL | Creation time. |
| completed_at | timestamptz | NULL | Completion time. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, idempotency_key) WHERE idempotency_key IS NOT NULL |

### Design Notes

- No explicit design note was provided.


## Entity: `payment_transactions`

**Purpose:** Gateway/provider event log per payment.

**Source module:** Sales, Payments and Receipts

**Data dictionary section:** `6.7`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| payment_id | uuid | NOT NULL FK | References payments(id). |
| event_type | varchar(40) | NOT NULL CHECK | auth, capture, void, refund, webhook, failure. |
| provider_transaction_id | varchar(160) | NULL | Provider transaction id. |
| amount | numeric(12,2) | NOT NULL CHECK >= 0 | Event amount. |
| payment_status | varchar(30) | NOT NULL | Resulting status. |
| raw_payload | jsonb | NULL | Sanitized payload. |
| created_at | timestamptz | NOT NULL | Creation time. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- No explicit design note was provided.


## Entity: `sale_payment_allocations`

**Purpose:** Allocates payments to POS sales for split payment support.

**Source module:** Sales, Payments and Receipts

**Data dictionary section:** `6.8`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| sale_id | uuid | NOT NULL FK | References sales(id). |
| payment_id | uuid | NOT NULL FK | References payments(id). |
| amount | numeric(12,2) | NOT NULL CHECK > 0 | Allocated amount. |
| created_at | timestamptz | NOT NULL | Creation time. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, sale_id, payment_id) |

### Design Notes

- No explicit design note was provided.


## Entity: `payment_webhook_events`

**Purpose:** Idempotent storage of payment provider webhook events.

**Source module:** Sales, Payments and Receipts

**Data dictionary section:** `6.9`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| provider_code | varchar(80) | NOT NULL | Provider code. |
| provider_event_id | varchar(180) | NOT NULL | Provider event id. |
| payment_id | uuid | NULL FK | References payments(id). |
| event_type | varchar(80) | NOT NULL | Provider event type. |
| raw_payload | jsonb | NOT NULL | Full webhook payload. |
| signature_valid | boolean | NOT NULL | Signature check result. |
| processed_status | varchar(30) | NOT NULL CHECK | pending, processed, ignored, failed. |
| received_at | timestamptz | NOT NULL | Receive time. |
| processed_at | timestamptz | NULL | Process time. |
| error_message | text | NULL | Failure details. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(provider_code, provider_event_id) |

### Design Notes

- No explicit design note was provided.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
