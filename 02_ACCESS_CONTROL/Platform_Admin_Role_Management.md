<!-- title: Platform Admin Role Management -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-15 -->


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

## Platform Permission Strategy (Option A)

Platform permissions use TM-EPOS plural domain codes for lifecycle/admin areas and
**granular action codes** for implemented modules.

Rules:

- Roles group permission codes; do not hardcode role names in UI or API logic.
- Angular menu visibility and route guards must use the same codes returned in login `platformPermissions[]`.
- Backend is the final authority for every protected platform endpoint.
- Login currently returns permission codes only; role names are not yet exposed to the frontend.

See [[Permission_Code_List]] for the authoritative 36-code platform catalog.

### Domain examples

| Domain | Example codes |
|---|---|
| Dashboard | `platform.dashboard.view` |
| Tenants | `platform.tenants.view`, `.create`, `.update`, `.activate`, `.suspend`, `.entitlements.update` |
| Subscription plans | `platform.subscription_plans.view`, `.create`, `.edit`, `.duplicate`, `.archive`, `.delete` |
| Catalog | `platform.permissions.view`, `platform.modules.view`, `platform.features.view` |
| Platform roles | `platform.roles.view`, `.create`, `.update`, `.permissions.view`, `.permissions.update` |
| Platform users | `platform.users.view`, `.create`, `.update`, `.roles.assign` |
| Settings / audit / billing / integrations | `platform.settings.*`, `platform.audit.view`, `platform.billing.*`, `platform.integrations.manage` |

### Super Administrator development role

Seed role code: `super_administrator`

Expected grants after platform permission foundation migration:

- All 36 platform permission codes listed in [[Permission_Code_List]].
- The 36-code count is the current authoritative catalog baseline. The earlier
  31-code live-login verification from 2026-07-02 is retained in historical
  verification records only and must not be used as the current catalog count.

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
