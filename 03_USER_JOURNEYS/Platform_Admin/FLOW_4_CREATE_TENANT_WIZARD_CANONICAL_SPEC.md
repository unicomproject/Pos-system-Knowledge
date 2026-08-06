<!-- title: Flow 4 Create Tenant Wizard Canonical Specification -->
<!-- status: Canonical -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-04 -->

> Implementation status (2026-08-04): Backend runtime implemented and verified at `db9d579`. Durable drafts/finalization, manual payment access/submission/review/history, private scanned evidence, notification retry, payment-to-pending-activation, separate activation and invitation resend are live. Angular manual-payment surfaces and canonical browser E2E remain. See [[../../05_BACKEND_ARCHITECTURE/FLOW_4_MANUAL_PAYMENT_AND_FUTURE_IPG_ARCHITECTURE]] and [[../../15_IMPLEMENTATION_TRACKING/FLOW_4_MANUAL_PAYMENT_BACKEND_IMPLEMENTATION_EVIDENCE_2026-08-04]].

# Flow 4 — Create Tenant Wizard Canonical Specification

## Authority

This is the implementation source of truth for Platform Admin tenant onboarding. It supersedes [[04_Create_Tenant_Wizard_Flow]], [[16_Platform_Tenant_Create_Wizard_Alignment]], [[../../09_ANGULAR_ADMIN_KNOWLEDGE/Tenant_Wizard_State]], and the tenant-wizard sections of the old Angular prompt. Existing code is evidence, not authority, where it conflicts with this specification.

## Goal, actor, entry and exit

- Actor: authenticated Platform Admin with `platform.tenants.create`.
- Entry: `/admin/tenants/create`; resume may enter `/admin/tenants/create/{draftId}`.
- Success exit: tenant detail with a durable creation receipt and lifecycle/provisioning status.
- Cancel exit: return to tenant list; preserve an existing saved draft unless the actor explicitly discards it.
- No tenant-scoped login is created for the Platform Admin.

## Required seven-step sequence

The order and names are fixed:

1. Tenant Basic Details
2. Business & Contact Information
3. Subscription Plan
4. Billing / Payment Setup
5. Feature Entitlements
6. Tenant Admin User
7. Review, Create & Activation

Limits and add-ons are part of steps 3 and 5; they are not separate steps.

## Wizard-wide behavior

- A draft is created on the first successful save and receives a server-generated `draftId`, opaque `version`, status, timestamps, owner and expiry.
- Autosave is debounced after valid field changes; explicit **Save draft** is always available. A failed autosave must remain visible and retryable.
- Completion is server-calculated per step from canonical validation rules. The client may preview it but cannot authoritatively mark a step complete.
- Resume restores the exact saved payload, step, completion map and latest version. Drafts are listed for their owner; users with `platform.tenants.update` may view/edit any draft.
- Draft retention defaults to 30 days from the latest save and is configurable in platform settings. Expired drafts are soft-expired, then purged by retention policy. A user can discard a draft with confirmation.
- Navigation to a later step is allowed for review, but finalization is blocked until every required step is complete. Back navigation never drops data.
- Leaving with unsaved changes triggers a route/browser warning. Saved drafts do not trigger the warning.
- Lookup defaults come from `create-options.defaults`; the client must not prefer `LK`, `LKR`, a locale or timezone in source code.
- All dates use ISO 8601 UTC. Money is decimal plus ISO-4217 currency; phone input is normalized to E.164 when possible.
- Step completion is `floor(100 * completedRequiredSteps / 7)`, yielding `0, 14, 28, 42, 57, 71, 85, 100`. A step counts only when its server-side completion predicate passes; warnings do not reduce completion. The server returns both the completed-step set and percentage.
- Manual **Save draft** accepts a partially valid section and returns field diagnostics without discarding the saveable fields. Autosave runs only after local syntax validation; finalization always runs complete DTO, domain, permission, catalogue and duplicate validation.
- The first draft is created when the actor first selects **Save draft**, successfully leaves Step 1 with valid required Step 1 values, or a debounced autosave first succeeds—whichever occurs first. Merely opening the route creates no row.

