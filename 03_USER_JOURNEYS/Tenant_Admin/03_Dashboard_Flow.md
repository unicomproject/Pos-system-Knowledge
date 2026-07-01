<!-- title: Tenant Admin Dashboard Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin Dashboard Flow

## Purpose

Defines the tenant dashboard after successful login.

## Actor

Tenant Admin

## Source

Derived from `Slide 3 - Tenant Admin Dashboard Flow` in `tenant-full-journey.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Tenant Admin login succeeds.

## Preconditions

- Tenant Admin is authenticated.
- Tenant feature and permission context is loaded.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Login success | System redirects to dashboard. |
| 2 | Load dashboard | System loads dashboard page. |
| 3 | Fetch tenant data | System fetches tenant-scoped metrics. |
| 4 | Display KPI summary | System shows today sales, orders, low stock, and active outlets. |
| 5 | Show orders | System shows order summary. |
| 6 | Show low stock alerts | System highlights low stock items. |
| 7 | Show active outlets | System displays active outlet count. |
| 8 | Show staff activity | System shows staff activity summary. |
| 9 | Show recent transactions | System lists recent transactions. |
| 10 | Show quick actions | System shows actions such as add product, create order, stock in, report, add staff, notifications. |
| 11 | Select target module | Tenant Admin chooses module. |
| 12 | Navigate | System opens selected module. |

## Data Used Or Captured

- Sales KPIs
- Orders
- Low stock alerts
- Outlet status
- Staff activity
- Recent transactions
- Quick actions

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Dashboard data must be tenant-scoped.
- Quick actions must follow permission context.

## Validation And Error Cases

- Dashboard data unavailable
- Permission denied for module
- Partial KPI load failure

## Outcome

Tenant Admin gets operational overview and module navigation.

## Related Modules

- 27_Reporting_Analytics
- 20_Unified_Order_Sales
- 16_Inventory_Foundation_Stock_Availability
- 05_Tenant_User_Permission_Access

## Related Files

- 08_FLUTTER_POS_KNOWLEDGE/Flutter_Tenant_Admin_Layout.md
