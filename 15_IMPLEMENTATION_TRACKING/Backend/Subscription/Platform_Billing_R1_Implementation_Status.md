<!-- title: Platform Billing R1 Backend Implementation Status -->
<!-- status: Active -->
<!-- last_updated: 2026-07-13 -->

# Platform Billing R1 Backend Implementation Status

## Status

Implemented on branch `feature/platform-billing-release-1`.

## Delivered

- Typed summary, paged invoice list, invoice detail, payment history, and filter-option APIs.
- Search/filter/date/sort/page operations execute in the repository/database query.
- Currency-separated paid revenue, outstanding, overdue, and invoice counts.
- Derived overdue display state without changing the stored invoice vocabulary.
- Domain-owned `DRAFT -> PENDING` and `PENDING -> PAID` transitions.
- View/manage permission checks in the application service.
- `updated_at` optimistic concurrency comparison and EF concurrency token.
- Dashboard pending-billing count corrected to unpaid pending invoices.
- No migration required; existing schema supports the R1 surface.

## Verification

- `dotnet build E_POS.sln --no-restore`: passed with zero warnings/errors.
- Lifecycle unit tests cover valid and invalid issue/mark-paid transitions.
- Final hardening suite: 684/684 passed (278 unit, 224 integration, 182 API).
- Live PostgreSQL smoke: login plus summary, list (6 rows), filter options, and detail endpoints returned success.
- Final live PostgreSQL smoke also passed invoice search, tenant/status/date filters, 401, 404, validation 400, `DRAFT -> PENDING`, stale-write 409, and `PENDING -> PAID` using a local development invoice.
- EF model verification: `No changes have been made to the model since the last migration.` No migration is required.

## Deferred

Manual creation, payment gateway/link commands, reminders, refunds, credit-note commands, automatic charging/suspension, accounting, and advanced usage billing.
