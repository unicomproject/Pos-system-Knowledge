# Tenant Admin Hardware Frontend Master — 2026-09-12

Status: SOFTWARE IMPLEMENTATION PARTIAL; real-device acceptance pending. This record supersedes earlier UI-only completion implications, not the historical physical evidence. No blanket production-ready claim.

## Scope and audit

Implemented against the existing Flutter application and backend contracts. Phase 0 was completed before source edits. Existing Riverpod, GoRouter, shared Dio, Tenant Admin theme, assignment dialog, compatibility endpoint and native receipt-printer bridge were reused. The full initial matrix is in [[Hardware_Frontend_Master_Phase_0_Audit_2026-09-12]]. Supplied seven images are visual references, never device/certification evidence.

## Seven screen matrix

| Screen | Status | Implemented | Remaining / reason |
|---|---|---|---|
| Hardware Overview | PARTIAL | Explicit authorized outlet filter, backend dashboard status/counts, debounced search, existing pagination/type/status/sort, refresh, permission-gated Add, Test on assigned POS guidance | Backend health and expandable troubleshooting panels implemented. Filters persist across navigation and reset on access-context refresh. Global audit-log browser remains deferred: no inspected hardware audit browse API. |
| Choose Device Type | PARTIAL | Current catalog types, backend-compatible connection profiles, unsupported choices blocked, outlet required, shared five-stage stepper | Till selection intentionally occurs at Assign rather than first stage. Product photography and additional future types deferred; no sample brand claims. |
| Discover & Connect | PARTIAL | Service-based Android USB printer enumeration/permission, already-paired Bluetooth printer listing, manual endpoint/HID setup, loading/error/retry and stale-result guard | No remote hardware dispatch, web USB enumeration, active Bluetooth pairing or LAN broadcast discovery. A detected or selected item is not claimed Connected/Ready. |
| Configure Device | PARTIAL | Conditional validated name/code, identity, network host/port, 58/80 mm receipt width, printer-attached drawer parent, backend create via existing repository | Print density, auto-cut, default-printer and drawer capability toggles deferred until capability/runtime persistence is consistently defined. Capability flags are not fabricated from screenshot models. |
| Assign Device | PARTIAL | Existing assignment dialog and backend mutation; explicit outlet/lifecycle/till-scope filtering, manage entitlement guard, refresh authoritative assignment | Current-user detail scope projection can be denied to hardware-only managers; fails closed. Backend per-user till authorization still needs independent enforcement audit. Primary/default printer toggle deferred. |
| Test Devices | PARTIAL | Assigned-device backend readiness query, error/loading/refresh, Test on POS instruction; Complete disabled without assigned + authoritative Ready | No secure remote test channel. Batch physical dispatch and detailed test-history table not implemented in this wizard; use actual host POS hardware testing. |
| Setup Complete | PARTIAL | Backend-confirmed individual device summary and guarded existing POS navigation, stale readiness removes success claim | Whole-outlet required-device policy/aggregate is absent. No all-devices/payment-ready claim. Receipt sample action requires physical host; not decorative. |

## Routes and state

Existing routes: /tenant-admin/hardware, /tenant-admin/hardware/add, /tenant-admin/hardware/:id, /tenant-admin/hardware/:id/edit. The add route hosts five setup stages plus completion. Existing detail/edit remains reusable. Go to POS uses /pos/home through existing access/router checks. No new cashier permission grants.

Riverpod HardwareSetupController holds outlet, type, connection, form values, discovered identity, saved device/version, stage, busy and generation state. Back preserves valid unsaved form state. Changing outlet/type/connection clears dependent values. Generation guards discard late discovery. Busy checks and saved-device lock prevent repeated create clicks; reload starts a valid first stage. This is not persistent draft/resume or a new cross-request idempotency protocol.

## Permission and scope mapping

| Action | Existing authority | Behavior |
|---|---|---|
| View | tenant.hardware.view with current route/access checks | No broad new grant |
| Create/edit/assign | tenant.hardware.manage plus hardware_device_management entitlement | Guard and mutation checks; backend remains authority |
| Outlet choice | TenantAdminContext.accessibleOutletIds intersect active outlet options | Empty projection grants none |
| Till choice | Current-user tillAccessScope and selected tills, allowed outlet, active lifecycle | ALL_ACCESSIBLE_TILLS or SELECTED_TILLS only; unknown scope returns no choices; missing projection fails |
| Physical test/open drawer | Existing authenticated POS runtime/device proof and action permissions | No Tenant Admin bypass or remote pulse |

