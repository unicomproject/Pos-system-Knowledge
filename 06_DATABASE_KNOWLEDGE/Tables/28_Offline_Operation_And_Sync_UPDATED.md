<!-- title: Offline Operation & Sync -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-04 -->
<!-- source: Updated from uploaded ERD image: 28_Offline Operation & Sync(1).png -->

# 28. Offline Operation & Sync

## Purpose

This file documents the database tables, attributes, keys, nullability, indexes, constraints, and external reference entities for this module.

## ERD Update Rule

This markdown version follows the uploaded ERD image as the source of truth. Table names, column names, data types, PK/FK markers, NULL/NOT NULL rules, and notes were updated to match the ERD.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `offline_clients` | Stores trusted offline-capable clients/devices. |
| `device_sync_states` | Stores per-client dataset sync state. |
| `offline_number_blocks` | Stores allocated document number ranges for offline usage. |
| `sync_batches` | Stores offline sync upload/download batch headers. |
| `sync_items` | Stores individual operations inside a sync batch. |
| `offline_id_mappings` | Maps client-created IDs to server IDs. |
| `sync_conflicts` | Stores offline sync conflict records. |

## `offline_clients`

Purpose: Stores trusted offline-capable clients/devices.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `outlet_id` | uuid | FK | NOT NULL |  |
| `pos_device_id` | uuid | FK | NOT NULL |  |
| `client_code` | varchar(80) |  | NOT NULL |  |
| `client_name` | varchar(150) |  | NOT NULL |  |
| `offline_type` | varchar(40) |  | NOT NULL |  |
| `offline_enabled` | boolean |  | NOT NULL DEFAULT true |  |
| `max_offline_duration_minutes` | int |  | NULL |  |
| `client_key_hash` | varchar(255) |  | NULL |  |
| `last_seen_at` | timestamptz |  | NULL |  |
| `last_sync_at` | timestamptz |  | NULL |  |
| `status` | varchar(40) |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `created_by_tenant_user_id` | uuid | FK | NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |
| `updated_by_tenant_user_id` | uuid | FK | NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(tenant_id, client_code)
UNIQUE(tenant_id, pos_device_id)
CHECK(max_offline_duration_minutes IS NULL OR max_offline_duration_minutes > 0)
```

## `device_sync_states`

Purpose: Stores per-client dataset sync state.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `offline_client_id` | uuid | FK | NOT NULL |  |
| `dataset_name` | varchar(40) |  | NOT NULL |  |
| `sync_direction` | varchar(40) |  | NOT NULL |  |
| `sync_filter_json` | jsonb |  | NULL |  |
| `last_full_sync_at` | timestamptz |  | NULL |  |
| `last_incremental_sync_at` | timestamptz |  | NULL |  |
| `last_server_version` | bigint |  | NULL |  |
| `last_client_version` | bigint |  | NULL |  |
| `status` | varchar(40) |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(tenant_id, offline_client_id, dataset_name)
CHECK(last_server_version IS NULL OR last_server_version >= 0)
CHECK(last_client_version IS NULL OR last_client_version >= 0)
```

## `offline_number_blocks`

Purpose: Stores allocated document number ranges for offline usage.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `offline_client_id` | uuid | FK | NOT NULL |  |
| `document_number_sequence_id` | uuid | FK | NULL |  |
| `document_type` | varchar(40) |  | NOT NULL |  |
| `prefix_snapshot` | varchar(30) |  | NULL |  |
| `suffix_snapshot` | varchar(30) |  | NULL |  |
| `padding_length_snapshot` | int |  | NOT NULL DEFAULT 6 |  |
| `range_start` | bigint |  | NOT NULL |  |
| `range_end` | bigint |  | NOT NULL |  |
| `next_value` | bigint |  | NOT NULL |  |
| `block_status` | varchar(40) |  | NOT NULL |  |
| `allocated_at` | timestamptz |  | NOT NULL |  |
| `expires_at` | timestamptz |  | NULL |  |
| `exhausted_at` | timestamptz |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

Indexes / Constraints / Notes:

```text
CHECK(range_start > 0)
CHECK(range_end >= range_start)
CHECK(next_value >= range_start)
CHECK(next_value <= range_end + 1)
CHECK(padding_length_snapshot > 0)
```

## `sync_batches`

