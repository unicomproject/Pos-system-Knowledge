<!-- title: Offline Operation & Sync -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 28. Offline Operation & Sync

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `offline_clients` | Stores trusted offline-capable clients/devices. |
| `device_sync_states` | Stores device sync states records for this module. |
| `offline_number_blocks` | Stores offline number blocks records for this module. |
| `sync_batches` | Stores offline sync upload/download batch headers. |
| `sync_items` | Stores individual operations inside a sync batch. |
| `offline_id_mappings` | Stores offline id mappings records for this module. |
| `sync_conflicts` | Stores offline sync conflict records. |

## offline_clients

Module: Offline Operation & Sync

Purpose: Stores trusted offline-capable clients/devices.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| outlet_id | uuid | FK NULL | References `outlets(id)`. |
| pos_device_id | uuid | FK NULL UNIQUE | References `pos_devices(id)`. Unique business key. |
| name | varchar(200) | NOT | Display name. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| client_code | varchar(80) | UNIQUE | Unique business key. |
| max_offline_duration_minutes | integer | CHECK | CHECK(max_offline_duration_minutes IS NULL OR max_offline_duration_minutes > 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(outlet_id) REFERENCES outlets(id)
FK(pos_device_id) REFERENCES pos_devices(id)
UNIQUE(tenant_id, client_code)
UNIQUE(tenant_id, pos_device_id)
CHECK(max_offline_duration_minutes IS NULL OR max_offline_duration_minutes > 0)
```

## device_sync_states

Module: Offline Operation & Sync

Purpose: Stores device sync states records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| offline_client_id | uuid | FK NOT UNIQUE | References `offline_clients(id)`. Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| dataset_name | varchar(40) | UNIQUE | Unique business key. |
| last_client_version | integer | CHECK | CHECK(last_client_version IS NULL OR last_client_version >= 0) |
| last_server_version | integer | CHECK | CHECK(last_server_version IS NULL OR last_server_version >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(offline_client_id) REFERENCES offline_clients(id)
UNIQUE(tenant_id, offline_client_id, dataset_name)
CHECK(last_server_version IS NULL OR last_server_version >= 0)
CHECK(last_client_version IS NULL OR last_client_version >= 0)
```

## offline_number_blocks

Module: Offline Operation & Sync

Purpose: Stores offline number blocks records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| offline_client_id | uuid | FK NOT | References `offline_clients(id)`. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| document_number_sequence_id | uuid | FK NOT | References `document_number_sequences(id)`. |
| next_value | integer | CHECK | CHECK(next_value >= range_start) CHECK(next_value <= range_end + 1) |
| padding_length_snapshot | integer | CHECK | CHECK(padding_length_snapshot > 0) |
| range_end | integer | CHECK | CHECK(range_end >= range_start) |
| range_start | integer | CHECK | CHECK(range_start > 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(offline_client_id) REFERENCES offline_clients(id)
FK(document_number_sequence_id) REFERENCES document_number_sequences(id)
CHECK(range_start > 0)
CHECK(range_end >= range_start)
CHECK(next_value >= range_start)
CHECK(next_value <= range_end + 1)
CHECK(padding_length_snapshot > 0)
```

## sync_batches

Module: Offline Operation & Sync

Purpose: Stores offline sync upload/download batch headers.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. Partial unique where idempotency_key IS NOT NULL. |
| offline_client_id | uuid | FK NOT UNIQUE | References `offline_clients(id)`. Unique business key. Partial unique where idempotency_key IS NOT NULL. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| conflict_count | integer | CHECK | CHECK(conflict_count >= 0) |
| downloaded_item_count | integer | CHECK | CHECK(downloaded_item_count >= 0) |
| idempotency_key | varchar(120) | UNIQUE | Unique business key. Partial unique where idempotency_key IS NOT NULL. |
| uploaded_item_count | integer | CHECK | CHECK(uploaded_item_count >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(offline_client_id) REFERENCES offline_clients(id)
UNIQUE(tenant_id, offline_client_id, idempotency_key) WHERE idempotency_key IS NOT NULL
CHECK(uploaded_item_count >= 0)
CHECK(downloaded_item_count >= 0)
CHECK(conflict_count >= 0)
```

## sync_items

Module: Offline Operation & Sync

Purpose: Stores individual operations inside a sync batch.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. Partial unique where payload_hash IS NOT NULL. |
| offline_client_id | uuid | FK NOT UNIQUE | References `offline_clients(id)`. Unique business key. Partial unique where payload_hash IS NOT NULL. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| operation_type | varchar(40) | UNIQUE | Unique business key. Partial unique where payload_hash IS NOT NULL. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| client_record_id | uuid | UNIQUE | Unique business key. Partial unique where payload_hash IS NOT NULL. |
| entity_name | varchar(40) | UNIQUE | Unique business key. Partial unique where payload_hash IS NOT NULL. |
| payload_hash | char(64) | UNIQUE | Unique business key. Partial unique where payload_hash IS NOT NULL. |
| sync_batch_id | uuid | FK NOT | References `sync_batches(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(sync_batch_id) REFERENCES sync_batches(id)
FK(offline_client_id) REFERENCES offline_clients(id)
UNIQUE(tenant_id, offline_client_id, entity_name, client_record_id, operation_type, payload_hash) WHERE payload_hash IS NOT NULL
```

## offline_id_mappings

Module: Offline Operation & Sync

Purpose: Stores offline id mappings records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| offline_client_id | uuid | FK NOT UNIQUE | References `offline_clients(id)`. Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| client_record_id | uuid | UNIQUE | Unique business key. |
| created_from_sync_item_id | uuid | FK NOT | References `sync_items(id)`. |
| entity_name | varchar(40) | UNIQUE | Unique business key. |
| server_record_id | uuid | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(offline_client_id) REFERENCES offline_clients(id)
FK(created_from_sync_item_id) REFERENCES sync_items(id)
UNIQUE(tenant_id, offline_client_id, entity_name, client_record_id)
UNIQUE(tenant_id, entity_name, server_record_id)
```

## sync_conflicts

Module: Offline Operation & Sync

Purpose: Stores offline sync conflict records.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| offline_client_id | uuid | FK NOT | References `offline_clients(id)`. |
| resolution_status | varchar(30) | CHECK | CHECK(resolution_status IN ('OPEN', 'RESOLVED', 'IGNORED', 'FAILED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| sync_batch_id | uuid | FK NOT | References `sync_batches(id)`. |
| sync_item_id | uuid | FK NOT | References `sync_items(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(offline_client_id) REFERENCES offline_clients(id)
FK(sync_batch_id) REFERENCES sync_batches(id)
FK(sync_item_id) REFERENCES sync_items(id)
CHECK(resolution_status IN ('OPEN', 'RESOLVED', 'IGNORED', 'FAILED'))
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
