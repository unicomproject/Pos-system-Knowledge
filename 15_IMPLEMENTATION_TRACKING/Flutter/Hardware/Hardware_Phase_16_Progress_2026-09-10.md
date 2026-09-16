<!-- title: Hardware Phase 16 Implementation Progress -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-10 -->

# Hardware Phase 16 — implementation progress

## Acceptance boundary

Phase 16 remains PARTIAL. Verified backend improvements are recorded below; this is not full software or production closure.
Source: supplied Phase 16A–W request and seven design images in Hardware Integration R&D and Screens.zip.
Images are design references, not detected devices or model certification.
Full implementation documentation belongs in Second Brain, not application docs/implementation.

## Implemented backend changes

- Compatibility catalog exposes protocol, transport, adapter, DECLARED capability source and UNVERIFIED support; unsupported families cannot register or become Ready.
- Create options, strict configuration allowlist, same-outlet parent printer checks and active/trusted assignment validation remain in place.
- POS hardware routes require the tenant JWT plus a high-entropy native activation proof using the existing fingerprint hash mechanism.
- Browser/legacy fingerprints, missing proof and a different target device are rejected; secure storage supplies proof in a header, never a URL.
- Legacy native installations need reactivation. No credential, proof or connection-string value is recorded here.
- Canonical hardware_device_management entitlement is checked on registry and POS hardware endpoints; existing permissions are retained without automatic cashier grants.
- Dashboard uses one parameterized PostgreSQL query for tenant scope, pagination, filters, sorting and aggregate counts; Flutter consumes the bounded response.
- Ready requires current-version physical test evidence, current assignment/POS scope and a recent heartbeat; failed telemetry and unavailable parent printers suppress Ready.
- Registry PUT changes name/lifecycle with ExpectedVersion; active assignments prevent deactivation; physical identifiers are preserved.
- Registry create/update/assign/release reuse existing idempotency infrastructure, a tenant transaction lock and durable shared AuditLog records.
- Audit records contain actor/target/action/status/version metadata, without copying hardware settings or caller free text.
- POS configuration lookup includes till assignments and canonical/legacy device types, prevents duplicate creation and rejects ambiguous assignments.
- POS settings updates preserve registered adapter/capability/physical metadata and reject mismatched registered transport.
- Physical test completion rechecks version, assignment and a ten-minute completion window; final-result replay stays idempotent.
- Heartbeat requires the current configuration version, 1–64 distinct non-null items and an observation time within five minutes past/thirty seconds future.
- Equal/older observations are skipped; transition rows are added only for status, configuration-version or reporting-POS changes.
- Telemetry requests are atomic and share the tenant hardware lock with registry mutations.
- Diagnostic reports require RequestId, ConfigurationVersion, active trusted POS, assignment and bounded timestamps/codes.
- Identical diagnostic replay returns the original result; changed replay conflicts. Caller free-text messages are not persisted; diagnostic reports do not assert physical confirmation.
- Ninety-day telemetry retention preserves each device's newest observation, physical tests and audit history; pruning is capped at 10,000 transitions per daily batch.
- Native routes have 32 KiB body and hardware rate limits; OpenAPI describes proof/idempotency headers and failure responses.
- No schema, migration or permission seed was added for this slice.

## Native/UI work and integration gaps

- Flutter adds secure proof/header injection, server dashboard paging/filter/sort, versioned edit and refresh invalidation.
- Dashboard search remains mounted during reload; secure-storage failure terminates the request safely.
- Printer telemetry skips missing configuration IDs; USB observation enumerates permitted devices without opening them or prompting during checkout.
- Bluetooth background connect/disconnect is disabled: the Android plugin shares a socket, so a separate Dart adapter could interrupt receipt printing.
- Passive Bluetooth telemetry and genuine scanner/drawer runtime observations are not implemented yet.
- Direct Android USB/Bluetooth selection now saves to the backend before persisting the returned configuration ID/version locally.
- POS receipt-printer save now validates USB/Bluetooth/network identity alongside the existing Local Print Agent contract; native configurations include catalog metadata.
- Android direct test print creates a server test operation before writing; Yes/No paper confirmation submits the physical result without repeating the print.
- Pending confirmation blocks another test print; submission failure retains the same operation for retry.
- Existing registry physical identity cannot be silently replaced by selecting different USB/Bluetooth/network settings.
- Automated checks do not prove that the complete Android setup UI works with real equipment through the running API.
- Actual native reactivation, full authenticated Flutter/API flow and physical cash-sale acceptance remain pending.

