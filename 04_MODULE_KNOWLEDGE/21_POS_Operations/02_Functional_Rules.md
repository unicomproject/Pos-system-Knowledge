<!-- title: POS Operations Functional Rules -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-07 -->

# POS Operations Functional Rules

## Purpose

Defines business and UX rules for `POS_Operations` in the new OneVerz POS MVP scope.
These rules must be applied before creating backend APIs, Flutter screens,
responsive online store screens, Angular/admin screens, tests, or database changes.

## Business Rules

- Portable POS uses the same POS rules as fixed POS.
- Receipt print failure does not cancel a completed backend sale.
- Flutter must print authoritative completed-receipt values without recalculating
  totals, tax, discounts, tender allocations, or change.
- Print audit is submitted only for a locally successful physical attempt.
  Audit-only recovery must never resend receipt bytes.
- Unknown print outcome requires operation lookup/operator decision; automatic
  physical retry is prohibited.
- A Receipt History reprint preserves the original snapshot and uses a new
  authorized reprint operation identity.
- Parked/held sale must remain tenant, outlet, till, and holding-cashier scoped.
- Till summary uses completed sales, payments, refunds, and cash movements.
- Approved Park/Recall: backend reference/totals/status; server-time 24-hour
  expiry; cart clears only after 201; atomic recall/cancel; no payment, receipt,
  print or drawer. See [[08_Park_Recall_Sale_Feature]].
- Approved visibility: non-empty cart shows Park Sale and hides Recall Sale;
  empty cart (no valid lines) shows Recall Sale and hides Park Sale. Recall must
  not overwrite a non-empty cart.
- Approved Parked Sales cards: product-name summary (first two + `+N more`) plus
  separate `itemCount`.
- Approved Cancel Reason is mandatory in the product target; current backend
  DELETE reason remains optional until enforced. No new cancel permission.
- Approved list scope is current till from trusted device/open session. Mark
  missing till filtering as an implementation gap, not Completed.
- Approved list-screen target uses Today/This Shift/All Parked Sales, no Cashier
  column, backend-filtered count/value, View/Recall/Cancel and existing theme/
  shell components. Current card screen is not target completion. See
  [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Parked_Sales_Recall_Screen_Implementation_Specification]].
- Implementation tracking records chunk evidence separately; do not treat docs as
  feature Completed.
- Cash movement schema is not a successful cashier movement without a mutation
  API and persistence result.
- Customer display is future unless explicitly enabled.
- **Product Discovery Segments**: Cashier New Sale supports filtering products by segments: Popular, Frequently Sold, and Offers. Selecting these segments updates only the catalog grid and preserves cart, customer, and totals.
- **Popular Products Configuration**: Uses a tenant-scoped reserved collection code `POS_POPULAR` and type `POS_QUICK_LIST` for manual product assignments and sorting order.
- **Frequently Sold Calculation**: Aggregates net sold quantities ($max(quantity - cancelled - returned, 0)$) for completed sales at the current outlet over a rolling 30-day window.
- **Offers & Special Pricing**: Dynamically lists active targeted discount policies and price lists. The lowest effective unit price is selected when multiple offers apply.
- **Variant Popup**: When direct-add cannot resolve one eligible variant, use the one-image Product Variant Selection Popup. It supports dynamic ID-based options, quantity, optional line note and manual Frequently Bought Together. Frequently Bought Together is not Frequently Sold. Full rules: [[04_MODULE_KNOWLEDGE/21_POS_Operations/07_Product_Variant_Selection_Popup_Feature]].

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

- Online storefront browsing
- Customer account password reset
- Subscription invoice payment links
- Warehouse stock transfer approval

## Related Files

- [[04_MODULE_KNOWLEDGE/21_POS_Operations/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/21_POS_Operations/03_Technical_Contract]]
- [[04_MODULE_KNOWLEDGE/21_POS_Operations/04_Popular_Product_Discovery_Feature]]
- [[04_MODULE_KNOWLEDGE/21_POS_Operations/05_Frequently_Sold_Product_Discovery_Feature]]
- [[04_MODULE_KNOWLEDGE/21_POS_Operations/06_Offers_Product_Discovery_Feature]]
- [[04_MODULE_KNOWLEDGE/21_POS_Operations/07_Product_Variant_Selection_Popup_Feature]]
