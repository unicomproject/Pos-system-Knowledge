# Cashier Login to Receipt runtime audit — 2026-09-11

## Payment gate remediation and runtime follow-up (2026-09-12)

This section supplements, rather than erases, the historical failures below.
Scope: unknown cash recovery, completed-cart duplicate prevention and explicit
known-rejection retry only. No unrelated production refactoring or permission
changes; no commit/push. Existing unrelated worktree changes were preserved.

### Root causes and implemented behavior

- `PosCashPaymentScreen._confirmCashPayment` marked uncertain outcomes unknown
  without a status-recovery caller. The screen now exposes Check Payment Status.
- `CashPaymentIntentNotifier.open` could replace a succeeded intent; success was
  pushed over a still-payable cart. Completed sale ID now locks cart mutation and
  checkout serialization, succeeded intent cannot create a new key, shell routes
  guard checkout, success replaces navigation and PopScope blocks system back.
- Known rejection had no deliberate new attempt action. Start New Attempt now
  creates a new key only after resolved rejection; unknown remains non-payable.
- Runtime exposed a transient LayoutBuilder context passed across submission.
  When submitting UI replaced that subtree, its context was unmounted and success
  navigation was skipped. Submission now uses the screen State context and mounted
  check. A subsequent freshly built/installed APK navigated directly to receipt.

Existing checkout replay was insufficient to prove an absent payment could not
commit later. New POST payment-status reuses original tenant/key, existing service
permissions, sensitive-response filtering and stored payment/receipt. Cash submit
and reconciliation acquire the same tenant/key PostgreSQL session advisory lock
before transaction snapshots. Reconciliation commits a permanent closed-attempt
marker in existing idempotency_requests storage before returning not_completed;
late original requests reject. Successful recovery does not create another sale
or automatically repeat drawer/printing. No schema migration or hardcoded runtime
transaction is used. Non-cash flow is not redesigned.

### Automated evidence

Commands use installed Flutter 3.44.2 against current project source; Flutter SDK
cache required approved access. Backend tests rebuilt (no --no-build).

| Command | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| flutter test --no-pub test/features/sale/pos_cash_payment_intent_test.dart test/features/sale/pos_cash_payment_submission_test.dart test/features/sale/pos_cash_payment_recovery_test.dart | 26 | 0 | 0 |
| flutter test --no-pub test/features/auth test/features/till test/features/sale test/features/hardware test/features/cash_drawer test/features/cart | 510 | 0 | 1 |
| dotnet test tests/E_POS.UnitTests/E_POS.UnitTests.csproj --no-restore --filter "FullyQualifiedName~Cash\|FullyQualifiedName~Checkout\|FullyQualifiedName~Till\|FullyQualifiedName~Receipt\|FullyQualifiedName~TenantAuth\|FullyQualifiedName~PosPermissionSeed\|FullyQualifiedName~PosCartCalculation" --verbosity quiet | 412 | 0 | 0 |
| dotnet test tests/E_POS.IntegrationTests/E_POS.IntegrationTests.csproj --no-restore --filter "FullyQualifiedName~PosCheckoutRepositoryTests" --logger "console;verbosity=normal" | 23 | 0 | 0 |
| dotnet test tests/E_POS.ApiTests/E_POS.ApiTests.csproj --no-restore --filter "FullyQualifiedName~PosCheckout\|FullyQualifiedName~PosCart\|FullyQualifiedName~PosTills\|FullyQualifiedName~PosReceipts\|FullyQualifiedName~Cash" --verbosity quiet | 37 | 0 | 0 |
| dotnet test tests/E_POS.LocalPrintAgent.Tests/E_POS.LocalPrintAgent.Tests.csproj --no-restore --verbosity quiet | 50 | 0 | 0 |

The PostgreSQL race test used POS_CASH_TEST_CONNECTION from local configuration,
created an isolated generated test DB and removed only that DB. No development
sale records were deleted. Permission-catalog failure was a stale test fixture
missing WorkspacePermissionSeedData; production permission behavior was unchanged.
APK debug build/install passed. Analyze passed after fixing three mounted-context
infos; final post-format analyzer result is recorded separately below.

Intermediate test failures were resolved: outdated key/button expectations,
missing test completion permission/pricing fixture, incorrect test error-envelope
shape, and initial test DB connection setup. They are not current production
failures. The final broader suite includes actual Cash screen submit-to-transport
timeout and explicit backend rejection, in addition to three recovery outcomes.

### Updated emulator runtime evidence

Actual UI login as cashier001@gmail.com succeeded; open till restored; no workspace
selection was required. New Sale, real catalog item, guest skip, cash method and
cash tender worked. No tokens or passwords are recorded here.