## Phase status

| Phase | Status | Evidence / remainder |
|---|---|---|
| A Future families | PARTIAL | Safe extensible catalog; new adapters unsupported. |
| B Compatibility | IMPLEMENTED | Software registry/API/UI; physical model certification NOT_RUN. |
| C Setup options | IMPLEMENTED / NATIVE E2E PENDING | Catalog/scope APIs and native authoritative save connected. |
| D Dashboard | IMPLEMENTED | PostgreSQL bounded query and Flutter paging/search tests pass. |
| E Update/deactivate | IMPLEMENTED | Permission/version/assignment tests and scoped analysis pass; runtime acceptance pending. |
| F Test All | TEST_ON_POS_REQUIRED | No remote command channel; no fabricated PASS. |
| G POS authentication | IMPLEMENTED / NATIVE TEST PENDING | Proof filter tests pass; actual reactivation pending. |
| G Heartbeat trust | PARTIAL | Binding/bounds/order/atomicity implemented; native observations incomplete. |
| H Status history | IMPLEMENTED / PARTIAL | Transition dedupe/projection implemented; runtime coverage incomplete. |
| I Concurrency | PARTIAL | Version checks/shared hardware lock; parallel lifecycle/unpair stress pending. |
| J Idempotency | IMPLEMENTED | Registry replay/conflict/audit verified in PostgreSQL; diagnostic replay tests pass. |
| K Providers | BLOCKED | No installed certified provider. |
| L Secrets | PARTIAL | Secure proof/configuration and minimized logs; runtime log acceptance pending. |
| M Capability source | PARTIAL | DECLARED metadata preserved; no physical certification claim. |
| N Parent printer | IMPLEMENTED / PHYSICAL PENDING | Scope/config validation and dependency guard. |
| O Permissions | IMPLEMENTED for this slice | Existing names reused; no new seed/bootstrap or cashier grant. |
| P Entitlement | IMPLEMENTED | Canonical enabled/disabled tests pass; Flutter gate added. |
| Q Audit | IMPLEMENTED / BROWSE DEFERRED | Single durable mutation audit verified; browse screen deferred. |
| R Retention | IMPLEMENTED | PostgreSQL rollback test verifies pruning/evidence preservation. |
| S Observability | PARTIAL | Safe metadata; operational metrics/runtime log acceptance pending. |
| T Limits | PARTIAL | Body/batch/IP policy implemented; per-device rate partition pending. |
| U OpenAPI | PARTIAL | Header/error contracts added and compiled; generated-document test pending. |
| V Migrations | NOT_REQUIRED for this slice | Existing schema reused; PostgreSQL checks pass. |
| W Software E2E | PARTIAL | Backend and PostgreSQL repository flow pass; authenticated Android reached Open Till; full hardware E2E remains pending. |
| W Physical E2E | NOT_RUN | Equipment details requested; no physical-device acceptance evidence supplied. |

## Latest continuation — 2026-09-10

- Passive Bluetooth bridge now returns the timestamp of the last successful write to the matching address. Observation does not connect, disconnect, request permission or send bytes; it is historical write evidence, not proof of continuous connectivity. Kotlin bridge compiled in the installed profile APK.
- HID and camera scan completion publish payload-free observation events. Telemetry requires authenticated native POS context and exactly one matching enabled scanner configuration; ambiguous assignments are ignored. Original event time is retained and submissions are throttled.
- A successful explicit physical test confirmation records LastSeen for the current configuration/assignment. This covers drawer/scanner confirmations without background drawer pulses or invented sensor state. PostgreSQL rollback verification now asserts this update directly rather than manually setting LastSeen.
- Customers compilation errors fixed: EffectivePermissionSet type corrected, missing customer_table_header.dart restored, unused code removed.
- HID inter-character detection changed from wall-clock sampling to KeyEvent.timeStamp following a combined-suite timing failure. Verified by the latest combined 141-pass run.

## Verification — latest evidence

