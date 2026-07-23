<!-- title: Subscription Billing, Payments & Usage Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-07-15 -->

# Subscription Billing, Payments & Usage Module Overview

> [!NOTE]
> The generic `/api/v1/billing/*` groups below describe the broader target
> module architecture. The current implemented Platform Admin Billing contract
> uses `/api/v1/platform-admin/billing` and is documented in
> [[05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]].

## Purpose

Manage active tenant subscriptions, add-on subscriptions, invoices, invoice lines, payment links, payment transactions, credit notes, and usage counters.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Subscription_Billing_Usage` |
| Module number | 04 |
| Primary users | Platform Admin, Tenant Admin billing contact |
| Frontend surfaces | Billing summary, Payment link page, Subscription status view, Usage counter review |
| Target API groups | `/api/v1/subscriptions`, `/api/v1/billing/invoices`, `/api/v1/billing/payment-links`, `/api/v1/billing/usage` |

## Main Tables

| Table | Role |
|---|---|
| `tenant_subscriptions` | Used by this module |
| `tenant_subscription_addons` | Used by this module |
| `tenant_subscription_history` | Used by this module |
| `subscription_invoices` | Used by this module |
| `subscription_invoice_lines` | Used by this module |
| `subscription_payment_links` | Used by this module |
| `subscription_payment_transactions` | Used by this module |
| `subscription_credit_notes` | Used by this module |
| `subscription_credit_note_lines` | Used by this module |
| `tenant_usage_counters` | Used by this module |

## Core Business Rules

- A tenant subscription references one subscription plan.
- Payment link tokens are hash-only.
- Invoice and credit note totals cannot be negative.
- Subscription status controls tenant access when trial, past_due, cancelled, or expired.
- Usage counters are tied to feature limits and billing periods.

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

- [[../03_Subscription_Catalog_Entitlements/01_Module_Overview]]
- [[../02_Tenant_Foundation/01_Module_Overview]]
- [[../24_Payment_Refund/01_Module_Overview]]

## Out Of Scope

- POS customer payments
- Product pricing tax calculation
- Full accounting ledger
- Bank reconciliation

## Related Files

- [[04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/03_Technical_Contract]]
- [[04_Platform_Billing_Functional_Specification]]
