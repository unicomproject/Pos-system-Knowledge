<!-- title: Flow 4 Create Tenant Wizard Implementation Readiness -->
<!-- status: Ready for Implementation -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-04 -->

> Runtime update (2026-08-04): implementation is in progress on dedicated runtime branches. Estimated executable readiness is 72%; builds, existing automated suites, snapshot verification, and representative PostgreSQL migration application pass. The current-release payment architecture is now manual verification, not a real gateway. Documentation alignment is complete and implementation may proceed; release remains NO-GO for the P0 items in [[../FLOW_4_CREATE_TENANT_WIZARD_IMPLEMENTATION_EVIDENCE_2026-08-04]].

# Flow 4 — Create Tenant Wizard Implementation Readiness

## Decision

# GO — Ready for implementation

This is a go to begin implementation against the canonical documents, not a release approval. No unresolved product or architecture decision prevents coding. Production release remains blocked until all P0 gates pass.

## Manual-payment decision addendum

The current release supports `MANUAL` payment setup for prepaid paid plans. Finalization yields tenant `PENDING_PAYMENT` and payment `AWAITING_PAYMENT`; the payer uses separate invoice and secure payment-status links to submit proof; an authorized, concurrency-protected and idempotent review approves, rejects, or requests information. Approval yields `PENDING_ACTIVATION`, never direct activation. `checkoutUrl` is null. Stripe/PayHere are future adapters and signed callback implementations.

Architecture/documentation readiness for this slice is **92% and GO for implementation**. This is not the executable/release score. Runtime gaps are the EF delta, secure access, proof storage, submission/review APIs, screens, notification handlers, activation hardening and P0 tests. See [[../../05_BACKEND_ARCHITECTURE/FLOW_4_MANUAL_PAYMENT_AND_FUTURE_IPG_ARCHITECTURE]] and [[FLOW_4_MANUAL_PAYMENT_SECOND_BRAIN_ALIGNMENT_2026-08-04]].

## Readiness scorecard

| Area | Score | Status | Evidence / principal gap |
|---|---:|---|---|
| Business decisions | 98% | Ready | Lifecycle, duplicates, draft, admin, invitation timing and billing policies closed |
| UX flow | 78% | Partially Ready | Canonical behavior specified; current UI uses old sequence |
| Frontend | 42% | Partially Ready | Strong form base; no drafts/resume/new sections/idempotency |
| Backend | 55% | Partially Ready | One-shot aggregate exists; orchestration and safety gaps |
| Database | 62% | Partially Ready | Most final tables exist; draft/operation/contact changes required |
| Subscription | 75% | Partially Ready | Plan/add-on resolution exists; canonical state authority needs refactor |
| Billing and payment | 35% | Blocked | Invoice schema/path exists; manual access/submission/review/notification workflow absent |
| Feature entitlements | 68% | Partially Ready | Included-feature path exists; optional/override contract absent |
| Tenant Admin handoff | 38% | Blocked | Pending user/role path exists; activation-gated secure token/delivery absent |
| Permissions | 85% | Ready | Existing codes cover R1; conditional enforcement to add |
| Audit | 45% | Partially Ready | Tenant history bridge exists; transaction/sequence/redaction work |
| Concurrency | 20% | Blocked | Tenant update token exists; onboarding has neither control |
| Automated tests | 48% | Partially Ready | Regression tests exist; canonical P0 matrix largely unimplemented |
| E2E | 10% | Blocked | No credible canonical paid/trial/demo/draft browser evidence |
| Documentation | 96% | Ready | Canonical eight-document pack and index/supersession links complete |
| **Overall (arithmetic mean of the 15 scored areas)** | **57%** | **Partially Ready** | Architecture is decided and coding may start; runtime release work remains substantial |

Scores represent current executable conformance, not document volume: 100 means the canonical behavior is implemented and verified at its required test layer; 50 means reusable implementation exists but a material canonical slice is missing; 0 means no reusable evidence. The overall score is the transparent arithmetic mean, not an undocumented weighted estimate.

## Start conditions satisfied

