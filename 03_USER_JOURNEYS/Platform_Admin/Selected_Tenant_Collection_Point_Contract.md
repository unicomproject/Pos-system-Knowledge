<!-- title: Selected Tenant Collection Point Contract -->
<!-- status: Canonical / Locked -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->
<!-- lock_date: 2026-08-12 -->

# Selected Tenant Collection Point Contract

## Authority

Locks **GAP 1 — Collection point model** for Selected-Tenant bootstrap and cross-references Tenant Admin fulfilment configuration.

## Canonical answer

**An outlet is NOT inherently a collection point.**

Collection capability is represented by an **active relation** between:

1. A tenant `outlets` record
2. A tenant `fulfillment_methods` record where `method_type = 'PICKUP'`
3. A row in `fulfillment_method_outlets` linking the two

There is **no** `is_collection_point` (or equivalent) column on `outlets`.

## Entity model

| Entity | Table | Role |
|---|---|---|
| Outlet | `outlets` | Physical/logical store location |
| Pickup fulfilment method | `fulfillment_methods` | Tenant-scoped pickup method master (`method_type = 'PICKUP'`) |
| Outlet pickup enablement | `fulfillment_method_outlets` | Maps outlet to pickup method; carries lead/window/cutoff config |

### `fulfillment_method_outlets` (canonical attributes used)

| Attribute | Type | Required | Notes |
|---|---|---|---|
| `tenant_id` | uuid | Yes | Tenant isolation |
| `fulfillment_method_id` | uuid | Yes | FK → `fulfillment_methods` |
| `outlet_id` | uuid | Yes | FK → `outlets` |
| `status` | varchar(30) | Yes | `ACTIVE` / `INACTIVE` / `DELETED` |
| `preparation_lead_minutes` | int | No | Optional fulfilment config |
| `pickup_window_minutes` | int | No | Optional fulfilment config |
| `cutoff_time` | time | No | Optional fulfilment config |

**Unique constraint:** `(tenant_id, fulfillment_method_id, outlet_id)`

## UI / API virtual field

| UI Label | API field | Type | Persisted? |
|---|---|---|---|
| Enable Click & Collect pickup at this outlet | `enablePickupCollection` | boolean | **No** — projects to `fulfillment_method_outlets` upsert |

## Business rules

1. `click_collect` entitlement must be effective for tenant.
2. Outlet must belong to tenant and be `ACTIVE`.
3. Storefront collection options additionally require effective `online_store` at read time (storefront API rule) — configuring outlet pickup is still a fulfilment action.
4. Enabling collection requires **valid open business-hours configuration** for the outlet (per `API_Authorization_Rules`: "valid current open business-hours configuration").
5. Collection enablement is **append/update of relation**, not outlet type change.

## Selected-Tenant bootstrap decision (LOCKED)

**SA-ST-UJ-005 (Create Initial Outlet) does NOT enable collection points in Phase 1 bootstrap.**

| Reason | Detail |
|---|---|
| Hours dependency | Bootstrap outlet form does not include full business-hours contract |
| Ownership | Collection configuration is fulfilment configuration, not minimum outlet create |
| Existing backend | Outlet CRUD already maps collection via fulfilment tables on **Tenant Admin** path |

**Tenant Admin** owns enabling collection points after outlet and hours exist.

### ST-02 approved fields (collection excluded)

`outlet_name`, `outlet_type`, `timezone`, address block, optional phone/email — **no** `enablePickupCollection` on SA bootstrap create.

## Entitlement

| Capability | Feature key |
|---|---|
| Configure outlet pickup | `click_collect` |
| Storefront collection read | `online_store` + `click_collect` |

## Migration required?

**NO** for this contract. Uses existing `fulfillment_methods` and `fulfillment_method_outlets`.

## Future migration requirement

**NONE approved.** If product later requires denormalized `outlets.is_pickup_enabled`, that would be a **separate future ADR** — not part of Selected-Tenant Phase 1.

## Evidence

- `06_DATABASE_KNOWLEDGE/Tables/23_Fulfilment_And_Pickup_UPDATED.md` — `fulfillment_method_outlets`
- `15_IMPLEMENTATION_TRACKING/Backend/OutletTillDevice/Outlet_CRUD_Implementation_Status.md` — collection via fulfilment tables
- `02_ACCESS_CONTROL/API_Authorization_Rules.md` — collection enablement rules

## Related journeys

| Actor | Journey | Collection action |
|---|---|---|
| Super Admin bootstrap | SA-ST-UJ-005 | **Deferred** — create outlet only |
| Tenant Admin | Outlet create/edit + fulfilment | Enable pickup via `fulfillment_method_outlets` |
