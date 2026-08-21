<!-- title: Access Control Overview -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-08 -->


# Access Control Overview

## Purpose

This file defines the access-control model for the OneVerz POS MVP.

The MVP now covers mobile POS, desktop EPOS, online store, click and collect,
offline operation, unified orders, payments, refunds, reports, and business admin
operations.

## Core Decision

Access is backend-driven.

The frontend may hide, disable, or redirect for user experience, but backend API
authorization is the final security authority.

## Access Layers

| Layer | Meaning |
|---|---|
| Authentication | User/session/customer identity is known |
| Tenant isolation | Data belongs to the correct tenant |
| Feature entitlement | Tenant is allowed to use the feature |
| Permission | User can perform the action |
| Outlet access | User/device can operate in the outlet |
| Till access | User/device can use the till where required |
| Device trust | POS/offline client is recognized and allowed |
| Sales channel | POS, online store, pickup, or admin scope is valid |
| Backend validation | Final authority for protected business decisions |

## User Types

| User Type | Access Style |
|---|---|
| Platform user | Platform administration and tenant setup |
| Tenant user | Business admin, POS, fulfilment, reports |
| Cashier | POS sale, payment, receipt, hold, permitted refund/cash actions |
| Customer | Online store browsing, cart, checkout, pickup self-service flow |
| Offline client | Trusted device/client allowed to queue offline operations |

## Feature Entitlement Rule

A tenant must have the feature enabled before users can access related screens,
APIs, or actions.

Feature entitlement does not replace permissions.
A user still needs permission for protected actions.

## Permission Rule

Permission codes represent actions.

Do not hardcode role names such as owner, manager, cashier, or ecommerce staff in
frontend or backend authorization logic.

Roles are only groups of permissions.

## POS Access Rule

POS sale and payment actions require:

- Authenticated tenant user.
- Active tenant.
- Enabled POS feature.
- Required POS permission.
- Outlet access.
- Trusted device where required.
- Selected till.
- Open till session for billing, payment, receipt, cash movement, and close flow.

## Online Store Access Rule

Customer online store access is channel-based and tenant-scoped.

Public browsing may not require customer sign-in, but checkout, customer profile,
order status, and pickup status must follow customer/session rules.

Tenant admin actions for online store setup require tenant user permissions.

## Click & Collect Access Rule

Click and collect operations require order, fulfilment, and pickup permissions
for staff actions.

Customer pickup visibility must only show the customer's own order data.

## Offline Access Rule

Offline operation requires a trusted POS device/offline client.

Offline cash sale, sync outbox, pending inventory movement, and offline number
usage must be tied to tenant, outlet, device, user, and till/session where
applicable.

Offline data is not final truth until backend sync and validation succeed.

## Critical Backend-Final Actions

Backend remains final authority for final sale total, card/QR payment, refund,
exchange, future/deferred loyalty or store credit, till final close, final inventory quantity,
permission, tenant isolation, and audit.

## Related Files

- [[Feature_Entitlement_Matrix]]
- [[Permission_Code_List]]
- [[API_Authorization_Rules]]
- [[../01_RELEASE_SCOPE/Release_1_Scope]]

<!-- RBAC_HARDENING_2026_08_15_START -->
## Tenant RBAC Runtime Addendum - 2026-08-15

Canonical effective permission resolution is now documented in `02_ACCESS_CONTROL/Tenant_Effective_Permission_Resolution.md`.

Key rules:

- Effective permissions are additive allow grants.
- Sources are tenant direct permissions, tenant role permissions, outlet direct permissions, and outlet role permissions where outlet context applies.
- Revoked assignments/grants must never contribute to effective permissions.
- Feature entitlement must be checked before plan-controlled permissions are usable.
- Explicit deny is not implemented in Release 1.
- Tenant Admin role APIs remain an implementation gap until `/api/v1/tenant-admin/roles` and `/api/v1/tenant-admin/permission-catalog` exist in backend source.
<!-- RBAC_HARDENING_2026_08_15_END -->

