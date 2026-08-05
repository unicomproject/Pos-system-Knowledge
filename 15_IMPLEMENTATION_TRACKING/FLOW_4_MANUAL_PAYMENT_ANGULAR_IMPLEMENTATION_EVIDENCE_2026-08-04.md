<!-- title: Flow 4 Manual Payment Angular Implementation Evidence 2026-08-04 -->
<!-- status: Angular Implemented and Automated Gates Passing - Production NO-GO -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-05 -->

# Flow 4 - Manual Payment Angular implementation evidence - 2026-08-04

## A. Executive result

### Release-validation update - 2026-08-05

The isolated real-browser run now records six distinct passes (E2E 1, 5, 12, 13, 14 and 17) and fourteen exact environment/token/lifecycle blocks. Queue responsiveness passes at 360, 768, 1024, 1366 and 1600 pixel widths after tablet card-layout containment fixes. Angular 21.2.19, production build, strict TypeScript and **453/453** tests pass; the production npm audit reports zero vulnerabilities. Production remains **NO-GO**. See [[FLOW_4_RELEASE_ENVIRONMENT_VALIDATION_EVIDENCE_2026-08-05]].

The Platform Admin and payment-recipient Angular runtime is implemented on `feat/flow4-create-tenant-runtime`. Production code calls the real Flow 4 APIs; it contains no payment gateway simulation, HTTP mock, fake payment success, or client-side lifecycle override. Manual payment remains the only current-release collection method and `checkoutUrl` is never presented.

Automated frontend gates pass: production build, strict application/spec TypeScript checks, and **453/453 Angular tests**. The existing Playwright stack discovers the 20 canonical real-browser scenarios, but all 20 are environment-gated and were **blocked/skipped**, not passed, because no controlled PostgreSQL/Blob/ClamAV/email environment or Flow 4 fixture credentials were supplied. Production therefore remains **NO-GO**.

## B. Repository evidence

| Repository | Branch | Evidence |
|---|---|---|
| Platform Admin Angular | `feat/flow4-create-tenant-runtime` | Runtime `90d85f3`; tests/E2E `8bbfb3977b3c9afb0847fcd8974a6737d143d853`; pushed to origin |
| Unified Commerce backend | `feat/flow4-create-tenant-runtime` | Runtime `db9d579`; additive UI projection correction `994f19b211150745e77b231cfedff1b71721a839`; pushed to origin |
| Second Brain | `docs/flow4-create-tenant-runtime` | This evidence and linked canonical status updates |

The backend correction appends the recipient/admin projection fields required for refresh-safe submitted/correction/detail views and removes the internal evidence checksum from the public DTO. It changes no state transition, endpoint, database schema or authorization rule. Two projection contract tests were added; the complete backend solution passes **1,460/1,460** tests: Unit 742, API 341 and Integration 377.

## C. Routes and access model

- Public, purpose-bound recipient route: `/payment/:accessToken`, declared before the authenticated admin shell.
- Platform Billing queue: `/admin/billing/manual-payments`, guarded by `platform.billing.view`.
- Platform Billing detail: `/admin/billing/manual-payments/:paymentId`, guarded by `platform.billing.view`.
- The payment-access token remains in the route only. The UI does not write it to storage, render it, log it or attach a Platform bearer token to recipient API calls.
- Review/resend/retry controls require `platform.billing.manage`; activation requires `platform.tenants.activate`; invitation resend requires `platform.tenants.update`; actor history requires `platform.audit.view`.

## D. Recipient runtime

The recipient page loads the authoritative status, invoice and history projections and provides:

- tenant/subscription/invoice/manual-instruction and current-status presentation, with no checkout control;
- PDF/JPEG/PNG evidence selection with 10 MiB client guidance, upload progress and server-authoritative validation/scanning outcomes;
- exact amount/currency/date/reference/note validation and multipart submit/update commands;
- stable idempotency key reuse until a command succeeds;
- submitted evidence summary, safe rejection/request-information feedback and correction/resubmission;
- invalid/expired-access handling that reveals no invoice or payment data;
- authorized invoice projection in a labelled dialog.

## E. Platform Admin runtime

The queue supports status, tenant, plan, date, search, sort and pagination inputs with loading, empty, error, table and small-screen card states. The detail view provides:

- expected-versus-submitted comparison and tenant/subscription/invoice/payment lifecycle context;
- on-demand proof retrieval only through the authenticated private proof endpoint, with object-URL revocation;
- evidence scan state and fail-closed approval eligibility;
- approve, reject and request-information dialogs with explicit confirmation, latest version and stable idempotency keys;
- conflict handling that does not silently retry a stale decision;
- permissioned actor history, payment-notification resend, separate activation and invitation resend;
- activation copy that states the server validates prerequisites and never implies payment approval activated the tenant.

