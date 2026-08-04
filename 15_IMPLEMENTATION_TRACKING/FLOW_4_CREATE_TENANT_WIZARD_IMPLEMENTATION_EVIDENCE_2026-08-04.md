<!-- title: Flow 4 Create Tenant Wizard Implementation Evidence -->
<!-- status: In Progress — NO-GO -->
<!-- last_updated: 2026-08-04 -->

# Flow 4 — Create Tenant Wizard implementation evidence

## Executive result

Implementation advanced from the audited 57% baseline to an estimated 72%. Durable drafts, ETag concurrency, the canonical seven-step Angular order, save/resume UI, idempotent transaction locking, atomic internal persistence, a shared leased outbox, activation-gated hash-only invitation generation, contact/tax persistence, and a forward migration are implemented.

Release remains **NO-GO**. The approved current-release model is now manual payment verification, so a real provider session and signed callback are no longer current-release P0 gates. The manual access/instructions, proof submission, review/history, payment notifications and paid-to-pending-activation implementation are not built. Retry/resend APIs, complete correlated audit coverage, activation-command outbox refactoring, focused PostgreSQL concurrency/fault-injection coverage, and canonical E2E execution also remain P0.

## Repository evidence

| Repository | Branch | Starting commit | Implemented/evidence commit |
|---|---|---|---|
| Backend | `feat/flow4-create-tenant-runtime` | `7c67bbd80310b6d2afdde5ba6b67e88dd880f8e5` | `2a3c83e1a5cde8f99ae5e7e60698a01004b5943f` |
| Platform Admin Angular | `feat/flow4-create-tenant-runtime` | `29b169fd4e77b659fb94afa51f8883351cbc89d7` | `306dcb7c0218962675ac0c2ca9b1b20c50f48bc8` |
| Second Brain | `docs/flow4-create-tenant-runtime` | `d3a04d3c4d7e1c1dce4ff00a97d57138e19524d0` | `d91562b5d1181fc46829d1e98ccf58d1b73b176a` (evidence bundle) |

The unrelated backend untracked `projects/12_IMPLEMENTATION_TRACKING/Backend/Email/` directory was preserved and excluded.

All three branches were pushed to their corresponding `origin` remotes. Draft PR creation was not available because GitHub CLI authentication is not configured in this environment; no PR was created and nothing was merged.

## Database and backend implemented

- Forward migration: `20260804055813_AddFlow4TenantOnboardingRuntime`.
- New tables: `platform_tenant_onboarding_drafts`, `platform_tenant_onboarding_operations`, `tenant_contacts`, and `integration_outbox_messages`.
- Added registration/tax fields, entitlement override reason, payment idempotency index, concurrency tokens, checks, partial uniques, bounded leases, and deduplication indexes.
- Added versioned draft payload, owner/edit-any authorization, and create/list/get/save/discard/validate/finalize/operation APIs.
- Finalization locks the draft with `FOR UPDATE`, rechecks version and draft-scoped idempotency hashes, and atomically commits the tenant aggregate, counters, history, operation, outbox, and draft receipt.
- Tenant Admin identity is tenant-local. Placeholder invite creation was removed from finalization.
- The outbox worker uses `FOR UPDATE SKIP LOCKED`, bounded leases, exponential retry, maximum attempts, and safe error codes.
- Invitation delivery generates a 256-bit raw token only in worker memory, persists its keyed hash, invalidates older pending invites, checks activation eligibility, and uses the existing ACS boundary without token logging.
- The existing payment outbox message currently retries with `payment_provider_not_configured`; no fake link or success is produced. The approved next change is a real manual-payment handler and secure payment-status workflow, not gateway emulation.

## Approved payment architecture update

- Current release: manual payment verification.
- Prepaid paid result: tenant `PENDING_PAYMENT`, payment `AWAITING_PAYMENT`, invitation not eligible.
- Available target links: `invoiceUrl`, secure `paymentStatusUrl`; manual `checkoutUrl` is null.
- Approval target: payment `PAID`, tenant `PENDING_ACTIVATION`, then separate activation and invitation.
- Future Stripe/PayHere: provider-neutral adapter, signed callback, event deduplication and provider contract tests; not current manual-release evidence.
- Documentation alignment evidence: [[99_AUDITS/FLOW_4_MANUAL_PAYMENT_SECOND_BRAIN_ALIGNMENT_2026-08-04]].

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

1. Manual-payment EF delta: statuses/submission/reviewer metadata, proof association, immutable review history, purpose-bound payment access and raw-URL removal.
2. Secure payment-status/invoice access, proof upload, submission/update, Platform Admin review/history, notification and resend APIs/UI.
3. Operation retry and invitation resend APIs with idempotency and throttling.
4. Existing activation command refactor for locked/idempotent approval-to-pending-activation and activation/invitation outbox publication.
5. Complete correlated audit events for draft/manual-payment/activation/invitation transitions.
6. Focused PostgreSQL concurrency, idempotency, fault-injection, lease-expiry, proof isolation and cross-tenant tests.
7. Canonical 17 E2E scenarios plus accessibility/responsive browser evidence.
8. Clean-database migration and downgrade verification; representative existing-database application passed.

## Deployment configuration

- `TenantOnboardingOutbox:TenantAdminAppBaseUrl`
- ACS endpoint/connection/sender values
- Tenant signing key from secret storage
- Manual payment instructions/reference format, support contact, proof-storage/scanning and secure recipient-access configuration
- Future-only provider credentials, webhook signature secret, and callback URL when a Stripe/PayHere adapter is enabled
- Platform base domain and create-option defaults

## Release decision

**NO-GO — P0 payment, activation/retry/audit, PostgreSQL concurrency, and E2E gates remain.**
