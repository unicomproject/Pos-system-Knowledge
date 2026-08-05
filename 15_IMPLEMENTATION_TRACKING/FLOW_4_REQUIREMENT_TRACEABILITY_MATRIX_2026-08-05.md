<!-- title: Flow 4 Requirement Traceability Matrix 2026-08-05 -->
<!-- status: Current Audit -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-05 -->

# Flow 4 requirement traceability matrix — 2026-08-05

## Evidence conventions

Atomic requirements were extracted before code inspection. The short mappings below expand as follows:

- `BE-ONB`: `E_POS.Api/.../PlatformTenantOnboardingController.cs`, `E_POS.Application/.../PlatformTenantOnboardingService.cs`, `E_POS.Infrastructure/.../PlatformTenantOnboardingRepository.cs`.
- `BE-MP`: `ManualPaymentAccessController`, `PlatformManualPaymentsController`, `PlatformTenantOnboardingPaymentStatusController`, `ManualPaymentService`, `ManualPaymentRepository`.
- `BE-ACT`: tenant activation in `PlatformTenantOnboardingRepository.ActivateAsync` and onboarding operation/invitation APIs.
- `BE-SEC`: `ManualPaymentAccessTokenService`, `PaymentAccessRequestRedactionMiddleware`, `RateLimitingExtensions`, `AzureManualPaymentEvidenceStorage`, `ClamAvManualPaymentEvidenceScanner`.
- `DB-F4`: migrations `20260804055813_AddFlow4TenantOnboardingRuntime`, `20260804110736_AddFlow4ManualPaymentRuntime`, guarded `20260804190000_BackfillDevelopmentRetailBusinessCode`, forward correction `20260805120000_ApplyProductionSafeRetailBusinessCodeRepair`, EF configurations and current model snapshot.
- `FE-WIZ`: `platform-create-tenant-page`, draft/result pages, onboarding model and `platform-tenant-api.service`.
- `FE-MP`: `/payment/:accessToken`, recipient page, manual-payment queue/detail/result pages, mapper/model and billing API service.
- `PW`: `qa-dashboard/manual-payment.e2e.spec.mjs`; `CI`: `.github/workflows/flow4-release-validation.yml`.
- Automated evidence: backend build and 1,461/1,461 tests; Angular build/strict TypeScript and 453/453 tests. Runtime evidence: isolated PostgreSQL/ClamAV/Azurite plus 6 distinct Playwright passes and 14 blocked cases.

## Stage 1 — Wizard draft

| Requirement ID | Requirement | Category | Source Document IDs | Source Sections | Priority | Backend Mapping | Database Mapping | Angular Mapping | Permission Mapping | Security Mapping | Test Mapping | Runtime Evidence | Status | Gap/Conflict ID |
| -------------- | ----------- | -------- | ------------------- | --------------- | -------- | --------------- | ---------------- | --------------- | ------------------ | ---------------- | ------------ | ---------------- | ------ | --------------- |
| F4-REQ-001 | Partial wizard input must use a dedicated draft aggregate and create no production tenant rows. | DATABASE | DOC-013,019,020,023 | draft storage; persistence boundary | P0 | BE-ONB create/update | `platform_tenant_onboarding_drafts`; DB-F4 | FE-WIZ draft state | `platform.tenants.create` | No tenant side effects | F4-T04,T05,T19 | Automated PostgreSQL evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-002 | Merely opening the create route must not create a draft; first successful save/valid Step-1 leave/autosave creates it. | USER_JOURNEY | DOC-013,019 | wizard-wide behavior; POST drafts | P0 | `CreateDraftAsync` | Draft created on command only | FE-WIZ | create permission | Owner from session | F4-T04,T05 | Angular/backend tests | IMPLEMENTED_VERIFIED | — |
| F4-REQ-003 | Valid changes must autosave with visible retry, while explicit Save draft remains available. | UI_UX | DOC-013,019,022 | wizard-wide behavior | P0 | PATCH draft | Version increment | FE-WIZ save state | owner/update | No sensitive local persistence | F4-T04 | 453 tests | IMPLEMENTED_VERIFIED | — |
| F4-REQ-004 | Owners may manage their drafts; non-owners require `platform.tenants.update`, otherwise safe 404/403 applies. | PERMISSION | DOC-013,019,021 | ownership; permission matrix | P0 | BE-ONB ownership predicate | owner FK/index | Draft list/resume controls | create/update split | Existence privacy | F4-T07 | 1,461 tests | IMPLEMENTED_VERIFIED | — |
| F4-REQ-005 | Draft expiry defaults to configurable 30 days, successful mutation extends it, and discard/expiry must not affect a completed tenant. | OPERATIONS | DOC-013,020,022 | retention; draft lifecycle | P1 | discard/retention services | status/expires/discarded columns | Confirm discard | owner/update | Soft-expire then purge | F4-T09 | Automated evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-006 | Resume must restore exact saved payload, current step, completion map, timestamps and latest version. | USER_JOURNEY | DOC-013,019 | resume; draft DTO | P0 | Get/List draft | JSON/version | FE-WIZ resume | owner/update | Bounded PII projection | F4-T05 | Automated evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-007 | The server must calculate the seven-step completion set and exact 0/14/28/42/57/71/85/100 percentages. | DOMAIN | DOC-013,019 | completion formula | P0 | validator/progress calculation | mask/percent columns | Display only | create/update | Client cannot forge | F4-T03,T04 | Automated evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-008 | Every draft mutation must require latest opaque version/ETag and reject stale writes without overwrite. | CONCURRENCY | DOC-013,019,020 | concurrency; PATCH | P0 | expected-version update | atomic `version=version+1` | Conflict/reload state | owner/update | No silent overwrite | F4-T08,T12 | PostgreSQL tests | IMPLEMENTED_VERIFIED | — |
| F4-REQ-009 | Step validation must preserve saveable data, block finalization until all predicates pass and warn on unsaved navigation. | UI_UX | DOC-013,019,022 | navigation; validation | P1 | ValidateDraftAsync | diagnostics in response | FE-WIZ validation/dirty guard | current permission recheck | No sensitive browser storage | F4-T03,T06 | Unit/component evidence; full browser case absent | IMPLEMENTED_NOT_RUNTIME_VERIFIED | — |

