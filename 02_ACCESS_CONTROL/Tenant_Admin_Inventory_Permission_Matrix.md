<!-- title: Tenant Admin Inventory Permission Matrix -->
<!-- status: Canonical -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Tenant Admin Inventory Permission Matrix

**PERMISSIONS: LOCKED.** Frontend hiding is UX only. Backend authorization is authoritative.

## Contract lock

```text
Inventory Contract Version: v1.0
Status: LOCKED
Prototype: APPROVED
Implementation Audit: PASS
UI/UX Contract: LOCKED
Implementation Contract: LOCKED
Frontend Implementation: NOT STARTED
Backend Implementation: NOT STARTED
QA Execution: NOT STARTED
```

Canonical lock: [[../07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Lock_Manifest]]

Feature key: `inventory_tracking`  
Namespace: existing `inventory.*` (do not use `inventory.adjust` as a new seed; it remains alias of `inventory.stock.adjust`).

## Codes

| Code | Meaning | Existing? | Bootstrap eligible |
|---|---|---|---|
| `inventory.stock.view` | View dashboard, current stock, product stock detail | Yes | Yes |
| `inventory.stock.adjust` | Draft/post stock adjustments | Yes | No |
| `inventory.movements.view` | View movement panel / future history | Yes | No |
| `inventory.alerts.view` | Dashboard priority alerts widget | Yes | No |
| `inventory.opening_stock.manage` | Opening stock wizard + post | **NEW** | No |
| `inventory.receiving.manage` | Receiving wizard + confirm | **NEW** | No |
| `inventory.serials.view` | Serial registry view + gap-fill register | **NEW** | No |
| `inventory.channel_allocation.view` | Allocation dashboard + detail | **NEW** | No |
| `inventory.channel_allocation.manage` | Allocation wizard + confirm | **NEW** | No |

## Journey mapping

| Journey | View nav/page | Mutating actions |
|---|---|---|
| TA-UJ-045 Overview / Current Stock | `inventory.stock.view` | — |
| TA-UJ-063 Opening Stock | `inventory.opening_stock.manage` | same |
| TA-UJ-046 Stock Receiving | `inventory.receiving.manage` | confirm |
| Serial registry | `inventory.serials.view` | gap-fill POST |
| TA-UJ-047 Adjustment | `inventory.stock.view` to list; `inventory.stock.adjust` to create/post | post |
| TA-UJ-064 Channel allocation | `inventory.channel_allocation.view` | `inventory.channel_allocation.manage` |

Dashboard Priority Alerts widget: `inventory.alerts.view`. If missing, hide widget; rest of dashboard still loads with `inventory.stock.view`.

Stock Count tile: visible with `inventory.stock.view`; action deferred (`STOCKTAKE_DEFERRED`).

## Frontend authorization

| Layer | Rule |
|---|---|
| Navigation visibility | Hide Inventory module without `inventory.stock.view` (and entitlement) |
| Page accessibility | Route guard same as permission; 403 page if deep-linked |
| Button visibility | Hide Post/Confirm/New without manage/adjust permission |
| Backend | Always enforce. UI hide is not security |

## Deferred permissions (do not seed now)

- `inventory.stocktake.manage`
- `inventory.transfer.manage`
- `inventory.stock.out`
- `inventory.adjustment.approve`
