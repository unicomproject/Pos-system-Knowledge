<!-- title: Role Permission Flow -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-18 -->

# Role Permission Flow

## Purpose

Defines Tenant Admin role, permission, and feature assignment flow.

## Source Basis

This journey is based on the uploaded SCS-TIX Release 1 user journey files, UI
screens, backend architecture, database design, and confirmed project decisions.

It must not be expanded into e-commerce, offline sync, supplier, delivery, kiosk,
coupon, AI, or accounting scope.

## Actors

| Actor | Responsibility |
|---|---|
| Tenant Admin | Creates roles and assigns permissions |
| Backend | Stores role permissions and feature assignments |
| Tenant User | Receives access after login/refresh |

## Preconditions

- Tenant Admin is authenticated.
- Role/permission feature is enabled.
- Permission catalog is seeded and exposed through tenant-admin catalog APIs.

## Main Flow

| Step | User/System Action | Expected Result |
|---:|---|---|
| 1 | Open Roles & Access | Role list from tenant context; permission catalog loads from backend |
| 2 | Select role | Role permission editor opens |
| 3 | Toggle permissions | Entitlement-filtered module → feature → permission tree |
| 4 | Review assignment | Selected codes reflect current role assignments |
| 5 | Save role permissions | Role permissions stored via tenant-admin API |

## Journey Diagram

```mermaid
flowchart TD
    S1[Open Roles and Access]
    S1 --> S2[Select role]
    S2 --> S3[Toggle permissions from backend catalog]
    S3 --> S4[Review assignment]
    S4 --> S5[Save role permissions]
    S5 --> Done[Journey completed]
```

## Business Rules

- Role code is tenant-unique.
- Permission catalog is platform-owned, seeded, and served by backend APIs.
- Flutter must not hardcode catalog trees; use `GET /api/v1/tenant-admin/permission-catalog`.
- Role list currently comes from `GET /api/v1/tenant-admin/context` → `roles[]`.
- Role create/edit CRUD remains a future gap; permission assignment is implemented.
- Feature entitlement must exist before assigning feature access.
- Permission changes should be audited.

## Access-Control Rules

| Control | Required Rule |
|---|---|
| Authentication | Required |
| Feature entitlement | Role/permission enabled |
| Permission | Role/permission manage permission |
| Audit | Required |

## Data and API References

| Area | References |
|---|---|
| API groups | `/api/v1/tenant-admin/permission-catalog`, `/api/v1/tenant-admin/roles/{roleId}/permissions`, `/api/v1/tenant-admin/context` |
| Tables | `roles`, `permissions`, `role_permissions`, `platform_modules`, `platform_features`, `tenant_feature_entitlements`, `tenant_user_roles` |

## Edge Cases

- Assigning disabled feature must fail.
- Removing permission hides UI and backend blocks API.
- System role protection must be respected where used.

## Out of Scope

- Fixed hardcoded access is excluded.
- Platform permission management is separate.

## Completion Criteria

- The user reaches the expected final state without bypassing access control.
- Tenant-owned data remains inside the resolved tenant context.
- Sensitive actions write audit records where required.
- UI state and backend state stay consistent after completion.

## Related Files

- [[../../02_ACCESS_CONTROL/Backend_Driven_Permission_Catalog]]
- [[../01_RELEASE_SCOPE/Release_1_Scope]]
- [[../02_ACCESS_CONTROL/Access_Control_Overview]]
- [[../05_BACKEND_ARCHITECTURE/API_Standards]]