## Stage 2 — Finalization

| Requirement ID | Requirement | Category | Source Document IDs | Source Sections | Priority | Backend Mapping | Database Mapping | Angular Mapping | Permission Mapping | Security Mapping | Test Mapping | Runtime Evidence | Status | Gap/Conflict ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F4-REQ-010 | The wizard must use the fixed canonical seven-step order and labels. | USER_JOURNEY | DOC-013,022,023 | required sequence; F4-D01 | P0 | DTO sections | Draft schema | FE-WIZ stepper | create guard | — | F4-T01 | 453 tests | IMPLEMENTED_VERIFIED | F4-CONFLICT-005 resolved |
| F4-REQ-011 | Review must display all saved/derived values and finalize only the latest validated catalog/version. | UI_UX | DOC-013,019 | Step 7; finalize | P0 | Validate/Finalize | locked draft/catalog revision | Review/edit actions | conditional permissions rechecked | No client authority | F4-T12 | Automated evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-012 | Finalization must require a draft-scoped idempotency key; same key/hash replays and changed hash conflicts. | IDEMPOTENCY | DOC-013,019,020,023 | idempotency; F4-D17/D25 | P0 | FinalizeAsync | accepted key/hash + receipt | Stable key/duplicate-click disable | create permission | Store hashes, not raw key in audit | F4-T20–T22 | PostgreSQL tests | IMPLEMENTED_VERIFIED | — |
| F4-REQ-013 | Normalized tenant code, slug and full domain must be globally unique and concurrent conflicts map to stable 409 fields. | DATABASE | DOC-013,019,020 | duplicate rules | P0 | duplicate classifier/finalize | named unique indexes | Warning then field conflict | safe matched-ID disclosure | No hidden tenant details | F4-T10,T11 | PostgreSQL tests | IMPLEMENTED_VERIFIED | — |
| F4-REQ-014 | Finalization must atomically persist tenant/profile/contacts/subscription/invoice/lines/entitlements/add-ons/limits/operation/receipt/audit/outbox. | DATABASE | DOC-013,019,020,023 | transaction boundary; F4-D16 | P0 | BE-ONB finalize UoW | DB-F4 and existing tables | Result page | conditional permissions | External calls after commit | F4-T19 | PostgreSQL rollback evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-015 | Finalization must create one tenant-local pending-invite admin membership, bootstrap role/grants, but no live setup token for paid pending-payment. | DOMAIN | DOC-013,020,040 | Step 6; mapping | P0 | BE-ONB wizard | tenant users/roles/grants | Admin form/review | create permission | tenant-local email key | F4-T23,T24,T38 | Automated evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-016 | The server must derive price, currency, dates, statuses, effective limits/features and validate active plan/add-on/catalog compatibility. | BUSINESS | DOC-013,019,035 | Steps 3–5; DTO authority | P0 | policy/validator | plan/add-on/entitlement FKs | Server options only | override requires entitlement permission | Reject mass assignment | F4-T12–T15,T32,T37 | Automated evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-017 | External email/storage/provider work must occur after commit through the leased, deduplicated shared outbox and must never recreate a tenant. | OUTBOX | DOC-013,018,020,042 | persistence/retry/outbox | P0 | outbox worker | `integration_outbox_messages` | Operation retry states | domain permission | payload redaction | F4-T30,T31,T36 | Worker/local evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-018 | Trial/demo must have no payment link and may become ACTIVE only after complete transactional provisioning. | BUSINESS | DOC-013,018,023 | Step 4; lifecycle | P0 | finalize policy | NOT_REQUIRED + tenant state | Result UI | create permission | No fake checkout | F4-T17,T18 | Automated evidence | IMPLEMENTED_VERIFIED | — |

