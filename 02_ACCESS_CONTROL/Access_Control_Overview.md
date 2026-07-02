<!-- title: Access Control Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Access Control Overview

## Purpose

This file defines the access-control model for the TM-EPOS MVP.

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
exchange, loyalty/store credit, till final close, final inventory quantity,
permission, tenant isolation, and audit.

## Related Files

- [[Feature_Entitlement_Matrix]]
- [[Permission_Code_List]]
- [[API_Authorization_Rules]]
- [[../01_RELEASE_SCOPE/Release_1_Scope]]