## Step 1 — Tenant Basic Details

Fields:

| Field | Required | Rule |
|---|---:|---|
| Display name | Yes | 2–200 trimmed characters |
| Legal name | Yes | 2–200 trimmed characters |
| Tenant code | Yes | Server suggests from name; editable; uppercase `A-Z0-9-`, 3–60; globally unique after normalization |
| Tenant slug | Yes | Server suggests from name; editable; lowercase DNS label, 3–100; globally unique |
| Requested subdomain | No | DNS label; resolved against configured platform base domain; resulting domain globally unique |
| Registration number | No | Max 100; duplicate is a warning, not a blocker |
| Tax number | No | Max 100; duplicate is a warning, not a blocker |
| Business type | Yes | Active catalog value |
| Operating mode | Yes | Server-supplied catalog value |
| Base currency | Yes | Active currency catalog value |
| Timezone | Yes | Server-supplied IANA timezone |
| Locale | Yes | Server-supplied supported locale |

Duplicate checks are advisory while typing and authoritative at finalization. Strict conflicts are tenant code, slug and full domain. Similar names, registration/tax numbers, primary contact and admin email produce clearly labelled warnings except where the current identity policy blocks an email; the final DB constraint remains authoritative.

Completion: all required fields above resolve to active server options, strict identifier syntax passes, and no known blocking duplicate exists. A warning can be saved and reviewed but does not complete an invalid identifier.

## Step 2 — Business & Contact Information

Capture registered address (line 1 required; line 2, city, province/state, postal code optional; country required), primary contact (name, email and phone required), website (optional HTTPS URL), billing contact (defaults from primary contact but remains editable), billing address (defaults from registered address), and support contact (optional). Copy controls copy current values once and do not permanently link the sections.

Email must be syntactically valid and normalized. Country-specific postal and phone validation is driven by server metadata; unsupported countries use conservative length/character validation. Never infer country from currency.

Completion: registered address, required primary-contact fields and every populated optional contact/address pass validation. Billing contact and address may be omitted only when their explicit `sameAsPrimary`/`sameAsRegistered` flags are true; the server materializes snapshots at finalization rather than storing linked form aliases.

## Step 3 — Subscription Plan

- Load active plans, prices, billing interval, included modules/features, base limits and compatible add-ons from the server.
- User selects exactly one plan and a subscription type: `PAID`, `TRIAL`, or `DEMO`.
- The commercial billing cycle is selected here because it determines the authoritative price. Step 4 displays it read-only; changing it returns the actor to Step 3 and refreshes price/dates.
- Add-ons and quantities must be compatible with the plan. Effective limits are calculated by the server; the client displays the calculation.
- Manual capacity reductions may be accepted within the computed ceiling. Increases above plan plus add-ons require an explicit entitlement override in step 5 and `platform.tenants.entitlements.update`.
- Changing the plan re-evaluates billing, add-ons, entitlements and completion. Removed or invalid selections are shown before the user confirms their removal.

Completion: one active plan, one supported subscription type, a plan-supported billing cycle, and compatible add-on quantities are selected; server-derived price, currency, dates, limits and included features have been refreshed against the current catalogue revision.

## Step 4 — Billing / Payment Setup

Fields depend on subscription type. The Step 3 billing cycle is displayed, while invoice email, tax, discount, start/renewal dates and auto-renew are configured and server validated. The plan currency is authoritative for subscription charges; any mismatch with tenant base currency is displayed.

- `PAID`: create and issue the authoritative invoice at finalization. For a prepaid plan, the tenant begins `PENDING_PAYMENT` and payment begins `AWAITING_PAYMENT`. The durable outbox queues a payment-required notification with separate `invoiceUrl` and secure `paymentStatusUrl`; `checkoutUrl` is null for the current manual-payment release. An authorized, versioned and idempotent manual approval or approved waiver moves the tenant only to `PENDING_ACTIVATION`.
- `TRIAL`: no payment link. Validate trial dates and limits; tenant may auto-activate only after transactional provisioning succeeds.
- `DEMO`: no payment link. Apply configured demo dates/limits; tenant may auto-activate only after transactional provisioning succeeds.
- Waiver requires `platform.billing.manage`, a non-empty reason and audit event. The actor cannot submit arbitrary billing/subscription statuses.
- Provider callbacks are a future Stripe/PayHere extension. They require signature verification and event deduplication and update payment records through the provider-neutral application command, never `tenants.status` directly. They are not simulated in the manual-payment release.
- Billing address/contact are immutable snapshots for the created billing account/invoice; copying from Step 2 is a UI convenience. No PAN, CVV, magnetic-stripe data or provider secret is accepted or stored. `paymentMethod` is a provider-neutral method code or invoice/manual option from create-options, never card data.

