<!-- title: Subscription Billing Lifecycle -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Subscription Billing Lifecycle

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| tenant_subscriptions | Current subscription assigned to tenant. | 10 |
| tenant_subscription_history | Immutable subscription lifecycle history. | 9 |
| subscription_invoices | Tenant subscription invoice header used for billing summary and payment tracking. | 18 |
| subscription_invoice_lines | Line items inside a subscription invoice. | 9 |
| subscription_payment_links | Secure payment link issued to tenant admin for subscription invoice payment. | 15 |
| subscription_payment_transactions | Payment transaction records for tenant subscription billing. | 12 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `tenant_subscriptions`

**Purpose:** Current subscription assigned to tenant.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.5`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| plan_id | uuid | NOT NULL FK | References subscription_plans(id). |
| status | varchar(30) | NOT NULL CHECK | trial, active, past_due, suspended, cancelled, expired. |
| starts_at | timestamptz | NOT NULL | Subscription start. |
| ends_at | timestamptz | NULL | Subscription end. |
| trial_ends_at | timestamptz | NULL | Trial end. |
| assigned_by_platform_user_id | uuid | NULL FK | References platform_users(id). |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id) WHERE status IN (trial, active, past_due) |

### Design Notes

- No explicit design note was provided.


## Entity: `tenant_subscription_history`

**Purpose:** Immutable subscription lifecycle history.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.6`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| subscription_id | uuid | NULL FK | References tenant_subscriptions(id). |
| old_plan_id | uuid | NULL FK | References subscription_plans(id). |
| new_plan_id | uuid | NULL FK | References subscription_plans(id). |
| change_type | varchar(40) | NOT NULL CHECK | created, upgraded, downgraded, renewed, suspended, cancelled, expired. |
| reason | text | NULL | Change reason. |
| changed_by_platform_user_id | uuid | NULL FK | References platform_users(id). |
| changed_at | timestamptz | NOT NULL | Change time. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- Append-only.


## Entity: `subscription_invoices`

**Purpose:** Tenant subscription invoice header used for billing summary and payment tracking.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.7`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| subscription_id | uuid | NOT NULL FK | References tenant_subscriptions(id). |
| invoice_number | varchar(80) | NOT NULL | Business invoice number. |
| invoice_status | varchar(30) | NOT NULL CHECK | draft, issued, paid, void, overdue, cancelled. |
| currency | char(3) | NOT NULL | Invoice currency. |
| subtotal | numeric(12,2) | NOT NULL CHECK >= 0 | Subtotal. |
| tax_total | numeric(12,2) | NOT NULL CHECK >= 0 | Tax total. |
| discount_total | numeric(12,2) | NOT NULL CHECK >= 0 | Discount total. |
| grand_total | numeric(12,2) | NOT NULL CHECK >= 0 | Payable total. |
| issued_at | timestamptz | NULL | Issue time. |
| due_at | timestamptz | NULL | Due time. |
| paid_at | timestamptz | NULL | Paid time. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |
| billing_period_start | date | NULL | Subscription period start. |
| billing_period_end | date | NULL | Subscription period end. |
| payment_status | varchar(30) | NOT NULL DEFAULT pending | pending, paid, failed, refunded, voided. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, invoice_number) |

### Design Notes

- No explicit design note was provided.


## Entity: `subscription_invoice_lines`

**Purpose:** Line items inside a subscription invoice.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.8`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| invoice_id | uuid | NOT NULL FK | References subscription_invoices(id). |
| line_no | int | NOT NULL | Line number. |
| item_type | varchar(40) | NOT NULL CHECK | plan, addon, setup_fee, discount, tax. |
| description | varchar(250) | NOT NULL | Line description. |
| quantity | numeric(12,3) | NOT NULL CHECK > 0 | Quantity. |
| unit_price | numeric(12,2) | NOT NULL CHECK >= 0 | Unit price. |
| line_total | numeric(12,2) | NOT NULL CHECK >= 0 | Line total. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, invoice_id, line_no) |

### Design Notes

- No explicit design note was provided.


## Entity: `subscription_payment_links`

**Purpose:** Secure payment link issued to tenant admin for subscription invoice payment.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.9`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| invoice_id | uuid | NOT NULL FK | References subscription_invoices(id). |
| token_hash | varchar(255) | NOT NULL UNIQUE | Hash of payment token. |
| provider_code | varchar(80) | NULL | Payment provider code. |
| link_status | varchar(30) | NOT NULL CHECK | active, paid, expired, cancelled. |
| expires_at | timestamptz | NOT NULL | Link expiry. |
| sent_to_email | citext | NOT NULL | Recipient email. |
| sent_at | timestamptz | NULL | Sent timestamp. |
| used_at | timestamptz | NULL | Used timestamp. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |
| payment_url | varchar(1000) | NULL | Provider checkout URL or internal hosted payment page URL. |
| resend_count | int | NOT NULL DEFAULT 0 | Number of resend attempts. |
| last_resent_at | timestamptz | NULL | Last resend timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(token_hash) |

### Design Notes

- No explicit design note was provided.


## Entity: `subscription_payment_transactions`

**Purpose:** Payment transaction records for tenant subscription billing.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.10`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| invoice_id | uuid | NOT NULL FK | References subscription_invoices(id). |
| payment_link_id | uuid | NULL FK | References subscription_payment_links(id). |
| provider_code | varchar(80) | NULL | Provider code. |
| provider_transaction_id | varchar(160) | NULL | External reference. |
| status | varchar(30) | NOT NULL CHECK | pending, authorized, captured, failed, cancelled, refunded. |
| currency | char(3) | NOT NULL | Currency. |
| amount | numeric(12,2) | NOT NULL CHECK > 0 | Transaction amount. |
| raw_response | jsonb | NULL | Sanitized provider response. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| completed_at | timestamptz | NULL | Completion timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, provider_code, provider_transaction_id) WHERE provider_transaction_id IS NOT NULL |

### Design Notes

- No explicit design note was provided.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
