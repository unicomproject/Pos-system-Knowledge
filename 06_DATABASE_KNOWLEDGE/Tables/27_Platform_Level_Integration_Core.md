<!-- title: Platform-Level Integration Core -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 27. Platform-Level Integration Core

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `integration_providers` | Stores integration providers records for this module. |
| `platform_integrations` | Stores platform integrations records for this module. |
| `platform_integration_credentials` | Stores platform integration credentials records for this module. |
| `platform_integration_webhook_events` | Stores platform integration webhook events records for this module. |
| `platform_integration_request_logs` | Stores platform integration request logs records for this module. |

## integration_providers

Module: Platform-Level Integration Core

Purpose: Stores integration providers records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| provider_code | varchar(80) | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| provider_category | varchar(40) | CHECK | CHECK(provider_category IN ('PAYMENT', 'SMS', 'EMAIL', 'WHATSAPP', 'ACCOUNTING', 'DELIVERY', 'ANALYTICS', 'OTHER')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |

Source constraints from uploaded design:

```text
PK(id)
UNIQUE(provider_code)
CHECK(provider_category IN ('PAYMENT', 'SMS', 'EMAIL', 'WHATSAPP', 'ACCOUNTING', 'DELIVERY', 'ANALYTICS', 'OTHER'))
```

## platform_integrations

Module: Platform-Level Integration Core

Purpose: Stores platform integrations records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| integration_code | varchar(80) | UNIQUE | Unique business key. |
| currency_code | char(3) | FK NOT | References `currencies(currency_code)`. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| integration_provider_id | uuid | FK NOT | References `integration_providers(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(integration_provider_id) REFERENCES integration_providers(id)
UNIQUE(integration_code)
FK(currency_code) REFERENCES currencies(currency_code)
```

## platform_integration_credentials

Module: Platform-Level Integration Core

Purpose: Stores platform integration credentials records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| credential_name | varchar(80) | UNIQUE | Unique business key. |
| platform_integration_id | uuid | FK NOT UNIQUE | References `platform_integrations(id)`. Unique business key. |
| revoked_at | timestamptz | CHECK | CHECK(revoked_at IS NULL OR revoked_at >= created_at) |

Source constraints from uploaded design:

```text
PK(id)
FK(platform_integration_id) REFERENCES platform_integrations(id)
UNIQUE(platform_integration_id, credential_name)
CHECK(revoked_at IS NULL OR revoked_at >= created_at)
```

## platform_integration_webhook_events

Module: Platform-Level Integration Core

Purpose: Stores platform integration webhook events records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| external_event_id | uuid | UNIQUE | Unique business key. Partial unique where external_event_id IS NOT NULL. |
| idempotency_key | varchar(120) | UNIQUE | Unique business key. Partial unique where idempotency_key IS NOT NULL. |
| integration_provider_id | uuid | FK NOT UNIQUE | References `integration_providers(id)`. Unique business key. Partial unique where external_event_id IS NOT NULL. Unique business key. Partial unique where idempotency_key IS NOT NULL. |
| platform_integration_id | uuid | FK NOT | References `platform_integrations(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(integration_provider_id) REFERENCES integration_providers(id)
FK(platform_integration_id) REFERENCES platform_integrations(id)
UNIQUE(integration_provider_id, external_event_id) WHERE external_event_id IS NOT NULL
UNIQUE(integration_provider_id, idempotency_key) WHERE idempotency_key IS NOT NULL
```

## platform_integration_request_logs

Module: Platform-Level Integration Core

Purpose: Stores platform integration request logs records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| duration_ms | integer | CHECK | CHECK(duration_ms IS NULL OR duration_ms >= 0) |
| integration_provider_id | uuid | FK NOT | References `integration_providers(id)`. |
| platform_integration_id | uuid | FK NOT | References `platform_integrations(id)`. |
| response_status_code | integer | CHECK | CHECK(response_status_code IS NULL OR response_status_code >= 100) |

Source constraints from uploaded design:

```text
PK(id)
FK(integration_provider_id) REFERENCES integration_providers(id)
FK(platform_integration_id) REFERENCES platform_integrations(id)
CHECK(duration_ms IS NULL OR duration_ms >= 0)
CHECK(response_status_code IS NULL OR response_status_code >= 100)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
