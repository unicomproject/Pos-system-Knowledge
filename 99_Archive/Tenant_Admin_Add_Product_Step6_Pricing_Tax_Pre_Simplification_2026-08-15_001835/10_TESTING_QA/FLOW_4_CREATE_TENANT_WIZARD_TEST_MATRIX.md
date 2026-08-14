<!-- title: Flow 4 Create Tenant Wizard Test Matrix -->
<!-- status: Canonical -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-05 -->

# Flow 4 — Create Tenant Wizard Test Matrix

## Release gate

All P0 cases must pass against PostgreSQL and the production Angular build. Unit-only or EF InMemory evidence cannot satisfy transaction, unique-index, concurrency, provider-callback or tenant-isolation cases.

| ID | Layer | Scenario | Expected result | Priority |
|---|---|---|---|---|
| F4-T01 | Angular unit | Fixed seven-step labels/order | Exact canonical sequence | P0 |
| F4-T02 | Angular unit | Configured/null defaults | Server defaults used; no `LK`/`LKR` preference | P0 |
| F4-T03 | Angular unit | Each field validator/cross-field rule | Accessible field errors; no data loss | P0 |
| F4-T04 | Angular integration | Autosave success/failure/retry | Version advances; visible retry; dirty state correct | P0 |
| F4-T05 | E2E | Save, close, list and resume | Exact values, step and progress restored | P0 |
| F4-T06 | E2E | Unsaved navigation | Warning; stay/leave behavior correct | P1 |
| F4-T07 | API unit | Draft owner and conditional permissions | Matrix enforced with safe 403/404 | P0 |
| F4-T08 | PostgreSQL integration | Optimistic draft concurrency | One update wins; stale update 409; no overwrite | P0 |
| F4-T09 | PostgreSQL integration | Draft expiry/discard | Hidden from active resume; completed tenant unaffected | P1 |
| F4-T10 | API/integration | Duplicate advisory check | Blocking vs warning classifications and safe disclosure | P0 |
| F4-T11 | PostgreSQL integration | Concurrent same code/slug/domain | One finalize succeeds; other maps unique violation to 409 field | P0 |
| F4-T12 | Unit/integration | Plan changed/inactive after save | 409 catalog changed; reconfirm required | P0 |
| F4-T13 | Unit | Plan/add-on/effective limit calculations | Server prices/limits win; invalid override rejected | P0 |
| F4-T14 | Unit/integration | Included/optional/prerequisite features | Effective entitlement set is correct | P0 |
| F4-T15 | Authorization | Entitlement override without permission | 403 and no persisted override | P0 |
| F4-T16 | E2E | Prepaid/manual happy path | Tenant pending payment; invoice, `AWAITING_PAYMENT`, secure access, notification outbox and operation created; `checkoutUrl` null | P0 |
| F4-T17 | E2E | Trial happy path | No payment link; provisioned tenant active | P0 |
| F4-T18 | E2E | Demo happy path | No payment link; configured demo limits; active | P0 |
| F4-T19 | PostgreSQL integration | Failure at every transactional write point | Full rollback; draft remains retryable; no orphan rows | P0 |
| F4-T20 | PostgreSQL integration | Finalize same key/hash twice | One aggregate; replay returns same tenant/operation | P0 |
| F4-T21 | PostgreSQL integration | Same key/different hash | 409 idempotency conflict; no second tenant | P0 |
| F4-T22 | E2E/API | Double-click/network timeout retry | Stable key; one tenant | P0 |
| F4-T23 | Security | Tenant admin invitation | Strong random raw token only at worker; hash at rest; no plaintext password/token in response/log | P0 |
| F4-T24 | Integration | Cross-tenant same admin email | Allowed; same-tenant duplicate blocked | P0 |
| F4-T25 | Integration | Invitation resend | Old token revoked, new hash saved, rate limit/audit applied | P0 |
| F4-T26 | Integration | Manual evidence command replay | Same key/hash returns one submission; changed request conflicts | P0 |
| F4-T27 | Integration | Rejected/action-required then corrected resubmission | Review history retained; tenant lifecycle remains pending payment | P0 |
| F4-T28 | Authorization | Waiver with/without billing manage | Allowed with reason/audit; denied otherwise | P0 |
| F4-T29 | Integration | Paid lifecycle transitions | Only pending payment → pending activation → active | P0 |
| F4-T30 | Integration | Outbox delivery failure | Tenant retained; retryable operation; no duplicate invoice/invite | P0 |
| F4-T31 | PostgreSQL integration | Audit sequence concurrency | Unique monotonic sequence; no `COUNT+1` race | P0 |
| F4-T32 | Security | Malicious IDs/status/price/token fields | Server ignores/rejects; no mass assignment | P0 |
| F4-T33 | Security | Tenant isolation/direct object access | No draft/tenant/contact data crosses scope | P0 |
| F4-T34 | Accessibility | Keyboard/screen reader/error summary | WCAG-oriented interactions and focus behavior pass | P1 |
| F4-T35 | Responsive E2E | 360px/tablet/desktop | No clipped controls; correct compact stepper | P1 |
| F4-T36 | Observability | Trace/idempotency correlation and redaction | Correlated events; secrets/PII absent | P0 |
| F4-T37 | Backend unit | Configured/null geographic and plan billing defaults | No `LKR`, `LK`, `Asia/Colombo` or unconditional monthly runtime/schema fallback | P0 |
| F4-T38 | Integration | Paid finalize before activation | Membership exists; no live setup invite/token; payment notification only | P0 |
| F4-T39 | Integration | Trial/demo or paid activation invite request | Outbox request committed; worker creates hash and sends token only in memory | P0 |
| F4-T40 | Migration | Historical registration/tax migration lineage | New forward migration applies from current snapshot without editing July 2/July 7 history | P0 |
| F4-T41 | Security | Invoice/payment-status/checkout URL semantics | Purpose URLs are distinct; manual `checkoutUrl` null; raw access token/proof URL absent from audit/log/unauthorized DTO | P0 |
| F4-T42 | Unit | Manual payment status transitions | Only documented transitions; invoice/payment/tenant states remain separate | P0 |
| F4-T43 | Unit/API | Submission amount/currency/date/method/reference validation | Expected invoice values enforced; stable field errors | P0 |
| F4-T44 | PostgreSQL integration | Concurrent manual reviews | One version wins; stale reviewer conflicts; one audit/review transition | P0 |
| F4-T45 | PostgreSQL integration | Duplicate approval request | Same command replays; no duplicate paid/pending-activation/outbox rows | P0 |
| F4-T46 | Integration/security | Payment proof upload/access | Private approved MIME/size/checksum; cross-ID and expired grant denied; short-lived access only | P0 |
| F4-T47 | Integration | Request information and resubmission | `ACTION_REQUIRED` -> `PAYMENT_SUBMITTED`; full immutable review chronology | P0 |
| F4-T48 | Integration | Approval handoff | `PAID` -> tenant `PENDING_ACTIVATION`; no direct ACTIVE or invitation token | P0 |
| F4-T49 | Integration | Payment notifications | Required/submitted/approved/rejected/action-required events are deduplicated and contain no account setup credential | P0 |
| F4-T50 | Authorization | Manual review and proof permissions | Billing view/manage split, secure recipient grant, direct API and cross-tenant isolation enforced | P0 |

