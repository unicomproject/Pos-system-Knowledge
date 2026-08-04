<!-- title: Flow 4 Create Tenant Wizard Decision Register -->
<!-- status: Approved -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-04 -->

# Flow 4 — Create Tenant Wizard Decision Register

## Closed decisions

| ID | Decision | Resolution and rationale |
|---|---|---|
| F4-D01 | Step structure | Fixed seven-step sequence in the canonical spec; old limits/add-ons step is absorbed into plan/entitlements. |
| F4-D02 | Draft model | Dedicated draft aggregate, not partial `tenants` rows, to avoid incomplete production aggregates and side effects. |
| F4-D03 | Draft retention | Configurable platform setting, default 30 days since latest save; soft-expire then retention purge. |
| F4-D04 | Progress | Server-derived completed-step mask and percentage; client state is only a preview. |
| F4-D05 | Defaults | API supplies configured defaults; no client country/currency/timezone/locale preference. |
| F4-D06 | Strict duplicates | Normalized code, slug and full domain block. Database constraints are final authority. |
| F4-D07 | Duplicate warnings | Similar names, registration/tax IDs and contacts warn. Registration/tax are not strict because one legal entity can operate multiple tenants. |
| F4-D08 | Admin email scope | Email uniqueness is tenant-local, matching `(tenant_id, email)`; cross-tenant membership is allowed. |
| F4-D09 | Paid lifecycle | `PENDING_PAYMENT` → verified/waived `PENDING_ACTIVATION` → manual authorized `ACTIVE`. |
| F4-D10 | Trial/demo lifecycle | Auto-activate only after the complete transactional aggregate is provisioned; no payment link. |
| F4-D11 | Failure states | Payment/provisioning/delivery failures live in payment/onboarding operation state, not `tenants.status`. |
| F4-D12 | Billing authority | Client selects business inputs; server derives price, billing status, subscription status and dates where policy controls them. |
| F4-D13 | Payment waiver | Allowed with `platform.billing.manage`, explicit reason and audit evidence. |
| F4-D14 | Entitlements | Plan inclusion plus compatible add-ons/features; overrides require entitlement permission, reason and expiry/permanent marker. |
| F4-D15 | Admin credentials | Invitation/setup-token only; cryptographic random token, hash at rest, no plaintext temporary password. |
| F4-D16 | Final transaction | Complete tenant aggregate, counters, history/audit, receipt and outbox are one PostgreSQL transaction. External calls occur after commit. |
| F4-D17 | Idempotency | Required for finalization; same key/hash replays result, same key/different hash conflicts. |
| F4-D18 | Concurrency | Every draft mutation uses an opaque version/ETag and rejects stale writes. |
| F4-D19 | Audit backing | Use transactional structured business events. Current subscription-history reuse is accepted only as an implementation bridge and must use atomic sequencing. |
| F4-D20 | Legal acknowledgement | No R1 checkbox without an approved legal/terms requirement; future consent must be versioned evidence. |
| F4-D21 | API migration | Introduce one onboarding API group; deprecate current create-options/final POST after the Angular migration. |
| F4-D22 | Retry | Database failure leaves draft retryable; post-commit provider/email failure retries outbox work and never recreates tenant. |
| F4-D23 | Setup-token timing | Create tenant-admin membership during finalization, request delivery only when the tenant is `ACTIVE`, and let the worker generate the raw token in memory/store only its hash; paid pending-payment tenants have no live setup token. |
| F4-D24 | Plan visibility | `platform.tenants.create` includes the minimum active plan/price/feature projection needed by the wizard; `platform.tenant_subscriptions.view` remains required for general tenant subscription reads. |
| F4-D25 | Finalize-key scope | The idempotency tuple is scoped to one draft. Do not add a globally unique key-only index; the locked draft stores the one accepted key/hash and completed receipt. |
| F4-D26 | Registration/tax lineage | The July 2 migration added tenant-profile registration/tax columns and the July 7 migration removed them; current entity/snapshot are authoritative. Reintroduce them only through a new additive migration. |

## Resolved contradictions

