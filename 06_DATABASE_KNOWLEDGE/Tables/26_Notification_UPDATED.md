<!-- title: Notification -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-04 -->
<!-- source: Updated from uploaded ERD image: 26_Notification(1).png -->

# 26. Notification

## Purpose

This file documents the database tables, attributes, keys, nullability, indexes, constraints, and external reference entities for this module.

## ERD Update Rule

This markdown version follows the uploaded ERD image as the source of truth. Table names, column names, data types, PK/FK markers, NULL/NOT NULL rules, and notes were updated to match the ERD.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `notification_channels` | Stores notification channel configuration. |
| `notification_event_types` | Stores notification event type catalog. |
| `notification_templates` | Stores notification templates. |
| `notification_template_versions` | Stores versioned notification template content. |
| `notification_preferences` | Stores recipient notification preferences. |
| `notification_events` | Stores event records that generate notifications. |
| `notification_messages` | Stores notification messages generated from events/templates. |
| `notification_delivery_attempts` | Stores delivery attempt rows for notification messages. |
| `notification_inbox_items` | Stores in-app inbox items. |
| `notification_read_receipts` | Stores read receipt records. |

## `notification_channels`

Purpose: Stores notification channel configuration.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NULL | Nullable for platform default channels |
| `channel_code` | varchar(90) |  | NOT NULL |  |
| `channel_name` | varchar(150) |  | NOT NULL |  |
| `channel_type` | varchar(40) |  | NOT NULL |  |
| `is_system_channel` | boolean |  | NOT NULL |  |
| `is_enabled` | boolean |  | NOT NULL |  |
| `provider_name` | varchar(120) |  | NULL |  |
| `provider_config_json` | jsonb |  | NULL |  |
| `status` | varchar(40) |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL |  |
| `created_by_tenant_user_id` | uuid | FK | NULL |  |
| `updated_at` | timestamptz |  | NULL |  |
| `updated_by_platform_user_id` | uuid | FK | NULL |  |
| `updated_by_tenant_user_id` | uuid | FK | NULL |  |
| `archived_at` | timestamptz |  | NULL |  |
| `archived_by_platform_user_id` | uuid | FK | NULL |  |
| `archived_by_tenant_user_id` | uuid | FK | NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(tenant_id, channel_code)
tenant_id nullable to support platform default channels.
```

## `notification_event_types`

Purpose: Stores notification event type catalog.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NULL | Nullable for platform default event types |
| `event_code` | varchar(120) |  | NOT NULL |  |
| `event_name` | varchar(180) |  | NOT NULL |  |
| `source_module` | varchar(120) |  | NULL |  |
| `description` | text |  | NULL |  |
| `default_priority` | varchar(40) |  | NOT NULL |  |
| `is_system_event` | boolean |  | NOT NULL |  |
| `is_enabled` | boolean |  | NOT NULL |  |
| `status` | varchar(40) |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL |  |
| `created_by_tenant_user_id` | uuid | FK | NULL |  |
| `updated_at` | timestamptz |  | NULL |  |
| `updated_by_platform_user_id` | uuid | FK | NULL |  |
| `updated_by_tenant_user_id` | uuid | FK | NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(tenant_id, event_code)
tenant_id nullable to support platform default event types.
```

## `notification_templates`

Purpose: Stores notification templates.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NULL | Nullable for platform default templates |
| `notification_event_type_id` | uuid | FK | NOT NULL |  |
| `template_code` | varchar(120) |  | NOT NULL |  |
| `template_name` | varchar(180) |  | NOT NULL |  |
| `template_scope` | varchar(40) |  | NOT NULL |  |
| `channel_type` | varchar(40) |  | NOT NULL |  |
| `locale` | varchar(20) |  | NULL |  |
| `description` | text |  | NULL |  |
| `status` | varchar(40) |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL |  |
| `created_by_tenant_user_id` | uuid | FK | NULL |  |
| `updated_at` | timestamptz |  | NULL |  |
| `updated_by_platform_user_id` | uuid | FK | NULL |  |
| `updated_by_tenant_user_id` | uuid | FK | NULL |  |
| `archived_at` | timestamptz |  | NULL |  |
| `archived_by_platform_user_id` | uuid | FK | NULL |  |
| `archived_by_tenant_user_id` | uuid | FK | NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(tenant_id, template_code)
tenant_id nullable for platform default templates.
```

## `notification_template_versions`

Purpose: Stores versioned notification template content.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NULL |  |
| `notification_template_id` | uuid | FK | NOT NULL |  |
| `version_number` | int |  | NOT NULL |  |
| `subject_template` | varchar(250) |  | NULL |  |
| `title_template` | varchar(250) |  | NULL |  |
| `body_text_template` | text |  | NULL |  |
| `body_html_template` | text |  | NULL |  |
| `action_label_template` | varchar(120) |  | NULL |  |
| `action_url_template` | varchar(700) |  | NULL |  |
| `variables_schema_json` | jsonb |  | NULL |  |
| `sample_payload_json` | jsonb |  | NULL |  |
| `is_active_version` | boolean |  | NOT NULL |  |
| `status` | varchar(40) |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL |  |
| `created_by_tenant_user_id` | uuid | FK | NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(notification_template_id, version_number)
One active version per template.
```

