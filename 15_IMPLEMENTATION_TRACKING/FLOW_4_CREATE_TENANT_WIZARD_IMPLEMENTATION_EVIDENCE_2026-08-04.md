<!-- title: Flow 4 Create Tenant Wizard Implementation Evidence -->
<!-- status: In Progress — NO-GO -->
<!-- last_updated: 2026-08-04 -->

# Flow 4 — Create Tenant Wizard implementation evidence

## Executive result

Implementation advanced from the audited 57% baseline to an estimated 72%. Durable drafts, ETag concurrency, the canonical seven-step Angular order, save/resume UI, idempotent transaction locking, atomic internal persistence, a shared leased outbox, activation-gated hash-only invitation generation, contact/tax persistence, and a forward migration are implemented.

Release remains **NO-GO**. Payment provider session creation and signed callback processing are not implemented because no provider adapter exists in the repository. Retry/resend APIs, complete correlated draft audit coverage, activation-command outbox refactoring, focused PostgreSQL concurrency/fault-injection coverage, and canonical E2E execution also remain P0.

## Repository evidence

| Repository | Branch | Starting commit |
|---|---|---|
| Backend | `feat/flow4-create-tenant-runtime` | `7c67bbd80310b6d2afdde5ba6b67e88dd880f8e5` |
| Platform Admin Angular | `feat/flow4-create-tenant-runtime` | `29b169fd4e77b659fb94afa51f8883351cbc89d7` |
| Second Brain | `docs/flow4-create-tenant-runtime` | `d3a04d3c4d7e1c1dce4ff00a97d57138e19524d0` |

The unrelated backend untracked `projects/12_IMPLEMENTATION_TRACKING/Backend/Email/` directory was preserved and excluded.

## Database and backend implemented

- Forward migration: `20260804055813_AddFlow4TenantOnboardingRuntime`.
- New tables: `platform_tenant_onboarding_drafts`, `platform_tenant_onboarding_operations`, `tenant_contacts`, and `integration_outbox_messages`.
- Added registration/tax fields, entitlement override reason, payment idempotency index, concurrency tokens, checks, partial uniques, bounded leases, and deduplication indexes.
- Added versioned draft payload, owner/edit-any authorization, and create/list/get/save/discard/validate/finalize/operation APIs.
- Finalization locks the draft with `FOR UPDATE`, rechecks version and draft-scoped idempotency hashes, and atomically commits the tenant aggregate, counters, history, operation, outbox, and draft receipt.
- Tenant Admin identity is tenant-local. Placeholder invite creation was removed from finalization.
- The outbox worker uses `FOR UPDATE SKIP LOCKED`, bounded leases, exponential retry, maximum attempts, and safe error codes.
- Invitation delivery generates a 256-bit raw token only in worker memory, persists its keyed hash, invalidates older pending invites, checks activation eligibility, and uses the existing ACS boundary without token logging.
- Payment-link work is durably queued but currently retries with `payment_provider_not_configured`; no fake link or success is produced.

## Angular implemented

- Exact order: Tenant Basic Details; Business & Contact Information; Subscription Plan; Billing / Payment Setup; Feature Entitlements; Tenant Admin User; Review, Create & Activation.
- Explicit Save Draft, save-and-continue, durable progress/version state, resume, draft list/discard, stable finalization key, bounded operation polling, and payment/activation/invitation result projection.
- Routes for draft list, resume, and operation result.
- Geographic/currency/timezone/billing defaults come from create-options rather than component constants.

## Validation evidence

| Command | Result |
|---|---|
| `dotnet build E_POS.sln --no-restore` | Passed, 0 warnings, 0 errors |
| `dotnet test E_POS.sln --no-restore` | Passed: Unit 727, API 336, Integration 373; total 1,436 |
| `npm run build` | Passed; existing component-style budget warnings only |
| `npm test -- --watch=false` | Passed: 420/420 |
| `dotnet ef migrations has-pending-model-changes ...` | Passed: no pending model changes |
| `dotnet ef database update ...` | Passed against representative PostgreSQL `UnifiedCommerceDb` |
| `git diff --check` | Passed in backend and frontend |

An initial regenerated migration exposed an inconsistent historical designer baseline and attempted to create the full schema. PostgreSQL rejected the first existing table and rolled the transaction back. The current snapshot was restored, the migration regenerated as a delta-only 24 KB migration, rebuilt, reviewed, and applied successfully.

## Canonical 17 E2E scenarios

All 17 are **Not executed** as browser/API E2E scenarios in this environment. Existing automated suites do not substitute for this release gate.

## Remaining P0 blockers

1. Real payment provider adapter, session persistence, signed callback verification, amount/currency/reference validation, and callback-deduplication tests.
2. Operation retry and invitation resend APIs with idempotency and throttling.
3. Existing activation command refactor for locked/idempotent activation and transactional invitation outbox publication.
4. Complete correlated audit events for draft/payment/activation/invitation transitions.
5. Focused PostgreSQL concurrency, idempotency, fault-injection, lease-expiry, and isolation tests.
6. Canonical 17 E2E scenarios plus accessibility/responsive browser evidence.
7. Clean-database migration and downgrade verification; representative existing-database application passed.

## Deployment configuration

- `TenantOnboardingOutbox:TenantAdminAppBaseUrl`
- ACS endpoint/connection/sender values
- Tenant signing key from secret storage
- Payment provider credentials, webhook signature secret, and callback URL after adapter implementation
- Platform base domain and create-option defaults

## Release decision

**NO-GO — P0 payment, activation/retry/audit, PostgreSQL concurrency, and E2E gates remain.**
