<!-- title: API Standards -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# API Standards

## Purpose

This file defines Release 1 API standards for SCS-TIX EPOS.

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

Do not add e-commerce, supplier, delivery, kiosk, AI, coupon, or offline-sync API
groups for Release 1.

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

## Related Files

- [[DTO_And_Mapping_Rules]]
- [[Error_Response_Standards]]
- [[Authentication]]
- [[Authorization_And_Permissions]]