Completion: `PAID` has invoice email, billing address, billing cycle and an allowed payment method; invoice/manual terms satisfy policy. `TRIAL`/`DEMO` have valid configured start/end dates and no payment-only fields. Any waiver or protected discount has the required permission and reason.

## Step 5 — Feature Entitlements

The platform feature catalogue defines sellable capabilities. Plan/add-on rows define commercial inclusion. Tenant entitlement rows define the tenant's effective contractual capability. Feature flags are operational rollout switches evaluated separately and are not editable in this wizard. Permissions govern what an authenticated user may do inside an enabled capability and are assigned through role/permission flows, not Step 5.

- Plan-included features are selected and locked unless the plan contract permits exclusion.
- Add-on features are derived from selected add-ons.
- Optional catalog features may be selected only when compatible with the plan and prerequisites.
- Overrides require `platform.tenants.entitlements.update`, an expiry or explicit permanent flag, and a reason.
- Backend resolves IDs/codes, validates active catalog rows, prerequisites and plan compatibility, then persists one effective entitlement per tenant/feature.
- Hidden UI is not authorization. Unauthorized selections return 403; invalid combinations return field-level 422 errors.

Completion: the server can calculate exactly one effective row per feature, all mandatory/included features are retained, dependencies are satisfied, conflicts are absent, and every override contains its authorization, reason and expiry/permanent choice.

## Step 6 — Tenant Admin User

First name and email are required; last name and phone are optional. The server normalizes email and checks identity conflicts. The canonical policy permits the same email in different tenants because the database key is `(tenant_id, email)`; cross-tenant membership must not be rejected merely because the email exists elsewhere.

Finalization creates a tenant-local pending-invite user, bootstrap administrator role/permissions and role assignment. A setup invitation is requested only when the tenant becomes `ACTIVE`: by the trial/demo finalization transaction or the later paid activation transaction. The outbox worker then generates the cryptographic raw token in memory, revokes/replaces any prior active invite, stores only its strong hash, sends the raw-token URL, and clears it from memory. A paid tenant in `PENDING_PAYMENT` receives only the payment-required notification and has no live setup token. Never accept, generate, log, return or email a plaintext temporary password. Resend creates a new idempotent request, revokes/replaces the prior token and is rate limited.

Completion: required identity fields are valid, no same-tenant email/phone constraint is violated, the bootstrap permission catalogue is complete, and the invitation method is the fixed `SET_PASSWORD_LINK` method. Email verification occurs when the single-use link is redeemed; it is not a wizard prerequisite.

Handoff sequence: paid finalization queues `tenant.paid_created` with invoice/manual-payment instructions and a secure payment-status link, but no checkout or setup link. Manual payment approval/waiver reaches pending activation; authorized activation queues `tenant.paid_activated`/password setup. Trial/demo finalization atomically activates and queues two distinct business notifications—created information first, activated/password setup second. Delivery order is preserved per tenant by outbox aggregate sequence. A failed informational email does not prevent the later activation email; operation status exposes each result.

## Step 7 — Review, Create & Activation

- Show every field grouped by step, derived prices/limits/features, duplicate warnings, lifecycle outcome, and permission-controlled overrides.
- Each group has an **Edit** action returning to its step.
- The create button states the outcome: **Create and request payment**, **Create trial tenant**, or **Create demo tenant**.
- Require an idempotency key and latest draft version. Disable duplicate clicks but rely on server idempotency.
- No extra terms checkbox is required for R1 because no approved legal requirement exists. If introduced, it must be versioned and stored as consent evidence.

