<!-- title: Flow 4 Create Tenant Wizard API Contract -->
<!-- status: Canonical -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-04 -->

# Flow 4 — Create Tenant Wizard API Contract

## Conventions

Base route: `/api/v1/platform-admin/tenant-onboarding`. Platform-only authentication is mandatory. Responses use the existing `{ success, message, data, errorCode, errors, traceId }` envelope. Draft IDs are UUIDs. `version` is an opaque string and is also returned as a quoted `ETag`. Draft write/delete/finalize requests require `If-Match`; finalization additionally requires `Idempotency-Key` (1–100 visible ASCII characters). A missing precondition returns 428; malformed headers return 400.

Current-release payment terminology is fixed by [[FLOW_4_MANUAL_PAYMENT_AND_FUTURE_IPG_ARCHITECTURE]]: `invoiceUrl` views/downloads the invoice, `paymentStatusUrl` opens the secure manual-payment experience, and `checkoutUrl` is null. No manual URL is labelled or serialized as a provider checkout/payment link.

## Endpoint catalogue

| Method and route | Purpose | Permission | Success |
|---|---|---|---|
| `GET /create-options` | Catalogs plus server defaults and validation metadata | `platform.tenants.create` | 200 |
| `POST /drafts` | Create an owned draft | `platform.tenants.create` | 201 |
| `GET /drafts?mine=&status=&page=` | Resume list | create for own; view/update for all | 200 |
| `GET /drafts/{draftId}` | Load draft | owner/create or update | 200 |
| `PATCH /drafts/{draftId}` | Merge changed fields and current step | owner/create or update | 200 |
| `DELETE /drafts/{draftId}` | Soft-discard draft | owner/create or update | 204 |
| `POST /drafts/{draftId}/validate` | Full or selected-step validation | owner/create or update | 200/422 |
| `POST /duplicate-checks` | Advisory normalized duplicate check | `platform.tenants.create` | 200 |
| `POST /drafts/{draftId}/finalize` | Transactionally create aggregate | `platform.tenants.create` plus conditional permissions | 201/200 replay |
| `GET /operations/{operationId}` | Provisioning/delivery/payment status | `platform.tenants.view` | 200 |
| `POST /operations/{operationId}/retry` | Retry eligible notification/activation outbox work | update plus domain permission | 202 |
| `POST /tenants/{tenantId}/admin-invitation/resend` | Replace and resend setup invitation | `platform.tenants.update` | 202 |

Requirement routing is deliberately non-duplicative: create-options includes the bounded active plan catalogue, feature catalogue, payment setup types, and plan payment policy; Step 4 billing setup is saved through draft PATCH; paid finalization creates the invoice/manual-payment access and queues the payment-required notice; payment status is the operation resource plus billing/payment resources; Tenant Admin validation occurs through step validation; review summary is returned by full draft validation; activation reuses the existing tenant lifecycle endpoint. No parallel APIs are added for the same operation.

### Endpoint behavior, audit and transaction matrix

