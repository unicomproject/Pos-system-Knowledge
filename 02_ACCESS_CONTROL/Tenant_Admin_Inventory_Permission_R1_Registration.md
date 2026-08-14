<!-- title: Tenant Admin Inventory Permission R1 Registration -->
<!-- status: LOCKED -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Tenant Admin Inventory — R1 Permission Registration

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

Feature entitlement: `inventory_tracking`

The full Release-1 permission contract file `CANONICAL_PERMISSION_AND_FEATURE_ENTITLEMENT_CONTRACT_R1.md` is not present on the canonical `main` branch at lock time. This document is the **Inventory slice** that must be present in that contract when it is merged.

Do not invent additional Inventory permission codes without an Inventory change request.

## Locked permission codes (29-screen scope)

| Code | Meaning | Bootstrap eligible | Frontend | Backend |
|---|---|---|---|---|
| `inventory.stock.view` | View dashboard, current stock, product stock detail | Yes | Hide Inventory nav/pages without it | Authoritative |
| `inventory.stock.adjust` | Draft/post stock adjustments | No | Hide New/Post Adjustment | Authoritative |
| `inventory.movements.view` | View movement panel / future history | No | Hide movement panel | Authoritative |
| `inventory.alerts.view` | Dashboard Priority Alerts widget | No | Hide widget only | Authoritative |
| `inventory.opening_stock.manage` | Opening stock wizard + post | No | Hide Opening Stock actions | Authoritative |
| `inventory.receiving.manage` | Receiving wizard + confirm | No | Hide receiving actions | Authoritative |
| `inventory.serials.view` | Serial registry view + gap-fill register | No | Hide serial registry | Authoritative |
| `inventory.channel_allocation.view` | Allocation dashboard + detail | No | Hide allocation read screens | Authoritative |
| `inventory.channel_allocation.manage` | Allocation wizard + confirm | No | Hide New/Confirm Allocation | Authoritative |

```text
Frontend hiding alone is not authorization.
Backend API authorization is security.
```

Alias: `inventory.adjust` remains a legacy alias of `inventory.stock.adjust`. Do not seed a second meaning.

## Feature mapping

All codes above map to feature key `inventory_tracking`. Missing entitlement → `403 FEATURE_DISABLED`.

## Deferred (do not seed now)

- `inventory.stocktake.manage`
- `inventory.transfer.manage`
- `inventory.stock.out`
- `inventory.adjustment.approve`

## Related Files

- [[Permission_Code_List]]
- [[Tenant_Admin_Inventory_Permission_Matrix]]
- [[../07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Lock_Manifest]]
