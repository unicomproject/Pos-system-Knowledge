<!-- title: Platform-Level Integration Core -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-04 -->
<!-- source: Updated from uploaded ERD image: 27_Platform-Level Integration(1).png -->

# 27. Platform-Level Integration Core

## Purpose

This file documents the database tables, attributes, keys, nullability, indexes, constraints, and external reference entities for this module.

## ERD Update Rule

This markdown version follows the uploaded ERD image as the source of truth. Table names, column names, data types, PK/FK markers, NULL/NOT NULL rules, and notes were updated to match the ERD.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `integration_providers` | Stores platform integration provider catalog. |
| `platform_integrations` | Stores platform-owned integration instances/configuration. |
| `platform_integration_credentials` | Stores encrypted credential values for platform integrations. |
| `platform_integration_webhook_events` | Stores inbound webhook events from integration providers. |
| `platform_integration_request_logs` | Stores platform outbound/inbound request logs for integrations. |

## `integration_providers`

Purpose: Stores platform integration provider catalog.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `provider_code` | varchar(80) |  | NOT NULL |  |
| `provider_name` | varchar(150) |  | NOT NULL |  |
| `provider_category` | varchar(40) |  | NOT NULL |  |
| `provider_type` | varchar(40) |  | NOT NULL |  |
| `auth_type` | varchar(40) |  | NOT NULL |  |
| `api_base_url` | varchar(500) |  | NULL |  |
| `documentation_url` | varchar(500) |  | NULL |  |
| `supports_webhook` | boolean |  | NOT NULL |  |
| `supports_test_mode` | boolean |  | NOT NULL |  |
| `status` | varchar(40) |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(provider_code)
```

## `platform_integrations`

Purpose: Stores platform-owned integration instances/configuration.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `integration_provider_id` | uuid | FK | NOT NULL |  |
| `integration_code` | varchar(80) |  | UNIQUE |  |
| `integration_name` | varchar(150) |  | NOT NULL |  |
| `integration_category` | varchar(40) |  | NOT NULL |  |
| `integration_status` | varchar(40) |  | NOT NULL |  |
| `environment` | varchar(40) |  | NOT NULL |  |
| `currency_code` | char(3) | FK | NULL |  |
| `is_enabled` | boolean |  | NOT NULL |  |
| `is_default` | boolean |  | NOT NULL |  |
| `base_url` | varchar(500) |  | NULL |  |
| `inbound_webhook_url` | varchar(500) |  | NULL |  |
| `connected_at` | timestamptz |  | NULL |  |
| `disconnected_at` | timestamptz |  | NULL |  |
| `last_successful_request_at` | timestamptz |  | NULL |  |
| `last_failed_request_at` | timestamptz |  | NULL |  |
| `last_failure_reason` | text |  | NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(integration_code)
Webhook secrets are stored in platform_integration_credentials.
```

## `platform_integration_credentials`

Purpose: Stores encrypted credential values for platform integrations.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `platform_integration_id` | uuid | FK | NOT NULL |  |
| `credential_name` | varchar(120) |  | NOT NULL |  |
| `credential_type` | varchar(40) |  | NOT NULL |  |
| `encrypted_value` | text |  | NOT NULL |  |
| `encryption_key_id` | varchar(120) |  | NOT NULL |  |
| `credential_key_version` | varchar(80) |  | NULL |  |
| `expires_at` | timestamptz |  | NULL |  |
| `last_rotated_at` | timestamptz |  | NULL |  |
| `revoked_at` | timestamptz |  | NULL |  |
| `status` | varchar(40) |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(platform_integration_id, credential_name)
Store encrypted values only.
```

## `platform_integration_webhook_events`

Purpose: Stores inbound webhook events from integration providers.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `integration_provider_id` | uuid | FK | NOT NULL |  |
| `platform_integration_id` | uuid | FK | NULL |  |
| `tenant_id` | uuid | FK | NULL |  |
| `external_event_id` | varchar(180) |  | NULL |  |
| `event_name` | varchar(150) |  | NOT NULL |  |
| `event_category` | varchar(120) |  | NULL |  |
| `signature_valid` | boolean |  | NULL |  |
| `event_status` | varchar(40) |  | NOT NULL |  |
| `event_payload_json` | jsonb |  | NULL |  |
| `headers_json` | jsonb |  | NULL |  |
| `source_ip` | inet |  | NULL |  |
| `received_signature_hash` | varchar(255) |  | NULL |  |
| `idempotency_key` | varchar(150) |  | NULL |  |
| `received_at` | timestamptz |  | NOT NULL |  |
| `processing_started_at` | timestamptz |  | NULL |  |
| `processed_at` | timestamptz |  | NULL |  |
| `processing_error` | text |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(integration_provider_id, external_event_id) WHERE external_event_id IS NOT NULL
UNIQUE(integration_provider_id, idempotency_key) WHERE idempotency_key IS NOT NULL
```