The till projection uses GET /api/v1/tenant-admin/users/{currentUserId}; hardware-only managers may not possess user-detail permission. A dedicated self-scope contract is a backend follow-up. Frontend filtering cannot establish backend authorization correctness.

## API / model / service reuse

| Area | Reused boundary |
|---|---|
| Registry create/detail/edit | hardwareRepositoryProvider, existing hardware datasource and versioned device DTO/entity |
| Compatibility | hardwareCompatibilityProvider / backend create-options; SUPPORTED, UNVERIFIED and CERTIFIED vocabulary; no certification inferred locally |
| Dashboard/readiness | hardwareDashboardProvider with explicit outletId and exact saved device ID status |
| Assignment | Existing AssignHardwareDialog and repository assignment endpoints; conflict/retry feedback |
| Discovery | HardwareSetupDiscoveryService wraps existing AndroidReceiptPrinter platform bridge; screens contain no MethodChannel calls |
| POS runtime | Existing host-native config/test APIs; registry save does not enable scanner auto-add by itself |

No duplicate API client, theme system or responsive framework was introduced. Existing spacing/colors and page/card/column helpers are reused. Widgets include HardwareSetupStepper, HardwareConfigurationForm and HardwareSetupReview.

## Files introduced / changed in this master iteration

Paths below are relative to Tenantadmin/Nytroz-POS-App.

New: lib/features/tenant_admin/hardware/services/hardware_setup_discovery_service.dart; presentation/providers/hardware_setup_controller.dart and hardware_scope_provider.dart; presentation/widgets/hardware_configuration_form.dart and hardware_setup_review.dart (the presentation paths share lib/features/tenant_admin/hardware/).

Updated hardware files: presentation/screens/add_hardware_screen.dart and hardware_list_screen.dart; presentation/providers/hardware_dashboard_provider.dart; presentation/widgets/hardware_setup_widgets.dart and assign_hardware_dialog.dart; data/models/hardware_compatibility_profile.dart. Updated lib/features/tenant_admin/tenant_admin_router.dart guards.

Tests added: test/features/hardware/hardware_master_wizard_test.dart, hardware_setup_review_test.dart, hardware_scope_test.dart. Updated tenant_admin_hardware_setup_test.dart. Existing activation fake now supplies the activation fingerprint method, till UI fixtures include the required hardware entitlement, and test/widget_test.dart supplies drawer API responses for End Shift navigation. These correct stale fixtures rather than remove expectations. Pre-existing unrelated changes/deletions remain untouched.

## Verification

| Check | Result |
|---|---|
| flutter pub get | PASS; dependencies retained, incompatible upgrades not forced |
| Full flutter analyze --no-pub | PASS, no issues, 8.6 seconds |
| Full flutter test --no-pub | PASS: 1857 passed, 1 physical Local Print Agent test skipped, 0 failed |
| Additional final scope + review tests | PASS: 17; includes four new scope cases added after full run and 13 review cases rerun after POS route correction |
| Target layouts | Choose/discover/configure and assign/test/complete widget checks at 1024x768, 1280x800, 1366x768, 1440x900; no overflow in these fixtures |
| Android profile build | PASS; final artifact build confirmation appended below |
| Web production build | PASS, build/web, 62.2 seconds |
| Authenticated Tenant Admin UI/API acceptance | NOT_RUN for this master iteration; widget fixtures are not live API acceptance |
| Screenshot pixel matching / physical device output | NOT_RUN; responsive widget assertions are not screenshot or physical certification |

Local verification logs: .codex-tmp/hardware-master-full-tests-final.log, hardware-master-final-analysis.log, hardware-master-scope-review.log, hardware-master-web.log, hardware-master-apk-final.log in the workspace. Existing mobile_scanner KGP and Cupertino-font warnings remain nonfatal; web Wasm dry-run warnings do not imply Wasm support. APK/web compilation is not physical hardware verification.

## Real device matrix

