<!-- title: Cashier POS Canonical Permission Registry — Chunk 8 -->
<!-- status: Active — Flutter Centralized Permission Infrastructure -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-04 -->

# Cashier POS Canonical Permission Registry — Chunk 8

## Scope

Chunk 8 delivers **Flutter-only** centralized permission visibility infrastructure:

- Authoritative effective-permission state
- Membership API (`has` / `hasAny` / `hasAll`)
- `PermissionGate` widget (fail-closed, no layout gap)
- Collection filter helper
- Session hydration normalization (trim + dedupe)

This chunk does **not**:

- Screen-by-screen visibility rollout
- Route guards
- Top bar / bottom bar permission rollout
- Payments / customers / drawer / till UI gates
- Tenant Admin UI
- Backend production changes
- New / renamed permission codes

## 1. Flutter authoritative permission source

```
Backend Chunk 5 effective set
        ↓
Login / refresh payload (`effectivePermissionCodes` preferred)
        ↓
AuthSession.permissionCodes (normalized list)
        ↓
effectivePermissionSetProvider → EffectivePermissionSet
        ↓
PermissionGate / AuthSession.hasPermission / helpers
```

## 2. Session hydration flow

`auth_mapper.dart` prefers `effectivePermissionCodes` (Chunk 5), then
`permissionCodes` / JWT claims. Codes are trimmed and deduplicated via
`EffectivePermissionSet.normalizeToList`. No parent expansion, no aliases invented,
no entitlement recalculation.

## 3. Central membership API

| API | Semantics |
| --- | --- |
| `hasPermission(code)` | Exact membership |
| `hasAnyPermission([...])` | OR |
| `hasAllPermissions([...])` | AND |

Implemented on `EffectivePermissionSet` and mirrored on `AuthSession`.

Wildcard (`*`) and slash compound lookups always return **false**.

## 4. PermissionGate contract

```dart
PermissionGate(permission: code, child: ...)
PermissionGate.any(permissions: [...], child: ...)
PermissionGate.all(permissions: [...], child: ...)
```

| Condition | Result |
| --- | --- |
| Allowed | Render `child` |
| Denied | `fallback` or `SizedBox.shrink()` |
| Layout gap | **Not retained** (no `Visibility(maintainSize: true)`) |

Business enable/disable remains on the child after permission allows render.

## 5–8. Invariants

| Rule | Status |
| --- | --- |
| Flutter recalculates parent/child | **NO** |
| Flutter recalculates entitlement | **NO** |
| Role-name authorization in central layer | **NO** |
| Mutable effective set for UI | **NO** (`UnmodifiableSetView`) |
| Fail-closed (null session / empty / loading) | **YES** (empty set → deny) |

## 9. Refresh behavior

`authSessionProvider` update → `effectivePermissionSetProvider` rebuilds →
`PermissionGate` consumers rebuild. No app restart required.

## 10. Dynamic no-gap rendering foundation

Denied gates shrink to empty. `filterByPermission` drops unauthorized action
items so later grids/nav can reflow without placeholders.

## 11. Permission vs business-state ordering

1. Permission denied → hide  
2. Else → evaluate till/device/business enabled/disabled on child  

## 12. Multi-device

One `effectivePermissionSetProvider`. No phone/tablet/desktop permission providers.

## 13. Hardcoded permission string audit (Chunk 8)

| Area | Result |
| --- | --- |
| Central access (`lib/core/access` new files) | Frozen constants / exact membership only |
| Wildcard literals in `lib/` | None found |
| Slash/shorthand membership lookups | Rejected by API; none in central layer |
| Feature screens | Deferred — still use `PosPermissionAccess` / ad-hoc `hasPermission` (Chunk 9+) |

## 14. Role-check audit

| Area | Result |
| --- | --- |
| Central access role checks | **0** |
| Feature-level `roleName` display / admin UI | Deferred (not authorization) |

## 15. Legacy helpers

`PosPermissionAccess` retained (CANONICAL_REUSE / LEGACY_HELPER).  
`hasAny` / `hasAll` / `hasExact` now delegate to `EffectivePermissionSet`.  
Alias OR lists in `grantsCanonicalPermission` remain legacy compatibility — **not**
parent→all-children expansion.

## 16. Permission-code freeze

Added / removed / renamed canonical codes: **0**.  
Backend: **unchanged**.

## 17–21. Explicit deferrals

- Screen-by-screen visibility **NOT** implemented  
- Route guards **NOT** implemented  
- Top bar / bottom bar rollout **NOT** implemented  
- Payments / customers / drawer / till UI rollout **NOT** implemented  

## 22. Chunk 9 deferred scope

Global Shell / Top Bar / Bottom Navigation / Notifications permission rollout
using `PermissionGate` + `effectivePermissionSetProvider`.
