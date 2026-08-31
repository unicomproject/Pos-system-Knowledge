<!-- title: Backend Driven Permission Catalog -->
<!-- status: CANONICAL — LOCKED & MERGED -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-28 -->


# Backend Driven Permission Catalog

> **Permission & Entitlement Contract Reconciled: 2026-08-28 — CANONICAL / LOCKED FOR RELEASE 1**  
> Full Release-1 catalog: [CANONICAL_MODULE_FEATURE_PERMISSION_CATALOG_R1.md](file:///c:/Users/User/Desktop/Nytroz__POS/Nytroz%20POS%20-%20Second%20Brain/Pos-system-Knowledge/02_ACCESS_CONTROL/CANONICAL_MODULE_FEATURE_PERMISSION_CATALOG_R1.md).

## Purpose

This file defines the backend-driven permission catalog rule for OneVerz POS MVP.

The frontend must not own the permission catalog.
The backend and database seed/catalog are the source of truth.

```text
NO production frontend-owned permission list as Source of Truth.
```

```text
Canonical Permission Definitions
        ↓
Database / Backend Seed
        ↓
Backend Permission Catalog API
        ↓
Frontend Rendering
```

## Catalog Principle

Permissions are stored as stable permission definitions.
Roles group permission definitions.
Users receive permissions through roles and optional direct permissions.
Outlet-specific access may be granted through outlet role/permission records.

## Database Alignment

The updated database design includes tenant users, role templates, tenant roles,
permission definitions, tenant role permissions, tenant user roles, outlet user
roles, and outlet user permissions.

These records support tenant-level and outlet-level access.

## Catalog Consumers

| Consumer | Usage |
|---|---|
| Backend APIs | Final authorization |
| Flutter POS | Hide/disable POS and offline actions |
| Desktop EPOS/Admin | Build menus and guard actions |
| Online Store Admin | Storefront/order/checkout admin access |
| Platform Admin | Tenant/plan/entitlement/admin controls |
| QA | Permission test cases |

## Required Catalog Groups

The permission catalog must support:

- Platform administration.
- Tenant administration.
- Product and variant management.
- Inventory management.
- POS operations.
- Online store setup.
- Cart and checkout support.
- Unified order management.
- Fulfilment and pickup.
- Payment and refund.
- Return and exchange.
- Offline operation and sync.
- Notification setup.
- Integration setup.
- Reporting and analytics.
- Device and hardware operations.

## Frontend Rule

Frontend must request permission context from backend.

Do not duplicate permission definitions in static frontend-only lists except as
typed constants for compile-time safety.

Typed constants must match backend codes **for surfaces the frontend actually
guards**. Platform Admin role assignment must consume the backend catalogue API
rather than a static frontend list. Static keys now include return-policy template
routes and actions (SA-P1-04).

## Menu Rule

Menus and action buttons must be built from backend context.

Do not hardcode role-based menu access.

## Entitlement + Permission Rule

```text
Entitlement ≠ Permission
```

A permission is not enough if the feature is disabled.

A permission cannot activate a feature that the tenant is not entitled to use.

Example: `pickup.orders.manage` is valid only if the tenant has click collect /
fulfilment feature enabled.

## Outlet Rule

Outlet-specific roles and permissions apply when an action belongs to a physical
outlet, till, device, POS flow, stock location, pickup point, or cash session.

## Offline Rule

Offline sync permissions must be evaluated before the device can upload sync
batches, resolve conflicts, or use offline number blocks.

Backend validation is still required after upload.

## Audit Rule

Permission denied events for protected actions should be auditable where
business-critical or security-sensitive.

## Related Files

- [[CANONICAL_PERMISSION_AND_FEATURE_ENTITLEMENT_CONTRACT_R1]]
- [[Permission_Code_List]]
- [[Feature_Entitlement_Matrix]]
- [[API_Authorization_Rules]]
