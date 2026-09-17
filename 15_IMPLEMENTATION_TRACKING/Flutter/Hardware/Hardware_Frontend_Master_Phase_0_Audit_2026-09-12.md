# Hardware frontend master implementation — Phase 0 audit (2026-09-12)

Completed before implementation. Scope: current Flutter hardware and shared dependencies, current backend contracts and canonical Second Brain hardware records. This is a source audit, not certification of every application flow.

| Area | Existing | Partial | Missing | Reuse | Change needed |
|---|---|---|---|---|---|
| Routes | GoRouter / tenant_admin_router, /hardware, /add, /:id, /:id/edit | Add is 3 local steps | Assign/test/complete wizard stages | Existing guarded add route | Use one wizard; refresh starts valid first step |
| Sidebar | Hardware route/menu in Tenant Admin shell | — | — | Current shell | No cashier menu grant |
| Theme | TenantAdminColors/Spacing/Breakpoints/PageScaffold | Hardware creates separate ThemeData/raw colors | Shared hardware visual consistency | Existing tokens | Remove parallel theme values |
| Responsive framework | Page scaffold and column helper | Current fixed cards/step chips | Four target-size wizard tests | LayoutBuilder/breakpoints | Reflow stepper and actions |
| API client | main builds shared Dio; app supplies auth/device proof | Safe network errors; hardware generic errors | — | appDioProvider | No new client |
| Hardware DTOs/entities | Device/list/config version/assignment models | Compatibility profile lacks capability fields | Certified support mapping | Existing models | Preserve backend vocabulary |
| Repositories | Hardware repository/data source; idempotency keys | Dashboard directly uses shared Dio | Remote test dispatch/audit browse | Existing repositories | Never fabricate logs/tests |
| Riverpod providers | Detail/list/dashboard/compatibility | Wizard state lives in widget | Unified setup controller | Riverpod 2 conventions | Central deterministic step/reset/mutation state |
| Permissions | tenant.hardware.view/manage and entitlement checks | Widget mutations rely heavily on route guard | Distinct create/edit/assign permission codes (not in current contract) | Actual manage permission | Hide/recheck mutations, no invented codes |
| Route guard | Tenant context/access checker | Edit/add guard uses raw permission | Entitlement consistency | canManageTillHardware | Use existing combined check |
| Outlet/Till/POS state | Tenant context accessibleOutletIds; till repository; native activation | Hardware selectors use broad till options | Explicit till IDs in TenantAdminContext | Projected outlet scope, backend till options | Scope audit must not claim unverified till filtering |
| Hardware services | Printer adapters, HID service, POS test controllers | Plugin calls inside AddHardwareScreen | Setup discovery abstraction | Native channel behind service | Move calls out of widget |
| USB discovery | Android USB printer enumeration/permission | Printer-only, local tablet only | Remote USB/scanner discovery | Existing bridge | Explicit manual HID path |
| Bluetooth discovery | Already-paired Classic printers | No active scan/pair UI | Cross-platform discovery | Existing bridge | Honest paired/manual states |
| LAN discovery | Manual host/port and native TCP adapter | No automatic LAN enumeration | Discovery broadcast | Manual endpoint | Explicit manual setup |
| Scanner service | HID/camera; backend config and exact barcode lookup | Tenant registry requires POS runtime configuration | User current POS scanner config | Existing POS testing screen | Guide real POS test; never claim auto-add enabled by registry alone |
| Printer service | Android USB/BT, network, Local Print Agent | Physical matrix incomplete | Certified models evidence | Existing adapters | No sample brands as truth |
| Drawer service | Printer-attached pulse + explicit confirmation | Parent linkage | Direct USB drawer support | Parent printer policy | Do not label as generic direct USB |
| Payment terminal | Catalog says unsupported/provider absent | — | Certified provider adapter | Disabled capability profile | Explicit BLOCKED |
| Components | SetupPage/Card/Columns, assignment/edit dialogs | Repeated forms/status | Five-stage stepper/readiness completion | Current widgets/tokens | Add reusable stage/review widgets |
| Tests | Hardware suite, scanner/controller tests, 18 catalog tests | Prior 141 hardware/customers/scanner pass | New flow/provider/responsive coverage | Existing fixture styles | Run pub get/analyze/full tests and builds |
| Offline | POS config stores separate from cloud management | Cloud errors distinct in some screens | Offline registry mutation queue | Existing runtime stores | No fake disconnected status |
| Readiness | Dashboard projects authoritative Ready/version/physical evidence | Legacy till helper less strict | Whole-setup required-policy aggregate | Dashboard detail lookup | Complete only selected authoritative Ready; do not claim all store devices ready |

## Backend boundaries
Tenant APIs: list/detail/create/update, compatibility create-options, till/POS assignments, release, dashboard, till readiness. Runtime APIs require POS context/device proof for configurations/test start/result/history. No secure remote physical command dispatch; Tenant Admin shows TEST_ON_POS_REQUIRED. No full audit-log browse route in inspected hardware controller. Default assignment isPrimary exists; UI must persist through assignment rather than local printer toggle. Payment providers list empty. Compatibility UNVERIFIED is not certification.

## Canonical records read
12_INTEGRATIONS/POS_Hardware_Integration.md; current Hardware_Phase_16_Progress_2026-09-10.md and prior runtime evidence. Seven supplied images are visual references only.

## Work order
Central state/discovery service and existing-theme reuse; extend guarded add flow through assignment/test/review; outlet selection/filtering; source-backed errors and blocked remote operations; regression/responsive checks; update Second Brain with actual results and remaining gaps.