| Device | Status | Evidence / pending |
|---|---|---|
| USB Scanner | SOFTWARE_VERIFIED; physical scan-to-cart NOT_RUN | Prior Windows HID enumeration/input only; emulator typed barcode lookup is not a USB passthrough scan. Configure runtime scanner on assigned POS, scan known product, confirm exactly one cart increment. |
| Bluetooth Scanner | NOT_RUN | No paired physical scanner acceptance evidence |
| Receipt Printer | SOFTWARE_VERIFIED; physical output NOT_RUN | Native bridge/regressions/builds only; connect real printer and observe receipt |
| Cash Drawer | SOFTWARE_VERIFIED; physical open NOT_RUN | Existing parent-printer pulse policy/confirmation; actual drawer open must be observed |
| Payment Terminal | BLOCKED | No certified provider adapter/credentials/certification flow; no generic successful payment test |

## Deferred visual/function inventory

Every omitted reference control is deferred, not a dead button: stock device photos/certified badges; Overview audit-log browser; active discovery Stop/Pair and discovery timestamps for unsupported transports; advanced printer density/cut/default settings; primary/default assignment; batch remote tests and detailed results/history; overall required-device completion counts; sample-receipt/Start Selling readiness of unrelated devices. Backend capabilities, scoped self-projection, remote host execution and required-device policy must be defined before those functional claims. Further visual refinements can follow independently; overview filter persistence and troubleshooting panels are now implemented.

Next acceptance work: signed-in authorized Tenant Admin create/assign against live API; host POS configuration/test with native proof; real scanner single-add, printer receipt, drawer observed pulse, disconnect/reconnect and permission revocation; backend explicit till-scope enforcement review. Do not mark master/Phase 16 fully finished until the remaining matrix is resolved.

Related: [[Hardware_Phase_16_Progress_2026-09-10]], [[../../../../12_INTEGRATIONS/POS_Hardware_Integration]], [[../../../Full_Feature_Status_Index]].

Final Android rebuild: PASS, 65.4 seconds, app-profile.apk 186.4 MB. Includes final /pos/home navigation correction; not installed or physically accepted in this iteration.


## Live flow / provider / UI continuation - 2026-09-12

Implemented backend-fed Hardware Health and expandable USB, Bluetooth/LAN, scanner and drawer troubleshooting. No invented operational badge: missing status counts read Not reported. Existing compatibility catalog action is reused. Overview query persists across navigation within the Riverpod session and resets when TenantAdminContext refreshes. Search text follows that reset. Missing outlet asks the user to select one; filtered zero matches no longer imply the store has no registered hardware.

New files: hardware_overview_query_provider.dart and hardware_overview_help.dart under existing hardware presentation providers/widgets; hardware_overview_help_test.dart. Updated hardware_list_screen.dart. No payment backend/runtime mutation was made.

Checks: full Flutter tests 1866 passed, 1 physical skip, zero failures. Five new tests cover scope reset/persistence plus interactive health/help at all four requested sizes. After final search-field reset: 11 focused tests passed, full analysis clean (6.9 seconds). Final artifact results are recorded below.

Live verification: development API started and /api/v1/health returned HTTP 200; Flutter web server at http://127.0.0.1:5322 returned HTTP 200. Interactive Chrome reached the actual login screen. Authenticated create/assign/test acceptance remains WAITING FOR USER LOGIN and a chosen outlet/till. No credentials collected, no test device assigned to a production till, no payment submitted. Browser screenshot of login proves entry rendering only.

Payment provider: source inspection confirms UnavailableCardPaymentGateway is the current fail-closed implementation. Existing ICardPaymentGateway already defines capture/status/cancel/reversal and terminal-status contracts. User was asked for bank/provider, terminal model, and sandbox/API/SDK documentation (no secrets). Provider-specific implementation remains WAITING FOR PROVIDER DETAILS; no fabricated adapter or success result has been added.

Remaining UI/backend dependencies: audit browsing, active pairing/remote discovery, advanced printer capability/default policy, detailed batch remote tests and whole-outlet required-device completion. Health/help panels and filter persistence are no longer deferred. This continuation does not claim all seven screens or live hardware acceptance complete.

Final continuation artifacts: Web PASS (57.1s, build/web); Android profile APK PASS (76.6s, 186.4 MB). No physical installation/output test claimed.

## Authenticated live access check - 2026-09-12

