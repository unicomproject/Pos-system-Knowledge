<!-- title: Platform Billing API Contract -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-15 -->

# Platform Billing API Contract

## Purpose And Scope

This file is the current implemented API contract for Platform Admin Billing
Management. It covers invoice summary, list, detail, payment-history reads, filter
options, issuing an existing draft invoice, and marking an existing pending invoice
paid.

It does not define the broader target billing platform described in
[[04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/03_Technical_Contract]].

## Verification Baseline

Verified on 2026-07-15 against the Unified Commerce backend controller, service,
repository, DTOs, domain entity, EF configuration, and automated tests.

| Item | Current contract |
|---|---|
| Controller | `PlatformAdminBillingController` |
| Base route | `/api/v1/platform-admin/billing` |
| Authentication | ASP.NET Core `PlatformOnly` authorization policy |
| Read permission | `platform.billing.view` |
| Mutation permission | `platform.billing.manage` |
| Success envelope | `LegacyApiResponse<T>` |

Frontend route/menu checks are UX enforcement only. `PlatformBillingService`
performs the mandatory permission checks before repository access.

## Endpoints

| Method | Route | Permission | Request | Response data |
|---|---|---|---|---|
| GET | `/summary` | `platform.billing.view` | `PlatformBillingQuery` | `PlatformBillingSummaryResponse` |
| GET | `/invoices` | `platform.billing.view` | `PlatformBillingQuery` | `PlatformBillingInvoiceListResponse` |
| GET | `/invoices/{invoiceId}` | `platform.billing.view` | Invoice GUID | `PlatformBillingInvoiceDetailResponse` |
| GET | `/invoices/{invoiceId}/payments` | `platform.billing.view` | Invoice GUID | `IReadOnlyList<PlatformBillingPaymentDto>` |
| GET | `/filter-options` | `platform.billing.view` | None | `PlatformBillingFilterOptionsResponse` |
| POST | `/invoices/{invoiceId}/issue` | `platform.billing.manage` | `PlatformBillingTransitionRequest` | `PlatformBillingInvoiceDto` |
| POST | `/invoices/{invoiceId}/mark-paid` | `platform.billing.manage` | `PlatformBillingMarkPaidRequest` | `PlatformBillingInvoiceDto` |

All routes in this table are relative to `/api/v1/platform-admin/billing`.

## Success Envelope

Successful responses use the existing API envelope:

```json
{
  "success": true,
  "message": "Invoices loaded successfully.",
  "data": {}
}
```

The concrete type of `data` is the response DTO shown in the endpoint table.

## Query Contract

`GET /summary` and `GET /invoices` accept `PlatformBillingQuery`.

| Parameter | Type | Default | Rule |
|---|---|---:|---|
| `pageNumber` | integer | `1` | Normalized to at least 1; list endpoint only |
| `pageSize` | integer | `10` | Clamped to 1-100; list endpoint only |
| `search` | string | null | Case-insensitive invoice number, tenant name, or tenant code search |
| `tenantId` | GUID | null | Exact tenant filter |
| `status` | string | null | Use `DRAFT`, `PENDING`, `OVERDUE`, or `PAID` |
| `dateFrom` | `DateTimeOffset` | null | Inclusive lower bound |
| `dateTo` | `DateTimeOffset` | null | Inclusive upper bound |
| `dateField` | string | `issuedAt` | `issuedAt` or `dueAt` |
| `sortBy` | string | `createdAt` | Supported fields listed below |
| `sortDirection` | string | `desc` | `asc` or `desc` |

The summary applies search, tenant, status, and date filters but does not paginate
its currency aggregates.

### Sorting

Supported `sortBy` values are case-insensitive:

- `createdAt`
- `invoiceNumber`
- `tenant`
- `amount`
- `status`
- `issuedAt`
- `dueAt`

Unsupported sorting, an invalid direction, an invalid date field, or
`dateFrom > dateTo` returns `platform_billing.validation_failed`.

Unknown status values are not strongly validated and can return an empty result.
Clients must use values returned by `/filter-options`.

## Pagination Response

`PlatformBillingInvoiceListResponse` contains:

| Field | Meaning |
|---|---|
| `items` | Current page of `PlatformBillingInvoiceDto` |
| `pageNumber` | Normalized page number |
| `pageSize` | Normalized page size |
| `totalCount` | Total filtered invoice count |
| `totalPages` | Calculated page count |

## Response DTOs

### `PlatformBillingSummaryResponse`

- `currencies`: `PlatformBillingCurrencySummaryDto[]`
- `totalInvoices`: combined non-monetary invoice count
- `generatedAt`: server UTC timestamp

Each currency row contains `currencyCode`, `paidRevenue`, `outstandingAmount`,
`overdueAmount`, and `invoiceCount`.

### `PlatformBillingInvoiceDto`

Contains invoice/tenant/subscription/plan identifiers and labels, `currencyCode`,
`totalAmount`, `paidAmount`, `balanceDue`, `storedStatus`, `displayStatus`,
`issuedAt`, `dueAt`, `paidAt`, `createdAt`, `updatedAt`, `canIssue`, and
`canMarkPaid`.

The frontend must use `canIssue` and `canMarkPaid` together with
`platform.billing.manage`; it must not derive additional actions locally.

### `PlatformBillingInvoiceDetailResponse`

