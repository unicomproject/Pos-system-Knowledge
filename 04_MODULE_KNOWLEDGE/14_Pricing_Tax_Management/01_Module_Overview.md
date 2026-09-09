<!-- title: Pricing & Tax Management Module Overview -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-03 -->

# Pricing & Tax Management Module Overview

## Purpose

Manage price lists, outlet/channel price assignment, price list items, and **Tenant Admin Tax Setup** (effective-dated rates, product tax assignment support, checkout/POS tax calculation inputs).

This module is part of the OneVerz POS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## Tax Setup authority

**Canonical Tax Management contract (2026-09-03):**

[[Tenant_Admin_Tax_Management_Canonical_Contract]]

Domain separation:

- **Tax Setup** owns identity, treatment (`TAXABLE` | `ZERO_RATED` | `EXEMPT`), effective-dated rates, status
- **Product** owns `TaxSetupId` reference + `TaxPriceMode` (`INCLUSIVE` | `EXCLUSIVE`)
- **Sale** stores immutable tax snapshot; **Refund** reverses original snapshot

Removed from Tax Setup: Used For / Applies To / Goods / Services / Both.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Pricing_Tax_Management` |
| Module number | 14 |
| Primary users | Tenant Admin, Store Manager, Platform Support |
| Frontend surfaces | Price list setup, **Tax Setup**, Product Setup Step 6 Pricing & Tax (SIMPLE single-identity + VARIANT per-`ProductVariantId` selling prices — see Product 7-Step §6.1–6.5), Checkout/POS calculation support |
| API groups | `/api/v1/pricing/price-lists`, `/api/v1/pricing/price-list-items`, **`/api/v1/tax`** (Tax Setup aggregate), `/api/v1/products/{id}/tax` (compat), Product create-options |

## Main Tables

| Table | Role |
|---|---|
| `price_lists` | Used by this module |
| `price_list_outlets` | Used by this module |
| `price_list_channels` | Used by this module |
| `price_list_items` | Used by this module |
| `tax_jurisdictions` | System-managed technical jurisdiction (not Tax Setup UX) |
| `tax_classes` | Persistence for **Tax Setup** |
| `tax_rates` | Effective-dated rates |
| `tax_class_rates` | Link Tax Setup ↔ rates (technical) |
| `product_tax_assignments` | Product → Tax Setup assignment |

## Core Business Rules

- Price can vary by outlet and sales channel through price list assignments.
- Price list items support product-level, variant-level, UOM-level, and minimum-quantity pricing.
- Price list validity windows and priority determine which active price can be selected when multiple price lists match.
- Tax is calculated from assigned Tax Setup + effective rate + product TaxPriceMode.
- Checkout/POS snapshots price and tax on order lines (`sales_order_taxes`).
- Cached price/tax is only a reference; backend validates final totals.
- Do not store gateway fees or accounting tax journals here.

## Access Summary

| Control | Rule |
|---|---|
| Authentication | Required for protected staff/customer/admin actions |
| Tenant status | Tenant must be active or allowed for the requested operation |
| Feature entitlement | Required when this module is plan or add-on controlled |
| Permission | `pricing.tax_*` TARGET (see canonical Tax contract); Product assign via `catalog.product_pricing.manage` |
| Tenant isolation | Tenant-owned records must never leak across tenants |
| Audit/event history | Required for sensitive status, payment, inventory, auth, and access changes |

## Dependencies

- [[../10_Product_Core/01_Module_Overview]]
- [[../07_Outlet_Till_POS_Device_Foundation/01_Outlet_Management_Overview]]
- [[../22_Online_Store_Cart_Checkout/01_Module_Overview]]

## Out Of Scope

- Subscription plan pricing
- Payment settlement
- Discount policy approval
- Inventory cost layers
- Fixed-amount (non-percentage) Tax Setup in R1 Tenant Admin UX

## Related Files

- [[Tenant_Admin_Tax_Management_Canonical_Contract]]
- [[02_Functional_Rules]]
- [[03_Technical_Contract]]
- [[../../13_DECISIONS_AND_CHANGES/TENANT_ADMIN_TAX_MANAGEMENT_DECISION_REGISTER_2026-09-03]]
- [[../../13_DECISIONS_AND_CHANGES/TENANT_ADMIN_PRODUCT_TAX_INCLUSIVE_EXCLUSIVE_DECISION_2026-08-27]]