- Backend repository-linked harness: 75 passed after the physical-confirmation freshness change.
- PostgreSQL secure local connection, tenant isolation, dashboard pagination/summary/sorting, registry identity reuse, configuration conflict, test replay, confirmation freshness, readiness, mutation replay/conflict, single audit and retention checks PASS. Synthetic fixtures were rolled back. No physical acceptance is implied.
- Latest combined Flutter hardware/Customers/scanner run: 141 passed, 1 physical Local Print Agent test skipped, 0 failed. This rerun verifies the HID timestamp fix and supersedes the earlier 140-pass/1-failure result.
- Latest full Flutter analysis: No issues found (8.0 seconds). Execution was permitted this turn; the earlier automatic approval usage-limit block is resolved for these checks.
- Final profile APK built successfully (186.4 MB, 68 seconds), installed with adb install -r (Success) and launched on emulator-5554. This artifact includes the verified final style/timestamp edits. Existing mobile_scanner KGP and Cupertino font warnings did not fail the build.
- Latest backend is running locally; /api/v1/health returned HTTP 200.
- Existing authenticated Android session reached Choose Workspace, then POS Open Till for the development outlet/device. Starting cash entry and keypad were absent and Open Till disabled. Source gates these controls on fine-grained till-opening permissions. Effective permission/API payload was not extracted, so the missing-grant source is not yet confirmed; no permissions were bypassed or automatically granted.
- No cash shift was opened, no sale was made and no printer/scanner/drawer physical output was verified in this continuation.

## Remaining order

1. Full analysis and combined Flutter regression verification are complete; retain the physical-test skip until actual equipment is available.
2. Resolve the authenticated test user's till-opening permission configuration through the normal role flow, then complete hardware screen/API acceptance with native device proof.
3. Add native controller save/confirmation retry interaction coverage; exercise concurrency/revocation, generated OpenAPI and runtime log redaction. Audit browse and per-device rate partition remain deferred/partial.
4. Validate transport/type mapping for camera/scanner/drawer configurations and observation attribution across configuration changes.
5. Run physical print, scan, drawer, disconnect/reconnect and cash-sale acceptance on actual equipment. User replied that hardware is not currently connected and referred to USB hardware; specific models have not been supplied; emulator results cannot certify these. Windows printer enumeration found only OneNote and Microsoft Print to PDF; emulator USB enumeration showed root hubs only. This does not rule out unconfigured LAN/Bluetooth equipment.
## Related records

- [[Tenant_Admin_Hardware_Integration_2026-09-09]]
- [[../../../Full_Feature_Status_Index]]
- [[../../../../12_INTEGRATIONS/POS_Hardware_Integration]]
- [[../../../../10_TESTING_QA/POS_Hardware_Production_Acceptance_Matrix]]

## Barcode search correction — 2026-09-11

Local read-only repository verification found barcode 2000000000114 ACTIVE and sellable: exact lookup PASS, ordinary search 1 product, Popular-filtered search 0 for the checked trusted POS devices. Barcode 2000000001418 had no local barcode record. No product data was changed.

Flutter catalog requests now omit quick-product segment filters while search text is present. Clearing search restores the selected browsing segment. Device/category scope and authorization remain in effect. Regression coverage includes popular, frequently-sold and offers.

Verification: 18 catalog/segment tests passed; changed-file analysis found no issues; profile APK built (143.8 MB), installed successfully on emulator-5554 and launched. Physical scan-to-cart on this updated build is still pending; this correction addresses product search availability, not proof of automatic scanner cart insertion.

## Frontend master continuation - 2026-09-12

See [[Hardware_Frontend_Master_2026-09-12]] and [[Hardware_Frontend_Master_Phase_0_Audit_2026-09-12]]. Five-stage setup and individual-device review now reuse Riverpod/theme/backend contracts with explicit scope filtering and honest Test on POS boundaries. Full tests: 1857 passed / 1 physical skip / 0 failed; final scope/review: 17 passed; full analysis clean; Android profile and Web builds passed. Seven-screen coverage remains PARTIAL; authenticated live acceptance, physical equipment and deferred capability/provider/remote-test items are listed in the master matrix. This does not certify real hardware or full Phase 16 closure.

Continuation: backend health/help panels and session-persistent scoped overview filters implemented. Full tests 1866 PASS / 1 physical skip; final 11 scoped tests PASS; analysis clean; Web and Android builds PASS. Local API and web started, browser reached login. Authenticated flow awaits user login/outlet/till; payment adapter awaits provider/model/SDK details. See [[Hardware_Frontend_Master_2026-09-12]].
