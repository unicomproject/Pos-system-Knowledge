<!-- title: Platform Subscription Plan API Endpoints -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-24 -->

# Platform Subscription Plan API Endpoints

## Tenant POS Login

Base route: `/api/v1/auth`

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/v1/auth/tenant-login` | Cashier / tenant user login for Flutter POS |

Request body:

```json
{
  "email": "cashier001@gmail.com",
  "password": "123456"
}
```

Tenant Code is not accepted from the POS login screen. Backend resolves tenant
from the tenant user email. If the email exists in multiple tenants, the API
returns `TENANT_SELECTION_REQUIRED` with: "Multiple tenants found for this
email. Tenant selection is required."

Base route: `/api/v1/platform/subscription-plans`

All endpoints require platform JWT authentication.

## Endpoints

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/api/v1/platform/subscription-plans` | `platform.subscription_plans.view` | List subscription plans |
| POST | `/api/v1/platform/subscription-plans` | `platform.subscription_plans.create` | Create draft plan |
| PATCH | `/api/v1/platform/subscription-plans/{planId}/pricing` | `platform.subscription_plans.edit` | Save draft `base_price` |
| PATCH | `/api/v1/platform/subscription-plans/{planId}/limits` | `platform.subscription_plans.edit` | Save draft outlet/till/user limits |
| POST | `/api/v1/platform/subscription-plans/{planId}/publish` | `platform.subscription_plans.edit` | Publish draft → DB `active` |

## Release 1 write flow

1. **Create draft** — basics fields on `subscription_plans`
2. **Update pricing** — `base_price` only, draft status required
3. **Update limits** — `max_outlets`, `max_tills`, `max_users`, draft status required
4. **Publish** — status `draft` → `active`; API response returns `status: active`

## Status contract

| Layer | Values |
|---|---|
| Database | `draft`, `active`, `retired` |
| API plan `status` field | Same DB values (no `published`/`archived` in responses) |
| Frontend labels | UI may show Published for `active`; backend does not |

Publish response example: `{ "status": "active", ... }`

## Verification (2026-06-22)

- Swagger at `http://localhost:5050`
- Full flow: POST create → PATCH pricing → PATCH limits → POST publish → GET list
- DB table `subscription_plans`: `base_price`, `max_outlets`, `max_tills`, `max_users`, `status = active`
- Backend unit tests: **109/109 passed**

## Limits request example

```json
{
  "maxOutlets": 5,
  "maxTills": 10,
  "maxUsers": 25
}
```

## Related Files

- [[../../04_MODULE_KNOWLEDGE/Subscription/03_Technical_Contract]]
- [[../../06_DATABASE_KNOWLEDGE/Subscription_Tables]]

---

# POS Payment And Receipt API Endpoints

Base routes: `/api/v1/pos/cart`, `/api/v1/pos/checkout`,
`/api/v1/pos/sales`, `/api/v1/pos/payments`, `/api/v1/pos/receipts`.

| Method | Route | Permission | Purpose |
|---|---|---|---|
| POST | `/api/v1/pos/cart/calculate` | `sales.cart.update_item` in the direct controller; `sales.checkout` when called through checkout summary/start-payment | Backend cart totals without saving a sale |
| POST | `/api/v1/pos/checkout/summary` | `sales.checkout` | Payment screen billing summary and permitted methods |
| POST | `/api/v1/pos/checkout/start-payment` | `sales.checkout` + selected payment permission | Existing Flutter cash checkout entry point; creates sale/payment/receipt for cash |
| POST | `/api/v1/pos/sales` | `sales.checkout` | Create draft POS sale |
| POST | `/api/v1/pos/sales/checkout` | `sales.checkout` | Alias for draft sale creation; does not complete payment by itself |
| GET | `/api/v1/pos/sales/{saleId}` | `sales.view` | Completed sale details |
| POST | `/api/v1/pos/payments` | Payment method permission such as `payments.cash.accept` | Record payment against an existing draft sale |
| GET | `/api/v1/pos/receipts/{saleId}` | `receipts.view` or `receipts.print` | Receipt preview data with `barcodeValue` |
| POST | `/api/v1/pos/receipts/{saleId}/print` | `receipts.print` | Receipt print audit row |