| Endpoint | Request/validation | Response/errors | Idempotency/concurrency | Audit/transaction |
|---|---|---|---|---|
| `GET /create-options` | none; actor permission | option DTO; 401/403 | cacheable ETag; no mutation | no business audit; read-only |
| `POST /drafts` | optional initial named payload sections/current step | draft DTO; 422 field errors | optional command key; creates once | `draft_created`; one transaction |
| `GET /drafts` | bounded filter/page; own/all authorization | paged summary DTO | stable ordering | read audit only if platform policy requires it; read-only |
| `GET /drafts/{id}` | UUID and ownership | full draft; 404 safe denial | returns ETag | `draft_resumed` when used for resume; read-only plus audit append |
| `PATCH /drafts/{id}` | merge-patch DTO, latest ETag, partial field rules | recalculated draft; 409/422 | version required; retry after reload | `draft_updated`; draft+audit atomic |
| `DELETE /drafts/{id}` | latest ETag/ownership | 204; 404/409 | repeat on discarded draft is 204 | `draft_discarded`; soft-state+audit atomic |
| `POST /drafts/{id}/validate` | optional step list | summary/warnings/errors | version checked, no key | no state mutation except optional validation timestamp; read transaction |
| `POST /duplicate-checks` | bounded normalized candidates | classifications | advisory; no reservation | security telemetry only; read transaction |
| `POST /drafts/{id}/finalize` | latest ETag, idempotency header, acknowledgements/reasons | creation receipt; 409/422 | mandatory key/hash and replay | full aggregate+audit+receipt+outbox atomic |
| `GET /operations/{id}` | UUID and tenant view | status DTO | ETag/refresh-safe | read-only |
| `POST /operations/{id}/retry` | retryable state, domain permission, command key | 202 operation DTO | command idempotent | retry event+outbox atomic |
| `POST .../admin-invitation/resend` | active tenant/pending user/rate limit, command key | 202 invitation status | command idempotent | request+audit+outbox atomic; worker replaces hash and sends |

Manual payment initialization is represented by finalization persistence plus a payment-required notification outbox message; no provider session is created. Payment status is exposed through the operation and billing/manual-payment APIs. Activation continues to reuse `POST /api/v1/platform-admin/tenants/{tenantId}/activate`, with `platform.tenants.activate`, `If-Match`, a command `Idempotency-Key`, approved-payment/waiver preconditions, idempotent already-active behavior, and transactional lifecycle/audit/invitation-request outbox handling. A retryable activation-side delivery failure is retried through `POST /operations/{operationId}/retry`; it does not roll the active lifecycle back.

## Manual payment API extension

The Platform Admin review routes extend `/api/v1/platform-admin/billing`; secure recipient routes never authorize by a guessable tenant or invoice ID.

| Method and route | Authentication/permission | Request and response | Concurrency/idempotency/audit |
|---|---|---|---|
| `GET /tenants/{tenantId}/payment-status` | Platform session; `platform.billing.view` | Safe invoice/payment/activation projection including nullable `checkoutUrl` | Read-only; tenant existence privacy |
| `GET /api/v1/platform-admin/billing/manual-payments` | Platform session; `platform.billing.view` | Paged review queue with safe filters | Stable ordering; no proof/contact leakage |
| `GET /api/v1/platform-admin/billing/manual-payments/{paymentId}` | Platform session; `platform.billing.view` | Expected/submitted amount, currency, method, dates, safe reference, proof metadata, status/version | ETag returned; access audit where required |
| `GET .../{paymentId}/proof/{evidenceId}` | Platform session; `platform.billing.view` | Short-lived private proof download/preview | Object ownership and access audit; no durable URL |
| `POST .../{paymentId}/review` | Platform session; `platform.billing.manage` | `{ action: APPROVE|REJECT|REQUEST_INFORMATION, expectedVersion, reviewNote?, reasonCode? }` -> payment/review result | `If-Match` plus `Idempotency-Key`; payment/invoice/lifecycle/review/audit/outbox atomic |
| `GET .../{paymentId}/history` | Platform session; `platform.billing.view` | Redacted immutable review history | Read-only; actor labels subject to permission |
| `POST .../{paymentId}/notification/resend` | Platform session; `platform.billing.manage` | Optional reason -> operation | Command key, rate limit, outbox/audit atomic |
| `GET /api/v1/tenant-onboarding/payment-access/{accessToken}` | Secure expiring purpose-bound token or equivalent authenticated recipient session | Instructions, invoice summary, status, `invoiceUrl`, `paymentStatusUrl`, `checkoutUrl: null` | Keyed-hash lookup, purpose/expiry/rate limit; read audit |
| `GET .../{accessToken}/invoice` | Same secure access | Invoice view/download | Content-disposition/privacy controls |
| `POST .../{accessToken}/evidence` | Same secure access | Reference, method, amount, currency, payment date, proof, optional note -> submission/status/version | `Idempotency-Key`; request hash; private upload controls; submission/audit/outbox atomic after storage succeeds |
| `PUT .../{accessToken}/submissions/{paymentId}` | Same payment ownership and eligible status | Corrected submission/action-required response | `If-Match`; stable command key; no history deletion |
| `GET .../{accessToken}/history` | Same secure access | Safe status/outcome chronology | Reviewer/contact/bank data redacted |