Completion: all seven server predicates pass, the displayed review is based on the latest saved version/catalogue revision, current warnings are acknowledged where required, and conditional override/waiver permissions still exist. Finalization remains blocked otherwise.

## Persistence and transaction boundary

Partial data lives in a dedicated `platform_tenant_onboarding_drafts` aggregate; it must not create partial production tenant rows. Finalization performs one PostgreSQL transaction containing tenant/profile/addresses/domain/contacts, subscription/history/invoice/lines, entitlements/add-ons/limits, tenant admin/role/permissions, capacity counters, onboarding operation, creation receipt/audit and outbox messages. Trial/demo finalization also records the setup-invitation request and activation email events. Paid finalization records no setup-token request; paid activation later records that request and activation event transactionally. Token material is generated only by the post-commit worker. Strict duplicate constraints are rechecked within each boundary.

External email, object-storage and future payment-provider calls never run inside the database transaction. Durable outbox consumers retry eligible work. Manual review commands transact only local payment/invoice/lifecycle/audit/outbox state. If finalization rolls back, no tenant is created. If an external call fails after commit, the tenant remains durable and the onboarding operation records a retryable failure; no duplicate tenant may be created.

## Lifecycle and operation states

Persisted `tenants.status` values remain exactly `DRAFT`, `PENDING_PAYMENT`, `PENDING_ACTIVATION`, `ACTIVE`, `SUSPENDED`, `CANCELLED` (database values are lowercase). `PAYMENT_FAILED`, `PROVISIONING`, and `ACTIVATION_FAILED` are operation/payment states, not tenant lifecycle values.

| Scenario | Final transaction result | Next transition |
|---|---|---|
| Paid | `PENDING_PAYMENT` | verified payment/waiver → `PENDING_ACTIVATION`; authorized activation → `ACTIVE` |
| Trial | Provisioned aggregate then `ACTIVE` | suspend/cancel by existing lifecycle rules |
| Demo | Provisioned aggregate then `ACTIVE` | suspend/cancel by existing lifecycle rules |
| Provisioning failure | Full rollback | draft remains editable; safe retry with same idempotency key |
| Delivery/provider failure | Tenant retained; operation failed/retryable | outbox retry or authorized manual retry |

### Tenant lifecycle transition contract

| State | Entry | Allowed actions / UI | Blocks | Exit / next state | Audit and retry |
|---|---|---|---|---|---|
| `DRAFT` | A complete tenant aggregate is created in draft mode by an internal provisioning operation; partial wizard input is not this state | Inspect provisioning; cancel; retry failed transaction from the separate wizard draft | Tenant login and paid activation | Trial/demo successful provision → `ACTIVE`; paid orchestration normally enters `PENDING_PAYMENT`; cancel → `CANCELLED` | State entry and result event; transaction failure rolls back rather than retaining a broken row |
| `PENDING_PAYMENT` | Prepaid paid tenant aggregate committed with invoice, `AWAITING_PAYMENT` record, secure access and outbox | View invoice/instructions, submit or review evidence, authorized waiver, resend notice, cancel | Activation and admin handoff | approved/waived → `PENDING_ACTIVATION`; cancel → `CANCELLED` | instructions/submission/review/waiver events; commands are concurrency protected and idempotent |
| `PENDING_ACTIVATION` | Paid payment verified/waived and provisioning complete | Authorized activate, inspect/retry delivery, cancel | Tenant login until activation | activate → `ACTIVE`; cancel → `CANCELLED` | pending/activated/failure events; activation command is idempotent |
| `ACTIVE` | Trial/demo provisioned or paid tenant activated | Normal tenant use, suspend, cancel under existing rules | Duplicate activation has no new effect | suspend → `SUSPENDED`; cancel → `CANCELLED` | activated/suspended/cancelled |
| `SUSPENDED` | Authorized suspension of active tenant | View, authorized reactivate/cancel | Tenant operations per suspension policy | reactivate → `ACTIVE`; cancel → `CANCELLED` | suspended/reactivated; concurrency protected |
| `CANCELLED` | Authorized cancellation | Read/audit only | Activation and mutation except approved recovery process | Terminal in R1 | cancellation reason required; no automatic retry |