Purpose: Stores offline sync upload/download batch headers.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `offline_client_id` | uuid | FK | NOT NULL |  |
| `sync_type` | varchar(40) |  | NOT NULL |  |
| `sync_status` | varchar(40) |  | NOT NULL |  |
| `client_started_at` | timestamptz |  | NULL |  |
| `server_started_at` | timestamptz |  | NOT NULL |  |
| `completed_at` | timestamptz |  | NULL |  |
| `failed_at` | timestamptz |  | NULL |  |
| `failure_reason` | text |  | NULL |  |
| `uploaded_item_count` | int |  | NOT NULL DEFAULT 0 |  |
| `downloaded_item_count` | int |  | NOT NULL DEFAULT 0 |  |
| `conflict_count` | int |  | NOT NULL DEFAULT 0 |  |
| `client_app_version` | varchar(80) |  | NULL |  |
| `client_local_time` | timestamptz |  | NULL |  |
| `idempotency_key` | varchar(150) |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(tenant_id, offline_client_id, idempotency_key) WHERE idempotency_key IS NOT NULL
CHECK(uploaded_item_count >= 0)
CHECK(downloaded_item_count >= 0)
CHECK(conflict_count >= 0)
```

## `sync_items`

Purpose: Stores individual operations inside a sync batch.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `sync_batch_id` | uuid | FK | NULL |  |
| `offline_client_id` | uuid | FK | NOT NULL |  |
| `direction` | varchar(40) |  | NOT NULL |  |
| `entity_name` | varchar(120) |  | NOT NULL |  |
| `client_record_id` | varchar(120) |  | NULL |  |
| `server_record_id` | uuid |  | NULL |  |
| `operation_type` | varchar(40) |  | NOT NULL |  |
| `payload_json` | jsonb |  | NOT NULL |  |
| `payload_hash` | varchar(255) |  | NULL |  |
| `item_status` | varchar(40) |  | NOT NULL |  |
| `error_code` | varchar(120) |  | NULL |  |
| `error_message` | text |  | NULL |  |
| `received_at` | timestamptz |  | NULL |  |
| `processed_at` | timestamptz |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(tenant_id, offline_client_id, entity_name, client_record_id, operation_type, payload_hash) WHERE payload_hash IS NOT NULL
```

## `offline_id_mappings`

Purpose: Maps client-created IDs to server IDs.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `offline_client_id` | uuid | FK | NOT NULL |  |
| `entity_name` | varchar(120) |  | NOT NULL |  |
| `client_record_id` | varchar(120) |  | NOT NULL |  |
| `server_record_id` | uuid |  | NOT NULL |  |
| `created_from_sync_item_id` | uuid | FK | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(tenant_id, offline_client_id, entity_name, client_record_id)
UNIQUE(tenant_id, entity_name, server_record_id)
```

## `sync_conflicts`

Purpose: Stores offline sync conflict records.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `offline_client_id` | uuid | FK | NOT NULL |  |
| `sync_batch_id` | uuid | FK | NULL |  |
| `sync_item_id` | uuid | FK | NULL |  |
| `entity_name` | varchar(120) |  | NOT NULL |  |
| `client_record_id` | varchar(120) |  | NULL |  |
| `server_record_id` | uuid |  | NULL |  |
| `conflict_type` | varchar(40) |  | NOT NULL |  |
| `client_payload_json` | jsonb |  | NULL |  |
| `server_payload_json` | jsonb |  | NULL |  |
| `resolution_status` | varchar(40) |  | NOT NULL |  |
| `resolution_strategy` | varchar(40) |  | NULL |  |
| `resolution_note` | text |  | NULL |  |
| `resolved_by_tenant_user_id` | uuid | FK | NULL |  |
| `resolved_at` | timestamptz |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

## Reference Entities (External)

| Table | Key Fields | Note |
| --- | --- | --- |
| `tenants` | id uuid PK | Tenant reference |
| `tenant_users` | id uuid PK | Tenant user/audit reference |
| `outlets` | id uuid PK | Outlet reference |
| `pos_devices` | id uuid PK | POS device reference |
| `document_number_sequences` | id uuid PK | Document sequence reference |



## Status And Type Check Constraints

```text
CHECK(offline_clients.max_offline_duration_minutes IS NULL OR offline_clients.max_offline_duration_minutes > 0)
CHECK(device_sync_states.last_server_version IS NULL OR device_sync_states.last_server_version >= 0)
CHECK(device_sync_states.last_client_version IS NULL OR device_sync_states.last_client_version >= 0)
CHECK(offline_number_blocks.range_start > 0)
CHECK(offline_number_blocks.range_end >= offline_number_blocks.range_start)
CHECK(offline_number_blocks.next_value >= offline_number_blocks.range_start)
CHECK(offline_number_blocks.next_value <= offline_number_blocks.range_end + 1)
CHECK(offline_number_blocks.padding_length_snapshot > 0)
CHECK(sync_batches.uploaded_item_count >= 0)
CHECK(sync_batches.downloaded_item_count >= 0)
CHECK(sync_batches.conflict_count >= 0)
CHECK(sync_items.direction IN ('UPLOAD', 'DOWNLOAD'))
```

## Module Notes

- Offline feature is optional and rows are created only for offline-enabled POS devices.
- No separate offline business tables such as offline_sales_orders or offline_sales_payments.
- Offline traceability is handled through sync_items and offline_id_mappings.

## Related Files

- [[20_Unified_Order_And_Sales]]
- [[21_POS_Operations]]
- [[24_Payment_And_Refund]]