Review approval records payment as `PAID`, settles the invoice consistently, and transitions the tenant only to `PENDING_ACTIVATION`. The separate activation endpoint remains mandatory. Review rejection or request-information leaves the tenant `PENDING_PAYMENT`.

Stable manual-payment errors are `manual_payment.validation_failed`, `access_invalid_or_expired`, `concurrency_conflict`, `idempotency_conflict`, `invalid_transition`, `amount_mismatch`, `currency_mismatch`, `proof_required`, `proof_access_denied`, `review_note_required`, `not_found`, `access_denied`, and `rate_limited`. Safe 404 behavior prevents cross-tenant/resource enumeration.

The existing `GET /api/v1/platform-admin/tenants/create-options` and `POST /api/v1/platform-admin/tenants` remain compatibility endpoints during migration, then become deprecated. They must not be extended as a second competing contract.

## Create-options response

`data` contains `plans`, `addons`, `catalogModules`, `currencies`, `businessTypes`, `countryCodes`, `timezones`, `locales`, `operatingModes`, `billingCycles`, `paymentMethods`, plus:

```json
{
  "defaults": {
    "countryCode": "configured value or null",
    "currencyCode": "configured value or null",
    "timezone": "configured value or null",
    "locale": "configured value or null",
    "billingCycle": "configured/plan value or null"
  },
  "validation": {
    "tenantCodePattern": "^[A-Z0-9-]{3,60}$",
    "tenantSlugPattern": "^[a-z0-9](?:[a-z0-9-]{1,98}[a-z0-9])?$",
    "draftRetentionDays": 30,
    "platformBaseDomain": "configured host or null"
  }
}
```

No geographic value is selected by array position or frontend constant.

`platform.tenants.create` authorizes this minimum plan/price/feature projection because it is necessary to create a tenant. It does not authorize general tenant-subscription records; those continue to require `platform.tenant_subscriptions.view`.

## DTO registry and validation

| DTO | Fields | Validation / authority |
|---|---|---|
| `TenantOnboardingCreateOptionsResponse` | existing active catalog arrays; `defaults`; `validation`; `catalogRevision` | Server filters active/compatible rows and current prices; no client-supplied status/default |
| `CreateTenantOnboardingDraftRequest` | optional `payload` named sections; `currentStep` 1–7 | Section DTO syntax only; owner comes from token |
| `PatchTenantOnboardingDraftRequest` | any subset of `basicDetails`, `businessContact`, `plan`, `billing`, `entitlements`, `tenantAdmin`; optional `currentStep` | JSON Merge Patch; max body 256 KiB; immutable/system fields rejected |
| `TenantOnboardingDraftResponse` | identity/owner/status, payload, completed steps/progress, warnings, catalogue revision, timestamps, version | PII returned only to authorized owner/editor; ETag mirrors version |
| `TenantOnboardingDraftSummaryResponse` | id, safe display name/code, status, step/progress, owner, updated/expiry, version | Paged; excludes contacts and payload |
| `ValidateTenantOnboardingDraftRequest` | optional distinct `steps` (1–7), default all | Unknown/duplicate steps rejected; validation never trusts saved derived values |
| `TenantOnboardingValidationResponse` | `isValid`, step results, canonical field errors, warnings, derived review summary, `catalogRevision` | Prices/limits/effective features/status outcomes server derived |
| `TenantDuplicateCheckRequest` | bounded optional identifier/contact candidates and `excludeDraftId` | At least one candidate; same normalization as finalize; max ten candidates |
| `TenantDuplicateCheckResponse` | classifications, stable warning codes, safe message, optionally authorized matched ID | Advisory; never returns contact values or existence details to unauthorized actor |
| `FinalizeTenantOnboardingRequest` | distinct warning codes; structured override reasons; optional billing-waiver reason | No prices, statuses, permissions, token/password/card fields; complete revalidation |
| `TenantOnboardingReceiptResponse` | tenant/draft/operation IDs, tenant/provisioning/payment/invitation status, timestamps, `invoiceUrl`, `paymentStatusUrl`, nullable `checkoutUrl`, replay flag | Stable persisted receipt; same-key replay returns same business result; URL fields follow purpose-specific authorization |
| `TenantOnboardingOperationResponse` | IDs, four status values, safe error code, retryable flag/count/next time, updated time/version | Does not expose provider payload, payment URL token or invite token |
| `RetryTenantOnboardingOperationRequest` | optional expected component: `PAYMENT_NOTIFICATION`, `INVITATION`, `ACTIVATION_DELIVERY` | Must match current retryable component; command key required; it never fabricates payment approval |
| `ResendTenantAdminInvitationRequest` | optional reason, expected tenant user ID | Tenant must be active; command key/rate limit; no email override or token input |