## Stage 3 — Pending payment

| Requirement ID | Requirement | Category | Source Document IDs | Source Sections | Priority | Backend Mapping | Database Mapping | Angular Mapping | Permission Mapping | Security Mapping | Test Mapping | Runtime Evidence | Status | Gap/Conflict ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F4-REQ-019 | Prepaid paid finalization must create tenant `PENDING_PAYMENT` and payment `AWAITING_PAYMENT`. | DOMAIN | DOC-002,013,018,023 | manual sequence; F4-D27 | P0 | BE-ONB | tenant/payment/operation | Result status | create | Server-owned statuses | F4-T16,T29 | E2E 1 passed | IMPLEMENTED_VERIFIED | — |
| F4-REQ-020 | Paid finalization must create and issue the authoritative invoice/lines with server-derived amount/currency/due date. | DATABASE | DOC-013,018,020 | Step 4; DB delta | P0 | BE-ONB | invoices/lines | Invoice projection | bounded creator/billing view | No client price/status | F4-T16,T19 | PostgreSQL/runtime | IMPLEMENTED_VERIFIED | — |
| F4-REQ-021 | Manual payment must expose distinct authorized `invoiceUrl` and purpose-bound `paymentStatusUrl`, with `checkoutUrl` exactly null. | API | DOC-002,013,018,019 | terminology; responses | P0 | status/receipt DTOs | Raw URL not stored | FE result/recipient | bounded creator/grant | Token not in logs/DTOs | F4-T16,T41 | E2E 1 + unit/API | IMPLEMENTED_VERIFIED | F4-CONFLICT-001 resolved |
| F4-REQ-022 | The payment-required communication must contain versioned manual instructions and support details, without a gateway claim. | EMAIL | DOC-018,024,049 | communications | P0 | outbox worker template | instruction snapshot/outbox | Result explanation | resend manage | No provider fiction | F4-T49 | Automated/outbox evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-023 | A paid pending-payment tenant must receive no account-setup credential, invitation request or live setup token. | SECURITY | DOC-013,017,018,024 | Step 6; sequence | P0 | BE-ONB/worker | invitation NOT_ELIGIBLE | No setup action | activation required later | Raw token absent | F4-T38 | Runtime operation evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-024 | Recipient access grants must be ≥256 random bits, purpose/tenant/invoice/payment/action bound, expiring/revocable, rate limited and keyed-hash-only at rest. | SECURITY | DOC-018–021,041 | secure access | P0 | BE-SEC | payment links/access fields/indexes | Public route token only in URL | recipient grant only | redaction middleware/rate policy | F4-T41,T46,T50 | Unit/API + E2E 14 | IMPLEMENTED_VERIFIED | — |

## Stage 4 — Recipient submission