Contains `invoice`, `invoiceType`, `billingCycle`, billing-period dates,
`subtotalAmount`, `discountAmount`, `taxAmount`, `lines`, and `payments`.
Invoice lines are `PlatformBillingInvoiceLineDto`; payments are
`PlatformBillingPaymentDto`.

### `PlatformBillingPaymentDto`

Contains transaction ID, provider name/reference, status, currency, amount,
provider fee, net amount, paid timestamp, and created timestamp.

### `PlatformBillingFilterOptionsResponse`

Contains invoice-bearing tenant options (`id`, `code`, `name`) and supported
statuses: `DRAFT`, `PENDING`, `OVERDUE`, and `PAID`.

## Mutation Requests

Issue request:

```json
{
  "expectedUpdatedAt": "2026-07-15T06:00:00Z"
}
```

Mark-paid request:

```json
{
  "expectedUpdatedAt": "2026-07-15T06:00:00Z",
  "paidAt": "2026-07-15T06:15:00Z"
}
```

`paidAt` is optional and defaults to current server time. `expectedUpdatedAt` is
required for both actions and must be the latest invoice `updatedAt` returned by
the API.

## Invoice Status And Action Rules

Stored statuses are `DRAFT`, `PENDING`, and `PAID`.

`OVERDUE` is a derived display/filter status:

```text
storedStatus == PENDING and dueAt < current UTC time
```

Allowed lifecycle:

```text
DRAFT -> PENDING -> PAID
```

- Issue accepts only `DRAFT` and sets the invoice to `PENDING`.
- Mark Paid accepts only `PENDING`, sets `paidAmount = totalAmount`, and sets
  `balanceDue = 0`.
- Mark Paid settles the whole invoice; no amount is accepted from the client.

## Concurrency

The repository first compares `expectedUpdatedAt` with the stored `UpdatedAt`.
`UpdatedAt` is also configured as an EF Core concurrency token. A stale timestamp
or database concurrency exception returns HTTP 409 with
`platform_billing.concurrency_conflict`.

The client must reload the invoice before retrying. It must not automatically
repeat a mutation with a stale timestamp.

## HTTP And Error Contract

| Status | Error code / case |
|---:|---|
| 200 | Successful read or mutation |
| 400 | `platform_billing.validation_failed` or framework body/model binding failure |
| 401 | Missing/invalid platform session, including `platform_auth.invalid_session` |
| 403 | `platform_billing.access_denied` |
| 404 | `platform_billing.invoice_not_found` |
| 409 | `platform_billing.invalid_transition` |
| 409 | `platform_billing.concurrency_conflict` |

Errors follow the existing envelope with `success: false`, `message`,
`errorCode`, `errors`, and `traceId`.

## Multi-Currency Rules

Currency is stored per invoice. Summary monetary values are grouped by
`currencyCode` and ordered by currency.

- Never add LKR, USD, or any other currencies into one monetary total.
- Render a separate monetary summary for each returned currency.
- `totalInvoices` may be shown as one combined count because it is not money.
- Preserve each invoice/payment currency when formatting amounts.

## Known Current Limitations

These are current scope limitations and do not block the scoped Billing UI:

- No Platform Billing endpoint creates a new invoice.
- No partial-payment mutation is exposed.
- No cancellation or void mutation is exposed.
- No overpayment action is exposed.
- Mark Paid may not create a payment-history transaction.
- Unknown status values can produce an empty result instead of validation error.
- `paidAt` lacks strong lifecycle/future-date domain validation.
- Default sorting has no explicit secondary tie-breaker.

The frontend must not invent controls for unsupported actions.

## Backend Source And Tests

Source paths in `Nytroz POS - Backend New/Unified-Commerce`:

- `src/E_POS.Api/Controllers/V1/Platform/PlatformAdmin/PlatformAdminBillingController.cs`
- `src/E_POS.Application/Modules/Platform/PlatformAdmin/Services/PlatformBillingService.cs`
- `src/E_POS.Application/Modules/Platform/PlatformAdmin/Contracts/IPlatformBillingService.cs`
- `src/E_POS.Application/Modules/Platform/PlatformAdmin/Contracts/IPlatformBillingRepository.cs`
- `src/E_POS.Application/Modules/Platform/PlatformAdmin/Dtos/PlatformBillingDtos.cs`
- `src/E_POS.Infrastructure/Modules/Platform/PlatformAdmin/Repositories/PlatformBillingRepository.cs`
- `src/E_POS.Domain/Modules/Platform/Subscription/Entities/SubscriptionInvoice.cs`
- `src/E_POS.Infrastructure/Modules/Platform/Subscription/Configurations/SubscriptionInvoiceConfiguration.cs`

Tests:

- `tests/E_POS.ApiTests/PlatformAdministration/PlatformAdminBillingControllerTests.cs`
- `tests/E_POS.UnitTests/PlatformAdministration/PlatformBillingServiceTests.cs`
- `tests/E_POS.IntegrationTests/PlatformAdministration/PlatformBillingRepositoryTests.cs`
- `tests/E_POS.UnitTests/SubscriptionBilling/SubscriptionInvoiceLifecycleTests.cs`

## Related Files

- [[04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/04_Platform_Billing_Functional_Specification]]
- [[07_UI_UX_KNOWLEDGE/Platform_Admin_Billing_UI]]
- [[02_ACCESS_CONTROL/Permission_Code_List]]
- [[15_IMPLEMENTATION_TRACKING/Angular/Billing/Platform_Billing_UI_Implementation_Status]]
