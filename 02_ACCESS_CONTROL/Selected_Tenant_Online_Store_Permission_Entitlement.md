<!-- title: Selected Tenant Online Store Permission Entitlement -->
<!-- status: LOCKED / APPROVED -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->

# Selected-Tenant Online Store — Permission & Entitlement

Canonical companion to [[Permission_Code_List]] and [[Selected_Tenant_Permission_Final_Matrix]].

## Prerequisites (insufficient alone)

| Permission | Role for OS |
|---|---|
| `platform.tenants.view` | Prerequisite |
| `platform.tenants.bootstrap.access` | Hub entry only — **not** sufficient for OS mutation |

## Permission (LOCKED)

| Permission | Description | Journey | Route | API | Entitlement | Audit |
|---|---|---|---|---|---|---|
| `platform.tenants.bootstrap.online_store.manage` | Configure initial Online Store bootstrap settings | SA-ST-UJ-011 / SA-UJ-057 | ST-07 | GET/PUT `.../bootstrap/online-store` | Effective `online_store` | `platform.tenant_bootstrap.online_store_configured` |

No create/view/edit/delete variants.

## Entitlement codes (existing — do not invent)

| Code | Gate |
|---|---|
| `online_store` | Hub configure + PUT |
| `click_collect` | Informational notice only; not required for OS bootstrap success |

## UI entitlement states

| State | Behavior |
|---|---|
| ENTITLED | Configure enabled |
| NOT_ENTITLED | Card / screen blocked |
| DEPENDENCY_BLOCKED | Not used for OS card (C&C is notice only) |
| CONFIGURED | `storeStatus` = `ACTIVE` |
| NOT_STARTED | `DRAFT` / defaults only |