| Requirement ID | Requirement | Category | Source Document IDs | Source Sections | Priority | Backend Mapping | Database Mapping | Angular Mapping | Permission Mapping | Security Mapping | Test Mapping | Runtime Evidence | Status | Gap/Conflict ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F4-REQ-025 | A valid grant must return only safe invoice, instructions, status, history and next-action projections; invalid/expired grants disclose nothing. | SECURITY | DOC-018,019,025 | recipient API | P0 | BE-MP status/history | payment/access join | recipient page states | grant | safe 404/redaction | F4-T41,T50 | E2E 14 passed | IMPLEMENTED_VERIFIED | — |
| F4-REQ-026 | Submission must accept method, reference, amount, ISO currency, payment date, proof and optional bounded note. | API | DOC-018,019 | DTO registry | P0 | `SubmitEvidenceAsync` | transaction/evidence fields | Reactive recipient form | grant SUBMIT action | bounded/scrubbed input | F4-T43 | Unit/API/Angular | IMPLEMENTED_VERIFIED | — |
| F4-REQ-027 | Submitted amount/currency/date/method/reference must validate against the locked invoice policy with stable field errors. | DOMAIN | DOC-018,019 | validation/errors | P0 | ManualPaymentService | invoice authority | Field errors retained | grant | reject mass assignment | F4-T43 | 1,461 tests | IMPLEMENTED_VERIFIED | — |
| F4-REQ-028 | Proof must be private and validate allow-listed PDF/JPEG/PNG type, extension, magic bytes, size, checksum and exact payment ownership. | SECURITY | DOC-018,020,022 | proof storage; P0 gates | P0 | BE-SEC storage | evidence table/blob metadata | accepted types/progress | grant/view split | no public URL | F4-T46 | Automated; live path blocked separately | IMPLEMENTED_VERIFIED | — |
| F4-REQ-029 | Malware-positive proof must be rejected before storage; approval must fail closed unless current evidence scan is CLEAN. | SECURITY | DOC-018,022 | F4-D28; release | P0 | ClamAV scanner/service/repository | scan status | safe error | grant/manage | fail closed | F4-T46 | ClamAV EICAR + unit/API | IMPLEMENTED_VERIFIED | — |
| F4-REQ-030 | Submission must be idempotent: same key/hash returns one logical submission; changed payload conflicts. | IDEMPOTENCY | DOC-018,019,022 | submit transaction | P0 | BE-MP | payment request/key hashes | Stable retry key | grant | no duplicate object/history | F4-T26 | Automated evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-031 | Submission/review chronology must be immutable, ordered and recipient-safe. | AUDIT | DOC-018,020 | history | P1 | ManualPaymentRepository | payment reviews sequence | History timeline | grant/view | reviewer/PII masking | F4-T27,T47 | Automated evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-032 | Eligible submitted/action-required/rejected payments must allow correction/resubmission without deleting prior history. | USER_JOURNEY | DOC-018,019 | state machine; update DTO | P0 | UpdateSubmissionAsync | new evidence/review rows | correction form | same grant/payment | ownership/version | F4-T27,T47 | Automated evidence | IMPLEMENTED_VERIFIED | — |

## Stage 5 — Platform review

| Requirement ID | Requirement | Category | Source Document IDs | Source Sections | Priority | Backend Mapping | Database Mapping | Angular Mapping | Permission Mapping | Security Mapping | Test Mapping | Runtime Evidence | Status | Gap/Conflict ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F4-REQ-033 | Platform Billing must provide searchable/filterable/paged manual-payment queue and detail/history. | API | DOC-018,019,039 | admin review API | P0 | BE-MP queue/detail/history | joined payment/invoice/tenant | queue/detail pages | billing.view | safe projections | F4-T50 | E2E 5 passed | IMPLEMENTED_VERIFIED | — |
| F4-REQ-034 | Proof streaming must require `platform.billing.view`, exact payment/evidence association and private/no-store response headers. | PERMISSION | DOC-018,019,021 | proof route | P0 | BE-MP proof endpoint | evidence association | proof preview/download | billing.view | ID substitution blocked | F4-T46,T50 | E2E 17 passed | IMPLEMENTED_VERIFIED | — |
| F4-REQ-035 | Review detail must compare expected versus submitted amount/currency/reference/date and show clean proof metadata. | UI_UX | DOC-018,053 | frontend target | P0 | detail projection | invoice/payment/evidence | manual-payment detail page | billing.view | no storage/checksum leakage | F4-T43,T46 | Angular + E2E 5 | IMPLEMENTED_VERIFIED | — |
| F4-REQ-036 | Approve/reject/request-information controls and direct API must require `platform.billing.manage`; view-only remains read-only. | PERMISSION | DOC-018,021 | permissions | P0 | controller/service | reviewer ID | control masking/guard | billing manage/view split | Backend final | F4-T50 | E2E 13 passed | IMPLEMENTED_VERIFIED | — |
| F4-REQ-037 | Approval must require valid current state, exact amount/currency and CLEAN proof. | DOMAIN | DOC-018,019 | review transaction | P0 | `ReviewAsync` | locked payment/invoice/evidence | confirm action | billing.manage | fail closed | F4-T44,T48 | Automated evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-038 | Rejection must require an approved safe reason/note, retain tenant pending payment and permit policy-controlled resubmission. | DOMAIN | DOC-018,019 | state machine | P0 | ReviewAsync REJECT | immutable review | reject dialog | billing.manage | safe reason | F4-T27,T47 | Automated evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-039 | Request information must move payment to ACTION_REQUIRED, leave tenant pending and notify recipient safely. | DOMAIN | DOC-018,019 | state machine | P0 | ReviewAsync REQUEST_INFORMATION | review/outbox | action UI | billing.manage | note redaction | F4-T47,T49 | Automated evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-040 | Every review must use current version/ETag; racing reviewers yield one transition and one safe conflict. | CONCURRENCY | DOC-018,019,022 | review locking | P0 | BE-MP ReviewAsync | row lock/version | conflict/reload | billing.manage | no duplicate action | F4-T44 | PostgreSQL concurrency passed | IMPLEMENTED_VERIFIED | — |
| F4-REQ-041 | Review commands must be payment/action-scoped idempotent with request hash and exact replay behavior. | IDEMPOTENCY | DOC-018–020 | review transaction | P0 | BE-MP | review key/request hashes | stable command key | billing.manage | key redaction | F4-T45 | Automated evidence | IMPLEMENTED_VERIFIED | — |