- First independent sale: RCP-000186, sale df636830-9813-4299-9cac-f997285c2a18,
  Team Jersey Small x1, subtotal 4500, discount 1125, tax 0, total 3375 LKR,
  tender 4000, change 625. UI receipt matched stored receipt/payment values.
  DB sales count 252 -> 253. Initial automatic navigation issue described above
  required View Receipt; no second payment was sent.
- Android Back left receipt visible. Start New Sale reset to 0 items / LKR 0.
- After navigation fix and APK reinstall: new independent sale RCP-000187,
  sale 4da64d46-43c3-4082-8e4d-468d60629b1e, exact tender 3375, change 0,
  navigated directly to Payment Success/Receipt. Start New Sale was invoked again.
  DB sales count became 254 (two deliberately separate test sales, not replay).
- Real authenticated POST payment-status using RCP-000187's stored original key
  returned succeeded, the same sale/receipt, total/cash 3375 and change 0.
  Sales count remained 254. No second financial request was made for recovery.
- Cashier Kavin, Front Till 01, Development Main Store were shown on receipt.
  Receipt UI displays UTC 05:14/05:23 without timezone label while local host is
  +05:30; stored instants agree. Physical paper output was not observed.

Real device transport-fault/known-rejection injection was not performed: those
branches are covered by automated real-screen tests, not claimed as live injected
faults. Durable recovery across process/data loss is not added by this task.

### Corrected-time drawer recheck

Before first submission: host 2026-09-12T10:44:24.2514966+05:30;
DB 2026-09-12T10:44:24.242523+05:30 (Asia/Colombo);
emulator 2026-09-12T05:14:23Z. Approximately 1.3 seconds device drift, host/DB
under 0.01 seconds. The stale restored emulator clock was corrected by normal
reboot; no 120-second freshness rule was weakened.

RCP-000186 drawer initiated at 10:44:27.319167+05:30, status AGENT_ACCEPTED,
agent_accepted=true. RCP-000187 drawer initiated at 10:53:45.106302+05:30,
also AGENT_ACCEPTED. Existing agent /health/ready returned ready=true,
configuration/store/printer ready, version 1.1.0, API 1, receipt contract 3.
An attempted additional direct agent launch lacked a key, but that was not the
already-running configured agent; it is not an active drawer blocker.
Physical drawer confirmation: NOT AVAILABLE (DB physical_confirmation null).

### Acceptance limitations / observations

An expired-session startup logged AuthUnauthorizedInterceptor handler-already-called
before successful login; it did not block the verified journey and was not changed
in this payment-only task. Receipt local-time formatting remains an observation.
Neither is evidence of a duplicate payment in these tests. Physical hardware
acceptance and app-restart recovery must not be inferred from session-level tests.

### Final verification and scoped gate decision

Final `flutter analyze --no-pub`: PASS, no issues (21.4 seconds).
Final broader Flutter suite: 510 passed, 0 failed, 1 skipped. Production frontend
and backend `git diff --check` passed. Whole Second Brain diff check identified an
unrelated existing blank line at EOF in OO05 prototype README_COMPONENT_MAP.md;
it was not edited as part of this payment task.

No remaining showstopper/critical issue was found in the three scoped payment
blockers after these fixes and checks. Software drawer acceptance is verified;
physical hardware and live fault injection limitations above remain explicit.

GATE MET — no remaining showstopper/critical cashier POS issue found.

## Scoped remediation follow-up (2026-09-11)

Previous findings below remain historical evidence. Current closure status: **PARTIAL; gate not established**.

- `TillException` in `lib/features/till/domain/entities/open_till.dart` now retains the backend error code.
- `till_remote_datasource.dart` preserves open/current-session error codes, treats only `404 till_session.not_found` as no current session, and rejects malformed/non-open/wrong-till/wrong-outlet session responses instead of inventing an open session.
- `TillController.openTill` in `till_provider.dart` recovers only `till_session.already_open` using the existing authoritative current-session GET. Confirmed recovery returns success to the existing screen bootstrap/navigation path. Failed recovery retains its error; unrelated conflicts do not trigger recovery. No backend/API changes or duplicate-open retry were introduced.
- Existing bootstrap already forces a current-session read. Its original initial-state discrepancy remains unproven; do not describe the bootstrap GET as newly implemented.
- Tests added in `till_provider_test.dart` cover successful conflict recovery, failed recovery and unrelated conflict; `till_remote_datasource_close_till_test.dart` adds specific 404 classification cases.
- Focused till + post-login test run: **46 passed, 0 failed, 0 skipped**. This run did not include the subsequently added three 404 classification cases; those still require rerun. Full regression/analyze after the fix remain pending.
- Authorized normal reboot of the existing `emulator-5554` corrected the clock. Before: host `2026-09-11 11:22:45 +05:30`, device `2026-09-10 19:16:35 +05:30`. After: host `2026-09-11 11:25:22.5529563 +05:30`, device `2026-09-11 11:25:22 +05:30` (sequential samples, approximately sub-second agreement). No cold boot or freshness-validation changes were needed. Repeat paired host/device/backend measurement remains part of final acceptance.
- A real current-session API read returned existing session `51a59a69-852d-454b-9489-e5c15bfd4208`, status `open`, opened `2026-09-10T06:47:17.218534Z`. No session was created by this read.
- Emulator reboot stopped the POS app (ADB pid lookup returned no process). Launching the updated app on the same emulator was blocked by the approval service usage limit. The denial was not bypassed. Backend was not restarted and ports were not changed.
- Therefore updated-app Login -> Till -> Sale -> Payment -> Receipt -> Reset, no-session opening, and corrected-time drawer request acceptance are **NOT YET VERIFIED**. Physical hardware verification remains unavailable. Do not claim GATE MET from the source fix or passing focused tests.