User selected Development Main Store / Front Till 01 (FRONT-01). The interactive browser is authenticated as Tenant Admin. Navigating to /tenant-admin/hardware returned to /tenant-admin/dashboard; the sidebar did not expose Hardware. Observed GET /api/v1/tenant-admin/context returned HTTP 200 with zero hardware permission entries and zero hardware feature-entitlement entries (accessible outlet count 12). Only this filtered access evidence was emitted; no tokens/passwords were collected or printed.

The earlier WAITING FOR USER LOGIN condition is superseded: login is present, but hardware authorization/entitlement is missing. Live create/assign remains blocked until the appropriate administrator enables hardware_device_management and grants the actual tenant.hardware.view / tenant.hardware.manage permissions, or an already-authorized account is used. No permissions were automatically elevated, no assignments changed, and no physical/payment tests performed. The user's chosen outlet/till has not yet been independently matched through the gated hardware assignment flow.


## Hardware outlet/till restriction implementation - 2026-09-12

Added HardwareScopeFilter to TenantAdminHardwareDevicesController and the separate till hardware-readiness action. Server-owned HardwareAccess:Restrictions entries identify TenantId, UserId, OutletId, TillId; restrictions never grant an entitlement or permission. No entry has been activated and no access grant applied to the development account.

For a configured account the filter validates the active till belongs to the selected outlet, rejects malformed/duplicate rules, verifies device ownership/active assignment, rejects other-till parent printers, and gates create, detail, update, assign-to-till, release and readiness before the action/mutation runner. Unknown actions, bulk list/dashboard and POS-target assignment are deliberately denied until scoped query and trusted target projections are implemented. Existing unrelated account access is unchanged. This is an API boundary restriction; no claim of new service-layer authorization or full usable wizard acceptance.

Tests: 15 new scope action-filter cases passed; repository-linked existing hardware/device-proof/entitlement suites plus new cases: 90 passed, 0 failed. API compiled as a dependency. Full E_POS.ApiTests project is blocked at compilation by pre-existing CatalogMediaBrandLogoControllerTests fake missing five ICatalogMediaService members. No hardware tests were skipped in the isolated run. Evidence: workspace .codex-tmp/hardware-scope-isolated-tests.log and hardware-scope-backend-tests.log.

Files: src/E_POS.Api/Common/HardwareScopeFilter.cs; scope attributes in TenantAdminHardwareDevicesController.cs and TenantAdminTillsController.cs; tests/E_POS.ApiTests/HardwareCash/HardwareScopeFilterTests.cs.

Remaining BEFORE grant: implement scope-filtered list/dashboard queries and frontend scope projection, define deployment-owned restriction persistence and revocation, test real HTTP and concurrent assignment changes, then apply the account grant together with its restriction. Tenant-wide entitlement grant previously rejected by automatic approval review was NOT retried. The earlier hardware access preparation script must not be run to grant access without the complete effective restriction. No live permission or database change was performed in this iteration.


## Scoped list/dashboard filtering - 2026-09-12

Implemented HardwareQueryScope (Application contract) as a request-scoped DI object. HardwareScopeFilter sets it from validated server configuration, never from client till/user IDs. List and Dashboard now allow a restricted account only when no outlet override is supplied or the requested outlet matches its restriction. A different outlet returns 403 before query execution. POS-target assignment remains denied for restricted accounts until a trusted till/POS projection exists.

TenantAdminHardwareRepository filters before Count/OrderBy/Skip/Take. HardwareDashboardQuery applies the identical scope predicate in its base CTE before readiness, filtering, totals, summary and pagination. Allowed rows: same tenant/outlet, actively assigned directly to the permitted till; or unassigned devices created by the restricted account. Devices assigned to other tills/POS targets and other users' unassigned devices are excluded. Drawer-parent readiness is evaluated only within the scoped base. Existing permissions/entitlement checks remain mandatory; query scoping never grants access.

Verification: API and dependencies compiled; 92 repository-linked hardware/filter tests passed (0 failed/skipped), including rejecting conflicting outlet query parameters and verifying exact server scope propagation. Real local PostgreSQL transaction created selected-till, other-till, owned-unassigned and unowned-unassigned fixtures. Scoped list/dashboard totals were 2, summary sum 2, three one-row pages returned only authorized IDs; foreign tenant/outlet queries returned 0. All fixtures rolled back. No grants/entitlements or persistent fixture data changed.