## Layer coverage checklist

- Unit: all normalizers/validators and min/max boundaries; duplicate classification; draft/tenant/operation/manual-payment state transitions; submission validation; amount/currency checks; approval eligibility; provider-neutral mapping; `checkoutUrl` null behavior; progress rounding; effective entitlement/dependency/limit calculation; permission predicates; paid/trial/demo/deferred billing rules; tenant-admin timing and token lifecycle.
- Backend integration: platform authentication/authorization; draft CRUD/list/resume/expiry; PostgreSQL uniqueness/rollback/isolation; subscription/invoice/payment/evidence/review/add-on/entitlement/contact/admin persistence; manual submission/review/resubmission and paid/pending/activation transitions; idempotency replay/conflict; concurrent PATCH/finalize/review/activate; proof access; audit/outbox rows and retry.
- Frontend: exact labels/order; typed forms/cross-field mapping; server defaults; draft save/resume/autosave failure; guard; duplicate warning and strict conflict; permissioned overrides; review/edit; pending payment/manual review/evidence/payment-recipient/pending activation/success; ETag conflict; stable-key retry; accessible focus and responsive layout.
- E2E: all 17 whole-wizard scenarios below plus the 20-scenario Angular manual-payment browser matrix, using the real API and PostgreSQL with controlled email/private-storage boundaries only for the manual release. No mocked plan, feature, tenant, draft, billing or permission data in the application path.

## Future provider contract tests

