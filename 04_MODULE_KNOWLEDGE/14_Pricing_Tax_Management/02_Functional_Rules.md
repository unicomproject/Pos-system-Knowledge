<!-- title: Pricing & Tax Management Functional Rules -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-07-04 -->

# Pricing & Tax Management Functional Rules

## Purpose

Defines business and UX rules for `Pricing_Tax_Management` in the new TM-EPOS MVP scope.
These rules must be applied before creating backend APIs, Flutter screens,
responsive online store screens, Angular/admin screens, tests, or database changes.

## Business Rules

- Price can vary by outlet and sales channel through price_list_outlets and price_list_channels.
- A tenant can mark one active default price list; backend must resolve the best active price list by outlet/channel, validity window, and priority.
- Price list items can be product-level when product_variant_id is null, or variant-level when it is present.
- selling_price must be non-negative; compare_at_price must be null or greater than or equal to selling_price.
- min_quantity enables quantity-tier pricing and must be greater than zero.
- Tax jurisdictions may be hierarchical, but a jurisdiction cannot be its own parent.
- Tax rates must be greater than zero and less than or equal to 100 percent.
- Product tax assignments must not overlap for the same product/variant when active.
- Tax must be calculated from assigned tax class/rate rules.
- Checkout snapshots price and tax on order lines.
- Cached price/tax is only a reference; backend validates final totals.
- Do not store gateway fees or accounting tax journals here.

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

- Subscription plan pricing
- Payment settlement
- Discount policy approval
- Inventory cost layers

## Related Files

- [[04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/03_Technical_Contract]]

