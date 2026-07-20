<!-- title: Platform Billing UI Implementation Status -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-20 -->

# Platform Billing UI Implementation Status

## Overall Status

```text
Platform Billing: Completed
Development: Completed
Integration: Completed
Release Verification: Completed
Release Status: Release Ready
```

**Final verdict:**

```text
BILLING PHASE 6 COMPLETED — RELEASE READY (Issue Invoice + Mark Paid)
```

**Release 1 scope note:** Payment Links are mandatory for Release 1 but not yet
implemented — final major Super Admin feature. Current UI/API cover read, Issue,
and Mark Paid only. See [[SA-P1_Payment_Links_Release_1_Scope_And_Sequencing]] and
[[Payment_Links_Implementation_Readiness_Checklist]].

## Current Baseline

| Item | Value |
|---|---|
| Platform | Angular Platform Admin |
| Feature | Platform Billing Management UI |
| Status | Completed — Release Ready |
| Route | `/admin/billing` |
| Current component | Lazy-loaded `PlatformBillingPage` |
| Backend | Ready and verified against live Platform Admin Billing API |
| Backend change required for UI | No |
| Database migration required | No |
| Read permission | `platform.billing.view` |
| Mutation permission | `platform.billing.manage` |
| Frontend merged commit | `7eec3ad` (PR #32; feature commit `c8a8992`) |
| Backend verified main | `f8cf0b3` (includes Development Platform Admin test accounts, PR #49) |
| Angular production build | Passed |
| Frontend test files | 42 |
| Frontend tests passed | 353 |
| Frontend failed | 0 |
| Frontend skipped | 0 |
| Backend build | Passed |
| Backend tests passed | 1035 |
| Backend failed | 0 |
| Backend skipped | 0 |
| Baseline verified | 2026-07-17 |

Dedicated Billing models, mapper, API service, page, components, mutation
confirmation dialog, and tests are present. Runtime Billing data comes only from
the real Platform Admin Billing API. No mock or fallback Billing data path exists
in the Angular feature.

## Backend Readiness

The implemented backend supplies summary, invoice list/detail, payment history,
filter options, Issue, and Mark Paid under `/api/v1/platform-admin/billing`.
Optimistic concurrency, permission enforcement, per-currency summaries, and
action eligibility flags are available and verified.

See [[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]].

Development Platform Admin test accounts (backend PR #49) are **testing
infrastructure only**. They enabled Billing Viewer and No-Billing browser
verification. They do **not** complete the future Platform Admin invite /
set-password product flow.

## Implementation Phases

### Phase 1 — Contracts, models, mapper and API service

**Status:** Completed

Delivered:

- Platform Billing endpoint configuration
- Strict Billing models
- API DTO mapping
- Billing mapper
- Typed Billing API service
- Seven Billing API operations
- Mapper tests
- API service tests

Key Angular files:

- `src/app/core/config/api-endpoints.ts`
- `src/app/features/admin/models/platform-billing.model.ts`
- `src/app/features/admin/mappers/platform-billing.mapper.ts`
- `src/app/features/admin/mappers/platform-billing.mapper.spec.ts`
- `src/app/features/admin/services/platform-billing-api.service.ts`
- `src/app/features/admin/services/platform-billing-api.service.spec.ts`

### Phase 2 — Billing route, summary, invoice list and pagination

**Status:** Completed

Delivered:

- `/admin/billing` no longer uses `AdminSectionPage`
- Lazy-loaded `PlatformBillingPage`
- Route permission remains `platform.billing.view`
- Real Billing summary API integration
- Real invoice-list API integration
- Per-currency summary cards
- Invoice table
- Server-side pagination
- Loading states
- Independent error states
- Empty state
- Retry actions
- Refresh behaviour

Key Angular files:

- `src/app/features/admin/routes/admin.routes.ts`
- `src/app/features/admin/pages/platform-billing-page/platform-billing-page.ts`
- `src/app/features/admin/pages/platform-billing-page/platform-billing-page.spec.ts`
- `src/app/features/admin/components/platform-billing-summary-cards/platform-billing-summary-cards.ts`
- `src/app/features/admin/components/platform-billing-summary-cards/platform-billing-summary-cards.spec.ts`
- `src/app/features/admin/components/platform-invoice-table/platform-invoice-table.ts`
- `src/app/features/admin/components/platform-invoice-table/platform-invoice-table.spec.ts`

### Phase 3 — Search, filters, date validation and server sorting

**Status:** Completed

Delivered:

- 300ms debounced server-side search
- Search trimming
- Tenant filter options from real API
- Status filter options from real API
- Supported statuses: `DRAFT`, `PENDING`, `OVERDUE`, `PAID`
- Date-field filtering: `issuedAt`, `dueAt`
- Optional `dateFrom` and `dateTo`
- Local invalid-date-range validation
- Server-side sorting
- Accessible `aria-sort`
- Filter preservation across pagination
- Filter preservation across refresh
- Reset-to-default behaviour
- Stale-response protection
- No client-side invoice filtering or sorting

Key Angular files:

- `src/app/features/admin/components/platform-billing-filters/platform-billing-filters.ts`
- `src/app/features/admin/components/platform-billing-filters/platform-billing-filters.spec.ts`
- Updated `platform-billing-page.ts` / `.spec.ts`
- Updated `platform-invoice-table.ts` / `.spec.ts`

### Phase 4 — Invoice detail and payment history

**Status:** Completed

Delivered:

- Accessible invoice-table View action that emits the selected invoice ID
- Billing page owns invoice-detail and payment-history API orchestration
- Real invoice-detail API integration
- Real payment-history API integration
- Independent detail and payment loading states
- Invoice metadata and lifecycle dates
- Currency-aware monetary summary
- Invoice line items, including empty and decimal-quantity handling
- Payment provider, reference, status, amount, fee, and net amount
- Empty payment history treated as a valid state
- Payment-history failure does not hide loaded invoice detail
- Invoice-not-found handling
- Detail retry and payment-history retry
- Stale detail and payment-response protection
- Drawer close invalidates pending requests
- Opening detail preserves summary, search, filters, sorting, and pagination
- Escape close, focus into drawer, and focus restoration where practical
- Responsive desktop side panel and mobile full-screen drawer

Key Angular files:

- `src/app/features/admin/components/platform-billing-invoice-detail/platform-billing-invoice-detail.ts`
- `src/app/features/admin/components/platform-billing-invoice-detail/platform-billing-invoice-detail.spec.ts`
- `src/app/features/admin/components/platform-billing-payment-history/platform-billing-payment-history.ts`
- `src/app/features/admin/components/platform-billing-payment-history/platform-billing-payment-history.spec.ts`
- Updated `platform-invoice-table.ts` / `.spec.ts`
- Updated `platform-billing-page.ts` / `.spec.ts`

### Phase 5 — Issue Invoice and Mark Paid mutation UI

**Status:** Completed

Delivered:

- Issue Invoice action in the invoice-detail action area
- Mark Paid action in the invoice-detail action area
- `platform.billing.manage` gating (view-only users see no mutation controls)
- Backend eligibility gating via `canIssue` and `canMarkPaid` (backend remains
  authoritative; eligibility is not derived only from display status)
- Feature-owned confirmation dialog for Issue and Mark Paid
- Mutations send the latest invoice `updatedAt` as `expectedUpdatedAt`
- Mark Paid omits `paidAt` by default (server applies paid timestamp)
- Loading state on confirmation submit
- Duplicate-submit prevention while a mutation is in flight
- Accurate success feedback after Issue and Mark Paid
- Summary, invoice list, and open detail refresh after successful mutation
- Payment-history refresh after Mark Paid
- Empty payment history remains valid after Mark Paid (UI does not fabricate a
  payment transaction)
- Distinct handling for `platform_billing.invalid_transition`
- Distinct handling for `platform_billing.concurrency_conflict` (no automatic
  retry; reload latest data)
- Safe handling for `platform_billing.access_denied`
- Mutation confirmation and page-level mutation outcome coverage in automated
  tests

Key Angular files:

- `src/app/features/admin/components/platform-billing-mutation-confirmation/platform-billing-mutation-confirmation.ts`
- `src/app/features/admin/components/platform-billing-mutation-confirmation/platform-billing-mutation-confirmation.spec.ts`
- Updated `platform-billing-invoice-detail.ts` / `.spec.ts`
- Updated `platform-billing-page.ts` / `.spec.ts`
- Updated Billing API service / mapper / models for issue and mark-paid requests

### Phase 6 — Permissions, conflicts, browser smoke and release verification

**Status:** Completed

Verified:

- Real Angular ↔ ASP.NET Core backend integration
- Manager (`platform.billing.view` + `platform.billing.manage`) browser flow
- Billing Viewer (view only) read-only browser flow
- No-Billing route and API denial browser flow
- Super Admin regression (view + manage unchanged)
- Issue Invoice against the real backend
- Mark Paid against the real backend
- Responsive smoke: desktop `1440 × 900`, tablet `768 × 1024`, mobile `430 × 932`
- Keyboard and accessibility smoke (drawer focus, Escape, dialog name, text
  status, loading prevents duplicate confirmation)
- DevTools clean for verified flows
- No CORS issue on the verified proxy path
- No duplicate mutation POST through normal UI
- No Billing data leakage for No-Billing users
- Frontend and backend builds and automated suites green

## Verification Baseline

Verified on 2026-07-17 against merged Angular Billing mutations (`7eec3ad`) and
backend main (`f8cf0b3`):

| Check | Result |
|---|---|
| Frontend production build | Passed |
| Frontend test files | 42 |
| Frontend tests | 353 passed / 0 failed / 0 skipped |
| Backend build | Passed |
| Backend tests | 1035 passed / 0 failed / 0 skipped |
| Manager browser verification | Verified |
| Billing Viewer browser verification | Verified |
| No-Billing browser verification | Verified |
| Super Admin regression | Verified |

## Release Evidence

### Frontend

```text
Repository: Nytroz-POS-Platform_Admin
Merged commit: 7eec3ad
Feature commit: c8a8992
Build: Passed
Test files: 42
Tests: 353 passed
```

### Backend

```text
Repository: Unified-Commerce
Current verified main: f8cf0b3
Build: Passed
Tests: 1035 passed
```

### Permission Browser Verification

```text
Manager: Verified
Billing Viewer: Verified
No Billing Access: Verified
Super Admin regression: Verified
```

### Final verdict

```text
BILLING PHASE 6 COMPLETED — RELEASE READY
```

## Accepted Release Verification Limitations

These are accepted non-blocking local test-data limitations, not Billing defects:

```text
Only LKR invoices were available locally.
No SubscriptionPaymentTransaction records were available.
The local invoice list fitted one page.
Invalid actions were hidden by eligibility, so invalid-transition UX was verified through API and automated tests.
Concurrency conflict was verified through stale expectedUpdatedAt API/session testing and frontend automated tests.
```

Why these are not release blockers:

- Per-currency grouping has frontend and backend automated coverage.
- No FX rollup is required by the approved contract.
- Empty payment history is supported current product behaviour.
- Pagination API behaviour and unit tests are complete.
- Invalid actions are correctly prevented by manage permission and eligibility.
- Backend concurrency authority is verified.

## Technical Confirmation

| Item | Value |
|---|---|
| Backend modified for Angular Billing UI work | No |
| Database migration created for Billing UI | No |
| Mock Billing data added | No |
| Unsupported statuses or actions added | No |
| Partial-payment, cancellation, void, or overpayment UI added | No |
| Invite/set-password product flow completed by Billing work | No |

## Acceptance Criteria

### Completed through Phase 6

- `/admin/billing` no longer renders `AdminSectionPage`.
- Runtime Billing data comes only from the real Platform Admin Billing API.
- Users without `platform.billing.view` cannot see or open Billing.
- Users without `platform.billing.manage` receive a read-only experience with no
  Issue or Mark Paid controls.
- Summary cards preserve separate monetary totals per currency.
- Search, tenant/status/date filters, server sorting, and server pagination map
  to the documented query contract.
- Invoice detail displays real line items and payment history.
- Detail and payment-history loading, empty, error, retry, not-found, and
  read-only states are implemented.
- Issue is offered only for `canIssue`; Mark Paid only for `canMarkPaid`.
- Both mutations send the latest `updatedAt` as `expectedUpdatedAt`.
- Mark Paid omits `paidAt` by default.
- Invalid transitions and stale concurrency conflicts receive distinct HTTP 409
  UI handling and reload current data without automatic retry.
- Confirmation, success, mutation-failure, conflict, and access-denied paths are
  covered by automated tests and browser verification.
- The UI exposes no invoice-create, partial-payment, overpayment, cancel, void,
  payment-link, reminder, or automatic suspension action.
- Opening detail preserves the active list query state.
- Stale detail and payment responses are ignored.
- Angular production build passes.
- Angular tests pass with zero failures and zero skips.
- Backend build and Billing-related suites pass.
- Real-backend browser verification for Manager, Viewer, No-Billing, and Super
  Admin regression is complete.

## Unsupported Future Scope

Not part of Billing completion:

- Invoice creation UI/API
- Partial payment, overpayment, refund
- Cancel or void invoice
- Payment gateway reconciliation
- Payment links and automated reminders
- Auto-suspension / Billing-driven activation
- Full Platform Admin invite / accept-invite / set-password product flow

## Completion Rule

Update this document with changed files, test totals, browser evidence, commit or
PR reference, and completion date. Do not mark Completed from compilation alone.

## Related Files

- [[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]]
- [[04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/04_Platform_Billing_Functional_Specification]]
- [[07_UI_UX_KNOWLEDGE/Platform_Admin_Billing_UI]]
- [[02_ACCESS_CONTROL/Permission_Code_List]]
- [[03_USER_JOURNEYS/Platform_Admin/10_Billing_Flow]]
- [[03_USER_JOURNEYS/Platform_Admin/12_Subscription_Billing_Management_Flow]]
