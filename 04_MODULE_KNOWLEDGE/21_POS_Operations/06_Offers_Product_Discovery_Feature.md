<!-- title: Offers Product Discovery Feature Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->

# Offers Product Discovery Feature

## Purpose

The **Offers** segment displays products that have an eligible active discount policy (e.g. product/variant discounts, category/brand/collection targeting) or a special price (where compare-at price is greater than selling price). It reuses the existing Discount Policy and Price List modules without duplicate promotion engines.

---

## Data Model Decision & Reuse

This feature reuses existing configuration tables:
- `discount_policies` & `discount_policy_targets`: Stores targeted discounts.
- `price_lists` & `price_list_items`: Stores special pricing details.
- `products` & `product_variants`: Standard catalog attributes.
- `inventory_balances`: Active stock status and quantities per outlet.

---

## Eligibility & Resolution Rules

1. **Context Verification**: Tenant, outlet, and POS sales channel are resolved server-side from the trusted device context.
2. **Time Window**: Discount policy or special pricing must be currently active (`starts_at <= now <= ends_at`).
3. **Include/Exclude Target Precedence**: EXCLUDE targets take precedence over INCLUDE targets. If a product or category is excluded, it is omitted.
4. **Special Price Resolution**: A price list item is considered an offer if `compare_at_price > selling_price`.
5. **Multiple Offer Display Resolution**: If a product qualifies for multiple active offers, the backend determines a single display offer using this priority order:
   - Prefer the offer yielding the lowest effective unit price.
   - Apply policy priority.
   - Use the nearest valid end date.
   - Use a stable GUID tie-breaker.
6. **Conditional Offers**:
   - Offers with conditions (e.g., minimum cart quantity/amount, specific customer) still display in the Offers tab.
   - The DTO does not return a false final discount price; instead it returns the standard selling price, sets `requiresCartValidation = true`, and returns the label `Offer available`.
7. **Existing policy metadata**: the DTO may expose
   `requiresManagerApproval` from existing backend policy capability. The current
   MANUAL cashier Discount popup does not start approval or offer POLICY selection.
8. **Manual cashier discount exclusion**: internal policies used as authority
   envelopes for cashier-entered manual discounts must never be resolved or exposed
   as automatic POS catalog offers. They must not populate `offerPolicyId`,
   `offerPrice`, or `discountLabel`, and remain available only through the existing
   manual Add Discount application/authorization workflow.

---

## Planned API Contract (Implementation Target)

### Get Offer Products (POS Client)
`GET /api/v1/pos/products?deviceId={deviceId}&segment=offers`
- **Response**: Shared standard response contract containing calculated offer DTO attributes:
  - `hasOffer`: `true` when an active eligible offer exists.
  - `offerType`: Policy type (percentage, fixed amount, special price, conditional).
  - `offerPolicyId`: Policy or price list identifier.
  - `offerName`: Human-readable name.
  - `originalPrice`: Original compare-at/selling price before the offer.
  - `sellingPrice`: Calculated selling price.
  - `offerPrice`: Nullable (populated only when price is unconditionally calculable).
  - `discountLabel`: Badge label (e.g., `20% OFF` or `Offer available`).
  - `requiresCartValidation`: `true` for conditional offers.
  - `requiresManagerApproval`: `true` if manager authorization is needed.

---

## Access Control

| Context | Required Permission | Description |
|---|---|---|
| Cashier View | `products.view` | View the product grid and access the Offers segment tab |
| Cashier Apply | `sales.discount.apply` | Current MANUAL cashier Discount; `sales.discount.approve` remains deferred capability |
| Admin Config | `discount.policy.*` | Create, update, or activate discount policies in admin console |

---

## Planned UI Contract

### Cashier POS UI
- Product cards check `hasOffer` to display a promotional badge (`discountLabel`).
- If `offerPrice` is populated, the card displays `offerPrice` and renders `originalPrice` with a strike-through.
- If `requiresCartValidation` or `requiresManagerApproval` is true, the card displays a badge indicating approval or cart validation is needed.
- If no active offers exist, the grid displays: `No active offers`.
- Error and retry states are fully supported.
