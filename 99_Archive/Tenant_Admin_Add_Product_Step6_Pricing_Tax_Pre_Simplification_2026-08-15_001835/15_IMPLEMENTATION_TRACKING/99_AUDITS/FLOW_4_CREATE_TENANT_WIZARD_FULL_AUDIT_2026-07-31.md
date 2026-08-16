<!-- title: Flow 4 Create Tenant Wizard Full Audit 2026-07-31 -->
<!-- status: Complete -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-04 -->

# Flow 4 — Create Tenant Wizard Full Audit — 2026-07-31

## Executive conclusion

The current product has a substantial one-shot tenant creation foundation, but it does not implement the newly approved Flow 4. The present Angular page uses a different seven-step order, has no durable draft/resume model, omits required contacts, hard-codes Sri Lanka/LKR preferences and cannot orchestrate payment links or email delivery. The backend also falls back to `LKR` and `Asia/Colombo`. Its transaction creates most core rows, but finalization is not idempotent and audit/capacity-counter writes happen after the transaction. The database contains useful payment-link and transaction structures but no onboarding draft/operation/outbox aggregate. Documentation previously mixed current implementation, approved lifecycle and target behavior.

The new canonical document set resolves the product/architecture contradictions. Implementation may begin against it; release is not ready.

## Scope and method

Read and cross-checked the active Second Brain release scope, platform tenant journeys (management, create, billing, activation, email), platform/subscription technical contracts, access-control catalog, tenant/subscription table references, Angular state/form/testing guidance, prior status audits, and archived material only where it explained a conflict. Inspected the active Angular page/model/mapper/validators/API service/route/tests; backend controller, DTOs, validator, service, repository, domain entities/configurations, migrations and relevant tests; and PostgreSQL-oriented schema constraints represented by EF configuration/migrations.

## Evidence inventory

| Area | Principal evidence | Finding |
|---|---|---|
| Existing journey | `04_Create_Tenant_Wizard_Flow.md`, `16_Platform_Tenant_Create_Wizard_Alignment.md` | Old order and one-shot create; now superseded |
| Lifecycle/email | `11_Tenant_Activation_Flow.md`, `18_Tenant_Onboarding_Email_Flows.md` | Paid gate and trial/demo behavior approved; delivery/payment link incomplete |
| Billing | `10_Billing_Flow.md`, subscription module contracts | Billing reads/mutations exist; payment-link onboarding unsupported |
| Access | `Permission_Code_List.md`, `PlatformPermissionCodes.cs` | Existing permission vocabulary is sufficient |
| Angular | `platform-create-tenant-page.ts`, create models/mapper/validators/service/specs | Functional old form; missing canonical steps/drafts/contacts/operations |
| API | `PlatformAdminTenantsController.cs` | Create-options and final POST only for creation |
| Application | `PlatformTenantService.Wizard.cs` | Creates core aggregate and lifecycle; multiple security/atomicity gaps |
| Persistence | `PlatformTenantRepository.Wizard.cs`, entity configs/migrations | Core tables exist; no draft/operation; transaction excludes later writes |
| Tests | wizard unit/integration/controller + Angular specs | Useful regression coverage; canonical P0 flows absent |

### Second Brain decision inventory

Paths are relative to the Second Brain root. “Code conflict” means current code differs from the document/approved target; it does not make code authoritative.