## `notification_preferences`

Purpose: Stores recipient notification preferences.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `recipient_type` | varchar(40) | FK | NOT NULL |  |
| `platform_user_id` | uuid | FK | NULL |  |
| `tenant_user_id` | uuid | FK | NULL |  |
| `customer_id` | uuid | FK | NULL |  |
| `notification_event_type_id` | uuid | FK | NOT NULL |  |
| `channel_type` | varchar(40) |  | NOT NULL |  |
| `is_enabled` | boolean |  | NOT NULL |  |
| `muted_until` | timestamptz |  | NULL |  |
| `status` | varchar(40) |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NULL |  |

Indexes / Constraints / Notes:

```text
Preferences for platform users, tenant users, or customers.
```

## `notification_events`

Purpose: Stores event records that generate notifications.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `notification_event_type_id` | uuid | FK | NOT NULL |  |
| `event_number` | varchar(80) |  | NOT NULL |  |
| `event_code` | varchar(120) |  | NOT NULL |  |
| `source_module` | varchar(120) |  | NULL |  |
| `source_reference_type` | varchar(120) |  | NULL |  |
| `source_reference_id` | uuid | FK | NULL |  |
| `event_payload_json` | jsonb |  | NULL |  |
| `priority` | varchar(40) |  | NOT NULL |  |
| `event_status` | varchar(40) |  | NOT NULL |  |
| `scheduled_at` | timestamptz |  | NULL |  |
| `processing_started_at` | timestamptz |  | NULL |  |
| `processed_at` | timestamptz |  | NULL |  |
| `failed_at` | timestamptz |  | NULL |  |
| `failure_reason` | text |  | NULL |  |
| `cancelled_at` | timestamptz |  | NULL |  |
| `cancellation_reason` | text |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `created_by_tenant_user_id` | uuid | FK | NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(tenant_id, event_number)
```

## `notification_messages`

Purpose: Stores notification messages generated from events/templates.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `notification_event_id` | uuid | FK | NOT NULL |  |
| `notification_template_version_id` | uuid | FK | NULL |  |
| `notification_channel_id` | uuid | FK | NOT NULL |  |
| `message_number` | varchar(80) |  | NOT NULL |  |
| `message_type` | varchar(40) |  | NOT NULL |  |
| `channel_type` | varchar(40) |  | NOT NULL |  |
| `recipient_type` | varchar(40) |  | NOT NULL |  |
| `platform_user_id` | uuid | FK | NULL |  |
| `tenant_user_id` | uuid | FK | NULL |  |
| `customer_id` | uuid | FK | NULL |  |
| `recipient_name_snapshot` | varchar(180) |  | NULL |  |
| `recipient_email` | varchar(254) |  | NULL |  |
| `recipient_phone` | varchar(30) |  | NULL |  |
| `recipient_device_token` | varchar(700) |  | NULL |  |
| `message_payload_json` | jsonb |  | NULL |  |
| `title_text` | varchar(250) |  | NULL |  |
| `body_text_mapped` | text |  | NULL |  |
| `body_html_mapped` | text |  | NULL |  |
| `action_url_mapped` | varchar(700) |  | NULL |  |
| `priority` | varchar(40) |  | NOT NULL |  |
| `message_status` | varchar(40) |  | NOT NULL |  |
| `scheduled_at` | timestamptz |  | NULL |  |
| `queued_at` | timestamptz |  | NULL |  |
| `sent_at` | timestamptz |  | NULL |  |
| `delivered_at` | timestamptz |  | NULL |  |
| `failed_at` | timestamptz |  | NULL |  |
| `failure_reason` | text |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(tenant_id, message_number)
CHECK(message_type IN ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP'))
CHECK(channel_type IN ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP'))
CHECK(recipient_type IN ('PLATFORM_USER', 'TENANT_USER', 'CUSTOMER'))
```