Evidence: .codex-tmp/hardware-filter-final-tests.log; PostgreSQL reproducible harness .codex-tmp/hardware-scope-query/Program.cs. Full API test project remains subject to the previously recorded unrelated CatalogMedia test-fake compilation errors; this is not a full API-suite pass.

This supersedes the previous statement that restricted List/Dashboard always return 403. Remaining before live scoped account grant: deployment/persistence of the exact restriction, frontend projection of permitted outlet/till choices, live HTTP acceptance and concurrent assignment/revocation coverage. The running API was not restarted/deployed in this iteration; no account access was granted.


## Deployment continuation - 2026-09-13

Saved exact Development restriction: tenant 55555555-0000-4000-8000-000000000001, user 99999999-0001-4000-8000-000000000001, outlet bbbbbbbb-0001-4000-8000-000000000001, till bbbbbbbb-0002-4000-8000-000000000001. Added the restriction filter to POS hardware and legacy telemetry controllers too; restricted-account operations lacking a safe target projection remain denied. Workspace API build passed and 92 hardware regressions passed.

Deployment is NOT complete. Directory.Build.props redirects dotnet run through scripts/run-api.ps1 to the trusted source/nytroz-pos-api-run directory. The old API listener was stopped as part of the authorized restart. Full Infrastructure compilation in that directory repeatedly stalled with no compiler diagnostic. Serial compilation, disabled build servers, shared compilation, and optional-analyzer-disabled retries were attempted. Last compiler exceeded 10 GB working memory and was stopped to avoid continued memory pressure. Port 5150 health check did not succeed. The workspace restriction config is prepared; running API enforcement is NOT verified.

No feature entitlement or account permission grant was executed. The previously rejected tenant-wide grant was not retried. Live HTTP acceptance and scoped grant must wait for deployment/build recovery. Relevant logs: .codex-tmp/hardware-deploy-build.log, hardware-deploy-regression.log, hardware-trusted-build*.log. Do not report access enabled or API running from this continuation.


## Live deployment and scoped grant VERIFIED - 2026-09-13

Correction to the previous deployment note: the final trusted-directory build log eventually recorded Build succeeded, 0 warnings, 0 errors (1m44s). Source hashes for restriction/filtering/configuration matched the workspace. Started the built API DLL directly from the existing trusted run directory, avoiding the clean-rebuild launcher. Health HTTP 200 verified.

Applied the user-authorized local grant after deployment: created the missing canonical hardware_device_management catalog entry under the existing hardware module, enabled the tenant entitlement, and granted tenant.hardware.view / tenant.hardware.manage directly to the identified Tenant Admin account. Existing role and non-hardware outlet/till scopes preserved. Automatic approval review approved this scoped/deployed grant attempt; the earlier unscoped rejection was not bypassed. Restriction is in Development configuration for the exact tenant/user/outlet/till documented above. POS hardware and legacy telemetry controllers also carry HardwareScopeFilter; operations without an allowed scope projection fail closed for this restricted account.

User logged in privately. Context API showed hardware_device_management enabled; actual Hardware menu and Overview rendered. Authenticated live HTTP checks: selected-outlet dashboard 200 (0 devices), scoped list 200 (0 devices), another outlet dashboard 403 hardware.scope_denied, another till assignment 403 hardware.scope_denied. The rejected assignment used nonexistent fixture IDs and produced no assignment. Session authorization was used only in memory for the user's own local API requests; no password/token written to output/files.

Physical device enumeration found only Standard PS/2 Keyboard, OneNote and Microsoft Print to PDF queues. No physical scanner/receipt printer was detected at that check. User has been asked to connect a scanner/printer and identify the model/host. No device registration, physical output, cash drawer pulse or payment operation has been fabricated. Payment provider/model/SDK details remain outstanding.

Current state supersedes 'API down/access not granted': API RUNNING, scoped Tenant Admin grant APPLIED, live scope denial VERIFIED. Next: connect real device, configure and assign to Front Till 01, then test through a permitted host flow. Restricted POS testing still requires implementation of the trusted till/POS projection; do not claim all physical flows available. Frontend selectors may still expose broader general outlet choices; server denies disallowed hardware requests.


## 2026-09-13 — Hardware scope projection and trusted POS runtime continuation

This update supersedes earlier notes that hardware scope projection and native runtime routing were entirely absent. It does not declare full hardware acceptance.

