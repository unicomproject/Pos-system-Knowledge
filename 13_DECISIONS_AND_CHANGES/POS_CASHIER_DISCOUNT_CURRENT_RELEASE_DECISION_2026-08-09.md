<!-- title: POS Cashier Discount Current Release Decision 2026-08-09 -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-09 -->

# POS Cashier Discount Current Release Decision 2026-08-09

## Status And Purpose

Approved and active from 2026-08-09. This is the Priority 1 current-release
authority for the OneVerz POS cashier Discount flow. It separates the approved
cashier experience from broader backend/schema capability.

## Current Release Scope

The cashier UI supports `MANUAL` discount only and exactly one active cashier
discount per cart/sale.

| Scope | Percentage | Fixed Amount |
|---|---:|---:|
| `ORDER` | Yes | Yes |
| `LINE` / Item | Yes | No |

`LINE` requires one exact selected cart line/product variant. It must exist in
the current tenant cart and be revalidated; arbitrary frontend product
relationships are not trusted. A second discount, order-plus-line combination,
or any stacking is rejected until the active discount is removed/replaced.

## Authority And Reason

Current authority is user-specific: `max_percentage`, `max_fixed_amount`, and
`currency_code`. At or below the applicable limit is allowed. Above it is
directly rejected and must not create `PENDING_APPROVAL`. Reason is optional and
may persist in `request_reason` / `manual_discount_reason`. UI quick-reason chips
are text helpers only, never policies, coupons, or promotions.

Permission `sales.discount.apply` controls list/context, validate, apply, and
cancel. `sales.discount.approve`, manager PIN, manager approval screens, and
above-authority approval are deferred and not invoked by this cashier flow.

## Online Contract

Backend validation is immediate and authoritative: validate the live cart and
context, apply idempotently, receive the canonical `discountApplicationId`, bind
it to checkout, refresh totals, and close on success. Cancel before Apply makes
no mutation. Removing a synchronized discount uses the canonical cancellation
lifecycle and preserves audit history.

## Offline Contract

Offline capture is allowed for an eligible manual discount using the latest safe
local authority/reference snapshot. The preview and cart discount are
provisional, stored as a local `PENDING_SYNC` outbox intent, and retain a stable
idempotency key. Reconnect submits through the generic offline sync
infrastructure. Backend revalidates and remains final authority.

The snapshot includes permission/entitlement, tenant, outlet, till, till-session,
device and cashier context; authority limits/currency; product/variant/cart data;
and pricing/tax references. It carries refresh/version/freshness and ownership
metadata. It is never final authorization.

The logical outbox payload includes local operation ID/type, ownership contexts,
requester, scope, method, value, line target, optional reason, authority and cart
snapshots, cart fingerprint/hash, currency, idempotency key, created time, sync
status, retry count, and last error. Exact operation enum naming is not yet
canonical; do not invent a separate public Discount sync API or backend table.

Sync acceptance checks tenant/client/device/till/session ownership, permission,
authority, currency, cart fingerprint, target, current scope matrix,
one-discount invariant, calculation, idempotency, and related offline sale. A
rejection is visible as failed/conflict state and never silently overwrites
backend truth.

Offline cash sale/receipt audit retains the locally captured amount and discount
snapshot. Card/QR do not finalize offline. Reconciliation resolution beyond
visible conflict handling remains an implementation requirement.

## Responsive Popup Contract

Tablet landscape is primary. Large layouts prefer a centered two-column modal:
inputs/selector/reason left; sale or selected-line summary, preview, and status
right. Medium tablets keep two columns only when readable, use proportional
constraints, bounded product scrolling, vertical content scrolling, and
reachable/sticky actions. Narrow/phone widths stack into a near-full screen
modal/sheet with summary below inputs.

Keyboard/viewInsets and safe areas must keep active input and Apply/Cancel
reachable. Increased text scale, focus order, contrast, touch targets, long
products/errors, and supported 800x600-class layouts must not overflow, clip, or
truncate critical values. Width never changes business rules.

Initial state is Order + Percentage, empty value/reason, zero preview. Order
Percentage uses `%`; Order Fixed uses currency; Item mode shows a cart-line
selector and Percentage only. Item Fixed is not a valid current screen state.

## API And Database Relationship

Current routes remain `GET /api/v1/pos/discounts`, `POST .../validate`, `POST
.../apply`, `POST .../{applicationId}/cancel`, checkout summary, and
start-payment with `discountApplicationId`. The approve endpoint is an existing
deferred capability and is not called by this flow.

Existing tables remain sufficient: `discount_types`, `discount_policies`,
`pos_discount_authority_limits`, `pos_discount_applications`, events,
`sales_order_discounts`, cart/order/context tables, and generic offline sync
tables. Order snapshot rows have `sales_order_line_id = null`; Item rows point to
the selected line. Approval fields, `POLICY`, line-fixed envelopes, and stacking
schema remain existing/reserved capability; none are removed.

## Explicitly Deferred

- POLICY/preconfigured selector in the cashier popup.
- Manager PIN, approval screen, `PENDING_APPROVAL`, and cashier wait flow.
- Item/Line Fixed Amount.
- Multiple or stacked cashier discounts.
- Coupon/promotion engine and tenant reason catalogue.

## Implementation Status Disclaimer

This is an approved target, not implementation proof. Backend may still accept
POLICY, LINE Fixed, approval, and stacking paths. Flutter offline outbox,
conflict UX, responsive popup, and target matrix require code/runtime evidence.
See [[../15_IMPLEMENTATION_TRACKING/POS_Cashier_Discount_Second_Brain_Alignment_2026-08-09]].

## Related Files

- [[../03_USER_JOURNEYS/Cashier/05_Discount_Flow]]
- [[../04_MODULE_KNOWLEDGE/15_Discount_Expiry_Discount_Management/02_Functional_Rules]]
- [[../05_BACKEND_ARCHITECTURE/Offline_Operation_Architecture]]
- [[../08_FLUTTER_POS_KNOWLEDGE/Flutter_Offline_Operation_Sync]]
- [[../10_TESTING_QA/Test_Case/21_POS_Operations/POS_Cashier_Discount_Test_Cases]]
