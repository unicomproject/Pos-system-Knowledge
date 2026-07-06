<!-- title: Catalog Master Data Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-07-03 -->

# Catalog Master Data Module Overview

## Purpose

Manage the common catalog setup used before product creation: departments, categories, brands, collections, units of measure, business type mapping, and return policies.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Catalog_Master_Data` |
| Module number | 09 |
| Primary users | Tenant Admin, Platform Admin support, Store Manager |
| Frontend surfaces | Catalog setup, Category/brand setup, Return policy setup, Product filter setup |
| API groups | `/api/v1/catalog/departments`, `/api/v1/categories`, `/api/v1/brands`, `/api/v1/collections`, `/api/v1/unit-of-measures`, `/api/v1/return-policies`, `/api/v1/platform/return-policy-templates` |

## Main Tables

| Table | Role |
|---|---|
| `business_types` | Used by this module |
| `departments` | Used by this module |
| `categories` | Used by this module |
| `brands` | Used by this module |
| `collections` | Used by this module |
| `unit_of_measures` | Used by this module |
| `return_policy_templates` | Platform/system reusable return policy templates. |
| `return_policies` | Tenant-owned return policies. |

## Core Business Rules

- Category and brand values must be tenant/business-scope safe.
- Platform return policy templates provide reusable defaults; tenant return policies drive POS and online return eligibility.
- Units of measure must match inventory and pricing behavior.
- Master data can be shown in online store filters only when linked to visible products.
- Do not store product price or stock in master data tables.

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

- [[../10_Product_Core/01_Module_Overview]]
- [[../25_Return_Inspection_Exchange/01_Module_Overview]]

## Out Of Scope

- Product variant stock
- Checkout totals
- Payment capture
- Offline sync conflicts

## Related Files

- [[04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/03_Technical_Contract]]