Stripe/PayHere tests are future/environment-dependent and do not block the manual-payment release. Before enabling either provider, contract tests must prove session creation/status mapping, secret/config isolation, callback signature verification, provider-event deduplication, amount/currency/invoice/tenant mismatch rejection, duplicate/out-of-order callbacks, provider timeout/unknown result, idempotent success/failure, cancellation/refund capability mapping and reconciliation. Live sandbox/production evidence is reported separately from automated adapter tests.

## Validation boundary set

Test empty, whitespace, min/max and one-over-max values; Unicode names; code/slug invalid characters; DNS label edges; email and HTTPS URL; ISO country/currency; unsupported locale/timezone; phone/postal metadata fallback; date ordering; negative/over-limit quantities, tax and discounts; duplicate feature/add-on IDs; inactive or deleted catalogs; mismatched currency; missing reason; malformed/stale ETag; expired draft; and schema-version upgrade.

## Existing evidence and gaps

The final backend solution passes **1,461/1,461** tests: Unit 743, API 341 and Integration 377. Focused evidence covers the payment state machine, manual provider behavior, access/invoice projections, validation and malware rejection, permission boundaries, raw-path redaction, wizard manual finalization, PostgreSQL schema/migration shape, conflicting concurrent review and concurrent activation with exactly one success/replay/invitation. Angular 21.2.19 passes production build, both strict TypeScript projects and **453/453** tests with zero production npm vulnerabilities. Isolated real-browser execution now has six distinct passing scenarios and fourteen exact token/lifecycle blocks. Future provider callback tests are absent by design and are not a manual-release gate. See [[../15_IMPLEMENTATION_TRACKING/FLOW_4_RELEASE_ENVIRONMENT_AND_E2E_VALIDATION_EVIDENCE_2026-08-04]].

### Backend execution evidence

| Gate | Result |
|---|---|
| Build | PASS - 0 warnings, 0 errors |
| Full solution | PASS - 1,461 tests, 0 failed |
| Manual unit focus | PASS - 12 |
| Manual API/security focus | PASS - 5 |
| PostgreSQL migration/concurrency focus | PASS - 4 |
| Representative apply / rollback / reapply | PASS |
| Clean PostgreSQL full migration chain | PASS |
| EF pending-model check | PASS - none |
| Changed-file formatter and `git diff --check` | PASS |

The repository-wide formatter still reports 785 pre-existing whitespace findings outside this change; the changed/new non-generated C# scope is formatted and verified. Fourteen browser scenarios, the real private Blob proof path and live ACS remain required release evidence.

### Angular manual-payment browser matrix - partially executed, release blocked

`qa-dashboard/manual-payment.e2e.spec.mjs` uses the existing Playwright stack and contains 20 real-path cases: paid creation, secure recipient access, valid submission, duplicate retry, queue filtering/detail, private proof, approve to Pending Activation, separate activation, rejection, information/correction/history, stale-review conflict, route/API permission denial, review denial, expired link, unsafe evidence, notification resend, cross-tenant proof isolation, activation retry, invitation resend and the complete lifecycle. It uses no HTTP route fulfilment or fake payment success.

Latest execution status: the authoritative all-20 run completed with **5 passed and 15 explicit environment skips**; focused E2E 13 also passed, for **6 distinct passes and 14 blocks**. E2E 1, 5, 12, 13, 14 and 17 pass through the real Angular/API path. Isolated PostgreSQL, ClamAV and Azurite were available; raw purpose-bound recipient tokens, submitted/review/activation fixtures, the real private-proof path and live ACS were not. This does not satisfy the full release gate.

## Required E2E scenario details

Base data: isolated PostgreSQL schema; a Platform Admin with all needed permissions; active prepaid/deferred/trial/demo plans with known features/limits; alternate configured defaults not equal to LK/LKR for default tests; private proof-storage and email adapters that record requests without real delivery. No gateway adapter is enabled for the current manual-release scenarios. Cleanup deletes the test schema/tenant fixtures through the test harness, never production-like shared data.

Every E2E row uses this execution protocol unless its distinguishing steps override it: seed only through approved test fixtures/API; sign in through platform auth; navigate to `/admin/tenants/create`; enter data through the seven UI steps; save/reload where required; intercept only the private storage/email boundaries; assert the API envelope/status/trace ID; query PostgreSQL directly for exact rows/constraints; assert UI state and correlated audit events; then dispose the isolated schema and clear adapter captures. Screenshots/video and request correlation IDs are attached before cleanup. A scenario that skips its API, database, UI, audit or cleanup assertion is incomplete.