The onboarding result surface now shows Pending Payment, Paid/Pending Activation, Active and invitation/operation states truthfully, exposing actions only when the relevant permission and lifecycle state allow them. Its previously duplicated `/api/v1/api/v1` onboarding API base was corrected to the canonical endpoint path.

## F. API and security evidence

Angular services map the canonical recipient status/invoice/history/submission/update endpoints, Platform Billing queue/detail/proof/history/review/resend endpoints, tenant activation, invitation resend and operation retry. Multipart field names, query parameters, `If-Match`, idempotency headers, upload events and Blob proof responses have focused tests.

Unknown payment values map to an explicit unknown state, never a success state. API errors are reduced to allow-listed user messages. The UI does not deserialize or expose access tokens, proof storage keys, proof URLs, checksums, passwords, provider secrets or raw invitation tokens. Stripe and PayHere are future architecture only and have no current-release UI or simulated adapter path.

## G. Accessibility and responsive implementation

The new surfaces use semantic controls, associated labels, field-level errors, live status regions, dialog labelling, visible focus treatment and keyboard-operable native controls. Queue rows have a small-screen card projection and the form/detail layouts collapse for narrow viewports. Component tests cover key error, permission and state projections. A complete keyboard/screen-reader and 360 px/tablet/desktop browser acceptance pass still requires the controlled E2E environment and is not claimed here.

## H. Automated verification

| Gate | Result |
|---|---|
| Baseline install | PASS - `npm ci` |
| Baseline production build | PASS - five pre-existing component style-budget warnings |
| Baseline Angular suite | PASS - 420/420 |
| Final production build | PASS - no new warning class; same five pre-existing style-budget warnings |
| Strict application TypeScript | PASS - `npx.cmd tsc -p tsconfig.app.json --noEmit` |
| Strict spec TypeScript | PASS - `npx.cmd tsc -p tsconfig.spec.json --noEmit` |
| Final Angular suite | PASS - 62 files, 453/453 tests, 0 failed |
| Changed-file `git diff --check` | PASS |
| Backend complete solution after projection correction | PASS - 1,460/1,460, 0 failed |

The frontend adds 33 passing tests over baseline. There is no configured lint script; strict compilation, production build and the full test suite are the available frontend static/automated gates.

## I. Real-browser E2E status

`qa-dashboard/manual-payment.e2e.spec.mjs` uses the repository's existing Playwright configuration and real application/API path. It defines 20 scenarios covering paid creation, secure recipient access, submission, stable-key replay, queue/detail, private proof, approval-to-pending-activation, separate activation, rejection, information/correction/history, stale review conflict, permissions, expired access, unsafe evidence, notification resend, tenant isolation, activation retry, invitation resend and the complete lifecycle.

Execution without `FLOW4_E2E_ENABLED=true` and the required fixture variables produced **20 discovered, 20 skipped, 0 passed**. This is reported as **BLOCKED BY ENVIRONMENT**, not success. No browser state mutation, route fulfilment, HTTP response mocking or fake payment provider is used.

## J. Live environment evidence and blockers

No `FLOW4_*` variables were present. Repository configuration inspection, without printing secrets, found the following required settings empty: Blob connection string, ClamAV host, payment-access base URL, Tenant Admin app base URL, manual payment instructions/support details, and Azure Communication Email endpoint/connection/sender address. Therefore the following evidence could not truthfully be produced:

1. Full 20-scenario browser pass against isolated PostgreSQL and the production Angular build.
2. Keyboard/screen-reader and 360 px/tablet/desktop browser acceptance artifacts.
3. Live private Blob upload/download and cross-tenant denial.
4. Live ClamAV clean/malicious/unavailable behavior.
5. Live payment and invitation email delivery/retry.
6. Public payment-access and Tenant Admin URL routing.

## K. Release decision

**Angular implementation and automated verification: GO. Overall Flow 4 production release: NO-GO.**

The remaining blockers are environment-owned validation gates, not permission to substitute mocks. Production can be reconsidered only after all 20 real-browser scenarios and live Blob, ClamAV, email and public-URL checks pass with retained artifacts.

## Related

- [[FLOW_4_CREATE_TENANT_WIZARD_IMPLEMENTATION_EVIDENCE_2026-08-04]]
- [[FLOW_4_MANUAL_PAYMENT_BACKEND_IMPLEMENTATION_EVIDENCE_2026-08-04]]
- [[../05_BACKEND_ARCHITECTURE/FLOW_4_MANUAL_PAYMENT_AND_FUTURE_IPG_ARCHITECTURE]]
- [[../10_TESTING_QA/FLOW_4_CREATE_TENANT_WIZARD_TEST_MATRIX]]
