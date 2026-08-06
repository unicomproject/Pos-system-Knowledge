<!-- title: Park Recall Sale Feature -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# Park Recall Sale Feature

## Purpose and Scope

Defines the approved cashier Park/Recall contract before implementation. Cashier terminology is Park Sale, Parked Sales and Recall Sale; `/api/v1/pos/holds` and Hold internal names remain valid.

## Approved UI Contract

- Header: pause icon, `Park Sale`, `Save this sale and continue it later.`, close X.
- Park Reference is read-only: `Generated automatically after parking` until a successful response returns it.
- One `Short Note (Optional)` input, example `Customer will return shortly`, maximum 250 trimmed characters.
- Use the active-cart customer automatically; do not ask for free-text customer identity.
- Show `This parked sale will be available for 24 hours.`
- Footer: Cancel and Park Sale. Cancel/X preserve cart; submit is disabled/loading in flight.
- Do not expose cashier, status, outlet, till/session, device, totals, expiry or tenant inputs.

## Functional Requirements

| ID | Requirement |
|---|---|
| PRK-01 | Open only for a cart with at least one valid line and preserve it while modal is open |
| PRK-02 | Use selected customer and optional discount context from the cart |
| PRK-03 | Accept one optional note of at most 250 trimmed characters |
| PRK-04 | Backend generates reference and server-time 24-hour expiry |
| PRK-05 | Submit through backend with a stable idempotency key and disable double tap |
| PRK-06 | Clear cart only after `201 Created`; preserve it for every failure/unknown outcome |
| PRK-07 | Display returned reference, refresh active list/count and open clean New Sale |
| PRK-08 | List only active, accessible, non-expired parked sales |
| PRK-09 | Recall revalidates stock, price, tax, discount and totals and releases once |
| PRK-10 | Cancel uses the existing backend contract and transitions once |
| PRK-11 | Provide loading, empty, success, validation, denied, conflict, expired and network states |

## Validation Matrix

| Input/context | Rule |
|---|---|
| Cart/lines | At least one line; VariantId non-empty/valid; quantity > 0 |
| DeviceId | Required; device active/trusted and actively assigned |
| Note | Optional; trim; maximum 250 characters |
| CustomerId | Optional; must belong to resolved tenant |
| Discount | Optional; must remain valid |
| Idempotency key | Required, stable, maximum current backend limit of 100 |
| Till/session | Till belongs to resolved outlet/tenant; session open |
| Pricing/stock | Backend-valid for create and revalidated on recall |
| Recall | HELD, active, same till/current user under existing scope |
| Cancel reason | Optional; current backend maximum 250 characters |

## Business and Permission Rules

Authentication, tenant isolation, POS entitlement where enforced, trusted device, till assignment and open session are mandatory. The backend owns reference, totals, status and expiry. Park persists a draft unpaid order and lines; it creates no payment/receipt/completed sale and triggers no drawer/print.

| Canonical permission | Behaviour |
|---|---|
| `sales.park.create` | Create Park Sale; current backend also uses it for cancel |
| `sales.park.view` | List/count active parked sales |
| `sales.park.recall` | Recall eligible parked sale |

Legacy aliases are `pos.sale.park`, `pos.sale.park.view`, and `pos.sale.recall`; they are compatibility names, not the target contract. Constants and service checks exist. Catalogue insertion and development Cashier assignment are not proven by source evidence.

## Current API and Data Mapping

| Operation | Route | Current contract |
|---|---|---|
| Create | `POST /api/v1/pos/holds` | deviceId, saleType, customerId, lines, reason, discountApplicationId, idempotencyKey, expiresAt; returns hold list item; 201 |
| List | `GET /api/v1/pos/holds` | returns holds and totalCount; 200 |
| Recall | `POST /api/v1/pos/holds/{holdId}/recall` | deviceId; returns hold/sale/device/customer/reason/lines/checkoutSummary; 200 |
| Cancel | `DELETE /api/v1/pos/holds/{holdId}?reason=...` | no body; 204 |