## Stage 6 — Payment approved

| Requirement ID | Requirement | Category | Source Document IDs | Source Sections | Priority | Backend Mapping | Database Mapping | Angular Mapping | Permission Mapping | Security Mapping | Test Mapping | Runtime Evidence | Status | Gap/Conflict ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F4-REQ-042 | Approval must atomically set payment PAID and settle the invoice consistently. | DOMAIN | DOC-018,019 | approval transaction | P0 | ManualPaymentRepository | payment/invoice | paid state | billing.manage | locked lineage | F4-T45,T48 | PostgreSQL tests | IMPLEMENTED_VERIFIED | — |
| F4-REQ-043 | Approval must move the tenant only to PENDING_ACTIVATION, never directly ACTIVE. | BUSINESS | DOC-002,013,017,018,023 | F4-D09/D29 | P0 | ManualPaymentRepository | tenant lifecycle | pending activation UI | billing.manage ≠ activate | trust-chain validation | F4-T29,T48 | Automated evidence | IMPLEMENTED_VERIFIED | F4-CONFLICT-002 resolved |
| F4-REQ-044 | Approval/submission/rejection/action-required notifications must be separate, deduplicated outbox events with no setup credential. | EMAIL | DOC-018,024,049 | communications/audit | P0 | outbox worker | outbox keys/sequence | status feedback | manage resend | token/password excluded | F4-T49 | Automated evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-045 | Payment approval must not create a setup token or invitation request before authorized activation. | SECURITY | DOC-013,018,023 | activation trust chain | P0 | review repository | invitation remains NOT_ELIGIBLE | no invite UI action before eligible | billing.manage cannot activate | no raw token | F4-T48 | Automated evidence | IMPLEMENTED_VERIFIED | — |

## Stage 7 — Activation

| Requirement ID | Requirement | Category | Source Document IDs | Source Sections | Priority | Backend Mapping | Database Mapping | Angular Mapping | Permission Mapping | Security Mapping | Test Mapping | Runtime Evidence | Status | Gap/Conflict ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F4-REQ-046 | Activation must lock and validate exact tenant/subscription/invoice/approved payment/amount/currency/provisioning lineage. | SECURITY | DOC-018,023 | F4-D29 | P0 | BE-ACT | FK/row locks | eligibility display | tenants.activate | Legacy MarkPaid insufficient | F4-T29,T48 | PostgreSQL tests | IMPLEMENTED_VERIFIED | — |
| F4-REQ-047 | Activation must be a separate authorized command requiring `platform.tenants.activate`, ETag and command idempotency key. | PERMISSION | DOC-017–019,021 | activation API/matrix | P0 | tenant activate endpoint | tenant version/command data | Activate action | exact key | backend final | F4-T29,T50 | Automated evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-048 | Duplicate/concurrent activation must be idempotent and produce at most one lifecycle transition/outbox request. | IDEMPOTENCY | DOC-013,018,019 | race table | P0 | BE-ACT | tenant lock/outbox unique | refresh result | activate | no double provisioning | F4-T29,T45 | PostgreSQL tests | IMPLEMENTED_VERIFIED | — |
| F4-REQ-049 | Successful activation must set tenant ACTIVE and append correlated activation audit/history. | AUDIT | DOC-013,017,018 | activation/audit events | P0 | BE-ACT | tenant/history/outbox | Active result | activate | safe audit fields | F4-T29,T36 | Automated evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-050 | Retryable activation/delivery work must retry through operation/outbox state without recreating tenant/payment/invoice. | OPERATIONS | DOC-013,018,019 | retry/recovery | P0 | operation retry API/worker | retry counters/lease | retry action | domain permission | bounded retries | F4-T30 | Automated evidence | IMPLEMENTED_VERIFIED | — |

