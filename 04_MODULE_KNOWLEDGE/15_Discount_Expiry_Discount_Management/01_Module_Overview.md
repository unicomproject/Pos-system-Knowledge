<!-- title: Discount & Expiry Discount Management Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Discount & Expiry Discount Management Module Overview

## Purpose

Manage discount types, policies, outlet/channel targeting, policy targets/conditions, expiry discount rules, expiry tiers, and expiry discount applications.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Discount_Expiry_Discount_Management` |
| Module number | 15 |
| Primary users | Tenant Admin, Cashier, Store Manager |
| Frontend surfaces | Discount setup, Expiry discount setup, POS discount dialog, Manager approval flow |
| API groups | `/api/v1/discounts`, `/api/v1/discount-policies`, `/api/v1/expiry-discounts`, `/api/v1/pos/discounts` |

## Main Tables

| Table | Role |
|---|---|
| `discount_types` | Used by this module |
| `discount_policies` | Used by this module |
| `discount_policy_outlets` | Used by this module |
| `discount_policy_channels` | Used by this module |
| `discount_policy_targets` | Used by this module |
| `discount_policy_conditions` | Used by this module |
| `expiry_discount_rules` | Used by this module |
| `expiry_discount_rule_tiers` | Used by this module |
| `expiry_discount_applications` | Used by this module |

## Core Business Rules

- Discount policy determines scope, limits, targets, and approval requirement.
- Expiry discount uses product batches/expiry dates and configured tiers.
- POS discount application must snapshot policy and approval result.
- Manager approval is required when the cashier exceeds allowed limit.
- Coupon campaign engine is not part of this module unless explicitly added later.

## Access Summary

| Control | Rule |
|---|---|
| Authentication | Required for protected staff/customer/admin actions |
| Tenant status | Tenant must be active or allowed for the requested operation |
| Feature entitlement | Required when this module is plan or add-on controlled |
| Permission | Required for staff/admin protected actions |
| Tenant isolation | Tenant-owned records must never leak across tenants |
| Audit/event history | Required for sensitive status, payment, inventory, auth, and access changes |

## Dependencies

- [[../14_Pricing_Tax_Management/01_Module_Overview]]
- [[../16_Inventory_Foundation_Stock_Availability/01_Module_Overview]]
- [[../21_POS_Operations/01_Module_Overview]]

## Out Of Scope

- Gift cards
- Advanced promotions stacking
- Accounting journal posting
- Delivery fee discounts

## Related Files

- [[04_MODULE_KNOWLEDGE/15_Discount_Expiry_Discount_Management/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/15_Discount_Expiry_Discount_Management/03_Technical_Contract]]