| Scenario | Preconditions / distinguishing data | Expected API and database | Expected UI and audit |
|---|---|---|---|
| 1 Valid trial create/activate | Trial plan, unique code/domain/admin email; complete Steps 1–7 and submit once | 201; one full aggregate and operation; no payment link; tenant active | Completion/detail; complete created/provisioned/activated/invitation-request/sent events |
| 2 Save after Step 1/resume | Unique basic details | Draft create/patch/get; no tenant rows | Resume at saved step with exact values; create/update/resume events |
| 3 Save after Step 5/resume | Valid plan/billing/entitlements | Draft JSON and derived progress persist; no final rows | Steps 1–5 restored; plan/entitlement change events |
| 4 Duplicate tenant | Existing normalized code/slug/domain; similar legal name | Advisory warning then finalize 409 on strict field; no new tenant | Field message and retained draft; duplicate check/override audit where applicable |
| 5 Paid creation | Prepaid plan/invoice email; submit review | One tenant pending payment, invoice/lines, `AWAITING_PAYMENT`, secure payment-access hash and notification outbox; no live setup invite/token; `checkoutUrl` null; 201 | Payment-required result with invoice/status links and manual instructions; no setup credential |
| 6 Payment remains pending | Recipient does not submit evidence | Tenant/payment remain pending/awaiting; operation stable | Refresh/poll shows awaiting payment; no activation event |
| 7 Payment rejected/retried | Submit evidence, reviewer rejects or requests information, payer corrects/resubmits, reviewer approves | Immutable review history; exactly one paid result; tenant reaches only pending activation; no duplicate invoice/access record | Rejection/action-required/resubmit/approved states and correlated notifications/audit |
| 8 Pending activation | Verified paid invoice | Lifecycle changes only to pending activation | Activation action shown only to authorized actor; activation-pending event |
| 9 Activation fail/retry | Inject retryable delivery/provisioning-side failure around activation | No invalid lifecycle/partial duplicate; operation retry count increments | Failure detail and retry control; failed/retried/activated events |
| 10 Invitation delivery fails | Email adapter fails after commit | Tenant remains durable; outbox retryable; token hash only | Warning/retry status; invitation requested/failed events without token |
| 11 Unauthorized create | Authenticated user lacks create | 403; no draft/tenant/audit business rows | Permission-denied screen; security telemetry only |
| 12 Concurrent editors | Two authorized users load same version | First PATCH 200/version+1; second 409/no overwrite | Conflict compare/reload; successful update audit only plus safe conflict telemetry |
| 13 Double final submit | Same draft, key and hash twice | 201 then 200 replay; exactly one aggregate/receipt | Same result/tenant ID; one creation audit plus replay telemetry |
| 14 Features/overrides | Plan features, add-on, compatible override with permission | Exact unique effective entitlements and override metadata | Review matches detail; entitlements changed audit with reason |
| 15 Admin handoff | Unique admin email; activate tenant; successful email adapter | Pending-invite user/role/grants at create; activation request; worker stores only hashed setup token | Delivery status then handoff message; invitation requested/sent event; raw token only in adapter capture |
| 16 Complete audit | Execute paid happy path through activation | Ordered correlated events with actor/draft/tenant/request IDs; sensitive columns absent | Audit view shows whole workflow subject to permission/redaction |
| 17 Tenant isolation | Existing second tenant and same email membership | Every created tenant-owned row has correct tenant ID; cross-ID requests 404/403 | No cross-tenant data in UI; isolation test event/telemetry only |

Each scenario also asserts no unexpected rows, validates server errors and trace IDs, and captures browser screenshot/video plus API/database assertions. Provider/email fixtures are reset between scenarios.

## Evidence format

Record commit SHA, command, environment/database provider, pass/fail count, duration and artifact link. Flaky retries do not count as pass without root-cause disposition. P0 failures block release; accepted P1 exceptions require owner, reason and expiry.

## Related

[[../05_BACKEND_ARCHITECTURE/FLOW_4_MANUAL_PAYMENT_AND_FUTURE_IPG_ARCHITECTURE]]

[[../03_USER_JOURNEYS/Platform_Admin/FLOW_4_CREATE_TENANT_WIZARD_CANONICAL_SPEC]] · [[Idempotency_Test_Cases]]
