<!-- title: API Standards -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-13 -->

# API Standards

## Purpose

This file defines Release 1 API standards for the TM-EPOS MVP.

APIs must be predictable for Flutter POS and Angular Platform Admin.

## API Style

Use REST APIs.

Use versioned routes.

Example:

```text
/api/v1/auth/login
/api/v1/products
/api/v1/inventory/stock-adjustments
/api/v1/pos/sales
```

## Controller Rule

Controllers must:

- Validate authentication/authorization attributes.
- Accept request DTOs.
- Call Application services.
- Return standard responses.
- Avoid business logic.
- Avoid direct DbContext access.

## HTTP Method Rule

| Method | Use |
|---|---|
| GET | Read/list/detail |
| POST | Create or business action |
| PUT/PATCH | Update |
| DELETE | Soft delete/deactivate only where safe |

## Main API Groups

Release 1 API groups include:

- `/api/v1/auth`
- `/api/v1/platform`
- `/api/v1/tenants`
- `/api/v1/subscriptions`
- `/api/v1/features`
- `/api/v1/outlets`
- `/api/v1/tills`
- `/api/v1/devices`
- `/api/v1/users`
- `/api/v1/roles`
- `/api/v1/permissions`
- `/api/v1/products`
- `/api/v1/categories`
- `/api/v1/inventory`
- `/api/v1/discounts`
- `/api/v1/pos/sales`
- `/api/v1/pos/payments`
- `/api/v1/pos/receipts`
- `/api/v1/pos/returns`
- `/api/v1/pos/refunds`
- `/api/v1/pos/exchanges`
- `/api/v1/customers`
- `/api/v1/loyalty`
- `/api/v1/reports`
- `/api/v1/files`
- `/api/v1/notifications`

E-commerce and offline operation/sync are approved TM-EPOS MVP areas under
[[../00_START_HERE/Current_Source_Of_Truth]]. Add their API groups only in work
explicitly scoped to those areas. Supplier, delivery, kiosk, AI, and coupon API
groups remain reserved until separately confirmed.

## Current Super Admin Completion Scope

The current Platform Admin completion branch includes subscription-plan
lifecycle and a dedicated subscription-plan detail view; tenant details and
editing; tenant subscription assignment and entitlements; and tenant suspension
and reactivation.

This branch does not include Tenant Audit History viewing, Flutter POS or Tenant
Admin Flutter work, checkout, inventory, returns/refunds, e-commerce, or offline
sync. These branch exclusions do not remove separately approved TM-EPOS MVP
scope. No tenant audit-history endpoint or placeholder UI is required for this
release.

## Standard Success Response

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {}
}
```

## Standard Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    { "field": "barcode", "message": "Barcode is required" }
  ],
  "traceId": "00-..."
}
```

## POS Checkout Error Rules

POS checkout/payment endpoints must use the standard error response shape.

| Case | Status | Rule |
|---|---|---|
| Empty cart / invalid quantity / unsupported payment method / cash short | 400 | Return a clear validation/business message. |
| Missing or expired authentication | 401 | Authentication middleware response. |
| Missing permission, device trust, or till access | 403 | Do not return 401 for an authenticated user lacking access. |
| Product, sale, or receipt not found inside tenant scope | 404 | Return safe not-found message. |
| Insufficient stock or business-state conflict | 409 | Return conflict message so Flutter can refresh/recalculate cart. |
| Unexpected failure | 500 | Return safe generic error; do not expose stack trace or SQL details. |

Checkout validation failures must happen before sale/payment persistence where
possible. Payment success responses must be returned only after database save
succeeds.

## List API Rule

List APIs must support pagination from the beginning.

Common filters:

- Status.
- Date range.
- Outlet.
- Category.
- Product type.
- Stock status.
- Search term.

## Platform Subscription Plans List (Implemented 2026-06-17)

| Item | Standard |
|---|---|
| Route | `GET /api/v1/platform/subscription-plans` |
| Auth | Platform JWT only |
| Permission | `platform.subscription_plans.view` |
| Pagination | `pageNumber`, `pageSize` (max 100) |
| Filters | `search`, `planType`, `status`, `billingCycle`, `currencyCode` |
| Sorting | `sortBy`, `sortDirection`; default `updatedAt desc` |
| Response wrapper | Standard success wrapper with paginated `data.items` and `data.statusCounts` |

## Related Files

- [[DTO_And_Mapping_Rules]]
- [[Error_Response_Standards]]
- [[Authentication]]
- [[Authorization_And_Permissions]]
