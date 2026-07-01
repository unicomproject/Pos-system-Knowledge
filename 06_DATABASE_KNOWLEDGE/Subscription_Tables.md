<!-- title: Subscription Tables -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# Subscription Tables

## Purpose

This file summarizes the subscription and entitlement database area.

## Combined Catalogue Rule

Uploaded modules 03 and 04 are duplicate table sets, so this knowledge folder
documents them once in a combined module file.

## Main Subscription Tables

| Table | Purpose |
|---|---|
| `platform_modules` | Module grouping |
| `platform_features` | Feature catalogue |
| `feature_limit_definitions` | Feature limits |
| `subscription_plans` | Commercial plans |
| `subscription_plan_features` | Plan feature inclusion |
| `subscription_addons` | Commercial add-ons |
| `tenant_feature_entitlements` | Tenant feature state |
| `feature_flags` | Feature rollout/config flags |
| `tenant_subscriptions` | Tenant subscription lifecycle |
| `subscription_invoices` | Billing invoice header |
| `tenant_usage_counters` | Usage tracking |

## Status Rule

Subscription, invoice, entitlement, payment, and feature flag statuses must be
varchar/text fields controlled by CHECK constraints.

## Related Files

- [[Tables/03_04_Catalog_And_Subscription_Catalog_Plans_Addons_And_Entitlements]]
- [[Tables/05_Subscription_Billing_Payments_And_Usage]]