- Exact seven-step sequence and behavior are authoritative.
- Field ownership and required schema changes are mapped.
- API routes, envelopes, errors, ETag and idempotency semantics are defined.
- Lifecycle/payment/trial/demo/provisioning boundaries are explicit.
- Existing permissions are mapped without inventing an unapproved catalog.
- Security rules prohibit plaintext credentials and define token handling.
- Transaction, outbox, failure and retry behavior is settled.
- P0 tests and release evidence are enumerated.

## Recommended implementation slices

1. Data foundation: drafts, operations, missing contact/profile fields, draft-scoped idempotency receipt/shared outbox, atomic history sequence.
2. Draft APIs: create/list/get/patch/delete/validate, ownership and concurrency.
3. Finalization refactor: full transaction, constraint mapping, idempotent replay, fix tenant-local email policy.
4. Secure onboarding: activation-eligible invitation request, worker-only token generation, hash-only persistence, resend and operation status.
5. Billing: manual payment access, instructions, proof submission, review/history, notification and paid-to-pending-activation transition; preserve future provider adapter/callback extension points.
6. Angular: canonical steps, server defaults, autosave/resume/dirty guard, duplicate warnings, operation result.
7. Verification: P0 PostgreSQL integration, security, Angular E2E, accessibility/responsive and operational evidence.

Each slice should update implementation tracking but must not alter the canonical behavior silently.

## Exact implementation sequence

1. Complete audit and close contradictions — completed by this document pack.
2. Finalize EF models/configurations and migration design from the field/table matrix.
3. Add and verify forward-only PostgreSQL migrations and snapshot.
4. Implement draft repository/application services/validators/controllers and permission tests.
5. Refactor final creation into one idempotent unit-of-work transaction with receipt/audit/counters/outbox.
6. Implement secure setup-token generation, invitation delivery/resend and retryable operation status.
7. Implement paid invoice/manual access, evidence submission/review/history/notifications and lifecycle orchestration; add provider-neutral interfaces without enabling a gateway.
8. Refactor Angular route/shell/forms into the canonical seven steps.
9. Add autosave, manual save, resume list, progress, dirty guard, duplicate warnings and conflict recovery.
10. Connect plan/billing/entitlement/admin/review/result states to authoritative APIs.
11. Complete unit, PostgreSQL integration, security, frontend and E2E matrices.
12. Update implementation evidence, raise PR, review/merge, then prepare the separately requested colorful one-page visual.

## File-level change plan

Paths are relative to their verified repository roots. New filenames are recommended and must follow the existing namespace/folder convention during implementation.

| Order | Existing file/path | Change / new file | Reason/dependency | Test file |
|---:|---|---|---|---|
| 1 | BE `Domain/.../TenantFoundation/Entities` and `Platform/Subscription/Entities` | Add `PlatformTenantOnboardingDraft`, operation/override/contact fields or entities only as mapped | Domain model before persistence | new domain primitive tests |
| 2 | BE `Infrastructure/.../Configurations` and `Persistence/Migrations` | Add configs, indexes/checks/FKs and forward migration; update snapshot | PostgreSQL draft/idempotency/contact support | new migration/model-shape integration tests |
| 3 | BE `Application/.../PlatformAdmin/Dtos` | Replace legacy creation shape with versioned draft/finalize DTOs; remove temporary password field | Stable contract/security | validator/serialization tests |
| 4 | BE `Application/.../PlatformAdmin/Validators` | Add section/final/cross-field validators | Shared canonical rules | validator tests |
| 5 | BE `Infrastructure/.../PlatformAdmin/Repositories/PlatformTenantRepository.Wizard.cs` | Add draft CRUD/atomic versioning; fix tenant-local email; atomic finalize/history | Data correctness | repository PostgreSQL tests |
| 6 | BE `Application/.../PlatformAdmin/Services/PlatformTenantService.Wizard.cs` | Split draft/finalize orchestration, derive statuses, require idempotency | Current service has post-commit failure window | service/idempotency/fault tests |
| 7 | BE `Api/Controllers/V1/Platform/PlatformAdmin/PlatformAdminTenantsController.cs` | Add onboarding controller/group; preserve/deprecate compatibility endpoints | Versioned API contract | controller/API tests |
| 8 | BE subscription billing services/repositories | Implement manual access/evidence/review/history/notifications/waiver and operation retries; retain future provider interfaces | Paid lifecycle | manual review/concurrency/lifecycle integration tests plus future adapter contracts |
| 9 | BE tenant auth invitation/token/email integration | Secure hash-only token, outbox consumer, resend | Admin handoff | security and delivery retry tests |
| 10 | FE `src/app/features/admin/models/platform-tenant-create.model.ts` | Canonical typed draft/step/operation models; remove temporary password | API alignment | model/mapper specs |
| 11 | FE `.../mappers/platform-tenant-create.mapper.ts` and validators | Map named draft sections/finalize; canonical field/cross-field rules | New API/models | mapper/validator specs |
| 12 | FE `.../services/platform-tenant-api.service.ts` | Draft CRUD/validate/duplicate/finalize/operation/retry methods with ETag/key | Backend endpoints | service HTTP specs |
| 13 | FE `.../pages/platform-create-tenant-page/*` | Refactor shell to exact seven steps, contacts, review/outcome, accessibility | Models/API ready | page/component specs |
| 14 | FE admin route configuration/guards | Add resume route and CanDeactivate dirty guard | Draft IDs and state | route/guard specs |
| 15 | FE new draft-list/state facade files under current admin feature | Resume list, autosave/query state, conflict recovery | Draft service ready | facade/component specs |
| 16 | BE/FE E2E projects | Implement P0 test matrix paid/trial/demo/resume/concurrency/isolation | All slices integrated | CI E2E artifacts |
| 17 | SB implementation tracking | Record actual status/commands/commit/limitations | Evidence after verification | link test artifacts |