| Document / section | Existing decision | Implementation / validity | Conflict | Action |
|---|---|---|---|---|
| `01_RELEASE_SCOPE/Included_Features.md` / payment links | Payment link is R1 | Not implemented end to end; valid requirement | Code gap | Keep; link readiness blocker |
| `01_RELEASE_SCOPE/Release_1_Scope.md` / tenant platform scope | Platform tenant/subscription control in R1 | Broadly supported; valid | None material | Keep |
| `02_ACCESS_CONTROL/Permission_Code_List.md` / platform tenant/billing/audit | Feature permissions, not fixed roles | Catalog exists; valid | None | Keep and map |
| `02_ACCESS_CONTROL/API_Authorization_Rules.md` | Backend enforcement mandatory | Current base create check exists; conditional checks incomplete | Code gap | Keep/update matrix |
| `03_USER_JOURNEYS/Platform_Admin/03_Tenant_Management_Flow.md` / lifecycle/concurrency/audit | Approved post-create detail/lifecycle rules | Mostly current; valid | Audit architecture nuance | Keep; cross-link canonical Flow 4 |
| `.../04_Create_Tenant_Wizard_Flow.md` / implemented steps | Old seven-step one-shot flow | Accurately describes old code; invalid as future authority | Approved flow conflict | Deprecate/supersede |
| `.../10_Billing_Flow.md` / unsupported | Payment-link generation absent | Matches code; valid status | Requirement remains | Keep |
| `.../11_Tenant_Activation_Flow.md` / paid/trial/demo | Paid gated; trial/demo auto | Matches lifecycle service; valid | Delivery not implemented | Keep/merge into canonical |
| `.../12_Subscription_Billing_Management_Flow.md` | Billing domain separated from tenant lifecycle | Valid architecture | Some wizard DTO fields blur states | Keep; enforce server authority |
| `.../16_Platform_Tenant_Create_Wizard_Alignment.md` | Old request/persistence alignment | Useful implementation evidence; outdated authority | Approved steps/drafts conflict | Deprecate/supersede |
| `.../17_Platform_Tenant_Detail_Entitlements_Alignment.md` | Post-create entitlement editing/concurrency | Reusable and valid | None | Keep |
| `.../18_Tenant_Onboarding_Email_Flows.md` | Hash-only setup link and delivery timing | Approved; delivery missing | Placeholder code conflicts | Keep/merge security rules |
| `03_USER_JOURNEYS/Tenant_Admin/01_Pre_Login_Payment_Trial_Demo_Flow.md` | Pre-login lifecycle expectations | Valid related consumer flow | Payment/email gaps | Keep/cross-reference |
| `04_MODULE_KNOWLEDGE/01_Platform_Administration/03_Technical_Contract.md` / tenant create | Existing API and validation | Largely accurate current baseline | Generic audit wording vs history bridge | Update later from canonical API |
| `04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/02_Functional_Rules.md` | Server controls subscription/billing | Valid | Current client-supplied statuses | Keep; code must align |
| `.../03_Technical_Contract.md` / target billing APIs | Provider-neutral target | Valid but not proof of completion | Current gap | Keep |
| `.../04_Platform_Billing_Functional_Specification.md` | Invoice/payment controls | Reusable | Onboarding orchestration absent | Merge via canonical contract |
| `05_BACKEND_ARCHITECTURE/API_ENDPOINTS.md` / platform tenants | Current route inventory | Create-options/final create only | Missing draft API | Update when implemented; canonical contract now controls target |
| `06_DATABASE_KNOWLEDGE/Tables/02_Tenant_Foundation_UPDATED.md` | Current tenant/profile/address/domain schema | Valid current model | Missing contacts/reg-tax/drafts | Keep; field matrix adds target delta |
| `.../05_Subscription_Billing_Payments_And_Usage_UPDATED.md` | Payment link/transaction tables | Valid schema | Workflow not implemented; idempotency config mismatch to verify | Keep/update on migration |
| `07_UI_UX_KNOWLEDGE/Empty_Error_Loading_States.md` | Standard state handling | Valid and partially used | Missing draft/conflict states | Keep/apply |
| `07_UI_UX_KNOWLEDGE/Platform_Admin_UI_Rules.md` | Responsive/permission UI rules | Valid | Canonical wizard incomplete | Keep/apply |
| `09_ANGULAR_ADMIN_KNOWLEDGE/Angular_Form_Validation_Guide.md` | Typed/reactive validation pattern | Valid and used | Cross-step server rules missing | Keep/apply |
| `.../Angular_State_Management.md` | State principles | Valid | Current wizard local-only | Keep/apply |
| `.../Angular_Testing_Scope.md` | Angular test expectations | Valid | E2E evidence absent | Keep/apply |
| `.../Tenant_Wizard_State.md` | Older SCS-TIX state model | Already historical | Linked old active source | Update replacement link |
| `10_TESTING_QA/Idempotency_Test_Cases.md` | Retryable creates/payments need idempotency | Valid | Wizard final create violates it | Keep/extend through matrix |
| `12_INTEGRATIONS/Email_Architecture_And_Provider_Decisions.md` | Provider-neutral email/outbox architecture | Valid | Wizard not connected | Keep/apply |
| `12_INTEGRATIONS/Email_Event_And_Template_Catalog.md` | Approved event/template naming | Valid | Missing emissions | Keep/apply |
| `14_AI_DEVELOPER_PROMPTS/Angular/03_Tenant_Wizard_Prompt.md` | Old build prompt | Outdated | Approved flow conflict | Deprecate/supersede |
| prior `15_IMPLEMENTATION_TRACKING/99_AUDITS/...` wizard/payment reports | Historical gap/evidence | Useful chronology | Mixed dates/status | Keep historical; canonical audit supersedes decisions |
| `99_Archive/**` related files | Archived legacy scope/contracts | Not current authority | Frequently conflicts with MVP | Keep archived; do not merge decisions |

