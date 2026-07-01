<!-- title: Platform Admin Role Management -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Platform Admin Role Management

## Purpose

This file defines Platform Admin role management rules for TM-EPOS MVP.

Platform Admin users manage the SaaS platform, not tenant daily POS operations.

## Platform Boundary

Platform Admin may manage tenants, subscription plans, feature entitlements,
platform users, platform permissions, billing setup, platform integrations, and
platform audit.

Platform Admin must not directly bypass tenant-level business permissions for
daily tenant operations unless a support/admin action is explicitly allowed and
audited.

## Platform Role Model

| Area | Rule |
|---|---|
| Platform users | Stored separately from tenant users |
| Platform roles | Group platform permissions |
| Platform permissions | Stable platform action codes |
| Platform role permissions | Mapping from role to permissions |
| Platform user roles | Mapping from user to platform roles |
| Platform direct permissions | Optional direct permission grant |

## Platform Permission Examples

| Code | Meaning |
|---|---|
| platform.tenants.view | View tenants |
| platform.tenants.create | Create tenants |
| platform.tenants.update | Update tenants |
| platform.subscriptions.manage | Manage plans/subscriptions |
| platform.features.manage | Manage modules/features/entitlements |
| platform.users.manage | Manage platform users |
| platform.audit.view | View platform audit |
| platform.integrations.manage | Manage platform-level integrations |

## Tenant Feature Control

Platform Admin can enable or disable tenant feature entitlements for:

- POS.
- Product and inventory.
- Online store.
- Cart and checkout.
- Click and collect.
- Offline operation and sync.
- Reports.
- Device and hardware operations.
- Notifications and integrations.

Tenant users still need tenant permissions after entitlement is enabled.

## Support Access Rule

If Platform Admin needs tenant support visibility, the action must be explicit,
permission-protected, and auditable.

Do not silently allow platform users to act as tenant users.

## Billing And Entitlement Rule

Subscription status may affect tenant entitlement access.

Expired, cancelled, or disabled entitlements must block related features according
to backend rules.

## Security Rule

Platform user sessions, refresh tokens, password reset tokens, and login audits
must remain separate from tenant user authentication records.

## Audit Rule

Platform role changes, entitlement changes, tenant status changes, integration
credential changes, and support access should be audit logged.

## Related Files

- [[Access_Control_Overview]]
- [[Feature_Entitlement_Matrix]]
- [[Permission_Code_List]]
