<!-- title: Platform Billing UI Implementation Status -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-16 -->

# Platform Billing UI Implementation Status

## Current Baseline

| Item | Value |
|---|---|
| Platform | Angular Platform Admin |
| Feature | Platform Billing Management UI |
| Status | In Progress — Read-only Billing experience completed; mutation workflow pending |
| Route | `/admin/billing` |
| Current component | Lazy-loaded `PlatformBillingPage` |
| Backend | Ready for scoped frontend implementation |
| Backend change required | No |
| Database migration required | No |
| Read permission | `platform.billing.view` |
| Mutation permission | `platform.billing.manage` |
| Angular production build | Passed |
| Test files | 41 passed |
| Tests passed | 329 |
| Failed | 0 |
| Skipped | 0 |
| Baseline verified | 2026-07-16 |

Dedicated Billing models, mapper, API service, page, components, and tests are
present. Runtime Billing data comes only from the real Platform Admin Billing API.
No mock or fallback Billing data path exists in the Angular feature.

## Backend Readiness

The implemented backend supplies summary, invoice list/detail, payment history,
filter options, Issue, and Mark Paid under `/api/v1/platform-admin/billing`.
Optimistic concurrency, permission enforcement, per-currency summaries, and
action eligibility flags are available.

See [[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]].

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
- Read-only invoice table
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
- No Issue Invoice or Mark Paid actions

Key Angular files:

- `src/app/features/admin/components/platform-billing-invoice-detail/platform-billing-invoice-detail.ts`
- `src/app/features/admin/components/platform-billing-invoice-detail/platform-billing-invoice-detail.spec.ts`
- `src/app/features/admin/components/platform-billing-payment-history/platform-billing-payment-history.ts`
- `src/app/features/admin/components/platform-billing-payment-history/platform-billing-payment-history.spec.ts`
- Updated `platform-invoice-table.ts` / `.spec.ts`
- Updated `platform-billing-page.ts` / `.spec.ts`

### Phase 5 — Issue Invoice and Mark Paid mutations

**Status:** Not Started

Pending scope:

- Issue Invoice UI
- Mark Paid UI
- Mutation confirmation dialogs
- `platform.billing.manage` action visibility
- Invalid-transition UI
- Concurrency-conflict UI
- Mutation success refresh behaviour

### Phase 6 — Permission, conflict, E2E and release verification

**Status:** Not Started

Pending scope:

- Browser-level real-backend smoke testing
- End-to-end release verification for the full Billing surface

## Next Phase

**Phase 5 — Issue Invoice and Mark Paid mutations**

## Verification Baseline

Verified on 2026-07-16 against merged Angular `main` after Phase 4:

| Check | Result |
|---|---|
| Production build | Passed |
| Test files | 41 passed |
| Tests passed | 329 |
| Failed | 0 |
| Skipped | 0 |

## Technical Confirmation

| Item | Value |
|---|---|
| Backend modified for this UI work | No |
| Database migration created | No |
| Mock Billing data added | No |
| Unsupported statuses or actions added | No |
| Partial-payment, cancellation, void, or overpayment UI added | No |

## Acceptance Criteria

### Completed through Phase 4

- `/admin/billing` no longer renders `AdminSectionPage`.
- Runtime Billing data comes only from the real Platform Admin Billing API.
- Users without `platform.billing.view` cannot see or open Billing.
- Summary cards preserve separate monetary totals per currency.
- Search, tenant/status/date filters, server sorting, and server pagination map
  to the documented query contract.
- Invoice detail displays real line items and payment history.
- Detail and payment-history loading, empty, error, retry, not-found, and
  read-only states are implemented.
- Opening detail preserves the active list query state.
- Stale detail and payment responses are ignored.
- Angular production build passes.
- Angular tests pass with zero failures and zero skips.

### Remaining for later phases

- Users without `platform.billing.manage` must continue to have a read-only
  experience with no Issue or Mark Paid controls once mutation UI is added.
- Issue is offered only for `canIssue`; Mark Paid only for `canMarkPaid`.
- Both mutations send the latest `updatedAt` as `expectedUpdatedAt`.
- Invalid transitions and stale concurrency conflicts receive distinct HTTP 409
  UI states and reload current data.
- The UI exposes no invoice-create, partial-payment, overpayment, cancel, void,
  payment-link, reminder, or automatic suspension action.
- Confirmation, success, mutation-failure, conflict, and no-action states are
  tested once mutation UI is added.
- A browser smoke test verifies real backend summary, list, filtering, detail,
  permissions, Issue, Mark Paid, and concurrency handling.

## Completion Rule

Update this document with changed files, test totals, browser evidence, commit or
PR reference, and completion date. Do not mark Completed from compilation alone.

## Related Files

- [[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]]
- [[04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/04_Platform_Billing_Functional_Specification]]
- [[07_UI_UX_KNOWLEDGE/Platform_Admin_Billing_UI]]
- [[02_ACCESS_CONTROL/Permission_Code_List]]