`ARCHIVED` is not added: retention/archive is a data-management concern, not an R1 tenant lifecycle transition. `PAYMENT_FAILED`, `PROVISIONING`, and `ACTIVATION_FAILED` are displayed from operation/payment state with retry actions appropriate to their domain.

## Concurrency, idempotency and duplicates

- Every draft mutation supplies `If-Match` or `version`; stale writes return 409 with the latest version and no overwrite.
- Finalization idempotency is scoped to `(draft_id, idempotency_key)` and stores request hash plus result tenant ID. Same key/same hash returns the original response; same key/different hash returns 409.
- Unique indexes protect normalized tenant code, slug, domain and finalization key. Catch PostgreSQL unique violations and map them to stable field errors.
- Audit/history sequence generation must be atomic; never use `COUNT(*) + 1`.

### Duplicate-prevention rules

| Candidate | Normalization | Final rule | Draft/advisory behavior | Error/UI |
|---|---|---|---|---|
| Tenant code | Trim, collapse internal separator runs, uppercase | Globally unique across every retained tenant, including suspended/cancelled/archived rows | Same value in another live draft is a warning; it is not a reservation | 409 `duplicate_conflict`, “Tenant code is already reserved.” |
| Slug | Trim, lowercase, validate DNS label | Globally unique across every retained tenant | Same draft warning | 409 field error |
| Full domain | Lowercase IDNA/host normalization, remove trailing dot | Globally unique; verified/pending and retained inactive rows all reserve it | Same draft warning | 409 field error |
| Display/legal name | Unicode trim/collapse whitespace and case-fold for comparison | Not unique | Exact/similar match warning | Review acknowledgement; never exposes hidden tenant details |
| Registration/tax number | Trim, uppercase/case-fold, remove presentation spaces/hyphens only where country metadata says they are formatting | Not unique | Exact normalized warning | Review acknowledgement |
| Primary email/admin email | Trim; admin comparison uses current `TenantUser.NormalizeEmail` uppercase-invariant form while display casing may be preserved separately | Primary is not unique; admin is unique only inside the newly created tenant | Cross-tenant match warning at most; never blocks membership | Safe warning; same-tenant DB conflict 409 |
| Phone | E.164 where possible, otherwise normalized conservative form | Primary not unique; admin phone follows current tenant-local constraint | Warning | Safe masked warning |
| Billing account/contact | Tenant-owned rows | No cross-tenant uniqueness | No duplicate block beyond one active contact/address per type inside tenant | 422 for duplicate type |

Frontend checks are debounced advice only. Finalization normalizes again inside the transaction and relies on named PostgreSQL constraints to defeat races. R1 does not recycle strict identifiers from cancelled or archived/soft-retained tenants; an authorized future recovery process must rename/release them explicitly before reuse. Discarded/expired drafts release all advisory claims. Exact match details are returned only when the actor also has permission to view that tenant/draft.

## Draft lifecycle and resume rules

| Draft status | Entry | Allowed actions | Exit |
|---|---|---|---|
| `in_progress` | First successful save | Owner create permission: load/save/discard/finalize; update permission: load/save/discard any | `finalizing`, `discarded`, `expired` |
| `finalizing` | Finalize owns the row lock and idempotency tuple | Read status; exact-key replay; no edits | Rollback restores `in_progress`; commit sets `completed` |
| `completed` | Tenant/operation receipt committed | Read/replay receipt only | Retained by audit policy |
| `discarded` | Authorized discard | Read only for audit-authorized support; repeat discard is idempotent | Purge after retention |
| `expired` | Retention job sees `expires_at <= now()` | Read-only recovery metadata; authorized clone-to-new-draft may be offered | Purge after retention |

The draft owner is the authenticated Platform Admin that creates it. `created_by` and `updated_by` are explicit platform-user FKs. Resume emits an audit event once per user-initiated resume session, not on every polling GET. Draft list ordering is `updated_at DESC, id DESC`. Draft expiry is extended only by a successful content mutation, not by reads or failed saves. The UI keeps a local recovery copy only as a convenience; server state is authoritative and sensitive fields must not be persisted to browser storage.

