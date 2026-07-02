<!-- title: Flutter Routing Guards -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Flutter Routing Guards

## Purpose

This file defines Flutter routing and guard rules for TM-EPOS MVP.

Routing must respect authentication, tenant status, feature entitlement,
permission, outlet, till, device, and offline state.

## Router Decision

Use GoRouter for app navigation.

Route guards must read backend-driven context from providers.

## Guard Layers

| Guard | Meaning |
|---|---|
| Auth guard | User must be logged in |
| Tenant guard | Tenant must be active/allowed |
| Feature guard | Tenant must have feature entitlement |
| Permission guard | User must have action permission |
| Outlet guard | User must have outlet access where required |
| Till guard | Open till/session required for billing |
| Device guard | Trusted device required where applicable |
| Offline guard | Allow only offline-safe routes/actions |

## POS Route Rules

POS sale routes require tenant user, POS feature, permission, outlet access,
trusted device where required, selected till, and open till session for billing
actions.

## Admin Route Rules

Tenant admin routes require tenant admin feature and permission.

Do not hardcode role names.

## Pickup Route Rules

Fulfilment and pickup routes require order/fulfilment/pickup permission.

## Offline Route Rules

Offline mode must not expose routes that require backend-final validation.

Examples blocked offline:

- Card/QR payment finalization.
- Refund final approval.
- Exchange final approval.
- Till final close.
- Loyalty/store credit final balance.

## UX Rule

When route access is denied, show clear message:

- Login required.
- Feature not enabled.
- Permission denied.
- Till not open.
- Device not trusted.
- Action unavailable offline.

## Related Files

- [[Flutter_Permission_Based_UI_Rendering]]
- [[Flutter_Offline_Operation_Sync]]
- [[Flutter_Security_Guardrails]]