## Stage 8 — Invitation

| Requirement ID | Requirement | Category | Source Document IDs | Source Sections | Priority | Backend Mapping | Database Mapping | Angular Mapping | Permission Mapping | Security Mapping | Test Mapping | Runtime Evidence | Status | Gap/Conflict ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F4-REQ-051 | Activation, and only activation eligibility, must transactionally queue the Tenant Admin setup-invitation request. | OUTBOX | DOC-013,017,018 | handoff/activation | P0 | BE-ACT | outbox/invitation status | invitation status | tenants.activate | no early token | F4-T38,T39 | Automated evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-052 | The worker must generate a cryptographic raw token in memory, persist only a strong/keyed hash and never put raw token/URL in DB, outbox, API or logs. | SECURITY | DOC-013,018,019,041,048 | token timing/security | P0 | outbox worker/token service | user_invites hash | no token exposure | worker identity | redaction | F4-T23,T39 | Automated evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-053 | Setup links must be expiring, single-use and revocable. | SECURITY | DOC-024,026,041,047 | setup token/invite | P0 | invitation/token service | expires/used/revoked | account setup state | authorized recipient | hash-only | F4-T23,T25 | Automated evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-054 | Authorized resend must be rate limited/idempotent, revoke/replace the previous token, audit the actor and preserve one active logical invitation. | IDEMPOTENCY | DOC-013,018,019,021 | resend | P0 | invitation resend/worker | invite/outbox unique state | resend control | tenants.update | old link invalidated | F4-T25 | Automated evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-055 | Invitation delivery ordering must preserve created/activated semantics and a failed informational email must not prevent setup delivery. | OUTBOX | DOC-013,024,049 | handoff sequence | P0 | outbox aggregate sequence | unique aggregate sequence | status presentation | authorized resend | separate payloads | F4-T30,T49 | Automated evidence | IMPLEMENTED_VERIFIED | — |
| F4-REQ-056 | The activation email must hand off to the tenant account-setup flow with username, single-use setup link, expiry and support, never a password. | EMAIL | DOC-017,024,026,048,049 | activation communication | P1 | email worker/template | token hash/invite status | final handoff | activation/update | no plaintext password | F4-T23,T39 | Automated contract only; live/browser path blocked | IMPLEMENTED_NOT_RUNTIME_VERIFIED | F4-GAP-004 |

## Stage 9 — Release validation