- Create-options now projects the server-owned hardware restriction as `hardwareScope` (restricted flag, outlet IDs, till IDs). Flutter intersects this with existing authorized outlet/till/lifecycle data. Missing or malformed scope fails closed; unrestricted metadata does not override normal user access.
- Native configuration, test creation/completion and history require registered native device proof before the restricted account's exact active POS-to-till mapping is checked. Trusted/active POS, matching tenant/outlet/till, active till, unreleased assignment and absence of conflicting active assignments are required.
- Registry heartbeat/test reporting additionally checks each hardware device belongs to the permitted scope. Existing permission/entitlement checks remain. Direct POS registry assignment remains denied for restricted accounts.
- Backend hardware verification harness: 102 passed, zero failures. Full API test project has previously reported unrelated catalog-media fake-interface compile errors; the harness is not a full API-suite claim.
- Flutter analysis: no issues. Hardware suite: 120 passed, one physical test skipped. Web release build succeeded (existing WASM/font warnings). Trusted local API build: zero warnings/errors; restarted at port 5150 with this change.
- PostgreSQL rollback-only checks passed: scoped list/dashboard rows/counts/pagination/tenant isolation plus valid native mapping, other-till/tenant denial and released-assignment denial. Temporary assignment fixtures supplied local audit timestamps; production assignments were not changed. Front Till 01 already has an active POS assignment.
- Current live browser probe requires login again. Updated browser dropdowns and authenticated HTTP checks are NOT yet accepted for this continuation.
- Current Windows device enumeration found Standard PS/2 Keyboard, no detected scanner/printer/serial peripheral. Real scanner-to-cart, receipt and drawer observations remain pending.
- Payment provider/model/SDK and customer display/scale model/protocol details have been requested. Provider-specific integration, full display/scale support and real-device acceptance remain incomplete. Additional UI dependencies listed in the earlier matrix remain open (capability settings/default policy, audit browsing, pairing and full remote/batch tests).
- Concurrency/revocation acceptance and production policy persistence remain separate acceptance work; request-time checks are not a claim of completed concurrent revocation testing.



### Same-day live verification correction
The first release web build omitted API_BASE_URL and showed a blank page. Rebuilt successfully with --dart-define=API_BASE_URL=http://localhost:5150. The existing login remained valid; no new login was required. Live create-options returned only Development Main Store / FRONT-01 IDs. Live dashboard/list returned 200; foreign outlet and foreign till assignment returned 403 hardware.scope_denied. Visually opened the Hardware Overview outlet dropdown: Development Main Store was its only option. General application header outlet remains separate from the hardware-only scope. Additional empty/foreign outlet selector tests passed (9 scope tests total). Native physical test acceptance and other UI/provider/hardware gaps remain pending as listed above.

## Hardware test history continuation
Implemented View Test Logs in Hardware Overview (device chooser for the current page) and device detail. Added GET hardware-devices/{id}/test-history using existing device permission checks and hardware scope enforcement. Returns latest 50 structured records (type/status/version/timestamps/physical confirmation); raw payloads and result messages are not exposed. Restricted history excludes other-till and null-till records even if the device was subsequently reassigned. This is device test history, not a complete global audit browser.
Validation: backend hardware harness 103 passed; two new Flutter history widget tests passed; Flutter analysis no issues. PostgreSQL transactional history isolation checks passed and all fixtures rolled back. Web release with explicit local API URL built successfully. Trusted local API build succeeded with zero warnings/errors; API health 200. Browser CDP unavailable at final check, so new screen live visual acceptance remains pending.
Still incomplete: full reference-screen parity, advanced printer/default policy, remote/batch tests, physical scanner-cart/receipt/drawer acceptance, named payment provider integration, full customer-display/scale adapters. Requested actual device models/connections/provider SDK details remain unanswered. No physical success or payment-provider completion claimed.

