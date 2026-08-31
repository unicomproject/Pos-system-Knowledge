<!-- title: Fulfilment & Pickup / Click & Collect Functional Rules -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-27 -->

# Fulfilment & Pickup / Click & Collect Functional Rules

## Purpose

Defines business and UX rules for `Fulfilment_Pickup_ClickCollect` in the new OneVerz POS MVP scope.
These rules must be applied before creating backend APIs, Flutter screens,
responsive online store screens, Angular/admin screens, tests, or database changes.

## Business Rules

- Click and collect requires a valid outlet and fulfilment method.
- Pickup slot reservations protect capacity until checkout/order confirmation.
- Fulfilment and pickup events are append-only.
- Collected status must be backend confirmed, not just UI changed.
- Own delivery is later phase and must not be mixed into pickup state.
- `Delayed` is derived, never persisted as another lifecycle.
- One fulfilment may have multiple packages and package lines.
- Ready requires resolved picking, valid package contents and backend validation.
- QR is READY-only, opaque, hash-stored, expiring, tenant/outlet/order bound and single-use on collection.
- Paid Online and Cash on Collection are valid; payment must complete before handover and duplicate charging is forbidden.
- Handover is idempotent and atomically finalizes pickup, fulfilment, sales-order projection and events/audit.

## User Rules

| User Type | Rule |
|---|---|
| Platform Admin | May manage platform-owned setup only when platform permission exists |
| Tenant Admin | May manage tenant-owned configuration only when entitlement and permission pass |
| Cashier / Stall Operator | May perform POS actions only with outlet, trusted device, and till context |
| Customer | May access online store/customer actions only through customer-facing APIs |
| Backend Worker | May process derived records, sync, notifications, or reports using service identity and audit |

## UI Rules

- Show this module only when the tenant plan, feature entitlement, and user permission allow it.
- Use loading, empty, error, permission-denied, feature-disabled, offline, and conflict states where relevant.
- Do not hardcode role names such as cashier, manager, or administrator as authorization logic.
- Do not show fake data, fake counts, fake success states, or hardcoded module rows.
- Mobile, tablet, iPad, laptop, and desktop layouts must keep the same business rules.

### OO-01 Online Orders queue

- Authenticated access requires `commerce.online_order.orders.access` and `commerce.online_order.orders.view`; frontend gating is UX only and backend enforcement is mandatory. Role-name authorization is forbidden.
- Read only the active tenant and authorized POS outlet/fulfilment scope.
- The visible queue exposes one debounced server-side search and exactly six authoritative summary aggregates: New, Preparing, Ready, Delayed, Collected and Cancelled.
- Render order cards, not a table. Each card contains only list projection facts and a chevron that opens detail without mutating fulfilment state.
- Filters, status tabs, sorting, table headers, Open/Start actions and visible pagination are excluded from the approved queue. Bounded API query capabilities remain permitted internally.
- `Delayed` is derived using lifecycle, collection window and server time. It must not override legitimate Ready, Collected, Cancelled or other terminal states merely because time passed.
- Payment labels derive from existing payment/order authority. Product previews are projected in the list response and must not cause per-order or per-product network calls.
- Loading, refresh, empty, empty-search, retry/error, denied, not-entitled and network/server failure states are explicit. Phone stacks cards; tablet/desktop use horizontal cards; no viewport may overflow or clip.
- The approved orange priority star has no verified business authority and therefore has no persisted/API business field in this chunk.

## Backend Rules

- Resolve tenant context server-side for every tenant-owned mutation.
- Validate foreign-key ownership within the same tenant before saving.
- Use typed request/response DTOs and map them to domain models/entities.
- Return standard 400, 401, 403, 404, 409, and 500 responses.
- Never expose passwords, POS PINs, token hashes, payment secrets, card data, or cross-tenant records.

## Offline And Cache Rules

- Cache can speed up safe reference data only.
- Backend database remains final truth for sale totals, stock, payments, refunds, exchanges, permissions, and sync acceptance.
- Offline operations must be marked pending until accepted by backend sync.
- Conflicts must be visible; do not silently overwrite backend truth.

## Error Rules

| Case | Expected Behavior |
|---|---|
| Missing login | Return 401 and send user to login/session recovery |
| Permission denied | Return 403 and show access denied state |
| Feature disabled | Return 403 and show feature not enabled state |
| Invalid business data | Return 400 with safe field/form errors |
| Duplicate or conflict | Return 409 with safe conflict message |
| Offline blocked action | Explain that online backend validation is required |

## Out Of Scope

- Driver assignment
- Delivery fee calculation
- Third-party courier integration
- Kitchen display automation

## Related Files

- [[04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/03_Technical_Contract]]