## Error, retry and recovery contract

- 400 malformed envelope; 401 unauthenticated; 403 unauthorized; 404 unknown/inaccessible draft or catalog row; 409 stale version/idempotency/strict duplicate; 422 field or cross-step validation; 429 resend/rate limit; 500 unexpected failure.
- Responses use stable `errorCode`, `message`, `errors[]` with canonical field paths, `traceId`, and optional `latestVersion`/`retryable`.
- On validation failure retain state and focus the first invalid group. On 409 offer reload/compare; never silently overwrite. On network failure allow retry with the same idempotency key.

| Failure/race | Authoritative control | Server result | UI recovery |
|---|---|---|---|
| Double-click/browser/API-gateway final retry | Draft-scoped key+hash, locked draft, persisted receipt | One 201; exact replays 200 same tenant; changed hash 409 | Keep same key, show same result |
| Two editors save one draft | Atomic expected-version update | One 200/version+1; stale writer 409/no overwrite | Compare/reload, manually reapply local fields |
| Two finalizers or duplicate checks race | Named unique constraints inside finalize transaction | One tenant; loser 409 field conflict | Retain draft and return to conflicting field |
| Two actors activate | Tenant concurrency token, lifecycle row lock, activation command key | One transition/outbox request; other receives idempotent active result or 409 stale version | Refresh status; never repeat provisioning |
| Manual approval repeats or reviewers race | Payment row lock/version, command key+hash, payment state machine | One review transition; exact replay returns the result; stale/different request conflicts | Reload review; no duplicate invoice/lifecycle transition |
| Future webhook repeats/out-of-order | Adapter signature verification, unique provider event/key, shared payment state machine | Existing transaction/result returned; invalid regression rejected | Refresh operation; no duplicate invoice/transition |
| Database timeout before commit | Transaction rollback plus unknown-outcome receipt lookup by draft/key | Retryable 5xx; receipt lookup determines whether commit occurred | Retry same key only |
| Proof storage/notification timeout | Private storage boundary or outbox lease/retry | Tenant remains pending payment; submission/operation remains safely retryable | Keep stable submission key; refresh/retry without fake success |
| Email failure/crash around send | Outbox lease; worker generates a fresh token per attempt and revokes prior hash | Tenant retained; latest link only is valid; bounded retry/final failure | Show delivery warning/resend when authorized |
| Partial provisioning exception | Single local UoW | Full rollback, draft restored in progress | Correct input or retry same key |
| Catalogue/permission changes after save | Re-read current catalogue and permissions during validation/finalize | 409 catalogue change or 403 permission revoked | Refresh/reconfirm; draft preserved |

Retries use bounded exponential backoff with jitter and a configured maximum attempt count; values are operations configuration, not hard-coded business constants. A final external failure requires authorized manual retry or support action and records the safe failure code. No compensating deletion is used for a successfully committed tenant because provider/email work is deliberately post-commit.

## Accessibility and responsive behavior

- Keyboard-operable stepper with current/completed/error states exposed to assistive technology.
- Programmatic labels, descriptions and errors; error summary links to fields; focus moves to step heading or first error.
- Desktop uses stepper plus content/review panel. Tablet collapses the review panel. Mobile uses a compact progress header and one-column controls with persistent Back/Next actions.
- Loading skeletons must not shift controls; empty plan/catalog states explain the blocking dependency; permission-denied states do not reveal restricted values.

## Audit events