| Requirement ID | Requirement | Category | Source Document IDs | Source Sections | Priority | Backend Mapping | Database Mapping | Angular Mapping | Permission Mapping | Security Mapping | Test Mapping | Runtime Evidence | Status | Gap/Conflict ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F4-REQ-057 | Backend build, unit, API and PostgreSQL integration suites must pass with no Flow 4 failure. | TESTING | DOC-022,052,054 | release gate/evidence | P0 | Entire solution | PostgreSQL tests | — | auth suites | security suites | 743+341+377 | 1,461/1,461 pass | IMPLEMENTED_VERIFIED | — |
| F4-REQ-058 | Angular production build, strict TypeScript and unit/component tests must pass. | TESTING | DOC-022,053,054 | Angular evidence | P0 | — | — | entire app | guards/masking | interceptor tests | 453 tests | Build + 453/453 pass | IMPLEMENTED_VERIFIED | — |
| F4-REQ-059 | Full migration chain, rollback/reapply and no-pending-model-change checks must pass on PostgreSQL. | TESTING | DOC-020,022,052,054 | migration evidence | P0 | EF migrations | DB-F4/current snapshot | — | — | data constraints | 9 focused PostgreSQL migration tests | Clean/history/rollback/reapply pass on PostgreSQL 17.10; no pending model changes | IMPLEMENTED_VERIFIED | F4-GAP-006 closed |
| F4-REQ-060 | All twenty real-path Playwright scenarios must pass without HTTP mocks, fake gateway success or uncontrolled DB mutation. | RELEASE | DOC-022,054 | browser matrix | P0 | Real API | isolated PostgreSQL | PW | real identities | real scoped tokens | E2E 1–20 | 6 distinct pass; 14 blocked | BLOCKED_ENVIRONMENT | F4-GAP-005 |
| F4-REQ-061 | Private Blob upload/download/proof-stream flow must pass through a real recipient submission and authorized review path. | RELEASE | DOC-018,022,054 | proof gate | P0 | Azure storage adapter | evidence/blob metadata | recipient/reviewer pages | grant/billing.view | private/no-store | E2E 3,6,15,17 | Azurite reachable; full path blocked | BLOCKED_ENVIRONMENT | F4-GAP-003 |
| F4-REQ-062 | ClamAV must accept a valid proof, detect EICAR and preserve scan-before-availability/fail-closed behavior. | SECURITY | DOC-018,022,054 | malware gate | P0 | ClamAV adapter | scan result | safe progress/error | grant/manage | positive rejected | F4-T46/E2E15 | Local PDF OK and EICAR found | IMPLEMENTED_VERIFIED | — |
| F4-REQ-063 | Live ACS must prove payment/invitation send acceptance, recipient routing, provider ID, retry/resend and redacted telemetry; inbox delivery is reported separately from `WaitUntil.Started`. | RELEASE | DOC-048–050,054 | provider/operations block | P0 | ACS email adapter/worker | outbox delivery state | operation UI | authorized resend | secrets/log redaction | live service cases | Credentials/mailbox unavailable | BLOCKED_ENVIRONMENT | F4-GAP-004 |
| F4-REQ-064 | Recipient and reviewer surfaces must pass keyboard, focus, labelled-error, live-region and screen-reader-oriented acceptance. | ACCESSIBILITY | DOC-013,018,022,054 | accessibility gates | P1 | safe errors | — | FE-MP | denied states | no restricted disclosure | accessibility E2E | Queue focus passed; recipient pending | PARTIALLY_IMPLEMENTED | F4-GAP-007 |
| F4-REQ-065 | Recipient/reviewer surfaces must pass 360/tablet/desktop responsive acceptance with no global clipping/scroll. | RESPONSIVE | DOC-013,018,022,054 | responsive gates | P1 | — | — | FE-MP SCSS/card-table | — | — | responsive E2E | Queue five viewports passed; recipient pending | PARTIALLY_IMPLEMENTED | F4-GAP-007 |
| F4-REQ-066 | Cross-tenant/token/object-ID substitution must be privacy-safe and public recipient requests must not receive platform bearer tokens. | SECURITY | DOC-018,021,022,054 | isolation/privacy | P0 | BE-SEC/BE-MP | exact associations | auth-token interceptor exclusion | view/manage/grant | safe 403/404 | F4-T33,T41,T46,T50 | E2E 14/17 pass + tests | IMPLEMENTED_VERIFIED | — |
| F4-REQ-067 | Release CI must fail fast on missing fixtures/services and run build/tests/preflight/all 20 scenarios with protected secrets and retained artifacts. | RELEASE | DOC-022,054 | CI gate | P0 | target API | target DB | CI/PW | protected identities | environment secrets | workflow | Workflow implemented; full run cannot pass yet | IMPLEMENTED_VERIFIED | F4-GAP-005 |
| F4-REQ-068 | Stripe/PayHere checkout/callback work must remain disabled in the manual release and later enter only through signed, deduplicated provider adapters. | BUSINESS | DOC-002,018,023 | future provider boundary | P2 | `IPaymentProvider`/manual adapter | nullable future fields | no gateway UI | future configuration | signature/event checks later | future contract tests | Intentionally deferred | NOT_APPLICABLE_CURRENT_RELEASE | — |
| F4-REQ-069 | Every production migration must be environment-neutral, forward-safe, rollback-safe and documented; a development-seed repair must not silently mutate a production record. | DATABASE | DOC-043,045,054 | migration rules; Retail backfill | P0 | guarded `20260804190000...` + forward `20260805120000...` | natural provenance, collision/ambiguity precheck, non-destructive Down | — | — | existing values protected; no UUID targeting | 9 focused PostgreSQL cases + 1,470 full regression | Decision/evidence approved; clean and existing-history paths pass | IMPLEMENTED_VERIFIED | F4-CONFLICT-007 resolved; F4-GAP-006 closed |
| F4-REQ-070 | A test-only recipient-token bootstrap, if used, must be explicitly approved, isolated to a test host, return raw token only to the invoking test process, store only hash, redact output and clean up. | SECURITY | DOC-013,018,020,022,054 | token rules; E2E protocol; approved 2026-08-05 contract | P0 | Approved separate CLI/hybrid; implementation pending | hash-only + test-control marker/ledger contract | Process-pipe manifest to scoped PW env | bootstrap credential; fixed personas | cumulative guards, <=60m TTL, one-time return, artifact scan | Chunk 3 negative/architecture tests | Security authority approved; no runtime builder or token generated | DOCUMENTED_APPROVED | F4-GAP-001 authority gap resolved; Chunk 3 verification pending |
| F4-REQ-071 | Awaiting/submitted/rejected/action-required/approvable/rejectable/conflict/paid/active/retry/happy-path fixtures must be produced through an approved deterministic API/test-host/helper, never uncontrolled DB mutation. | TESTING | DOC-022,054 | required E2E details; approved typed scenario contract | P0 | Separate CLI + production services + scenario-specific test assemblers approved; not built | isolated DB marker/run/resource ledger required | Versioned secret-safe manifest | fixed run-owned personas | allow-list, ownership, parallel isolation | E2E 2–20 + Chunk 3 fixture tests | Fixture values unavailable; implementation contract approved | MISSING_IMPLEMENTATION | F4-GAP-002 |
| F4-REQ-072 | Test fixture/token/proof/email captures must have explicit retention and cleanup that removes test-owned state without touching unrelated resources. | OPERATIONS | DOC-013,018,022,054 | retention; E2E protocol; approved cleanup contract | P1 | Idempotent cleanup design approved; implementation pending | run/resource ledger; reverse-FK cleanup | artifact exclusion/secret scan contract | test identity/run ownership | revoke, delete, TTL/nightly fallback | forced-failure/foreign-run cleanup tests | Docker safety + cleanup/redaction contract documented; execution unproven | DOCUMENTED_ONLY | F4-GAP-008 |

