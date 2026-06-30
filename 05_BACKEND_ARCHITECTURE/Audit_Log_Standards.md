<!-- title: Audit Log Standards -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Audit Log Standards

## Purpose

This file defines audit logging rules for TM-EPOS MVP backend.

Audit logs record business-sensitive and security-sensitive actions.

Logs help debugging.
Audit logs support accountability.

## Audit Rule

Audit important actions once, with stable event name, actor, tenant, context,
timestamp, and result.

Do not store sensitive secrets in audit logs.

## Required Audit Context

| Field | Meaning |
|---|---|
| tenant_id | Tenant context where applicable |
| actor_type | platform_user, tenant_user, customer, system, offline_client |
| actor_id | Actor identifier |
| outlet_id | Outlet where applicable |
| till_id | Till where applicable |
| pos_device_id | Device where applicable |
| action | Stable audit action |
| result | success, failed, denied |
| reference_type | Related business object |
| reference_id | Related record ID |
| timestamp | Server timestamp |

## Platform Audit Events

- Tenant created/updated/suspended.
- Feature entitlement changed.
- Subscription changed.
- Platform role or permission changed.
- Integration credential changed.

## Tenant Admin Audit Events

- User invited/updated/disabled.
- Role/permission changed.
- Outlet/till/device changed.
- Product or inventory configuration changed.
- Report export created.

## POS Audit Events

- Till opened/closed.
- Cash movement created.
- Sale completed.
- Receipt printed/reprinted.
- Discount applied.
- Refund processed.
- Exchange processed.
- Cash drawer opened.

## Online / Pickup Audit Events

- Online order created.
- Checkout completed.
- Order status changed.
- Fulfilment status changed.
- Pickup slot reserved.
- Pickup order completed/cancelled.

## Offline Audit Events

- Offline client registered/disabled.
- Offline number block assigned.
- Sync batch uploaded.
- Sync item applied/rejected.
- Sync conflict opened/resolved.
- Offline cash sale synced.

## Security Rule

Never audit raw passwords, tokens, POS PINs, card data, payment secrets, or raw
provider credentials.

## Related Files

- [[Offline_Operation_Architecture]]
- [[API_Standards]]
- [[Authorization_And_Permissions]]
