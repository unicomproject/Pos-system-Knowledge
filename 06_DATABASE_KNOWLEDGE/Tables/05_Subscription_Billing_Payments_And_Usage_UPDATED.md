<!-- title: 05. Tenant Subscription, Billing, Payments & Usage -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- source: Updated from uploaded ERD image: 05_Subscription, Billing, Payments & Usage.png -->

# 05. Tenant Subscription, Billing, Payments & Usage

## Purpose

This file documents the entity tables, attributes, keys, nullability, constraints, and external references for this ERD module. Enum/domain data types from the image are represented as `varchar(...)` plus CHECK/notes, not database enum types.

## Entity Tables

| Table | Purpose |
|---|---|
| `tenant_subscriptions` | Stores tenant subscription lifecycle. |
| `tenant_subscription_addons` | Stores add-ons attached to a tenant subscription. |
| `tenant_subscription_history` | Append-only subscription change history. |
| `subscription_invoices` | Stores subscription invoice headers. |
| `subscription_invoice_lines` | Stores invoice line items. |
| `subscription_payment_links` | Stores secure payment links for subscription invoices. |
| `subscription_payment_transactions` | Stores payment transaction attempts for subscription invoices. |
| `subscription_credit_notes` | Stores subscription credit note headers. |
| `subscription_credit_note_lines` | Stores subscription credit note line rows. |
| `tenant_usage_counters` | Stores usage counter values for feature limits. |

## `tenant_subscriptions`

Purpose: Stores tenant subscription lifecycle.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `plan_id` | uuid | FK | NOT NULL | References subscription_plans(id) |
| `subscription_number` | varchar(80) |  | NOT NULL |  |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: subscription_status |
| `billing_cycle` | varchar(40) |  | NOT NULL | Original ERD domain: billing_cycle |
| `currency_code` | char(3) | FK | NOT NULL | References currencies(currency_code) |
| `plan_price` | numeric(18,4) |  | NOT NULL |  |
| `auto_renew` | boolean |  | NOT NULL |  |
| `started_at` | timestamptz |  | NOT NULL |  |
| `trial_started_at` | timestamptz |  | NULL |  |
| `trial_ends_at` | timestamptz |  | NULL |  |
| `current_period_start` | timestamptz |  | NOT NULL |  |
| `current_period_end` | timestamptz |  | NULL |  |
| `next_billing_date` | timestamptz |  | NULL |  |
| `cancelled_at` | timestamptz |  | NULL |  |
| `ended_at` | timestamptz |  | NULL |  |
| `cancellation_reason` | text |  | NULL |  |
| `assigned_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

Constraints / Notes:

```text
UNIQUE(subscription_number)
CHECK(plan_price >= 0)
CHECK(current_period_end > current_period_start)
One active subscription per tenant when status IN ('TRIALING', 'ACTIVE', 'PAST_DUE')
```

Relationships:

- tenant_subscriptions.tenant_id -> tenants.id
- tenant_subscriptions.plan_id -> subscription_plans.id
- tenant_subscriptions.currency_code -> currencies.currency_code

## `tenant_subscription_addons`

Purpose: Stores add-ons attached to a tenant subscription.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `subscription_id` | uuid | FK | NOT NULL | References tenant_subscriptions(id) |
| `addon_id` | uuid | FK | NOT NULL | References subscription_addons(id) |
| `quantity` | int |  | NOT NULL |  |
| `unit_price` | numeric(18,4) |  | NOT NULL |  |
| `currency_code` | char(3) | FK | NOT NULL | References currencies(currency_code) |
| `auto_renew` | boolean |  | NOT NULL |  |
| `starts_at` | timestamptz |  | NOT NULL |  |
| `ends_at` | timestamptz |  | NULL |  |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: subscription_addon_status |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `updated_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |

Constraints / Notes:

```text
CHECK(quantity > 0)
CHECK(unit_price >= 0)
UNIQUE(subscription_id, addon_id) WHERE status IN ('ACTIVE', 'SCHEDULED')
```

Relationships:

- tenant_subscription_addons.subscription_id -> tenant_subscriptions.id
- tenant_subscription_addons.addon_id -> subscription_addons.id

## `tenant_subscription_history`

