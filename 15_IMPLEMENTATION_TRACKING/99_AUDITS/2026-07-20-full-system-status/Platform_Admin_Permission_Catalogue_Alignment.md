<!-- title: Platform Admin Permission Catalogue Alignment -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-20 -->

# Platform Admin Permission Catalogue Alignment

## Status

**COMPLETE — NO_FUNCTIONAL_GAP** for the reported `31 versus 36` count difference.

The count difference is explained and is **not** a Release 1 authorization or role-assignment defect. Return-policy template Angular UI remains deferred under **SA-P1-04** (BACKEND_ONLY).

## Branches

| Repo | Branch | Base |
|---|---|---|
| nytroz-pos-platform-admin | `fix/platform-admin-permission-keys-alignment` | `f268925` |
| Unified-Commerce | `fix/platform-admin-permission-keys-alignment` | `d80c68e` |
| Pos-system-Knowledge | `docs/platform-admin-permission-keys-alignment` | `2f0d0fd` |

## Counts (verified 2026-07-20)

| Source | Count | Notes |
|---|---:|---|
| `PlatformPermissionCodes.All` | **36** | Active assignable business codes |
| Seed `PlatformAdminPermissionsSeedData.Definitions` | **36** | Includes return-policy templates |
| DB `platform_permissions` ACTIVE platform.* | **37** | 36 business + bootstrap `platform.admin.access` |
| Catalogue API / flat | **36** | Bootstrap filtered out |
| Super administrator role grants | **36** | Includes 5 return-policy codes |
| Login JWT / user.platformPermissions | **37** | Includes bootstrap |
| Angular `platformPermissions` (guarded UI) | **31** | Route/menu/action surfaces that exist |
| Angular role form (dynamic catalogue) | **36** | Loaded from API, not static keys |

## Explanation of `31 versus 36`

The five codes present in backend/catalogue but absent from Angular static `platformPermissions` are:

1. `platform.return_policy_templates.view`
2. `platform.return_policy_templates.create`
3. `platform.return_policy_templates.update`
4. `platform.return_policy_templates.delete`
5. `platform.return_policy_templates.manage`

| Classification | Result |
|---|---|
| Seeded / ACTIVE | Yes |
| Returned by catalogue API | Yes |
| Visible / assignable in Role UI | Yes (catalogue-driven) |
| Required by Angular route/menu/action | **No** — no return-policy Angular pages |
| Required by backend API | Yes (`ReturnPolicyTemplateService`) |
| Documented | Yes (`Permission_Code_List`) |

**Prior SA-P0-03 claim** that FE must add five constants to “fix” a P0 gap was **incorrect**. Static key count ≠ catalogue completeness. Role UI already assigns all 36 from the API.

## Classification of the five codes

`VALID_BUT_FE_GUARD_MISSING` only in the sense that Angular has no return-policy surface yet — intentional **BACKEND_ONLY** / tracked as **SA-P1-04**, not a catalogue defect.

## Runtime evidence

| Check | Result |
|---|---|
| GET `/api/v1/platform-admin/permission-catalog` | 36 codes; 5 return-policy present; bootstrap absent |
| GET `/api/v1/platform-admin/permission-catalog/flat` | totalCount=36 |
| Super admin role permissions | 36 assigned |
| Create role + PUT permissions including return-policy view | save/reload matched (3 codes, no dupes) |
| GET `/api/v1/platform/return-policy-templates` authenticated | 200 |
| Same endpoint unauthenticated | **401** |
| Limited-user password login | **UNVERIFIED** — create-user API is invite-oriented (no password field) |
| Service-layer deny without permission | Covered by unit tests (`return_policy_templates.access_denied`) |

## Fixes applied (minimum)

- Document FE static keys as guarded UI subset; add `platformBackendOnlyPermissions` + alignment unit test (no blind constant dump into route guards).
- Correct BE XML comment that falsely claimed Angular keys matched all 36.
- Catalogue mapper module label/sort for `return_policy_templates`.
- Second Brain audit priority correction: SA-P0-03 → closed as NO_FUNCTIONAL_GAP; return-policy UI remains SA-P1-04.

## Scores

No Release 1 score change (documentation/classification correction only).

| Score | Before | After |
|---|---:|---:|
| Release 1 Super Admin | 80% | **80%** |
| Full planned Super Admin | 63% | **63%** |

## Related

- [[Permission_Code_List]]
- [[Backend_Driven_Permission_Catalog]]
- [[Super_Admin_Current_Status_Audit]]
- SA-P1-04 return-policy templates FE