Nested step DTO field names and database ownership are authoritative in the field-to-table matrix. Common bounds: display/legal/contact names 2–200, code 3–60, slug 3–100, email max 255, phone max 40, URL max 500, address lines max 250, city/state 120, postal 30, registration/tax 100, notes 1,000, reason 500, add-on quantity 1–10,000. Exact plan/discount/tax limits come from create-options policy metadata and are revalidated in the domain.

## Draft resource

```json
{
  "id": "uuid",
  "status": "in_progress",
  "ownerPlatformUserId": "uuid",
  "currentStep": 2,
  "completedSteps": [1],
  "progressPercent": 14,
  "payload": { "basicDetails": {}, "businessContact": {}, "plan": {}, "billing": {}, "entitlements": {}, "tenantAdmin": {} },
  "warnings": [],
  "version": "opaque",
  "createdAt": "2026-07-31T00:00:00Z",
  "updatedAt": "2026-07-31T00:00:00Z",
  "expiresAt": "2026-08-30T00:00:00Z"
}
```

`PATCH` uses JSON Merge Patch semantics over named sections, not positional step arrays. The body carries `currentStep`; the server sets completion/progress. Null removes an optional field. Immutable owner/id/status/version/timestamps are rejected. A stale version returns `platform_tenant_onboarding.concurrency_conflict` and `latestVersion`.

`POST /drafts` creates no tenant rows. It returns `Location`, ETag and the full draft. List defaults to `mine=true`, active status and 25 rows, with maximum page size 100 and stable `updatedAt DESC, id DESC` ordering. Delete is soft and requires the latest ETag. Expired/discarded drafts cannot be edited or finalized; completed drafts expose only their receipt-safe representation.

## Duplicate check

Request accepts the currently entered normalized candidates: `tenantCode`, `tenantSlug`, `requestedDomain`, `displayName`, `legalName`, `registrationNumber`, `taxNumber`, `primaryEmail`, `primaryPhone`, `tenantAdminEmail`, and optional `excludeDraftId`. Response items contain `field`, `classification` (`blocking` or `warning`), `matchedEntityId` only when actor may view it, and a safe message. The endpoint is advisory and rate limited; finalization repeats checks.

## Finalize request and response

Headers: latest `If-Match`, stable `Idempotency-Key`. Body contains only explicit acknowledgements/override reasons that were not already saved:

```json
{
  "acknowledgedWarningCodes": ["similar_legal_name"],
  "entitlementOverrideReason": null,
  "billingWaiverReason": null
}
```

201 returns `tenantId`, `draftId`, `operationId`, `tenantStatus`, `provisioningStatus`, `paymentStatus`, `invitationStatus`, `createdAt`, and tenant-detail link. An exact idempotent replay returns 200 with the same representation and `idempotentReplay: true`.