### Concrete file map

The following paths remove ambiguity from the plan. `New` means the file does not exist in the audited tree; names may change only to satisfy an established repository naming rule, with this register updated in the same PR.

| Order | Repository path | Existing/new and exact change | Dependency | Exact verification target |
|---:|---|---|---|---|
| 1 | BE `src/E_POS.Domain/Modules/Platform/PlatformAdmin/Entities/PlatformTenantOnboardingDraft.cs` | New draft aggregate and transitions | Canonical draft states | BE `tests/E_POS.UnitTests/PlatformAdministration/PlatformTenantOnboardingDraftTests.cs` new |
| 2 | BE `src/E_POS.Domain/Modules/Platform/PlatformAdmin/Entities/PlatformTenantOnboardingOperation.cs` | New async status/retry aggregate | Draft entity | BE operation domain tests new |
| 3 | BE `src/E_POS.Domain/Modules/Tenant/TenantFoundation/Entities/TenantProfile.cs` | Add registration/tax properties and mutation mapping | Data matrix | Existing wizard/domain tests plus migration test |
| 3a | BE `src/E_POS.Domain/Modules/Platform/Subscription/Entities/TenantSubscription.cs` and `src/E_POS.Infrastructure/Modules/Platform/Subscription/Configurations/TenantSubscriptionConfiguration.cs` | Remove `LKR` and unconditional monthly defaults from canonical construction/schema path; require resolved plan currency/cycle | Create-options/plan authority | Subscription domain/model-default tests |
| 4 | BE `src/E_POS.Domain/Modules/Tenant/TenantFoundation/Entities/TenantContact.cs` | New billing/support contact entity | Contact rules | BE `TenantContactTests.cs` new |
| 5 | BE `src/E_POS.Domain/Modules/Platform/Subscription/Entities/TenantFeatureEntitlement.cs` | Reuse effective/source fields; add override reason | Entitlement decision | Existing entitlement tests + new override cases |
| 6 | BE `src/E_POS.Domain/Common/Entities/IntegrationOutboxMessage.cs` | New one shared outbox entity | Email/payment architecture | BE `IntegrationOutboxMessageTests.cs` new |
| 7 | BE `src/E_POS.Infrastructure/Modules/Platform/PlatformAdmin/Configurations/PlatformTenantOnboardingDraftConfiguration.cs` and `PlatformTenantOnboardingOperationConfiguration.cs` | New exact EF mappings/indexes/checks/FKs | Orders 1–2 | PostgreSQL model-shape test new |
| 8 | BE `src/E_POS.Infrastructure/Modules/Tenant/TenantFoundation/Configurations/TenantProfileConfiguration.cs` and new `TenantContactConfiguration.cs` | Map profile/contact delta | Orders 3–4 | PostgreSQL contact/profile persistence tests new |
| 9 | BE `src/E_POS.Infrastructure/Modules/Platform/Subscription/Configurations/TenantFeatureEntitlementConfiguration.cs` and new common outbox configuration | Map override/outbox constraints | Orders 5–6 | PostgreSQL constraint tests new |
| 10 | BE `src/E_POS.Infrastructure/Persistence/EPosDbContext.cs`, `DependencyInjection.cs`, `Persistence/Migrations/EPosDbContextModelSnapshot.cs` | Register sets/services and update snapshot through generated migrations | EF configurations | Migration apply/revert-on-empty-schema tests |
| 11 | BE `src/E_POS.Application/Modules/Platform/PlatformAdmin/Dtos/PlatformTenantOnboardingDtos.cs` | New DTO registry; do not extend legacy password/status shape | Data model | DTO serialization/validator tests new |
| 12 | BE `src/E_POS.Application/Modules/Platform/PlatformAdmin/Validators/PlatformTenantOnboardingValidator.cs` | New partial/final/cross-step rules | DTOs/create-options policy | `PlatformTenantOnboardingValidatorTests.cs` new |
| 13 | BE `src/E_POS.Application/Modules/Platform/PlatformAdmin/Contracts/IPlatformTenantService.cs` and new `IPlatformTenantOnboardingRepository.cs` | Add service/repository contracts | DTOs/domain | Compile plus mock contract tests |
| 14 | BE `src/E_POS.Infrastructure/Modules/Platform/PlatformAdmin/Repositories/PlatformTenantRepository.Wizard.cs` | Fix raw/global email query; retain compatibility path until cutover | Tenant-local rule | Existing repository tests + cross-tenant email test |
| 15 | BE new `src/E_POS.Infrastructure/Modules/Platform/PlatformAdmin/Repositories/PlatformTenantOnboardingRepository.cs` | Draft CRUD/version lock and atomic finalize persistence | Orders 7–13 | `PlatformTenantOnboardingRepositoryTests.cs` new |
| 16 | BE `src/E_POS.Application/Modules/Platform/PlatformAdmin/Services/PlatformTenantService.Wizard.cs` | Remove LKR/timezone fallbacks, premature mock invite and post-commit failure window; compatibility facade only | New service ready | Existing wizard service tests updated |
| 17 | BE new `src/E_POS.Application/Modules/Platform/PlatformAdmin/Services/PlatformTenantOnboardingService.cs` | Canonical create-options/draft/validate/finalize/operation orchestration | Repository/outbox | New service/idempotency/fault tests |
| 18 | BE new `src/E_POS.Api/Controllers/V1/Platform/PlatformAdmin/PlatformTenantOnboardingController.cs`; existing `PlatformAdminTenantsController.cs` | Add canonical endpoints; retain documented activation/compatibility endpoints and correct error mapping | Application service | Controller integration tests new/updated |
| 19 | BE `src/E_POS.Infrastructure/Modules/Platform/Subscription/Configurations/SubscriptionPaymentTransactionConfiguration.cs` and payment services | Preserve existing idempotency index; add manual status/submission/review/proof/access delta and future provider-event extension point | Shared outbox | Manual command/concurrency/isolation tests; future adapter contracts |
| 20 | BE tenant-auth email delivery service plus new outbox worker under existing infrastructure convention | Generate raw setup token only in worker memory; store hash; ACS send/retry | Active tenant + outbox | Security/delivery retry tests |
| 21 | FE `src/app/features/admin/models/platform-tenant-create.model.ts`, `mappers/platform-tenant-create.mapper.ts`, `validators/platform-tenant-create.validators.ts` | Replace legacy step/state contract, remove temporary-password property | API DTOs | Existing three spec files updated |
| 22 | FE `src/app/features/admin/services/platform-tenant-api.service.ts` | Add canonical methods and ETag/idempotency headers | API available | `platform-tenant-api.service.spec.ts` |
| 23 | FE `src/app/features/admin/pages/platform-create-tenant-page/platform-create-tenant-page.ts` | Exact seven-step shell/forms/review/result; remove LK/LKR resolvers | Models/service | `platform-create-tenant-page.spec.ts` |
| 24 | FE new `src/app/features/admin/services/platform-tenant-onboarding-state.service.ts` and `pages/platform-tenant-drafts-page/platform-tenant-drafts-page.ts` | Autosave/resume/list/conflict/retry state | Draft API | Matching new service/page specs |
| 25 | FE `src/app/features/admin/routes/admin.routes.ts` and new `src/app/core/guards/pending-tenant-draft.guard.ts` | Add resume/list routes and unsaved-change guard | State service | `admin.routes.spec.ts` + guard spec |
| 26 | BE/FE E2E harness in the repository's selected test project | Implement F4-T05, T16–T18, T22 and scenarios 1–17 before release | Integrated stack | CI artifact manifest required by test matrix |