## Guided POS Test All and printer/drawer configuration
Added a guided Test All session to POS Hardware Testing. It snapshots enabled backend configurations and existing history IDs; opens each printer/scanner/drawer test card; refreshes backend results. Prior tests, different configuration versions, agent health-only tests and missing physical confirmation cannot count as passed. Changing configurations invalidates the session; unsupported device types remain unsupported. This reuses native-proof-protected configuration/test/history endpoints. It is not a remote command queue or a persisted server-side batch, and does not execute physical tests automatically.
Added USB/Bluetooth POS printer paper-width (58/80), auto-cut and feed-line controls persisted via existing authoritative configuration save API. Pending physical tests block these setting changes. Direct test receipt uses the selected feed-line value. Tenant Admin printer registration now exposes declared compatible cash-drawer-port support, enabling the existing parent-printer validation workflow. Registry metadata does not itself turn on runtime auto-open. Backend validates boolean capability flags and 58/80 numeric paper width.
Validation: hardware Flutter suite 128 passed, one physical test skipped; changed hardware analysis clean; web release build succeeded with explicit localhost API. Backend hardware regression harness 107 passed. Latest backend validation source built/tested but has not been deployed to the separately running trusted API in this continuation. No hardware was connected or physically tested, per user instruction. Remaining: remote command execution/batch persistence, complete screenshot parity/default-printer/density policy and native live acceptance.

## Local validation deployment and responsive UI update
Deployed TenantAdminHardwareService printer capability/paper-width validation to the trusted local API. Source SHA256 matches workspace. Trusted API build: zero warnings/errors; health endpoint 200. This is localhost deployment, not a production deployment.
UI updates: shared outlined form fields, completed/current wizard-step styling, distinct display/scale icons, semantic colored status badges, and responsive Overview table with adjacent Health/Tips panel at desktop widths (stacked on smaller widths).
Validation: hardware Flutter suite 128 passed / one physical skip; changed hardware analysis clean; web release build passed. Existing font/WASM warnings remain. CDP browser unavailable, so current live visual comparison is not complete. Full screenshot parity remains incomplete (device imagery, some detailed screen layouts, default/density policy); do not interpret this update as full UI acceptance. No physical commands executed.

## Scoped device activity timeline
Added GET hardware-devices/{id}/activity and Device activity navigation from the test-log dialog. Returns latest 50 available database creation, assignment, release and configuration-audit records; excludes free-text reasons/payloads. Restricted accounts only see their permitted till assignment/change history; creation requires the scoped actor ownership. Device access is checked through the existing service and hardware scope filter. This is a timeline of available persisted records, not a claim that all historic server-log-only actions can be recovered.
Verification: hardware backend harness 108 passed; activity/history UI tests 3 passed; changed-widget analysis clean. PostgreSQL rollback fixtures confirmed foreign till activity and tenant history are excluded. Web build succeeded. Trusted local API deployment succeeded with 0 errors/warnings, health 200.
Remaining work from user request still includes remote job dispatch/execution, full live-device health coverage, complete reference visual parity and final signed-in visual acceptance. No physical tests run.

### 2026-09-13 — Dashboard observation refresh verification
- Dashboard response now includes server checkedAt and freshnessSeconds (90). The active Flutter dashboard refreshes every 30 seconds and displays the server check time. This refresh reads stored observations; it does not probe or operate hardware.
- Verified automatic data refresh and timer disposal in a regression test. Hardware overview tests: 6 passed. Targeted Flutter analysis: no issues. Release web build succeeded; existing CupertinoIcons font warning remains.
- Backend build succeeded with 0 warnings/errors. Copied HardwareDashboardQuery.cs to the existing local API runtime and rebuilt/restarted it. The protected dashboard endpoint returns 401 without authentication, as expected.
- Browser reopened at http://127.0.0.1:5322. Screenshot currently shows the login page; authenticated visual validation remains pending.
- Remote Test All is NOT implemented by the existing POS CreateTest API. Durable remote request ownership/dispatch and POS consumption still need implementation. Guided local test sessions must not be represented as remote execution.
- Full screenshot parity and full passive hardware telemetry remain incomplete. No physical printer, scanner, or drawer tests were run.

## 2026-09-18 — Till realtime diagnostic development slice

The new Scan Till flow is distinct from operator-assisted Test All. It authenticates the bound native POS, routes a scan to one current connection, persists diagnostic snapshots in existing hardware_test_logs and pushes authorized Admin updates. Detection, driver-reported health and physical operation remain separate. It does not imply payment, drawer, scanner-to-cart or receipt acceptance.

Implementation, API/event contracts, current test evidence, single-process deployment limitation and remaining acceptance work: [Till realtime diagnostics](Till_Realtime_Diagnostics_2026-09-18.md).

This is feature-branch work, not a live deployment. Windows native compilation requires the missing Visual Studio C++ toolchain; physical and full persisted five-client acceptance remain unverified.