Purpose: Append-only subscription change history.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `subscription_id` | uuid | FK | NOT NULL | References tenant_subscriptions(id) |
| `old_plan_id` | uuid | FK | NULL | References subscription_plans(id) |
| `new_plan_id` | uuid | FK | NULL | References subscription_plans(id) |
| `old_status` | varchar(40) |  | NULL | Original ERD domain: subscription_status |
| `new_status` | varchar(40) |  | NULL | Original ERD domain: subscription_status |
| `change_type` | varchar(40) |  | NOT NULL | Original ERD domain: subscription_change_type |
| `reason` | text |  | NULL |  |
| `change_data` | jsonb |  | NULL |  |
| `changed_at` | timestamptz |  | NOT NULL |  |
| `changed_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |

Constraints / Notes:

```text
Append-only history log
```

Relationships:

- tenant_subscription_history.tenant_id -> tenants.id
- tenant_subscription_history.subscription_id -> tenant_subscriptions.id

## `subscription_invoices`

Purpose: Stores subscription invoice headers.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `subscription_id` | uuid | FK | NOT NULL | References tenant_subscriptions(id) |
| `invoice_number` | varchar(80) |  | NOT NULL |  |
| `invoice_type` | varchar(40) |  | NOT NULL | Original ERD domain: invoice_type |
| `invoice_status` | varchar(40) |  | NOT NULL | Original ERD domain: invoice_status |
| `currency_code` | char(3) | FK | NOT NULL | References currencies(currency_code) |
| `subtotal_amount` | numeric(18,4) |  | NOT NULL |  |
| `discount_amount` | numeric(18,4) |  | NOT NULL |  |
| `tax_amount` | numeric(18,4) |  | NOT NULL |  |
| `total_amount` | numeric(18,4) |  | NOT NULL |  |
| `paid_amount` | numeric(18,4) |  | NOT NULL |  |
| `balance_due` | numeric(18,4) |  | NOT NULL |  |
| `billing_period_start` | timestamptz |  | NULL |  |
| `billing_period_end` | timestamptz |  | NULL |  |
| `billing_details_json` | jsonb |  | NULL |  |
| `issued_at` | timestamptz |  | NULL |  |
| `due_at` | timestamptz |  | NULL |  |
| `paid_at` | timestamptz |  | NULL |  |
| `voided_at` | timestamptz |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

Constraints / Notes:

```text
UNIQUE(invoice_number)
CHECK(subtotal_amount >= 0)
CHECK(discount_amount >= 0)
CHECK(tax_amount >= 0)
CHECK(total_amount >= 0)
CHECK(paid_amount >= 0)
CHECK(balance_due >= 0)
```

Relationships:

- subscription_invoices.tenant_id -> tenants.id
- subscription_invoices.subscription_id -> tenant_subscriptions.id

## `subscription_invoice_lines`

Purpose: Stores invoice line items.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `invoice_id` | uuid | FK | NOT NULL | References subscription_invoices(id) |
| `line_number` | int |  | NOT NULL |  |
| `item_type` | varchar(40) |  | NOT NULL | Original ERD domain: invoice_line_type |
| `item_reference_id` | uuid |  | NULL |  |
| `item_code` | varchar(120) |  | NULL |  |
| `description` | varchar(250) |  | NOT NULL |  |
| `quantity` | numeric(18,4) |  | NOT NULL |  |
| `unit_price` | numeric(18,4) |  | NOT NULL |  |
| `discount_amount` | numeric(18,4) |  | NOT NULL |  |
| `tax_amount` | numeric(18,4) |  | NOT NULL |  |
| `line_total` | numeric(18,4) |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |

Constraints / Notes:

```text
UNIQUE(invoice_id, line_number)
CHECK(quantity > 0)
CHECK(unit_price >= 0)
CHECK(discount_amount >= 0)
CHECK(tax_amount >= 0)
```

Relationships:

- subscription_invoice_lines.invoice_id -> subscription_invoices.id

## `subscription_payment_links`

Purpose: Stores secure payment links for subscription invoices.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `invoice_id` | uuid | FK | NOT NULL | References subscription_invoices(id) |
| `token_hash` | varchar(255) |  | NOT NULL |  |
| `provider_name` | varchar(120) |  | NULL |  |
| `provider_payment_link_id` | varchar(150) |  | NULL |  |
| `payment_url` | varchar(700) |  | NOT NULL |  |
| `link_status` | varchar(40) |  | NOT NULL | Original ERD domain: payment_link_status |
| `expires_at` | timestamptz |  | NULL |  |
| `sent_to_email` | varchar(255) |  | NULL |  |
| `sent_at` | timestamptz |  | NULL |  |
| `used_at` | timestamptz |  | NULL |  |
| `revoked_at` | timestamptz |  | NULL |  |
| `last_reminder_at` | timestamptz |  | NULL |  |
| `reminder_count` | int |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |

Constraints / Notes:

```text
UNIQUE(token_hash)
UNIQUE(provider_name, provider_payment_link_id) WHERE provider_payment_link_id IS NOT NULL
CHECK(reminder_count >= 0)
```

Relationships:

- subscription_payment_links.tenant_id -> tenants.id
- subscription_payment_links.invoice_id -> subscription_invoices.id

## `subscription_payment_transactions`

Purpose: Stores payment transaction attempts for subscription invoices.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `invoice_id` | uuid | FK | NOT NULL | References subscription_invoices(id) |
| `payment_link_id` | uuid | FK | NULL | References subscription_payment_links(id) |
| `transaction_type` | varchar(40) |  | NOT NULL | Original ERD domain: payment_transaction_type |
| `provider_name` | varchar(120) |  | NOT NULL |  |
| `provider_transaction_id` | varchar(150) |  | NOT NULL |  |
| `idempotency_key` | varchar(150) |  | NULL |  |
| `transaction_status` | varchar(40) |  | NOT NULL | Original ERD domain: payment_transaction_status |
| `currency_code` | char(3) | FK | NOT NULL | References currencies(currency_code) |
| `amount` | numeric(18,4) |  | NOT NULL |  |
| `provider_fee` | numeric(18,4) |  | NOT NULL |  |
| `net_amount` | numeric(18,4) |  | NOT NULL |  |
| `paid_at` | timestamptz |  | NULL |  |
| `failed_at` | timestamptz |  | NULL |  |
| `failure_reason` | text |  | NULL |  |
| `provider_response_json` | jsonb |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

Constraints / Notes:

```text
UNIQUE(provider_name, provider_transaction_id)
UNIQUE(idempotency_key) WHERE idempotency_key IS NOT NULL
CHECK(amount >= 0)
CHECK(provider_fee >= 0)
CHECK(net_amount >= 0)
```

Relationships:

- subscription_payment_transactions.tenant_id -> tenants.id
- subscription_payment_transactions.invoice_id -> subscription_invoices.id
- subscription_payment_transactions.payment_link_id -> subscription_payment_links.id

## `subscription_credit_notes`

Purpose: Stores subscription credit note headers.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `invoice_id` | uuid | FK | NOT NULL | References subscription_invoices(id) |
| `credit_note_number` | varchar(80) |  | NOT NULL |  |
| `reason` | text |  | NULL |  |
| `currency_code` | char(3) | FK | NOT NULL | References currencies(currency_code) |
| `subtotal_amount` | numeric(18,4) |  | NOT NULL |  |
| `tax_amount` | numeric(18,4) |  | NOT NULL |  |
| `total_amount` | numeric(18,4) |  | NOT NULL |  |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: credit_note_status |
| `issued_at` | timestamptz |  | NULL |  |
| `applied_at` | timestamptz |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `updated_at` | timestamptz |  | NOT NULL |  |

Constraints / Notes:

```text
UNIQUE(credit_note_number)
CHECK(subtotal_amount >= 0)
CHECK(tax_amount >= 0)
CHECK(total_amount >= 0)
```

Relationships:

- subscription_credit_notes.tenant_id -> tenants.id
- subscription_credit_notes.invoice_id -> subscription_invoices.id

## `subscription_credit_note_lines`

Purpose: Stores subscription credit note line rows.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `credit_note_id` | uuid | FK | NOT NULL | References subscription_credit_notes(id) |
| `invoice_line_id` | uuid | FK | NULL | References subscription_invoice_lines(id) |
| `line_number` | int |  | NOT NULL |  |
| `description` | varchar(250) |  | NOT NULL |  |
| `quantity` | numeric(18,4) |  | NOT NULL |  |
| `unit_amount` | numeric(18,4) |  | NOT NULL |  |
| `tax_amount` | numeric(18,4) |  | NOT NULL |  |
| `tax_total` | numeric(18,4) |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |

Constraints / Notes:

```text
UNIQUE(credit_note_id, line_number)
CHECK(quantity > 0)
CHECK(unit_amount >= 0)
CHECK(tax_amount >= 0)
CHECK(line_total >= 0)
```

Relationships:

- subscription_credit_note_lines.credit_note_id -> subscription_credit_notes.id
- subscription_credit_note_lines.invoice_line_id -> subscription_invoice_lines.id

## `tenant_usage_counters`

Purpose: Stores usage counter values for feature limits.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `feature_limit_id` | uuid | FK | NOT NULL | References feature_limit_definitions(id) |
| `usage_scope` | varchar(40) |  | NOT NULL | Original ERD domain: usage_scope |
| `scope_reference_id` | uuid |  | NULL |  |
| `current_value` | numeric(18,4) |  | NOT NULL |  |
| `limit_value` | numeric(18,4) |  | NULL |  |
| `period_start` | timestamptz |  | NOT NULL |  |
| `period_end` | timestamptz |  | NULL |  |
| `last_calculated_at` | timestamptz |  | NULL |  |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

Constraints / Notes:

```text
UNIQUE(tenant_id, feature_limit_id, usage_scope, scope_reference_id, period_start)
```

Relationships:

- tenant_usage_counters.tenant_id -> tenants.id
- tenant_usage_counters.feature_limit_id -> feature_limit_definitions.id

## Reference Entities (External)

| Table | Key Fields | Note |
|---|---|---|
| `tenants` | id uuid PK | Tenant reference |
| `subscription_plans` | id uuid PK | Plan reference |
| `subscription_addons` | id uuid PK | Add-on reference |
| `feature_limit_definitions` | id uuid PK | Feature limit reference |
| `platform_users` | id uuid PK | Platform audit user reference |
| `currencies` | currency_code char(3) PK | Currency reference |

## Module Notes

- Dashed grey lines in the ERD indicate external reference/audit relationships.