Current hold/list item fields are `holdId`, `holdNumber`, `saleId`,
`saleNumber`, `tillId`, `tillSessionId`, `customerId`, `customerName`, `reason`,
`status`, `itemCount`, `subtotal`, `discount`, `tax`, `total`, `currency`,
`heldAt`, `expiresAt`, and `lines`; the list envelope adds `holds` and
`totalCount`. Each list line returns `lineId`, `variantId`, `name`,
`variantName`, `sku`, `qty`, `unitPrice`, `lineTotal`, and `lineNote`. Recall
returns `holdId`, `saleId`, `holdNumber`, `deviceId`, customer fields,
`saleType`, `reason`, `recalledAt`, request-shaped `lines`, and
`checkoutSummary`.

Expected controller statuses are 200, 201, 204, 400, 401, 403, 404 and 409. Verified errors include invalid tenant context, permission denied, invalid hold/device/lines/reason/expiry/idempotency key, not found, expired, not recallable/cancellable, till mismatch, idempotency conflict, device/variant/customer not found, no open session, insufficient stock and price not configured.

`pos_order_holds` stores id, tenant, hold number, sale, status, reason, held/released users and times, expiry, cancellation and audit timestamps. It links to canonical order/customer/till/device/session/pricing/discount/tax/inventory documents rather than duplicating them.

## Lifecycle and Invariants

`HELD → RELEASED`, `HELD → CANCELLED`, or `HELD → EXPIRED`; terminal states cannot be recalled. Create, recall and cancel must be atomic. New target holds always have `expires_at > held_at`, set to server time plus 24 hours. Target PS references remain tenant-safe and unique.

## Current vs Target Gap

| Area | Current verified state | Approved target | Required code work |
|---|---|---|---|
| Flutter persistence | Device-local secure storage | Backend-authoritative online persistence | Wire API repository/provider |
| Create API | Exists | Used by Flutter | Flutter integration |
| Reference | `HOLD-000001` | `PS-2026-00012` style | Backend sequence change |
| Reference before submission | Not safely reserved | Generated-after-success message | UI correction |
| Note | Backend `Reason` | One optional short note | Typed mapping |
| Customer | `CustomerId` | Use active-cart customer | Flutter mapping |
| Expiry | Optional client DTO | Server-controlled 24 hours | Service/DTO/tests |
| Permissions | Constants/checks exist | Canonical codes seeded and assigned | Verify/fix seed |
| Recall | Backend exists; Flutter local restore | Backend recall + recalculation | Flutter integration |
| Cart clearing | Current local behaviour | Only after API success | Provider correction |
| Offline | Independent local records | Defined outbox/sync, backend final | Separate future chunk |
| Runtime DB | Source exists; Local Development applied | Applied in each target environment | Environment DB verification |

## Non-Functional Requirements

- Security: tenant/permission/device/till/session enforcement; no client totals/expiry; do not log note text.
- Reliability: atomic, idempotent and retry-safe; no cart loss, duplicate hold or duplicate recall.
- Performance: modal opens locally; backend-filtered list/count avoids full history.
- Usability/accessibility: landscape responsive, focus order, labels, contrast, touch targets and non-colour loading cue.
- Observability: structured identifiers and lifecycle/audit events without sensitive note content.
- Offline: outbox states require a separate contract; never silently merge local and backend authorities.

## Out of Scope

Backend/Flutter code, migrations, route renaming, cross-cashier override, full offline sync, payments, receipts, drawer, customer creation, long reference forms and assigned-cashier selection.

## Related Files

- [[../../03_USER_JOURNEYS/Cashier/12_Park_Recall_Sale_Flow]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Park_Recall_Sale_Implementation_Specification]]
- [[../../13_DECISIONS_AND_CHANGES/ADR/ADR_008_Park_Recall_Sale_Authority_And_Expiry]]
