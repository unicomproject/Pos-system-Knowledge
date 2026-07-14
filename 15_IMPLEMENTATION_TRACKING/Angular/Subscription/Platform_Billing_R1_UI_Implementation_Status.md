<!-- title: Platform Billing R1 Angular Implementation Status -->
<!-- status: Active -->
<!-- last_updated: 2026-07-13 -->

# Platform Billing R1 Angular Implementation Status

## Status

Implemented on branch `feature/platform-billing-release-1-ui`.

## Delivered

- `/admin/billing` now loads a real standalone Billing page instead of `AdminSectionPage`.
- Live currency-aware KPI cards, responsive invoice table, server-side search/filter/sort/pagination.
- Loading, empty, inline error, retry, and refresh states.
- Invoice detail drawer with line items and payment history.
- Issue and mark-paid actions shown only with `platform.billing.manage` and valid server state.
- Commands carry `expectedUpdatedAt` and surface safe API conflict messages.
- No manual Create Invoice button because no approved backend use case exists.
- Unreleased placeholder items (Outlets, Tills & Devices, Products, Reports, Alerts) are hidden from the Platform sidebar; existing routes are retained.

## Verification

- `npm run build`: passed; only pre-existing style-budget warnings in unrelated components.
- API service tests cover filter query transmission and concurrency-token mutation payload.
- Final hardening suite: 35 files / 240 tests passed, including 19 dedicated Billing page/route tests.
- Headless Chrome smoke at `/admin/billing`: page title and four KPI labels rendered, 6 live rows rendered, no Create Invoice button, and no hidden Alerts placeholder.
- Invoice detail is route-backed at `/admin/billing/invoices/{invoiceId}` with direct URL, refresh-compatible initialization, retryable 404/403 handling, conflict feedback, and close navigation to `/admin/billing`.
- Final headless Chrome verification passed direct detail URL, hard refresh, drawer close, browser back, six rendered invoice rows, and hidden unreleased sidebar destinations.