Gate: **NOT MET**. Runtime audit stopped at existing-open-till recovery. This is not a successful end-to-end financial transaction audit. Production source, environment configuration, clocks and running application processes were not changed/restarted. Existing tests use their normal fixtures; they are not evidence of a real completed sale.

## Environment and measured clock evidence

- Existing Android `emulator-5554`, Pixel Tablet, foreground `com.nytroz.pos.nytroz_pos/.MainActivity`; screenshot acquired through ADB.
- Existing backend listening on 5150. `/health` returns 404 (not a backend-down finding); real tenant login succeeds.
- Host: Sri Lanka Standard Time. Device: Asia/Colombo, `auto_time=1`.
- Paired sample: host `2026-09-11T04:42:15.0690160Z`; emulator `2026-09-10T12:49:41Z`. Device is **57,154 seconds behind** (15.876 hours), despite the same UTC+05:30 timezone.
- Backend HTTP Date: `Fri, 11 Sep 2026 04:37:25 GMT`; immediately following DB sample `2026-09-11 10:07:26.770762+05:30`. Backend/DB follow host day/time, not device time. Later DB sample: `2026-09-11 10:12:15.311777+05:30`.
- Latest till: `TS-0234`, OPEN, opened `2026-09-10 12:17:17.218534+05:30`, business date `2026-09-10`, opening float 0. This historical business date alone does not prove corruption or expiry.
- Latest drawer operation: AGENT_ACCEPTED, initiated `2026-09-10T12:23:50.413548+05:30`, completed `2026-09-10T12:23:52.05845+05:30`. Historical acceptance is not proof of today's physical opening.

## SHOWSTOPPER: existing-open-till recovery in running UI

Observed initial UI: Open Till form, CLOSED header / Till pending. Submitted the displayed valid 0 opening balance once through the running app. Result: header OPEN / Development Main Store / Front Till 01, but the form remains with `An open till session already exists for this till.` No New Sale navigation was available from this form. DB confirms the pre-existing TS-0234 session; no new session appeared in the read-back.

Relevant source:

- `lib/features/till/presentation/providers/till_provider.dart`, `openTill`: catches `TillException`, stores the error and returns false; it does not refresh current session on this conflict.
- `lib/features/till/presentation/screens/till_open_screen.dart`, `_submitOpenTill`: bootstrap/invalidate/navigation occurs only when `opened` is true.
- `lib/features/auth/presentation/providers/post_login_navigation_provider.dart`: workspace routing uses `tillProvider.hasOpenSession`.
- `lib/app/router/app_router.dart` already has an Open Till -> Home redirect when the resolved route is Home. Do not claim that redirect is absent. The observed conflict branch does not perform the session refresh needed to recover.

Impact: the observed running cashier session cannot progress through the requested journey from the exposed form. Why its initial local session disagreed with the existing database session remains unproven; clock drift must not be asserted as that cause without evidence.

## CRITICAL environment defect: device clock and drawer timestamp contract

`lib/features/hardware/receipt_printer/models/local_print_agent_models.dart`, `LocalPrintAgentDrawerOpenRequest.toJson` sends `requestedAt` from `DateTime.now().toUtc()`.

Agent `tools/E_POS.LocalPrintAgent/Validation/DrawerOpenRequestValidator.cs` compares request time to host `DateTimeOffset.UtcNow`, rejecting future offsets beyond 60 seconds and ages above configured `DrawerRequestMaxAgeSeconds`. `PrintAgentOptions` defaults to 120 seconds (supported configuration range 5–600 seconds). Measured drift far exceeds that window. Thus this device timestamp cannot pass the inspected agent validation for an otherwise valid drawer-open request. No physical pulse was attempted; this is a measured clock plus verified validation-contract failure, not a claimed observed drawer movement failure.

`AuthSession.isExpired`/`canRefresh` also compare device `DateTime.now()` with token expiry. Device clock can misclassify local expiry; no actual expired-token rejection was reproduced. Do not claim payment, receipt or till dates are wrong merely from this drift.

