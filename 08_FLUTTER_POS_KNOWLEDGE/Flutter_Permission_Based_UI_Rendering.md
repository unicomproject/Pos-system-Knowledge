<!-- title: Flutter Permission Based UI Rendering -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-09 -->


# Flutter Permission Based UI Rendering

## Purpose

This file defines permission-based UI rendering rules for OneVerz POS Flutter apps.

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
- `sales.discount.apply` controls the current MANUAL Discount surface. Offline
  visibility may use a cached snapshot, but sync backend revalidation is final.
- Do not show manager approval/POLICY/Item Fixed controls in current cashier UI;
  `sales.discount.approve` is deferred capability, not a normal Cashier grant.
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

<!-- RBAC_HARDENING_2026_08_15_START -->
## Tenant Admin Roles & Access UI Correction - 2026-08-15

Flutter permission rendering is a UX helper only. Backend authorization remains final authority.

Role setup must use the approved five-step flow:

1. Role Details & Template
2. Select Modules
3. Configure Permissions
4. Assign Users & Access Scope
5. Review & Create

Do not expose or imply a sixth wizard step. Confirmation is a post-save result state.
<!-- RBAC_HARDENING_2026_08_15_END -->