Search also found many tenant-admin operational journeys mentioning tenant creation only as a precondition; they contain no Flow 4 decision and were classified **Keep / not controlling**. This prevents keyword matches from being mistaken for onboarding requirements.

## Current implementation map

### Angular

Route `/admin/tenants/create` is guarded by `platform.tenants.create`. Current steps are Business Info; Plan Selection; Limits & Add-ons; Feature Entitlements; Tenant Admin; Billing & Subscription; Review & Create. State exists only in signals/reactive forms. It fetches create options and submits one final POST, then navigates to tenant detail.

Strengths: reactive validation, loading/error retry, field-error mapping, responsive stepper, plan/add-on/feature presentation, review and unit tests.

| Frontend element | Evidence | Classification | Canonical action |
|---|---|---|---|
| Route/permission guard | `admin.routes.ts` `/tenants/create`, create permission | Partially implemented | Keep base route/guard; add draft/list/CanDeactivate routes |
| Seven-step shell/stepper | `platform-create-tenant-page.ts` | Outdated/incorrect | Rename/reorder exact steps; absorb limits/add-ons |
| Typed form/state model | create page + `platform-tenant-create.model.ts` | Partially implemented | Preserve reactive approach; split canonical named sections/version state |
| Validators/server errors | validator file/page field map | Partially implemented | Add complete bounds/cross-step paths/422 and 409 handling |
| Options/API integration | tenant API service/mapper | Partially implemented | Reuse service style; add defaults/revision/draft/operation methods |
| Draft/resume/progress | No route/model/service | Missing | Implement server-backed facade/list/resume/autosave |
| Navigation guard/concurrency | No CanDeactivate/ETag | Missing | Add dirty guard and compare/reload conflict flow |
| Billing/payment operation | Current form submits fields only | Not connected to backend workflow | Implement pending/result polling/retry; never collect card data |
| Permissioned overrides | Base route only | Incorrect | Add conditional entitlement/billing controls; backend remains authoritative |
| Responsive/accessibility | Wrapping CSS/ARIA labels present | Partially implemented | Add semantic state, focus/error summary and viewport evidence |
| Loading/empty/retry | Options loading/error present | Partially implemented | Add skeleton, no-plan blocker, autosave/operation retry states |
| Tests | page/mapper/validator/service/route specs | Partially implemented/outdated | Retain regression value; rewrite expectations to canonical matrix |

Gaps:

- Wrong names/order versus the approved sequence.
- No draft create/list/load/save/discard, autosave, progress authority, resume route, dirty-navigation guard, ETag or idempotency key.
- No primary/billing/support contacts, website, complete address, explicit slug/subdomain or duplicate check.
- `resolveDefaultCountryCode` prefers `LK`; `resolveDefaultCurrency` prefers `LKR`.
- Optional catalog feature override is effectively unavailable because selections are constrained to plan-included features.
- UI explicitly states invitation email delivery is not wired.
- Mapper includes a temporary-password-shaped property even though it sends `sendInvite: true`; remove the dangerous field from the contract.

### Backend/API

`GET /api/v1/platform-admin/tenants/create-options` and `POST /api/v1/platform-admin/tenants` require the create permission. The service validates plan/catalogs, tenant code, features, add-ons, limits, business type and tenant admin; resolves lifecycle by paid/trial/demo; and builds tenant, profile/address, subscription/history, entitlements, add-ons, administrator role/grants/user/invite, and optional invoice/lines.

Strengths: permission check; active-catalog validation; server-side price/limit/entitlement resolution; database transaction for most core rows; approved tenant lifecycle values; no intentional plaintext temporary password path.

Critical gaps:

