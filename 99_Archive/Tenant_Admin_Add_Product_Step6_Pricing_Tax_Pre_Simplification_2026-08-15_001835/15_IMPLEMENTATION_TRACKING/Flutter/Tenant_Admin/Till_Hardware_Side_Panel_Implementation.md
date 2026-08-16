<!-- title: Till Hardware Side Panel Implementation -->
<!-- status: Implemented -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-08-03 -->

# Till Hardware Side Panel Implementation

## Status: COMPLETED (Frontend monitoring path)

Tracks Flutter right-side Till hardware monitoring card separately from general Till Monitoring status.

**Physical hardware remains PHYSICAL VERIFICATION PENDING.**

## Completed (2026-08-03)

- Root path: `/tenant-admin/tills`
- Desktop split view (~65/35) with `selectedTillId` (not list index)
- Real APIs:
  - `GET /api/v1/tenant-admin/tills`
  - `GET /api/v1/tenant-admin/tills/summary`
  - `GET /api/v1/tenant-admin/tills/{tillId}/hardware-readiness`
- Readiness DTO/mapper now parse cashier, lastActivityAt, posDevice, connections, attentionReasons, alertCount
- Connection status vocabulary: CONNECTED / DISCONNECTED / NEEDS_ATTENTION / MAINTENANCE / NOT_ASSIGNED / UNKNOWN
- Central hardware type + status UI mappers (`till_hardware_ui.dart`)
- Option A: only real Backend connections (no fake category cards)
- Permission:
  - Missing `tenant.hardware.view` → list/summary still load; hardware section shows permission state; readiness API not called
  - Add Till uses existing `canCreateTill()` + `/tenant-admin/tills/add`
- Empty/error states: unassigned cashier, no recent activity, no POS device, empty hardware, 403/404/timeout/network/invalid JSON
- Tests updated; `flutter analyze` clean for tills feature; till widget/DTO/visibility/CRUD tests passing
- Dev interceptor readiness mock stripped of reference-image hardware brands; empty contract-shaped payload

## Intentionally not done in this frontend task

| Item | Status |
|---|---|
| Assign Hardware CTA / assignment UI route | **NOT IMPLEMENTED** (no Flutter assign route yet) |
| Physical status verification | **PHYSICAL VERIFICATION PENDING** |
| Live Backend manual E2E on :5150 during this pass | Backend was not listening — API contract verified against Unified-Commerce DTOs + Flutter parsing tests |

## Architecture reminder

Panel is monitoring-only. No browser sockets to hardware.

## Flutter files changed (key)

- `tills/data/models/till_dto.dart`
- `tills/data/mappers/till_mapper.dart`
- `tills/domain/entities/till_hardware_readiness.dart`
- `tills/domain/entities/till_monitoring.dart`
- `tills/presentation/utils/till_hardware_ui.dart` (new)
- `tills/presentation/providers/till_providers.dart`
- `tills/presentation/widgets/till_monitoring_side_panel.dart`
- `tills/presentation/widgets/till_hardware_connection_tile.dart`
- `tills/presentation/widgets/till_monitoring_workspace.dart`
- `tills/presentation/widgets/till_monitoring_summary_cards.dart`
- `tills/presentation/widgets/till_monitoring_list.dart`
- `tills/presentation/screens/till_monitoring_screen.dart`
- `tills/presentation/screens/add_till_screen.dart`
- `domain/services/tenant_admin_access_checker.dart` (till_management permission fallback)
- Dev interceptor readiness mock
- Tests: `till_list_screen_test.dart`, `till_dto_test.dart`

## Related

- [[Till_Monitoring_UI_Implementation_Status]]
- [[../../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Till_Monitoring_UI]]
- [[../../Backend/HardwareCash/Tenant_Admin_Hardware_Read_Assignment_Status_Implementation]]
- [[../../99_AUDITS/2026-08-01_Tenant_Admin_Till_Hardware_Second_Brain_Audit]]