Finalization re-loads catalogs and never trusts client prices, feature inclusion, effective limits, lifecycle/subscription status or permission flags. Conditional permissions are checked against the authenticated actor at finalization time.

## Stable errors

| Code | HTTP | Meaning/recovery |
|---|---:|---|
| `platform_tenant_onboarding.validation_failed` | 422 | Fix field errors |
| `platform_tenant_onboarding.access_denied` | 403 | Do not reveal restricted data |
| `platform_tenant_onboarding.not_found` | 404 | Missing or inaccessible resource |
| `platform_tenant_onboarding.concurrency_conflict` | 409 | Reload/compare latest draft |
| `platform_tenant_onboarding.duplicate_conflict` | 409 | Change code/slug/domain |
| `platform_tenant_onboarding.idempotency_conflict` | 409 | Same key used with different request hash |
| `platform_tenant_onboarding.catalog_changed` | 409 | Reload plan/catalog and reconfirm |
| `platform_tenant_onboarding.operation_not_retryable` | 409 | Reload operation |
| `platform_tenant_onboarding.rate_limited` | 429 | Honor `Retry-After` |
| `platform_tenant_onboarding.precondition_required` | 428 | Resend with current ETag/idempotency header |

Field paths use the payload names, for example `payload.businessContact.registeredAddress.countryCode`.

## Transaction and retry semantics

Finalize locks the draft, accepts or verifies its draft-scoped idempotency key/hash and writes the complete aggregate, capacity counters, audit/history, operation, receipt and outbox in one transaction. No global key-only unique index is used. The completed draft stores `createdTenantId`. A database rollback restores `in_progress`; the same tuple may retry. Provider/email failures update the operation asynchronously and are retried without re-running finalization.

Manual submissions and reviews use payment-scoped versions plus command key/request hash semantics. A duplicate approval returns the existing result; a changed request under the same key conflicts. Future provider callbacks use adapter signature verification plus a unique provider event/reference and the same internal payment-state command. Invitation outbox processing generates the raw setup token in worker memory only, transactionally replaces the prior hash, sends the URL, and never places the raw token in the outbox, database, API response or logs. If delivery fails, retry generates another token and invalidates the prior one. Resend queues this same idempotent process.

## Clean Architecture use-case map

The inspected Platform Administration module is application-service/repository based, not MediatR command-handler based. Do not add a parallel CQRS framework solely for Flow 4. Each controller action calls one named `PlatformTenantOnboardingService` method; that method is the use-case handler, invokes the validator/domain aggregate/policy services, and commits through the onboarding repository/unit of work.

| Use case | Controller action | Application handler | Domain/repository/external boundary | Audit/integration event | Test location |
|---|---|---|---|---|---|
| Options | `GetCreateOptions` | `GetCreateOptionsAsync` | Existing catalogue repositories + platform settings | None | Unit/controller projection |
| Draft create/list/get/save/discard | Matching draft actions | `Create/List/Get/Update/DiscardDraftAsync` | Draft aggregate/repository; platform permission checker | Draft event names in canonical spec | Unit + PostgreSQL repository + controller |
| Validate/review | `ValidateDraft` | `ValidateDraftAsync` | Validator, duplicate classifier, plan/entitlement/billing policy services | None unless warning acknowledgement mutates | Unit + API integration |
| Duplicate advice | `CheckDuplicates` | `CheckDuplicatesAsync` | Tenant/draft/profile/contact read repository | Security telemetry only | Unit/privacy/PostgreSQL |
| Finalize | `FinalizeDraft` | `FinalizeAsync` | Draft/tenant/subscription/admin aggregates; one repository UoW | Creation/audit/outbox events | Unit/fault injection/PostgreSQL/idempotency |
| Operation status/retry | `GetOperation`/`RetryOperation` | Matching methods | Operation aggregate/outbox repository/provider adapter | Retry/result events | Unit + worker/integration |
| Activation | Existing tenant controller `ActivateTenant` | Existing lifecycle service refactored to UoW | Tenant lifecycle, operation, invitation request outbox | Activation/request events | Existing lifecycle + new concurrency tests |
| Invitation resend | `ResendAdminInvitation` | `ResendAdminInvitationAsync` | Active-tenant/user policy, outbox; worker token/email adapter | Resend/sent/failed events | Security/rate-limit/delivery tests |

