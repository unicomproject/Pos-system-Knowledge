<!-- title: Subscription, Billing, Payments & Usage -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 05. Subscription, Billing, Payments & Usage

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `tenant_subscriptions` | Stores tenant subscriptions records for this module. |
| `tenant_subscription_addons` | Stores tenant subscription addons records for this module. |
| `tenant_subscription_history` | Stores tenant subscription history records for this module. |
| `subscription_invoices` | Stores subscription invoices records for this module. |
| `subscription_invoice_lines` | Stores subscription invoice lines records for this module. |
| `subscription_payment_links` | Stores subscription payment links records for this module. |
| `subscription_payment_transactions` | Stores subscription payment transactions records for this module. |
| `subscription_credit_notes` | Stores subscription credit notes records for this module. |
| `subscription_credit_note_lines` | Stores subscription credit note lines records for this module. |
| `tenant_usage_counters` | Stores tenant usage counters records for this module. |

## tenant_subscriptions

Module: Subscription, Billing, Payments & Usage

Purpose: Stores tenant subscriptions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| subscription_number | varchar(80) | UNIQUE | Unique business key. |
| subscription_plan_id | uuid | FK NOT | References `subscription_plans(id)`. |
| subscription_status | varchar(30) | CHECK | CHECK(subscription_status IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED')) |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(subscription_plan_id) REFERENCES subscription_plans(id)
UNIQUE(tenant_id, subscription_number)
CHECK(subscription_status IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED'))
```

## tenant_subscription_addons

Module: Subscription, Billing, Payments & Usage

Purpose: Stores tenant subscription addons records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| subscription_addon_id | uuid | FK NOT UNIQUE | References `subscription_addons(id)`. Unique business key. |
| tenant_subscription_id | uuid | FK NOT UNIQUE | References `tenant_subscriptions(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_subscription_id) REFERENCES tenant_subscriptions(id)
FK(subscription_addon_id) REFERENCES subscription_addons(id)
UNIQUE(tenant_subscription_id, subscription_addon_id)
```

## tenant_subscription_history

Module: Subscription, Billing, Payments & Usage

Purpose: Stores tenant subscription history records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| sequence_number | integer | UNIQUE CHECK | Unique business key. CHECK(sequence_number > 0) |
| tenant_subscription_id | uuid | FK NOT UNIQUE | References `tenant_subscriptions(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_subscription_id) REFERENCES tenant_subscriptions(id)
CHECK(sequence_number > 0)
UNIQUE(tenant_subscription_id, sequence_number)
```

## subscription_invoices

Module: Subscription, Billing, Payments & Usage

Purpose: Stores subscription invoices records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| invoice_number | varchar(80) | UNIQUE | Unique business key. |
| tenant_subscription_id | uuid | FK NOT | References `tenant_subscriptions(id)`. |
| total_amount | numeric(18,2) | CHECK | CHECK(total_amount >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_subscription_id) REFERENCES tenant_subscriptions(id)
UNIQUE(tenant_id, invoice_number)
CHECK(total_amount >= 0)
```

## subscription_invoice_lines

Module: Subscription, Billing, Payments & Usage

Purpose: Stores subscription invoice lines records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| line_number | varchar(80) | UNIQUE | Unique business key. |
| line_total_amount | numeric(18,2) | CHECK | CHECK(line_total_amount >= 0) |
| quantity | numeric(18,4) | CHECK | CHECK(quantity > 0) |
| subscription_invoice_id | uuid | FK NOT UNIQUE | References `subscription_invoices(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(subscription_invoice_id) REFERENCES subscription_invoices(id)
CHECK(quantity > 0)
CHECK(line_total_amount >= 0)
UNIQUE(subscription_invoice_id, line_number)
```

## subscription_payment_links

Module: Subscription, Billing, Payments & Usage

Purpose: Stores subscription payment links records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| expires_at | timestamptz | CHECK | CHECK(expires_at IS NULL OR expires_at > created_at) |
| payment_link_token_hash | varchar(255) | UNIQUE | Unique business key. |
| subscription_invoice_id | uuid | FK NOT | References `subscription_invoices(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(subscription_invoice_id) REFERENCES subscription_invoices(id)
UNIQUE(payment_link_token_hash)
CHECK(expires_at IS NULL OR expires_at > created_at)
```

## subscription_payment_transactions

Module: Subscription, Billing, Payments & Usage

Purpose: Stores subscription payment transactions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| amount | numeric(18,2) | CHECK | CHECK(amount >= 0) |
| provider_transaction_reference | varchar(255) | UNIQUE | Unique business key. |
| subscription_invoice_id | uuid | FK NOT | References `subscription_invoices(id)`. |
| subscription_payment_link_id | uuid | FK NOT | References `subscription_payment_links(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(subscription_invoice_id) REFERENCES subscription_invoices(id)
FK(subscription_payment_link_id) REFERENCES subscription_payment_links(id)
CHECK(amount >= 0)
UNIQUE(provider_transaction_reference)
```

## subscription_credit_notes

Module: Subscription, Billing, Payments & Usage

Purpose: Stores subscription credit notes records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| credit_note_number | varchar(80) | UNIQUE | Unique business key. |
| subscription_invoice_id | uuid | FK NOT | References `subscription_invoices(id)`. |
| total_credit_amount | numeric(18,2) | CHECK | CHECK(total_credit_amount >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(subscription_invoice_id) REFERENCES subscription_invoices(id)
UNIQUE(tenant_id, credit_note_number)
CHECK(total_credit_amount >= 0)
```

## subscription_credit_note_lines

Module: Subscription, Billing, Payments & Usage

Purpose: Stores subscription credit note lines records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| line_credit_amount | numeric(18,2) | CHECK | CHECK(line_credit_amount >= 0) |
| line_number | varchar(80) | UNIQUE | Unique business key. |
| subscription_credit_note_id | uuid | FK NOT UNIQUE | References `subscription_credit_notes(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(subscription_credit_note_id) REFERENCES subscription_credit_notes(id)
CHECK(line_credit_amount >= 0)
UNIQUE(subscription_credit_note_id, line_number)
```

## tenant_usage_counters

Module: Subscription, Billing, Payments & Usage

Purpose: Stores tenant usage counters records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| platform_feature_id | uuid | FK NOT UNIQUE | References `platform_features(id)`. Unique business key. |
| usage_period_start | varchar(255) | UNIQUE | Unique business key. |
| used_quantity | numeric(18,4) | CHECK | CHECK(used_quantity >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(platform_feature_id) REFERENCES platform_features(id)
UNIQUE(tenant_id, platform_feature_id, usage_period_start)
CHECK(used_quantity >= 0)
```

## tenant_subscriptions (wizard billing fields)

Additional Unified-Commerce columns used by tenant create wizard step 6:

- `billing_cycle`, `trial_start_at`, `trial_end_at`, `billing_start_at`, `next_billing_at`
- `auto_renew`, `discount_type`, `discount_value`, `tax_percentage`
- `invoice_email`, `payment_method`, `notes`
- `max_outlets_override`, `max_tills_override`, `max_users_override`

## tenant_subscription_addons

- `quantity` column added for wizard add-on selections

## subscription_invoices

- `invoice_status`, `billing_cycle`, `due_at` used for draft invoice creation on pending billing

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