## Release blockers

- Any P0 test failure.
- Placeholder invitation token or any plaintext password/token storage/logging.
- Finalization that can return failure after a committed tenant without a stable replay result.
- Missing manual payment-status access, proof submission/review/history/notification path for paid onboarding.
- Missing draft concurrency/idempotency.
- Hard-coded country/currency defaults.
- Hard-coded backend timezone/currency fallbacks.
- Incomplete persistence of required fields or incorrect cross-tenant email rejection.
- No credible PostgreSQL transaction/uniqueness evidence or paid/trial/demo browser E2E.

## Angular implementation contract

- Routes: keep guarded `/admin/tenants/create`; add `/admin/tenants/create/:draftId` for resume and `/admin/tenants/drafts` for the resume list. All use `platform.tenants.create`; the list exposes an all-owners filter only with update permission.
- State: use a feature-scoped signals/RxJS facade consistent with the current Angular application—no new global store. It owns the typed forms, latest server draft/ETag, stable finalize key, autosave debounce, request cancellation, dirty state, catalogue revision and operation polling.
- Forms: one typed group per canonical step. Cross-field validators cover address/contact copy snapshots, plan/cycle/add-ons, type-specific billing dates, feature dependencies/overrides and admin identity. Map server field paths back to controls and an accessible error summary.
- Navigation: Back never validates away data; Next performs the current-step save/validation; later-step navigation is permitted for review but incomplete steps retain error state; Edit links return to their exact group. The CanDeactivate guard blocks only unsaved local changes.
- Data loading: render skeletons for draft/options; a blocking empty state for no active plans/catalogue; inline retry for autosave/options/operation calls; 409 compare/reload for stale drafts; catalog-changed refresh with explicit reconfirmation.
- Finalization: generate one idempotency key per user submit intent and reuse it through timeouts/retries; disable duplicate clicks as UX only. Poll operation status with bounded backoff while visible, stop on terminal state/navigation and expose manual refresh.
- Responsive/accessibility: retain one-column mobile and wrapping tablet behavior, add semantic ordered stepper state, keyboard navigation, focus management, labelled errors/live regions and 360px/tablet/desktop tests. Pending Payment, Pending Activation and completion are distinct result panels, not extra wizard steps.