| Conflict | Canonical result |
|---|---|
| Old wizard order vs approved order | Approved order wins; old documents are superseded. |
| `DRAFT` tenant status vs partial wizard drafts | `DRAFT` remains a tenant lifecycle value, but partial wizard input uses the separate draft table. |
| UI permits only plan-included features vs required optional overrides | Implement compatible optional selection plus permissioned overrides. |
| UI hard-codes `LK`/`LKR` vs server authority | Remove hard-codes; use nullable configured defaults. |
| Global application admin-email check vs tenant-local DB uniqueness | Tenant-local policy wins; fix repository query. |
| Payment-link tables exist vs documentation says not implemented | Schema is present; end-to-end generation/provider/delivery workflow is not implemented. |
| Audit endpoint exists vs generic `audit_logs` absent | Tenant audit currently projects subscription history. Finalization must write transactional structured events; do not claim generic audit infrastructure exists. |
| Current invite hash mock vs approved secure setup link | Replace mock with security token service before release. |
| Usage counters/audit after commit vs all-or-nothing provisioning | Move them into final transaction/outbox boundary. |
| Backend `LKR`/`Asia/Colombo` fallbacks vs configurable defaults | Remove both backend and Angular geographic defaults; create-options returns configuration/catalogue defaults or null. |
| Paid setup invite created at finalization vs activation-only set-password email | Create membership at finalization; activation queues the request and the worker generates/stores/sends token material. |
| Create permission needs plan data vs subscription-view restriction | Permit the narrow create-options projection with create permission; keep broad subscription reads separately protected. |
| Draft-scoped key vs globally unique finalize key column | Scope key/hash to the locked draft; no key-only global uniqueness. |

## Detailed contradiction traceability

Path roots: `SB = C:\Users\User\Desktop\Nytroz__POS\Nytroz POS - Second Brain\Pos-system-Knowledge`; `BE = C:\Users\User\Desktop\Nytroz__POS\Nytroz POS - Backend New\Unified-Commerce`; `FE = C:\Users\User\Desktop\Nytroz__POS\nytroz-pos-platform-admin`.