## Coverage summary

| Status | Count | Requirement IDs | Release impact |
|---|---:|---|---|
| IMPLEMENTED_VERIFIED | 61 | F4-REQ-001–008, 010–055, 057–059, 062, 066–067, 069 | Strong automated implementation baseline; not a production release by itself |
| IMPLEMENTED_NOT_RUNTIME_VERIFIED | 2 | F4-REQ-009, 056 | Full browser/live handoff evidence absent |
| PARTIALLY_IMPLEMENTED | 2 | F4-REQ-064–065 | Recipient accessibility/responsive acceptance incomplete |
| DOCUMENTED_APPROVED | 1 | F4-REQ-070 | Security authority approved; Chunk 3 runtime and negative-test evidence pending |
| DOCUMENTED_ONLY | 1 | F4-REQ-072 | Cleanup contract not implemented end to end |
| BLOCKED_ENVIRONMENT | 3 | F4-REQ-060–061, 063 | Prevents release gate |
| MISSING_IMPLEMENTATION | 1 | F4-REQ-071 | Prevents deterministic 20/20 execution |
| CONFLICTING_REQUIREMENT | 0 | — | F4-CONFLICT-007 and F4-GAP-006 resolved by the guarded/history-safe migration decision |
| NOT_APPLICABLE_CURRENT_RELEASE | 1 | F4-REQ-068 | Future IPG only |
| TEST_ONLY / BLOCKED_DEPENDENCY | 0 | — | No requirement is credited solely to a test or an unidentified dependency |

### Priority counts

| Priority | Total | Verified | Non-verified/blocked |
|---|---:|---:|---:|
| P0 | 64 | 59 | 5 (F4-REQ-060,061,063,070,071) |
| P1 | 7 | 2 | 5 (F4-REQ-009,056,064,065,072) |
| P2 | 1 | 0 applicable | F4-REQ-068 is future/not applicable |
| P3 | 0 | 0 | — |

### Ratios

- Documentation coverage: **72 / 72 = 100%** have an identified authoritative or explicitly conflicting source.
- Full implementation coverage: **63 / 71 = 88.7%** applicable requirements are implemented (verified plus implemented-not-runtime-verified; partial is not counted as complete).
- Verified coverage: **61 / 71 = 85.9%** applicable requirements have implementation plus passing automated/runtime evidence.
- Release-critical coverage: **59 / 64 = 92.2%** P0 requirements are verified. This ratio does not waive the five remaining P0 requirements.

## Gate interpretation

The migration disposition is approved and verified. The secret-safe test-host/token authority is also approved by the 2026-08-05 Chunk 2 contract, so Chunk 3 may implement it without changing production security. Verified P0 coverage remains 59/64 because F4-REQ-070 still lacks runtime/negative-test proof and F4-REQ-071 is not built. The implementation is not production-ready: fixture runtime, 20/20 browser, real proof path and live ACS remain P0 gates.

## Related

- [[FLOW_4_SECOND_BRAIN_DOCUMENT_READ_MANIFEST_2026-08-05]]
- [[FLOW_4_DOCUMENT_CONFLICT_AND_GAP_REGISTER_2026-08-05]]
- [[FLOW_4_APPROVED_NEXT_IMPLEMENTATION_SCOPE_2026-08-05]]