## Dependencies that are not design blockers

Production email/blob credentials, platform base domain, manual instructions/support configuration and deployment-specific defaults can be supplied through configuration. No payment-provider credential is required for the manual release. Future provider credentials and adapter configuration remain environment dependencies only when Stripe/PayHere is enabled. Implementations must remain provider-neutral and fail safely when configuration is absent.

## Canonical implementation pack

- [[../../03_USER_JOURNEYS/Platform_Admin/FLOW_4_CREATE_TENANT_WIZARD_CANONICAL_SPEC]]
- [[FLOW_4_CREATE_TENANT_WIZARD_FULL_AUDIT_2026-07-31]]
- [[../../13_DECISIONS_AND_CHANGES/FLOW_4_CREATE_TENANT_WIZARD_DECISION_REGISTER]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/FLOW_4_CREATE_TENANT_WIZARD_FIELD_TO_TABLE_MATRIX]]
- [[../../05_BACKEND_ARCHITECTURE/FLOW_4_CREATE_TENANT_WIZARD_API_CONTRACT]]
- [[../../02_ACCESS_CONTROL/FLOW_4_CREATE_TENANT_WIZARD_PERMISSION_MATRIX]]
- [[../../10_TESTING_QA/FLOW_4_CREATE_TENANT_WIZARD_TEST_MATRIX]]