## `notification_delivery_attempts`

Purpose: Stores delivery attempt rows for notification messages.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `notification_message_id` | uuid | FK | NOT NULL |  |
| `attempt_number` | int |  | NOT NULL |  |
| `channel_type` | varchar(40) |  | NOT NULL |  |
| `provider_name` | varchar(120) |  | NULL |  |
| `provider_message_id` | varchar(160) |  | NULL |  |
| `provider_status` | varchar(40) |  | NULL |  |
| `request_payload_json` | jsonb |  | NULL |  |
| `response_payload_json` | jsonb |  | NULL |  |
| `error_code` | varchar(120) |  | NULL |  |
| `error_message` | text |  | NULL |  |
| `attempted_at` | timestamptz |  | NOT NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(notification_message_id, attempt_number)
```

## `notification_inbox_items`

Purpose: Stores in-app inbox items.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `notification_message_id` | uuid | FK | NOT NULL |  |
| `recipient_type` | varchar(40) | FK | NOT NULL |  |
| `platform_user_id` | uuid | FK | NULL |  |
| `tenant_user_id` | uuid | FK | NULL |  |
| `customer_id` | uuid | FK | NULL |  |
| `title_text` | varchar(250) |  | NULL |  |
| `body_text` | varchar(700) |  | NULL |  |
| `link_url` | varchar(700) |  | NULL |  |
| `inbox_status` | varchar(40) |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `delivered_at` | timestamptz |  | NULL |  |
| `archived_at` | timestamptz |  | NULL |  |
| `read_at` | timestamptz |  | NULL |  |
| `ip_address` | varchar(45) |  | NULL |  |
| `user_agent` | text |  | NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(notification_message_id)
```

## `notification_read_receipts`

Purpose: Stores read receipt records.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `notification_inbox_item_id` | uuid | FK | NOT NULL |  |
| `notification_message_id` | uuid | FK | NOT NULL |  |
| `recipient_type` | varchar(40) | FK | NOT NULL |  |
| `platform_user_id` | uuid | FK | NULL |  |
| `tenant_user_id` | uuid | FK | NULL |  |
| `customer_id` | uuid | FK | NULL |  |
| `read_at` | timestamptz |  | NOT NULL |  |
| `ip_address` | varchar(45) |  | NULL |  |
| `user_agent` | text |  | NULL |  |



## Status And Type Check Constraints

```text
CHECK(notification_channels.channel_type IN ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP'))
CHECK(notification_event_types.default_priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT'))
CHECK(notification_templates.channel_type IN ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP'))
CHECK(notification_preferences.recipient_type IN ('PLATFORM_USER', 'TENANT_USER', 'CUSTOMER'))
CHECK(notification_preferences.channel_type IN ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP'))
CHECK(notification_events.priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT'))
CHECK(notification_messages.channel_type IN ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP'))
CHECK(notification_messages.recipient_type IN ('PLATFORM_USER', 'TENANT_USER', 'CUSTOMER'))
CHECK(notification_delivery_attempts.channel_type IN ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP'))
CHECK(notification_inbox_items.recipient_type IN ('PLATFORM_USER', 'TENANT_USER', 'CUSTOMER'))
CHECK(notification_read_receipts.recipient_type IN ('PLATFORM_USER', 'TENANT_USER', 'CUSTOMER'))
```

## Module Notes

- Notification flow is split into Event -> Message -> Delivery Attempt -> Inbox -> Read Receipt.
- Template versioning is included.
- Preferences support platform user, tenant user, and customer recipients.
- Platform defaults and tenant custom templates are supported via nullable tenant_id in selected master/template tables.

## Related Files

- [[19_Customer_Basic_Authentication_And_Consent]]
- [[27_Platform_Level_Integration_Core]]