- No draft/resume/progress/duplicate/operation/retry API.
- `PlatformTenantService` also embeds `LKR` and `Asia/Colombo` fallbacks, so fixing the Angular resolver alone would not make defaults server-configurable.
- Final POST has no idempotency key or optimistic concurrency.
- `TenantUserEmailExistsAsync` computes a normalized email but queries globally using the raw email. This conflicts with the DB unique key `(tenant_id, email)` and incorrectly blocks cross-tenant membership.
- Tenant slug is derived directly from lowercased code; requested domains are not created.
- Registration/tax values are accepted but not persisted; Angular does not send `PrimaryContact`; website/contact sections are missing.
- Tenant-admin invitation uses `Guid.NewGuid().ToString("N")` as a placeholder token hash and a fixed seven-day expiry. It is not a cryptographic token/hash delivery workflow and it is created too early for a paid tenant that may wait in `PENDING_PAYMENT`.
- Create transaction commits before `AddAuditLogAsync` and capacity-counter seeding. A later failure returns an error although a tenant already exists, making retry duplication possible.
- Audit sequence uses row count plus one and can collide under concurrency.
- External payment-link/email orchestration is absent.
- Error mapping treats most unrecognized application errors as 403, blurring server failures and validation.
- Client can supply billing/subscription statuses that should be server derived under the canonical policy.

| Backend element | Evidence | Classification | Canonical action |
|---|---|---|---|
| Create-options endpoint/service/repository | Current tenant controller/service/repository | Partially implemented/reusable | Move bounded projection under onboarding group; add defaults/revision/metadata |
| One-shot final create | controller + wizard service/repository | Partially implemented/unsafe | Compatibility facade only; replace with draft finalization UoW |
| DTO/validator | create DTOs/static validator | Partially implemented/incorrect | Remove password/client statuses; add partial/final validators |
| Plan/add-on/entitlement resolution | wizard service/catalog repositories | Partially implemented/reusable | Reuse authoritative calculations; add dependency/override policy |
| Draft/list/resume/delete | No entity/API/repository | Missing | Add one aggregate and endpoint group |
| Duplicate advice/final enforcement | Tenant-code precheck + DB indexes | Partially implemented | Add advisory classifier; keep constraints as authority |
| Billing/invoice | Invoice/line creation path | Partially implemented | Server-derived paid invoice; payment link/outbox/callback lifecycle |
| Tenant admin/role/grants | Wizard service/write model | Partially implemented | Keep membership bootstrap; remove premature mock invite |
| Activation | Existing lifecycle service/controller | Partially implemented/reusable | Add ETag/idempotency/UoW/invitation request |
| Audit | Subscription-history projection + post-commit append | Incorrect for finalization | Transactional structured events and atomic sequencing |
| Idempotency/concurrency | Tenant update timestamp only | Missing for onboarding | Draft version, row lock, receipt and command keys |
| Email/payment external work | ACS abstraction exists; onboarding adapters absent | Missing/not connected | Shared outbox consumers; no external call inside UoW |
| Tests | Wizard/lifecycle/repository/controller tests | Partially implemented/outdated | Preserve regression tests; add P0 PostgreSQL/fault/security cases |

### Database/PostgreSQL

Existing structures cover tenant/profile/address/domain, subscription/add-ons/history, entitlements, invoices/lines, payment links/transactions, usage counters, users/roles/invites. Unique constraints protect tenant code, slug, domain, tenant-feature, subscription-add-on and tenant-local user email. `tenants.updated_at` is an EF concurrency token.

Gaps: no draft, onboarding-operation or outbox aggregate; no completion receipt/finalize idempotency; no canonical billing/support contact persistence; registration/tax profile fields are absent from the current model after having been removed by the July 7 migration; no unique payment idempotency index in current EF configuration; no RLS; no atomic audit sequence. Payment tables prove schema availability, not implemented onboarding behavior. `subscription_payment_links.payment_url` is sensitive operational data and must be access-controlled/redacted even though raw card data is never stored.

### Tests and operational evidence

Current wizard-related tests cover validators, service branches, controller behavior, repository create options and invoice lines. Angular page/mapper/validator specs exist. The independent project validation reported passing broad backend and Angular unit suites, but it also found no credible current end-to-end browser pass. None of the missing workflows can be inferred from unit coverage.

### 2026-08-04 validation addendum

