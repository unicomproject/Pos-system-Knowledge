<!-- title: Offline Operation & Sync Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Offline Operation & Sync Module Overview

## Purpose

Support offline-capable EPOS operation using registered offline clients, device sync state, offline number blocks, sync batches/items, offline ID mapping, and conflict tracking.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Offline_Operation_Sync` |
| Module number | 28 |
| Primary users | Cashier, Store Manager, Backend sync worker |
| Frontend surfaces | Offline banner, Pending sync count, Sync status screen, Conflict review, Offline receipt support |
| API groups | `/api/v1/offline/clients`, `/api/v1/offline/number-blocks`, `/api/v1/sync/batches`, `/api/v1/sync/conflicts`, `/api/v1/sync/status` |

## Main Tables

| Table | Role |
|---|---|
| `offline_clients` | Used by this module |
| `device_sync_states` | Used by this module |
| `offline_number_blocks` | Used by this module |
| `sync_batches` | Used by this module |
| `sync_items` | Used by this module |
| `offline_id_mappings` | Used by this module |
| `sync_conflicts` | Used by this module |

## Core Business Rules

- Offline operation supports continuity, not independent business authority.
- Offline client must be registered to tenant/device context.
- Sync items require idempotency keys and local IDs.
- Backend resolves or rejects conflicts; device must not overwrite backend truth silently.
- Card/QR final payment, refund approval, final stock, and till final close require backend validation.

## Access Summary

| Control | Rule |
|---|---|
| Authentication | Required for protected staff/customer/admin actions |
| Tenant status | Tenant must be active or allowed for the requested operation |
| Feature entitlement | Required when this module is plan or add-on controlled |
| Permission | Required for staff/admin protected actions |
| Tenant isolation | Tenant-owned records must never leak across tenants |
| Audit/event history | Required for sensitive status, payment, inventory, auth, and access changes |

## Dependencies

- [[../21_POS_Operations/01_Module_Overview]]
- [[../16_Inventory_Foundation_Stock_Availability/01_Module_Overview]]
- [[../24_Payment_Refund/01_Module_Overview]]
- [[../20_Unified_Order_Sales/01_Module_Overview]]

## Out Of Scope

- Redis dependency
- Peer-to-peer sync between tills
- Offline customer web checkout
- Unvalidated offline card settlement

## Related Files

- [[04_MODULE_KNOWLEDGE/28_Offline_Operation_Sync/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/28_Offline_Operation_Sync/03_Technical_Contract]]