## Login and hardware read checks

Real `POST /api/v1/tenant-auth/login` using previously supplied cashier credentials succeeded. Final response: tenant `55555555-0000-4000-8000-000000000001`, 387 permissions, `workspace.pos.access=true`, `pos.till.open=true`, `workspace.tenant_admin.access=false`; access expiry `2026-09-11T04:55:08.3703482Z`. Tokens/passwords are intentionally omitted. API login is verified, not a fresh on-device login-to-receipt journey.

Local Print Agent `http://localhost:9101/health/ready`: ready true, configuration/store/printerExists/printerReady true, agent 1.1.0, API 1, receipt contract 3. This is software readiness, not paper delivery. Port 9100 is Flutter DevTools, not the printer agent. Android USB reports disconnected / host_connected=false. No physical scanner scan, paper print, drawer open or card charge was performed. **PHYSICAL HARDWARE VERIFICATION NOT AVAILABLE** in this audit. Card reader is outside supported completed hardware scope; no safe live provider acceptance is established.

## Financial flow scope and limitations

New Sale/cart quantity changes, exact/over/under tender, completed payment, receipt-to-DB parity and next-sale reset could not be exercised end-to-end after the till blocker. They are **NOT RUNTIME VERIFIED**, not additional proven defects.

Inspected `pos_cash_payment_screen.dart`: submission lock precedes network call; stable intent key is passed; authoritative response is recorded before success navigation; failure path preserves cart/tender. Receipt success provider retains authoritative payment payload. This source inspection is not evidence that duplicate financial transactions are impossible. The screen calls the remote datasource directly, differing from the documented provider/repository orchestration direction; this is an architecture observation, not a proven financial showstopper.

## Automated commands and evidence

Commands run against existing source without restarting services:

1. Installed Flutter runner `test --no-pub test/features/auth test/features/till test/features/sale test/features/hardware test/features/cash_drawer`: **471 passed, 0 failed, 1 skipped**.
2. `dotnet test tests/E_POS.UnitTests/E_POS.UnitTests.csproj --no-restore --filter "FullyQualifiedName~Cash|FullyQualifiedName~Till|FullyQualifiedName~Receipt|FullyQualifiedName~TenantAuth" --verbosity quiet`: **361 passed, 1 failed, 0 skipped**. Build completed with existing nullable warnings.
3. Failure-only rerun with `--no-build --no-restore --filter "FullyQualifiedName~CashierAllowedPermissionCodes_SubsetOfActiveTenantPermissionCatalog"`: **1 failed**. `PosPermissionSeedTests.cs:432` expects `workspace.pos.access` in its assembled seed catalog, which omits the separate workspace seed. Current real login does contain this permission; this failure alone does not prove cashier login failure.
4. `dotnet test tests/E_POS.LocalPrintAgent.Tests/E_POS.LocalPrintAgent.Tests.csproj --no-restore --verbosity quiet`: **50 passed, 0 failed, 0 skipped**.
5. `dotnet test tests/E_POS.ApiTests/E_POS.ApiTests.csproj --no-build --no-restore --filter "FullyQualifiedName~PosTills|FullyQualifiedName~PosReceipts|FullyQualifiedName~Cash" --verbosity quiet`: **25 passed, 0 failed, 0 skipped** against existing compiled test binaries. Not claimed as fresh API build verification.

The complete backend solution/API was not rebuilt and no real payment was submitted. Some read-only discovery commands failed (restricted `Get-NetTCPConnection`, unavailable `sales` table name); netstat and known till tables supplied the stated evidence. No failure was converted into a PASS.

6. Installed Flutter runner `analyze --no-pub`: **PASS**, no issues, 80.6 seconds.

## Second Brain comparison

Consulted current source-of-truth, workspace provisioning, cashier Payment Flow, Open Till specification/module, Cash Payment specification, Payment Success Receipt specification, Flutter hardware/payment/receipt and existing scanner/hardware authority.

Historical Open Till production-ready claims do not establish current runtime acceptance: this rerun exposes the recovery blocker. Cash Payment specification still labels implementation pending while inspected source exists; that does not prove complete acceptance. Hardware integration documentation includes legacy unsupported-direct-adapter wording alongside newer direct-printer implementation notes; use separate physical acceptance evidence, not a documentation status alone.

Only this audit record is new. No speculative canonical rule changes, code fix, DB repair, clock change, commit or push is part of the audit.

## Required gate closure

Resolve the verified Open Till recovery failure; correct/verify environment clock synchronization with authorization; rerun the complete authenticated UI sale/payment/receipt/reset flow and physical drawer path where configured. Preserve backend duplicate-till and drawer stale-request protections. No unrelated development track should be declared cleared by this audit.