- Re-read the current Angular create page/model/mapper/service/validators/routes and confirmed the old order, local-only state, `LK`/`LKR` resolver preferences and lack of draft/operation APIs remain.
- Re-read `PlatformTenantService.cs` and `.Wizard.cs`: `DefaultBaseCurrency = "LKR"` and `DefaultTimezone = "Asia/Colombo"` are backend hard-codes; `TenantSubscription` also has `LKR`/monthly construction defaults and its EF mapping defaults billing cycle to monthly. The service still creates a placeholder invite hash before paid activation, accepts client billing/subscription statuses, and performs audit/counter writes after repository commit.
- Re-read the repository and EF configurations: admin email is queried globally using raw input although the database unique key is tenant-local; payment transactions expose an idempotency property but have no unique idempotency index; no durable outbox was found.
- Verified migration lineage: `20260702182515_AddTenantCreateWizardSupport` added profile registration/tax columns and `20260707185919_UpdateTenantAuthAndFoundationEntities` removed them. The current entity/configuration/snapshot do not support those fields, so implementation must add a new forward migration rather than edit history.
- Reconciled the canonical pack with the approved activation-only set-password email: tenant-admin membership is created at finalization, while setup-token generation is an activation-eligible worker action. Paid pending-payment tenants have no live setup token.
- Verification on 2026-08-04: `npm test -- --watch=false` passed 54 files/420 tests; the focused backend command filtering wizard validator/service, create-mode, lifecycle and permission tests passed 80/80. These prove the existing baseline remains green, not the missing canonical workflows.

## Conflict register

| Topic | Conflicting evidence | Resolution |
|---|---|---|
| Seven steps | Existing UI/docs vs user-approved order | Canonical order wins |
| Draft meaning | `tenants.status=DRAFT` vs partial input | Separate draft aggregate; lifecycle value retained |
| Paid activation | Some old notes imply creation/activation together | Paid remains pending payment, then pending activation, then manual activation |
| Trial/demo | Earlier manual activation variants | Auto-activate after successful provisioning |
| Payment links | Tables/entities exist; journeys say not implemented | Schema ready, workflow not implemented |
| Audit | Tenant history used as audit; generic audit contract says absent | Document current bridge and require transactional structured events |
| Email uniqueness | App global check; DB tenant-local key | Tenant-local canonical policy |
| Defaults | Angular `LK`/`LKR`; catalog-driven architecture | Server-configured defaults only |
| Backend defaults | Service/domain/EF `LKR`, `Asia/Colombo`, monthly fallbacks; multi-region/catalog rule | Remove runtime geographic/commercial fallbacks; require configured/plan values |
| Invite security | Approved hash-only link; code placeholder hash | Secure token service/outbox required |
| Invite timing | Wizard creates invite before paid activation; email SOT permits setup link after activation | Membership at finalize; token issuance only after activation eligibility |
| Transaction | Core writes atomic; later audit/counters non-atomic | Expand final boundary and use outbox |

## Gap severity and implementation priority

| Priority | Gap | Why it matters | Required proof |
|---|---|---|---|
| P0 | Draft/resume/version persistence and APIs | Core approved UX/data-loss prevention | PostgreSQL concurrency + Angular resume E2E |
| P0 | Finalize idempotency and full transaction | Prevent duplicate/partial tenants | fault-injection and replay tests |
| P0 | Secure invite token and outbox delivery | Credential/security boundary | token-at-rest/log inspection and resend tests |
| P0 | Canonical seven-step forms and complete persistence | Product correctness | field/table integration and E2E |
| P0 | Paid payment-link/lifecycle orchestration | Approved R1 paid onboarding | callback/idempotency/lifecycle E2E |
| P0 | Remove hard-coded locale/currency defaults | Multi-region correctness | unit/E2E with alternate/null defaults |
| P0 | Fix email uniqueness and audit sequencing | Correctness/concurrency | cross-tenant + concurrency tests |
| P1 | Duplicate warning service | Operator safety | classification/privacy tests |
| P1 | Optional entitlement overrides | Plan exception workflow | auth/prerequisite/expiry tests |
| P1 | Accessibility/responsive polish | Usability/compliance | keyboard/screen-reader/viewport evidence |

## Documentation changes made

- Created canonical spec, decision register, field-to-table matrix, API contract, permission matrix, test matrix and implementation readiness report.
- Marked the two old active wizard documents and Angular wizard state/prompt as superseded or historical, pointing to the canonical spec.
- Added canonical links to source-of-truth and feature-status indexes.
- No production code, database migration or runtime configuration was changed by this audit.

## Audit verdict

Documentation readiness: high after this audit. Current-code conformance: partial. Release readiness: no. Implementation can safely start because the canonical business, data, permission, API, concurrency, lifecycle and test decisions are explicit.

## Related

[[../../03_USER_JOURNEYS/Platform_Admin/FLOW_4_CREATE_TENANT_WIZARD_CANONICAL_SPEC]] · [[FLOW_4_CREATE_TENANT_WIZARD_IMPLEMENTATION_READINESS]]
