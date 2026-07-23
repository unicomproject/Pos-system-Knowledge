<!-- title: POS Customer Management Implementation -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-18 -->

# POS Customer Management (`/pos/customers`)

## Scope

Cashier POS Customer Selection / Management screen. Not Tenant Admin CRM.
Not loyalty or store-credit.

## Backend

| Method | Route | Permission |
|---|---|---|
| GET | `/api/v1/customers/summary` | `customers.view` |
| GET | `/api/v1/customers` | `customers.view` |
| GET | `/api/v1/customers/{customerId}` | `customers.view` |
| GET | `/api/v1/customers/{customerId}/orders` | `customers.view` |
| POST | `/api/v1/customers` | `customers.create` |
| PUT | `/api/v1/customers/{customerId}` | `customers.update` |
| POST | `/api/v1/customers/{customerId}/attach-to-sale` | `customers.view` + `sales.cart.manage` |

Open till + trusted device required for all POS customer operations.

### List / detail fields (backend authority)

- `sourceType` — POS / MANUAL / ECOMMERCE / IMPORT
- `totalOrderCount` — COMPLETED, non-cancelled sales only
- `totalSpentAmount` + `currencyCode` — same policy
- `isMixedCurrencySpend` — when COMPLETED orders use more than one currency; spend display must not invent a combined total
- `lastPurchaseAt`

### Update

Editable: `fullName`, `phone`, `email`, `status` (`ACTIVE` / `INACTIVE` / `BLOCKED`).

Immutable: `tenantId`, `customerId`, `customerCode`, `sourceType`, aggregates, create audit.

Phone/email normalized; tenant-scoped duplicate checks exclude self.

### Summary — New customers this month

Uses `Tenants.DefaultTimezone` (fallback `UTC` if missing/invalid).

Local month start → next month start converted to UTC for `customers.created_at` query.
Response includes `timeZoneId`.

### Attach / checkout

Attach rejects non-ACTIVE with:

- `pos_customers.customer_inactive`
- `pos_customers.customer_blocked`
- `pos_customers.customer_deleted`
- `pos_customers.customer_not_eligible`

Attachment mode remains `CART_CONTEXT` when no saleId; optional DRAFT sale assignment when saleId provided.

Checkout independently revalidates ACTIVE-only customer (`pos_checkout.customer_*` codes). Does not trust Flutter attach alone.

## Flutter

- Route: `/pos/customers`
- Table binds `sourceType`, `totalOrderCount`, `totalSpentAmount` / `currencyCode` / mixed flag
- Source filter: ALL / POS / MANUAL / ECOMMERCE / IMPORT → list API `source`
- Search: `TenantAdminSearchField` debounce **300 ms**; provider CancelToken + request sequence; dispose cancels
- Edit dialog: PUT update; requires `customers.update`
- Purchase History dialog: paginated GET orders (no new API)
- Attach: UI requires `customers.view` + `sales.cart.manage` (aligned with backend)

## Database

**No migration required** for customer schema attributes.

Permission seed migration: `20260718160000_SeedPosCustomerUpdatePermission`

| Field | Value |
|---|---|
| Permission code | `customers.update` |
| Deterministic UUID | `77777777-0338-4000-8000-000000000001` |
| Module ID | `71000000-0000-0000-0000-000000000010` (Core POS) |
| Feature ID | `72000000-0000-0000-0000-000000000013` (POS Customers) |
| Action | `update` |
| Assignment | Development Cashier role (`88888888-0003-...`) via `tenant_role_permissions` |
| Seed SQL | `DevelopmentPosCustomerUpdatePermissionSeedData` — update-by-code then insert-if-missing |

### Migration hardening (2026-07-18)

**Root cause:** the first draft called `DevelopmentPosNewSalePermissionsSeedData.UpSql`, which reseeded the entire New Sale catalogue and reused UUID `77777777-0316-...` already owned by `sales.checkout`. `ON CONFLICT (permission_code)` does not catch primary-key collisions on `id`.

**Fix:** seed only `customers.update` with unused UUID `0338`; preserve existing permission IDs; Down deletes only the migration-owned UUID + Cashier assignment for that code.

**Verification:** first `dotnet ef database update` applied; second run reported already up to date; exactly one `customers.update` row.

## Remaining limitations

- Loyalty / store credit not implemented
- Multi-currency spend shown as unavailable (`—`) rather than converted totals
- Physical printer / unrelated POS modules unchanged
