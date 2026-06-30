<!-- title: Flutter Permission Based UI Rendering -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Flutter Permission Based UI Rendering

## Purpose

This file defines permission-based UI rendering rules for TM-EPOS Flutter apps.

Permissions are backend-driven and must not be hardcoded by role name.

## Rule

UI may hide or disable actions based on permissions.
Backend remains final authorization authority.

## Context Sources

Flutter must load:

- Enabled features.
- Effective permissions.
- Tenant status.
- Outlet access.
- Till/device context.
- Offline allowed actions.

## Rendering Behavior

| Condition | UI Behavior |
|---|---|
| Feature disabled | Hide menu or show feature unavailable |
| Permission missing | Hide/disable action |
| Till not open | Disable billing actions |
| Device not trusted | Block POS/device routes |
| Offline blocked action | Disable and explain online required |
| Sync conflict | Show sync issue indicator |

## POS Examples

- Hide discount button without discount permission.
- Hide refund/exchange without permission.
- Disable card/QR payment while offline.
- Disable till close while offline.
- Disable receipt reprint if permission missing.

## Pickup Examples

- Show pickup order list only with pickup permission.
- Show status update actions only with fulfilment/pickup permission.
- Hide cancelled/completed actions when order state does not allow them.

## Anti-Patterns

- `if role == cashier`.
- Static frontend-only permission list as source of truth.
- UI permission check without backend validation.
- Showing offline actions that backend cannot validate later.

## Related Files

- [[Flutter_Routing_Guards]]
- [[Flutter_API_Integration]]
- [[Flutter_Offline_Operation_Sync]]