Required structured events: `tenant_onboarding.draft_created`, `draft_updated`, `draft_resumed`, `draft_discarded`, `duplicate_override_acknowledged`, `plan_selected`, `plan_changed`, `billing_configured`, `tenant.finalized_pending_payment`, `invoice.generated`, `payment.instructions_issued`, `payment.notification_queued`, `payment.notification_sent`, `manual_payment.submitted`, `submission_updated`, `review_started`, `approved`, `rejected`, `information_requested`, `resubmitted`, `entitlements_changed`, `tenant_admin_details_added`, `finalization_started`, `tenant.created`, `provisioning_started`, `provisioning.failed`, `activation_pending`, `activation.queued`, `tenant.activated`, `activation_failed`, `activation_retried`, `billing.waived`, `tenant_admin.invitation_requested`, `invitation_sent`, `invitation_failed`, `invitation_resent`. Store actor ID/type, UTC time, draft/tenant/payment/invoice correlation, entity type/ID, action, result, reason where required, changed field names or masked before/after values, trace/request/idempotency correlation, and source IP only where the platform already captures it. Never store tokens, token-bearing URLs, proof URLs/storage keys, passwords, full provider payloads, bank details or unnecessary PII.

## Four-layer validation matrix

| Field/group | UI | API DTO | Domain | Database | Blocking/error |
|---|---|---|---|---|---|
| Display/legal name | required, trim, 2–200 | same bounds | non-empty normalized | varchar(200)/required final | Step 1; `validation_failed` |
| Tenant code | uppercase pattern, async warning | required, `A-Z0-9-`, 3–60 | normalized strict duplicate check | varchar(60), global unique | Step 1/final; `duplicate_conflict` |
| Slug/domain | DNS pattern | length/pattern | base-domain resolution and strict duplicate | slug/domain unique indexes | Step 1/final; `duplicate_conflict` |
| Registration/tax | max 100 | trim/max | warning comparison only | nullable varchar(100), non-unique | Non-blocking warning unless malformed |
| Country/currency/timezone/locale/mode/type | server options | allowed catalog value | active-reference and cross-field checks | FK/check/length as applicable | Relevant step; `validation_failed` |
| Address/contact/website | required markers, email/phone/HTTPS | bounded syntax | normalize; country metadata rules | required final columns/FKs | Step 2; field paths returned |
| Plan/type/cycle/add-ons | option controls, positive quantity | IDs, enum, range | active/compatible, server price/limits | FKs, checks, unique pairs | Steps 3–4; `catalog_changed`/422 |
| Dates/tax/discount | range and ordering preview | decimal/date bounds | policy and cycle/type consistency | numeric precision/checks | Step 4; 422 |
| Entitlements/overrides | dependencies shown | distinct IDs/codes, reason fields | effective-set/prerequisite/permission evaluation | unique tenant/feature; override metadata | Step 5; 403 or 422 |
| Admin name/email/phone | name/email required | bounded email/phone | tenant-local identity policy | `(tenant_id,email)` unique | Step 6; 409 same tenant |
| Warning acknowledgements | review controls | known codes only | must match current warnings | receipt/audit evidence | Step 7; 422 |
| Draft version/idempotency | client preserves opaque values | valid header bounds | latest version and key/hash semantics | atomic version and unique key | Mutation/final; 409 |

All strings are trimmed; empty optional strings become null; identifiers are compared in their documented normalized case. UI rules improve feedback but cannot weaken API/domain/constraint enforcement.

## Acceptance gate

Implementation is complete only when the API, field/table, permission and test matrices linked below pass, PostgreSQL integration tests prove rollback/uniqueness/concurrency/idempotency, Angular E2E covers paid/trial/demo and resume, and no country/currency default is hard-coded.

## Related

- [[../../05_BACKEND_ARCHITECTURE/FLOW_4_CREATE_TENANT_WIZARD_API_CONTRACT]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/FLOW_4_CREATE_TENANT_WIZARD_FIELD_TO_TABLE_MATRIX]]
- [[../../02_ACCESS_CONTROL/FLOW_4_CREATE_TENANT_WIZARD_PERMISSION_MATRIX]]
- [[../../10_TESTING_QA/FLOW_4_CREATE_TENANT_WIZARD_TEST_MATRIX]]
- [[../../13_DECISIONS_AND_CHANGES/FLOW_4_CREATE_TENANT_WIZARD_DECISION_REGISTER]]
- [[../../05_BACKEND_ARCHITECTURE/FLOW_4_MANUAL_PAYMENT_AND_FUTURE_IPG_ARCHITECTURE]]
- [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/FLOW_4_CREATE_TENANT_WIZARD_FULL_AUDIT_2026-07-31]]
