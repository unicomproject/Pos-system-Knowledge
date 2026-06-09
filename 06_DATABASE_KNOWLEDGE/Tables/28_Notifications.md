<!-- title: Notifications -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Notifications

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| notification_templates | Reusable notification templates for email and in-app messages. | 9 |
| notifications | Notification message generated for tenant users, customers, roles or outlets. | 14 |
| notification_delivery_logs | Per-channel notification delivery attempts. | 11 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `notification_templates`

**Purpose:** Reusable notification templates for email and in-app messages.

**Source module:** Reporting, Exports and Notifications

**Data dictionary section:** `9.6`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NULL FK | Null for platform default, otherwise tenant override. |
| template_key | varchar(120) | NOT NULL | Template key. |
| channel | varchar(30) | NOT NULL CHECK | email, in_app. |
| subject | varchar(250) | NULL | Subject/title. |
| body | text | NOT NULL | Template body. |
| status | varchar(30) | NOT NULL CHECK | active, inactive. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, template_key, channel, language_code) |

### Design Notes

- No explicit design note was provided.


## Entity: `notifications`

**Purpose:** Notification message generated for tenant users, customers, roles or outlets.

**Source module:** Reporting, Exports and Notifications

**Data dictionary section:** `9.7`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| recipient_type | varchar(30) | NOT NULL CHECK | user, role, outlet, customer. |
| recipient_user_id | uuid | NULL FK | References users(id). |
| recipient_customer_id | uuid | NULL FK | References customers(id). |
| recipient_role_id | uuid | NULL FK | References roles(id). |
| outlet_id | uuid | NULL FK | References outlets(id). |
| title | varchar(250) | NOT NULL | Notification title. |
| message | text | NOT NULL | Message content. |
| notification_type | varchar(60) | NOT NULL | low_stock, near_expiry, payment, subscription_expiry, security, report_ready. |
| priority | varchar(20) | NOT NULL CHECK | low, normal, high, critical. |
| status | varchar(30) | NOT NULL CHECK | pending, sent, failed, read, archived. |
| created_at | timestamptz | NOT NULL | Creation time. |
| read_at | timestamptz | NULL | Read time. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- No explicit design note was provided.


## Entity: `notification_delivery_logs`

**Purpose:** Per-channel notification delivery attempts.

**Source module:** Reporting, Exports and Notifications

**Data dictionary section:** `9.8`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| notification_id | uuid | NOT NULL FK | References notifications(id). |
| channel | varchar(30) | NOT NULL CHECK | email, in_app. |
| provider | varchar(80) | NULL | Provider name. |
| provider_message_id | varchar(180) | NULL | Provider id. |
| delivery_status | varchar(30) | NOT NULL CHECK | pending, sent, delivered, failed, bounced. |
| error_message | text | NULL | Failure details. |
| sent_at | timestamptz | NULL | Sent time. |
| delivered_at | timestamptz | NULL | Delivered time. |
| created_at | timestamptz | NOT NULL | Creation time. |

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