## `platform_integration_request_logs`

Purpose: Stores platform outbound/inbound request logs for integrations.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `integration_provider_id` | uuid | FK | NOT NULL |  |
| `platform_integration_id` | uuid | FK | NULL |  |
| `tenant_id` | uuid | FK | NULL |  |
| `request_direction` | varchar(40) |  | NOT NULL |  |
| `request_type` | varchar(120) |  | NOT NULL |  |
| `http_method` | varchar(20) |  | NOT NULL |  |
| `request_url` | text |  | NOT NULL |  |
| `request_headers_json` | jsonb |  | NULL |  |
| `request_body_hash` | varchar(255) |  | NULL |  |
| `response_status_code` | int |  | NULL |  |
| `response_headers_json` | jsonb |  | NULL |  |
| `response_body_hash` | varchar(255) |  | NULL |  |
| `request_status` | varchar(40) |  | NOT NULL |  |
| `error_code` | varchar(120) |  | NULL |  |
| `error_message` | text |  | NULL |  |
| `idempotency_key` | varchar(150) |  | NULL |  |
| `correlation_id` | varchar(150) |  | NULL |  |
| `requested_at` | timestamptz |  | NOT NULL |  |
| `completed_at` | timestamptz |  | NULL |  |
| `duration_ms` | int |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |

Indexes / Constraints / Notes:

```text
CHECK(duration_ms IS NULL OR duration_ms >= 0)
CHECK(response_status_code IS NULL OR response_status_code >= 100)
```

## Reference Entities (External)

| Table | Key Fields | Note |
| --- | --- | --- |
| `tenants` | id uuid PK | Used only for tenant-level event correlation and request tracing |
| `platform_users` | id uuid PK | Platform audit user reference |
| `currencies` | currency_code char(3) PK | Currency reference |



## Status And Type Check Constraints

```text
CHECK(integration_providers.provider_category IN ('PAYMENT', 'SMS', 'EMAIL', 'WHATSAPP', 'ACCOUNTING', 'DELIVERY', 'ANALYTICS', 'OTHER'))
CHECK(integration_providers.auth_type IN ('NONE', 'API_KEY', 'BASIC_AUTH', 'OAUTH2', 'HMAC', 'CUSTOM'))
CHECK(platform_integrations.environment IN ('TEST', 'SANDBOX', 'PRODUCTION'))
CHECK(platform_integration_request_logs.request_direction IN ('OUTBOUND_TO_PROVIDER', 'INBOUND_FROM_PROVIDER'))
CHECK(platform_integration_request_logs.duration_ms IS NULL OR platform_integration_request_logs.duration_ms >= 0)
CHECK(platform_integration_request_logs.response_status_code IS NULL OR platform_integration_request_logs.response_status_code >= 100)
```

## Module Notes

- Platform-owned integration configuration only. Public API, outbound webhooks, and subscription billing tables are intentionally excluded.
- All configuration tables are platform-owned.
- Credentials must be stored encrypted.

## Related Files

- [[26_Notification]]
- [[24_Payment_And_Refund]]