<!-- title: ST-UX-001 Selected Tenant Context Requirement -->
<!-- status: Canonical / Locked -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->

# ST-UX-001 — Mandatory Selected-Tenant Context Indicator

## Classification

| Attribute | Value |
|---|---|
| Type | **Cross-cutting UX / security requirement** |
| Atomic journey? | **NO** — rejected as SA-ST-UJ-004 |
| Applies to | Every Selected-Tenant Mode screen and shell variant |

## Requirements

| # | Requirement | Verification |
|---|---|---|
| 1 | Tenant **name** always visible | ST-UX visual inspection |
| 2 | Tenant **code** visible where layout allows | Chip or meta line |
| 3 | Tenant **lifecycle status** visible | Status chip |
| 4 | **Plan** or subscription summary when available | Secondary chip/text |
| 5 | **Exit Tenant Context** action always reachable | Button/link; keyboard accessible |
| 6 | **Switch Tenant** available where product allows | Hub + context band |
| 7 | No stale tenant data after switch | QA ST-QA-004 |
| 8 | No cross-tenant cache leakage | QA ST-SEC-002 |
| 9 | Browser refresh rehydrates from route `tenantId` | QA ST-QA-010 |
| 10 | Deep-link to `/configure/*` validates auth + tenant access | QA ST-SEC-002 |
| 11 | Permission-aware — hide actions caller cannot perform | Permission matrix |
| 12 | **Suspended** tenant shows warning treatment; mutations blocked | ST-SHELL-04 |
| 13 | Audit attribution unaffected — banner is display only | No audit on render |

## Component contract

Implementation reference: `SelectedTenantContextHeader` in [[../../07_UI_UX_KNOWLEDGE/Platform_Admin/Selected_Tenant_Component_Inventory]].

## Screens that MUST include ST-UX-001

| Screen ID |
|---|
| ST-01 Setup Hub |
| ST-02 Create Outlet |
| ST-03 Create Till |
| ST-04 Create Role |
| ST-05 Add User |
| ST-06A Manual Product |
| ST-06B CSV Import |
| ST-SHELL-01 through ST-SHELL-04 (context band or equivalent) |

ST-SHELL-05/06 may replace band with full-page state but must still show tenant identifier in error copy where applicable.

## Prototype reference

All files under `prototypes/selected-tenant/` except pure error pages include `.tenant-context` band.
