<!-- title: Platform Billing UI Implementation Status -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-15 -->

# Platform Billing UI Implementation Status

## Current Baseline

| Item | Value |
|---|---|
| Platform | Angular Platform Admin |
| Feature | Platform Billing Management UI |
| Status | Not Started |
| Route | `/admin/billing` |
| Current component | `AdminSectionPage` placeholder |
| Backend | Ready for scoped frontend implementation |
| Backend change required | No |
| Database migration required | No |
| Read permission | `platform.billing.view` |
| Mutation permission | `platform.billing.manage` |
| Angular production build | Passed |
| Test files | 33 passed |
| Tests | 222 passed |
| Failed | 0 |
| Skipped | 0 |
| Baseline verified | 2026-07-15 |

No dedicated Billing models, mapper, API service, page, components, or tests
exist at this baseline. Do not mark this feature In Progress or Completed until
source work and verification evidence exist.

## Backend Readiness

The implemented backend supplies summary, invoice list/detail, payment history,
filter options, Issue, and Mark Paid under `/api/v1/platform-admin/billing`.
Optimistic concurrency, permission enforcement, per-currency summaries, and
action eligibility flags are available.

See [[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]].

## Implementation Phases

1. Models, endpoint configuration and mapper.
2. API service and contract tests.
3. Summary and invoice list.
4. Filters, sorting and pagination.
5. Invoice details and payment history.
6. Issue and mark-paid actions.
7. Permissions and error states.
8. Unit tests.
9. Real backend browser smoke test.

## Acceptance Criteria

- `/admin/billing` no longer renders `AdminSectionPage`.
- Runtime Billing data comes only from the real Platform Admin Billing API.
- Users without `platform.billing.view` cannot see or open Billing.
- Users without `platform.billing.manage` have a read-only experience with no
  Issue or Mark Paid controls.
- Summary cards preserve separate monetary totals per currency.
- Search, tenant/status/date filters, server sorting, and server pagination map
  to the documented query contract.
- Invoice detail displays real line items and payment history.
- Issue is offered only for `canIssue`; Mark Paid only for `canMarkPaid`.
- Both mutations send the latest `updatedAt` as `expectedUpdatedAt`.
- Invalid transitions and stale concurrency conflicts receive distinct HTTP 409
  UI states and reload current data.
- The UI exposes no invoice-create, partial-payment, overpayment, cancel, void,
  payment-link, reminder, or automatic suspension action.
- Loading, filter-loading, empty, error, permission-denied, detail-loading,
  confirmation, success, mutation-failure, conflict, no-action, and read-only
  states are tested.
- Angular production build passes.
- All existing and new Angular tests pass with zero failures/skips.
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
