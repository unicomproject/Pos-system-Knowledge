<!-- title: Notification -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 26. Notification

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `notification_channels` | Stores notification channels records for this module. |
| `notification_event_types` | Stores notification event types records for this module. |
| `notification_preferences` | Stores notification preferences records for this module. |
| `notification_events` | Stores notification events records for this module. |
| `notification_templates` | Stores notification templates records for this module. |
| `notification_template_versions` | Stores notification template versions records for this module. |
| `notification_messages` | Stores notification messages records for this module. |
| `notification_delivery_attempts` | Stores notification delivery attempts records for this module. |
| `notification_inbox_items` | Stores notification inbox items records for this module. |
| `notification_read_receipts` | Stores notification read receipts records for this module. |

## notification_channels

Module: Notification

Purpose: Stores notification channels records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| channel_type | varchar(40) | CHECK | CHECK(channel_type IN ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| channel_code | varchar(40) | UNIQUE | Unique business key. |
| platform_integration_id | uuid | FK NOT | References `platform_integrations(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(platform_integration_id) REFERENCES platform_integrations(id)
UNIQUE(tenant_id, channel_code)
CHECK(channel_type IN ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP'))
```

## notification_event_types

Module: Notification

Purpose: Stores notification event types records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| default_priority | varchar(255) | CHECK | CHECK(default_priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')) |
| event_code | varchar(80) | UNIQUE | Unique business key. |
| sort_order | integer | NOT DEFAULT 0 | Display order. |

Source constraints from uploaded design:

```text
PK(id)
UNIQUE(tenant_id, event_code)
CHECK(default_priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT'))
```

## notification_preferences

Module: Notification

Purpose: Stores notification preferences records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| platform_user_id | uuid | UNIQUE CHECK | Unique business key. CHECK((recipient_type = 'PLATFORM_USER' AND platform_user_id IS NOT NULL AND tenant_user_id IS NULL AND customer_id IS NULL) OR (recipient_type = 'TENANT_USER' AND tenant_user_id IS NOT NULL AND platform_user_id IS NULL AND customer_id IS NULL) OR (recipient_type = 'CUSTOMER' AND customer_id IS NOT NULL AND platform_user_id IS NULL AND tenant_user_id IS NULL)) |
| tenant_user_id | uuid | UNIQUE CHECK | Unique business key. CHECK((recipient_type = 'PLATFORM_USER' AND platform_user_id IS NOT NULL AND tenant_user_id IS NULL AND customer_id IS NULL) OR (recipient_type = 'TENANT_USER' AND tenant_user_id IS NOT NULL AND platform_user_id IS NULL AND customer_id IS NULL) OR (recipient_type = 'CUSTOMER' AND customer_id IS NOT NULL AND platform_user_id IS NULL AND tenant_user_id IS NULL)) |
| customer_id | uuid | UNIQUE CHECK | Unique business key. CHECK((recipient_type = 'PLATFORM_USER' AND platform_user_id IS NOT NULL AND tenant_user_id IS NULL AND customer_id IS NULL) OR (recipient_type = 'TENANT_USER' AND tenant_user_id IS NOT NULL AND platform_user_id IS NULL AND customer_id IS NULL) OR (recipient_type = 'CUSTOMER' AND customer_id IS NOT NULL AND platform_user_id IS NULL AND tenant_user_id IS NULL)) |
| channel_type | varchar(40) | UNIQUE | Unique business key. |
| recipient_type | varchar(40) | UNIQUE CHECK | Unique business key. CHECK((recipient_type = 'PLATFORM_USER' AND platform_user_id IS NOT NULL AND tenant_user_id IS NULL AND customer_id IS NULL) OR (recipient_type = 'TENANT_USER' AND tenant_user_id IS NOT NULL AND platform_user_id IS NULL AND customer_id IS NULL) OR (recipient_type = 'CUSTOMER' AND customer_id IS NOT NULL AND platform_user_id IS NULL AND tenant_user_id IS NULL)) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| notification_event_type_id | uuid | FK NOT UNIQUE | References `notification_event_types(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(notification_event_type_id) REFERENCES notification_event_types(id)
CHECK((recipient_type = 'PLATFORM_USER' AND platform_user_id IS NOT NULL AND tenant_user_id IS NULL AND customer_id IS NULL) OR (recipient_type = 'TENANT_USER' AND tenant_user_id IS NOT NULL AND platform_user_id IS NULL AND customer_id IS NULL) OR (recipient_type = 'CUSTOMER' AND customer_id IS NOT NULL AND platform_user_id IS NULL AND tenant_user_id IS NULL))
UNIQUE(tenant_id, recipient_type, platform_user_id, tenant_user_id, customer_id, notification_event_type_id, channel_type)
```

## notification_events

Module: Notification

Purpose: Stores notification events records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. Unique business key. Partial unique where idempotency_key IS NOT NULL. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| event_number | varchar(80) | UNIQUE | Unique business key. |
| idempotency_key | varchar(120) | UNIQUE | Unique business key. Partial unique where idempotency_key IS NOT NULL. |
| notification_event_type_id | uuid | FK NOT | References `notification_event_types(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(notification_event_type_id) REFERENCES notification_event_types(id)
UNIQUE(tenant_id, event_number)
UNIQUE(tenant_id, idempotency_key) WHERE idempotency_key IS NOT NULL
```

## notification_templates

Module: Notification

Purpose: Stores notification templates records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| template_code | varchar(80) | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| channel_type | varchar(40) | UNIQUE | Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| locale | varchar(20) | UNIQUE | Unique business key. |
| notification_event_type_id | uuid | FK NOT UNIQUE | References `notification_event_types(id)`. Unique business key. |
| sort_order | integer | NOT DEFAULT 0 | Display order. |

Source constraints from uploaded design:

```text
PK(id)
FK(notification_event_type_id) REFERENCES notification_event_types(id)
UNIQUE(tenant_id, notification_event_type_id, channel_type, locale, template_code)
```

## notification_template_versions

Module: Notification

Purpose: Stores notification template versions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| notification_template_id | uuid | FK NOT UNIQUE | References `notification_templates(id)`. Unique business key. Unique business key. Partial unique where is_active_version = true. |
| is_active_version | boolean | NOT | Active version flag used by partial unique filter. |
| version_number | integer | UNIQUE CHECK | Unique business key. CHECK(version_number > 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(notification_template_id) REFERENCES notification_templates(id)
UNIQUE(notification_template_id, version_number)
UNIQUE(notification_template_id) WHERE is_active_version = true
CHECK(version_number > 0)
```

## notification_messages

Module: Notification

Purpose: Stores notification messages records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| platform_user_id | uuid | CHECK | CHECK((recipient_type = 'PLATFORM_USER' AND platform_user_id IS NOT NULL) OR (recipient_type = 'TENANT_USER' AND tenant_user_id IS NOT NULL) OR (recipient_type = 'CUSTOMER' AND customer_id IS NOT NULL)) |
| tenant_user_id | uuid | CHECK | CHECK((recipient_type = 'PLATFORM_USER' AND platform_user_id IS NOT NULL) OR (recipient_type = 'TENANT_USER' AND tenant_user_id IS NOT NULL) OR (recipient_type = 'CUSTOMER' AND customer_id IS NOT NULL)) |
| customer_id | uuid | CHECK | CHECK((recipient_type = 'PLATFORM_USER' AND platform_user_id IS NOT NULL) OR (recipient_type = 'TENANT_USER' AND tenant_user_id IS NOT NULL) OR (recipient_type = 'CUSTOMER' AND customer_id IS NOT NULL)) |
| recipient_type | varchar(40) | CHECK | CHECK((recipient_type = 'PLATFORM_USER' AND platform_user_id IS NOT NULL) OR (recipient_type = 'TENANT_USER' AND tenant_user_id IS NOT NULL) OR (recipient_type = 'CUSTOMER' AND customer_id IS NOT NULL)) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| message_number | varchar(80) | UNIQUE | Unique business key. |
| notification_channel_id | uuid | FK NOT | References `notification_channels(id)`. |
| notification_event_id | uuid | FK NOT | References `notification_events(id)`. |
| notification_template_version_id | uuid | FK NOT | References `notification_template_versions(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(notification_event_id) REFERENCES notification_events(id)
FK(notification_template_version_id) REFERENCES notification_template_versions(id)
FK(notification_channel_id) REFERENCES notification_channels(id)
CHECK((recipient_type = 'PLATFORM_USER' AND platform_user_id IS NOT NULL) OR (recipient_type = 'TENANT_USER' AND tenant_user_id IS NOT NULL) OR (recipient_type = 'CUSTOMER' AND customer_id IS NOT NULL))
UNIQUE(tenant_id, message_number)
```

## notification_delivery_attempts

Module: Notification

Purpose: Stores notification delivery attempts records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| attempt_number | integer | UNIQUE CHECK | Unique business key. CHECK(attempt_number > 0) |
| notification_channel_id | uuid | FK NOT | References `notification_channels(id)`. |
| notification_message_id | uuid | FK NOT UNIQUE | References `notification_messages(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(notification_message_id) REFERENCES notification_messages(id)
FK(notification_channel_id) REFERENCES notification_channels(id)
UNIQUE(notification_message_id, attempt_number)
CHECK(attempt_number > 0)
```

## notification_inbox_items

Module: Notification

Purpose: Stores notification inbox items records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| inbox_status | varchar(30) | CHECK | CHECK(inbox_status IN ('UNREAD', 'READ', 'ARCHIVED', 'DELETED')) |
| notification_message_id | uuid | FK NOT UNIQUE | References `notification_messages(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(notification_message_id) REFERENCES notification_messages(id)
UNIQUE(notification_message_id)
CHECK(inbox_status IN ('UNREAD', 'READ', 'ARCHIVED', 'DELETED'))
```

## notification_read_receipts

Module: Notification

Purpose: Stores notification read receipts records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| notification_inbox_item_id | uuid | FK NOT | References `notification_inbox_items(id)`. |
| read_source | varchar(40) | CHECK | CHECK(read_source IN ('WEB', 'MOBILE', 'POS', 'ADMIN', 'API')) |

Source constraints from uploaded design:

```text
PK(id)
FK(notification_inbox_item_id) REFERENCES notification_inbox_items(id)
CHECK(read_source IN ('WEB', 'MOBILE', 'POS', 'ADMIN', 'API'))
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
