<!-- title: Till Monitoring UI Implementation Status -->
<!-- status: Partially Implemented -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-08-01 -->

# Till Monitoring UI Implementation Status

## Status: PARTIALLY COMPLETED

Evidence-based status for Tenant Admin Till Monitoring after desktop split-view work and Backend inspection (2026-08-01). Documentation-only audit — no code changed in this documentation task.

## COMPLETED

- Till list + pagination bound to `GET /api/v1/tenant-admin/tills`
- Summary cards bound to `GET /api/v1/tenant-admin/tills/summary` (real Backend counts; not reference-image samples)
- Tenant isolation + basic till permissions
- Desktop split-view shell inside shared Tenant Admin layout (header / white sidebar / footer unchanged)
- `selectedTillId` selection (stable ID, not list index); auto-select first till on desktop when list non-empty
- Mobile: full-width list → `/tenant-admin/tills/:id`
- Hardware readiness remote call: `GET .../tills/{id}/hardware-readiness`

Flutter files: `till_monitoring_workspace.dart`, `till_monitoring_side_panel.dart`, `till_monitoring_list.dart`, `till_monitoring_row.dart`, `till_monitoring_toolbar.dart`, `till_hardware_connection_tile.dart`, `till_monitoring_screen.dart`.

## PARTIALLY COMPLETED

- Right-side panel UI (Cashier, Last Activity, Hardware Connections, View Alerts)
- Cashier / last activity on panel: domain model supports them; readiness mapper does not populate from current readiness DTO (often null / Unassigned)
- List row can show `currentCashierName` / last activity from list DTO when Backend returns them
- Hardware card: renders Backend connections; commonly shows **"No hardware connections found."** when no active Till assignments exist
- Online/Offline/Needs Attention: Backend resolver + options timeout exist; Flutter must not hardcode Connected

## NOT IMPLEMENTED

- Assign Hardware flow UI wired to assignment APIs
- Derived alert count (mapper hardcodes `alertCount: 0`)
- Hardware permission-restricted panel state (`tenant.hardware.view`)
- Mock-free complete detail binding for all approved panel fields from a single SoT response

## PHYSICAL VERIFICATION PENDING

- Network printer / scanner / cash drawer / card reader end-to-end status on Tenant Admin card

## DEPRECATED (desktop)

- Full-width list-only as the final approved desktop design

## Backend Dependencies (remaining)

- Merge Model A + Model B hardware assignments in readiness
- Hardware inventory + assignment/release APIs
- Peripheral hardware heartbeat + test-result reporting
- Derived alerts on readiness/detail
- Optional: embed connections into `GET .../tills/{id}` without breaking readiness contract
- Confirm Offline summary semantics (repository maps Offline count to inactive — product risk)

## Flutter Changes Remaining

- Map cashier/activity/status from real detail or combined providers (list detail + readiness) without mocks
- Wire alertCount / warnings from Backend when available
- Permission-restricted hardware section
- Clear stale hardware when `selectedTillId` changes
- Expand widget tests for connection states and mobile/tablet layouts

## Related

- [[Tenant_Admin_Till_Monitoring_UI]]
- [[../../Backend/HardwareCash/Tenant_Admin_Hardware_Read_Assignment_Status_Implementation]]
- [[../../../12_INTEGRATIONS/POS_Hardware_Integration]]


## Status refinement (2026-08-01 code audit)

- Desktop split-view **UI shell**: **COMPLETED**
- Hardware readiness **binding**: remains **PARTIALLY COMPLETED** (DTO/mapper gaps; `alertCount` hardcoded 0)
- See [[Till_Hardware_Side_Panel_Implementation]] for the detailed Flutter evidence pass.