| ID / topic | Decision A vs B | Source files and code evidence | Impact if unresolved | Canonical decision / reason | Documentation/code/tests | Status |
|---|---|---|---|---|---|---|
| F4-C01 Steps | Old Business/Plan/Limits/Features/Admin/Billing/Review vs approved exact order | `SB\03_USER_JOURNEYS\Platform_Admin\04...`, `16...`; `FE\src\app\features\admin\pages\platform-create-tenant-page\platform-create-tenant-page.ts` lines defining seven old labels | Developers build incompatible UX/data boundaries | Approved sequence; it better separates identity, contacts, commercial choice and billing | Supersede old docs; refactor page/forms/spec | Resolved |
| F4-C02 Draft | Tenant lifecycle `DRAFT` vs save partial wizard input | lifecycle/email docs; `BE\...\Tenant.cs`; no draft API/entity found | Incomplete production rows and side effects | Dedicated versioned draft aggregate; lifecycle remains business state | Canonical/data/API docs; new migration/service/E2E | Resolved |
| F4-C03 Billing timing | One-shot DB create vs payment/provider orchestration | `PlatformTenantService.Wizard.cs`; payment-link entity exists but journey marks workflow unimplemented | Partial tenant or long transaction | Commit full local aggregate/outbox, then provider call; paid starts pending payment | API/data docs; refactor finalize + worker | Resolved |
| F4-C04 Activation | Trial/demo activation in service vs paid manual gate | `TenantCreateModeResolver`, wizard service; onboarding email/activation docs | Wrong access or email timing | Preserve trial/demo auto-after-provision; paid verified/waived then manual activation | Canonical lifecycle and tests | Resolved |
| F4-C05 Entitlements | UI only plan-included vs requirement for optional/overrides | FE `isFeatureAllowed`; BE resolution and permission catalog | Cannot represent approved exceptions | Effective plan+add-on+compatible optional set; permissioned reasoned overrides | Spec/permission; FE/BE/schema/tests | Resolved |
| F4-C06 Admin credentials | Hash-only invitation policy vs placeholder GUID “hash” and legacy temporary-password field | onboarding email doc; wizard service lines creating invite; mutation DTO/model | Account takeover/token leakage risk | Cryptographic one-time setup token, hash at rest, outbox delivery; remove password field | Spec; security service/DTO/tests | Resolved |
| F4-C07 Email uniqueness | App global exists check vs DB `(tenant_id,email)` unique | `PlatformTenantRepository.Wizard.cs`; `TenantUserConfiguration.cs` | Legitimate cross-tenant user blocked | Tenant-local uniqueness, consistent with DB and SaaS membership | Decision/data docs; repository/test fix | Resolved |
| F4-C08 Defaults | UI prefers LK/LKR vs server-driven catalogs | FE default resolvers; create-options repository | Wrong multi-region tenants | Configured nullable defaults from API only | Spec/API; FE resolver tests | Resolved |
| F4-C09 Audit atomicity | Core create transaction vs audit/counters after commit | wizard service calls repository create, then audit and counter service; audit uses count+1 | Error response after durable tenant and retry duplication | Include counters/audit/receipt/outbox atomically; atomic sequence | API/data/test docs; repository/UoW refactor | Resolved |
| F4-C10 Payment tables | Table/entity presence vs “not implemented” journey | payment entities/configs; billing flow unsupported list; no onboarding endpoint/service | False readiness claim | Reuse schema, build missing provider-neutral workflow; schema alone is not completion | Audit/readiness; worker/API/E2E | Resolved |
| F4-C11 Domain | Tenant slug derived from code vs explicit slug/subdomain requirement | wizard service `code.ToLowerInvariant()`; tenant/domain unique configs | Unfriendly/colliding tenant URLs | Explicit server-suggested editable slug and optional full-domain reservation | Spec/data/API; forms/service/tests | Resolved |
| F4-C12 Concurrency | Tenant detail update uses updated-at token vs onboarding writes have none | controller `If-Match` for update/entitlements; no draft/finalize token | Lost draft changes/double create | Monotonic draft version + finalize idempotency; existing tenant token retained | Canonical/API/data/tests | Resolved |
| F4-C13 Backend defaults | Angular prefers LK/LKR and backend/service/domain/EF fall back to LKR/Asia-Colombo/monthly vs multi-region server/plan authority | FE default resolvers; BE `PlatformTenantService.cs`, `TenantSubscription.cs`, `TenantSubscriptionConfiguration.cs`; create-options has no defaults object | Silent wrong regional/commercial configuration | Add configured nullable geographic defaults, take billing cycle from plan choice, require final values and remove runtime code/schema fallbacks | Canonical/audit/API; FE/BE configuration tests | Resolved |
| F4-C14 Invite timing | Current wizard persists a mock invite before activation vs approved onboarding email flow permits setup link only after activation | BE wizard `UserInvite.CreatePending`; SB `18_Tenant_Onboarding_Email_Flows.md` | Token expires while paid tenant waits; premature account handoff | Persist membership at finalize; activation queues a request; worker generates raw token in memory and persists only its hash | Canonical/data/API/email tests | Resolved |
| F4-C15 Plan projection authorization | Draft permission matrix implied subscription-view is needed while current create-options and the wizard require prices under create | BE `GetCreateOptionsAsync`; FE create route; permission catalogue | A creator cannot complete Step 3 or prices leak through broad APIs | Create permission authorizes only the bounded active create-options projection; broad subscription APIs still require view | Permission/API docs and auth tests | Resolved |
| F4-C16 Registration/tax schema | Historical July 2 migration added fields; July 7 migration removed them; current entity has none | migrations `20260702182515...`, `20260707185919...`; current `TenantProfile`/configuration/snapshot | Editing old migrations or assuming columns exist breaks deployed schema | New forward-only reintroduction with current snapshot verification | Data/audit docs; migration/model tests | Resolved |

No item is `Needs approval`. Production provider credentials and domain/default values are configuration choices within the approved provider-neutral model.

## Approval status

No product choice remains open for implementation start. Provider selection, email sender credentials and production base-domain values are deployment configuration, not blockers to implementing provider-neutral contracts and adapters. Any later change to lifecycle, uniqueness scope, legal consent, pricing authority or permission semantics requires a new decision record and updates to all four canonical matrices.

## Supersession

This register replaces unresolved tenant-wizard choices in older implementation prompts and audit notes. Historical documents may explain why the current code looks different but cannot override these decisions.

## Related

[[../03_USER_JOURNEYS/Platform_Admin/FLOW_4_CREATE_TENANT_WIZARD_CANONICAL_SPEC]] · [[../15_IMPLEMENTATION_TRACKING/99_AUDITS/FLOW_4_CREATE_TENANT_WIZARD_FULL_AUDIT_2026-07-31]]