Cash checkout writes `sales`, `sale_lines`, `payments`,
`sale_payment_allocations`, and `receipts`. Print audit writes
`receipt_print_logs`.

Cash checkout request includes `cashReceived`. Successful cash checkout response
includes backend-sourced `cashReceived` and `changeDue`; Flutter must display
those returned values instead of recalculating or defaulting locally. Sale detail
and receipt detail responses also expose `cashReceived` and `changeDue` from the
saved sale/payment outcome.

Checkout/cart line requests use backend product variant IDs. `GET
/api/v1/pos/products` exposes `variantId` for simple/non-variant products so
Flutter can send `{ variantId, qty }` to checkout summary/start-payment without
substituting product IDs.

`GET /api/v1/pos/products` product summaries expose variant search metadata for
New Sale filtering. Product name remains the primary search key; variant terms
only refine product-name searches, while exact SKU/barcode remains a direct
lookup/search path.

## Needs Verification

- The permission catalog contains `sales.cart.manage`, but current verified
  backend code still protects direct `POST /api/v1/pos/cart/calculate` with
  `sales.cart.update_item`. Treat any documentation that says the direct endpoint
  requires only `sales.cart.manage` as a mismatch until backend access rules are
  updated.
- `GET /api/v1/pos/payment-methods` and `GET /api/v1/pos/printer-settings` were
  not found in the current backend. Flutter payment methods come from checkout
  summary, and printer selection/config remains local or future scope.

---

# Permission Catalog API Endpoints

See [[../02_ACCESS_CONTROL/Backend_Driven_Permission_Catalog]] for full
architecture, frontend routes, alias rules, and known gaps.

## Platform Admin

Base: `/api/v1/platform-admin/permission-catalog`

| Method | Route | Permission |
|---|---|---|
| GET | `/api/v1/platform-admin/permission-catalog` | `platform.permissions.view` |
| GET | `/api/v1/platform-admin/permission-catalog/flat` | `platform.permissions.view` |

## Tenant Admin

| Method | Route | Permission |
|---|---|---|
| GET | `/api/v1/tenant-admin/permission-catalog` | `roles.permissions.view` |
| GET | `/api/v1/tenant-admin/roles/{roleId}/permissions` | `roles.permissions.view` |
| PUT | `/api/v1/tenant-admin/roles/{roleId}/permissions` | `roles.permissions.update` |
| GET | `/api/v1/tenant-admin/context` | Authenticated; includes `effectivePermissions`, `enabledFeatures` |

## Verification (2026-06-23)

| Layer | Tests | Commit |
|---|---|---|
| Backend | Build passed; migration applied; catalog GET/role GET/role PUT passed | `0c7008e8fda4c9eb0892b44cfe2468155f73ebf6` |
| Angular | 95/95 passed | `9626a85f28bccf379b3bf48d6f51de9718b2bace` |
| Flutter | 90/90 passed | `18e1b29` (`Nytroz-POS-App`) |

Tenant Admin save verification used real backend APIs, not mock data:

- `GET /api/v1/tenant-admin/permission-catalog`: 5 modules / 99 permissions.
- `GET /api/v1/tenant-admin/roles/{roleId}/permissions`: `tenant_admin_dev`, 84 assigned permissions.
- `PUT /api/v1/tenant-admin/roles/{roleId}/permissions`: `activity.view` toggled off successfully.
- `PUT /api/v1/tenant-admin/roles/{roleId}/permissions`: `activity.view` toggled back on successfully.

The final backend fix was migration
`20260623103000_LinkTenantAdminSalesPermissions`, which links `sales.*`
tenant-admin permissions to the Tenant Admin `sales` catalog feature.