Mapping remains explicit static/manual mapping in the existing DTO style. External ACS/payment calls are infrastructure adapters invoked by background consumers after commit. The application service owns orchestration; entities own valid state transitions; repositories own persistence only; neither controllers nor repositories decide permissions.

## Implemented manual-payment API surface - 2026-08-04

Backend commit `db9d579` implements the current-release manual surface:

| Audience | Endpoint | Enforcement/result |
|---|---|---|
| Recipient | `GET /api/v1/tenant-onboarding/payment-access/{accessToken}` | Purpose/expiry/hash lookup, rate limited; safe manual status projection |
| Recipient | `GET /api/v1/tenant-onboarding/payment-access/{accessToken}/invoice` | Same grant; bounded invoice projection |
| Recipient | `POST /api/v1/tenant-onboarding/payment-access/{accessToken}/evidence` | Multipart PDF/JPEG/PNG, 10 MiB request limit, `Idempotency-Key`, validation and malware scan |
| Recipient | `PUT /api/v1/tenant-onboarding/payment-access/{accessToken}/submissions/{paymentId}` | Corrective resubmission with expected version and idempotency |
| Recipient | `GET /api/v1/tenant-onboarding/payment-access/{accessToken}/history` | Recipient-safe immutable history |
| Platform Billing | `GET /api/v1/platform-admin/billing/manual-payments` | `platform.billing.view`; filtered/searchable/sorted/paged queue |
| Platform Billing | `GET /api/v1/platform-admin/billing/manual-payments/{paymentId}` | `platform.billing.view`; expected-versus-submitted detail |
| Platform Billing | `GET /api/v1/platform-admin/billing/manual-payments/{paymentId}/proof/{evidenceId}` | `platform.billing.view`; exact ownership check, private no-store stream |
| Platform Billing | `POST /api/v1/platform-admin/billing/manual-payments/{paymentId}/review` | `platform.billing.manage`; expected version + idempotency; approve/reject/request-information |
| Platform Billing | `GET /api/v1/platform-admin/billing/manual-payments/{paymentId}/history` | `platform.billing.view`; immutable review/submission history |
| Platform Billing | `POST /api/v1/platform-admin/billing/manual-payments/{paymentId}/notification/resend` | `platform.billing.manage`; rate-limited/idempotent outbox command |
| Platform tenant | `GET /api/v1/platform-admin/tenant-onboarding/tenants/{tenantId}/payment-status` | `platform.billing.view` bounded tenant payment projection |
| Platform tenant | `POST /api/v1/platform-admin/tenant-onboarding/operations/{operationId}/retry` | Existing platform-only operation retry |
| Platform tenant | `POST /api/v1/platform-admin/tenant-onboarding/tenants/{tenantId}/invitation/resend` | Activation-gated invitation resend |

Manual responses keep `checkoutUrl` null. `IPaymentProvider` supplies create/status/callback/cancel/refund mapping for future providers, but the manual adapter creates no provider session and exposes no callback endpoint.

## Related

[[FLOW_4_MANUAL_PAYMENT_AND_FUTURE_IPG_ARCHITECTURE]]

[[../03_USER_JOURNEYS/Platform_Admin/FLOW_4_CREATE_TENANT_WIZARD_CANONICAL_SPEC]] · [[../06_DATABASE_KNOWLEDGE/Tables/FLOW_4_CREATE_TENANT_WIZARD_FIELD_TO_TABLE_MATRIX]]
