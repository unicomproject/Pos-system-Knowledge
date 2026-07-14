<!-- title: Discount & Expiry Discount Management Functional Rules -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-07-13 -->

# Discount & Expiry Discount Management Functional Rules

## Purpose

Defines business and UX rules for `Discount_Expiry_Discount_Management` in the new TM-EPOS MVP scope.
These rules must be applied before creating backend APIs, Flutter screens,
responsive online store screens, Angular/admin screens, tests, or database changes.

## Business Rules

- Discount policy determines scope, limits, targets, and approval requirement.
- Expiry discount uses product batches/expiry dates and configured tiers.
- POS discount application must snapshot policy and approval result.
- Manager approval is required when the cashier exceeds allowed limit.
- Coupon campaign engine is not part of this module unless explicitly added later.
- A POS cashier's percentage and fixed-amount authority limits are user-specific.
- A request at or below cashier authority may be applied directly.
- A request above cashier authority but at or below the policy absolute limit creates a `PENDING_APPROVAL` application.
- A request above the policy absolute limit is rejected and must not create an application.
- The user who requested a discount must not approve their own request.
- Approval does not bypass checkout revalidation: cart fingerprint, requester, device, till session, expiry, and active policy are checked again.
- Successful payment snapshots the approved application into `sales_order_discounts` and marks the application `APPLIED`.
- POS runtime supports two sources: `MANUAL` and `POLICY`.
- `POLICY` source is server-authoritative: policy scope, value, calculation method, active dates, outlet/channel targeting, target rules, conditions, approval requirement, and stacking settings are reloaded from the database.
- `MANUAL` source does not require the cashier to select a fake policy in the POS UI; the backend resolves the internal manual authority envelope by calculation method.
- Manual POS discounts are resolved by both calculation method and requested scope. The internal envelopes are order percentage, order fixed amount, line percentage, and line fixed amount; an order envelope must never be reused for a line discount.
- `ORDER` discounts apply to the cart. `LINE` discounts require a selected variant in the cart. The client cannot apply an `ORDER` policy as `LINE` or a `LINE` policy as `ORDER`.
- POS runtime must support manual order, manual line, predefined order, and predefined line application. Line application must include a target variant that exists in the current cart.
- Discount target matching uses `discount_policy_targets`: `EXCLUDE` matches always reject; if any `INCLUDE` target exists, at least one include must match; if no include target exists, the policy remains eligible unless excluded.
- Product, product variant, category, brand, and collection targets are derived from tenant-owned backend catalog data. Frontend-supplied product/category/brand identifiers are not trusted for policy matching.
- Active conditions currently supported by POS runtime are minimum cart/order/eligible amount, minimum quantity, and customer-required checks. Unknown active condition types fail closed.
- Clearing a backend-backed POS discount calls the cancel lifecycle and preserves audit history; records are not physically deleted.

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
| Scope tampering | Reject with `pos_discounts.scope_mismatch` |
| Target not applicable | Reject with `pos_discounts.policy_not_applicable` |
| Missing manual scope envelope | Reject with `pos_discounts.manual_configuration_not_found` |
| Missing line target | Reject with `pos_discounts.target_required` |
| Line target not in cart | Reject with `pos_discounts.target_not_in_cart` |
| Stacking conflict | Reject with `pos_discounts.stacking_not_allowed` |

## Out Of Scope

- Gift cards
- Advanced promotions stacking
- Accounting journal posting
- Delivery fee discounts

## Related Files

- [[04_MODULE_KNOWLEDGE/15_Discount_Expiry_Discount_Management/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/15_Discount_Expiry_Discount_Management/03_Technical_Contract]]
