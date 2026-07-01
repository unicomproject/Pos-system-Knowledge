<!-- title: Tenant Id Rules -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# Tenant Id Rules

## Purpose

This file defines tenant isolation rules for the TM-EPOS database.

## Core Rule

Tenant-owned records must be scoped by `tenant_id` directly or through a strict
foreign key path to a tenant-owned parent.

## Tenant-Owned Areas

| Area | Tenant Isolation Applies |
|---|---|
| Users / roles / permissions | Yes |
| Outlets / tills / devices | Yes |
| Products / prices / taxes / discounts | Yes |
| Inventory and stock movements | Yes |
| Cart / checkout / orders | Yes |
| Payments / refunds / returns / exchanges | Yes |
| Fulfilment / pickup | Yes |
| Notifications / integrations | Yes |
| Offline clients / sync batches | Yes |

## Cross-Tenant Rule

A child record must never reference a parent from another tenant.

Application queries must also include tenant filters.

## Offline Rule

Offline ID mappings and sync conflicts must remain tenant-scoped.

## Related Files

- [[Database_Overview]]
- [[Tables/28_Offline_Operation_And_Sync]]
