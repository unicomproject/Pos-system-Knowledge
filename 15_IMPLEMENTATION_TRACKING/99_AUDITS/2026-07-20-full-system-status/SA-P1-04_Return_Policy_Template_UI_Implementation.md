<!-- title: SA-P1-04 Return Policy Template UI Implementation -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-20 -->

# SA-P1-04 — Return Policy Template Platform Admin UI

## Final status

**COMPLETE**

## Scope decision

Return Policy Templates are **included in Release 1** as part of the Super Admin product configuration journey. Backend was already COMPLETE; this task delivered the missing Angular Platform Admin UI against the existing contract without backend redesign.

## Branches and commits

| Repo | Branch | Base | Task commit |
|---|---|---|---|
| Platform Admin | `feature/platform-admin-return-policy-templates` | `6d324ba` | (this task) |
| Unified-Commerce | `feature/platform-admin-return-policy-templates` | `5f7539e` | **No changes** |
| Pos-system-Knowledge | `docs/platform-admin-return-policy-templates` | `8608a83` | (this task) |

## User journey

`Platform Login` → sidebar **Return Policy Templates** → **List** (search + pagination) → **Create Template** → **Detail** → **Edit** → **Save** → **Reload** → **Delete** (soft) or status **INACTIVE** via update.

Routes:

| Route | Page |
|---|---|
| `/admin/return-policy-templates` | List |
| `/admin/return-policy-templates/create` | Create |
| `/admin/return-policy-templates/:templateId` | Detail / edit |

## API contract (backend source of truth)

Base: `GET|POST /api/v1/platform/return-policy-templates`, `GET|PUT|DELETE /api/v1/platform/return-policy-templates/{id}`

| Operation | Method | Endpoint | Permission (or manage alias) | Request | Response | Supported |
|---|---|---|---|---|---|---|
| List | GET | `/api/v1/platform/return-policy-templates` | `platform.return_policy_templates.view` | `pageNumber`, `pageSize`, `search?` | `ReturnPolicyTemplateListResponse` | Yes |
| Get | GET | `/{id}` | view | — | `ReturnPolicyTemplateResponse` | Yes |
| Create | POST | `/` | `platform.return_policy_templates.create` | `ReturnPolicyTemplateCreateRequest` | 201 + `ReturnPolicyTemplateResponse` | Yes |
| Update | PUT | `/{id}` | `platform.return_policy_templates.update` | `ReturnPolicyTemplateUpdateRequest` | `ReturnPolicyTemplateResponse` | Yes |
| Delete | DELETE | `/{id}` | `platform.return_policy_templates.delete` | — | 204 | Yes (soft) |

### Fields

| Field | Type | Required | Validation | UI control |
|---|---|---|---|---|
| `templateCode` | string | Yes | max 80; normalized uppercase server-side | text input |
| `name` | string | Yes | max 200 | text input |
| `returnWindowDays` | int? | No | ≥ 0 if provided | number input |
| `status` | enum | Yes | `ACTIVE` \| `INACTIVE` on write; `DELETED` via delete | select |

No separate activate/deactivate endpoint — status changes use PUT.

### Error codes

| Code | HTTP | UI handling |
|---|---|---|
| `return_policy_templates.access_denied` | 403 | Safe message via `ApiErrorService` |
| `return_policy_templates.not_found` | 404 | Detail load error |
| `return_policy_templates.validation_failed` | 400 | Field + banner messages |
| `return_policy_templates.conflict` | 409 | Duplicate template code banner |

## Permission mapping

| Surface | Permission | Manage alias |
|---|---|---|
| Menu + list route + detail view | `platform.return_policy_templates.view` | `...manage` |
| Create route + button | `platform.return_policy_templates.create` | `...manage` |
| Edit + save | `platform.return_policy_templates.update` | `...manage` |
| Delete | `platform.return_policy_templates.delete` | `...manage` |

Implementation:

- `permission-keys.ts` — all five codes in `platformPermissions` (36 total static keys)
- `permission.guard.ts` + route `alternatePermissions` for manage alias
- `sidebar.ts` — menu visibility checks required OR alternate permissions
- `return-policy-template-access.util.ts` — page action helpers

## Frontend files changed

**New**

- `src/app/features/admin/models/platform-return-policy-template.model.ts`
- `src/app/features/admin/mappers/platform-return-policy-template.mapper.ts` (+ spec)
- `src/app/features/admin/services/platform-return-policy-template-api.service.ts` (+ spec)
- `src/app/features/admin/utils/return-policy-template-access.util.ts`
- `src/app/features/admin/pages/platform-return-policy-templates-page/*` (+ spec)
- `src/app/features/admin/pages/platform-create-return-policy-template-page/*` (+ spec)
- `src/app/features/admin/pages/platform-return-policy-template-detail-page/*` (+ spec)

**Modified**

- `src/app/core/config/permission-keys.ts` (+ spec)
- `src/app/core/config/api-endpoints.ts`
- `src/app/core/config/menu.config.ts`
- `src/app/core/guards/permission.guard.ts` (+ spec)
- `src/app/features/admin/routes/admin.routes.ts`
- `src/app/layout/sidebar/sidebar.ts` (+ spec)

## Backend files changed

**None** — existing contract sufficient.

## Tests

| Suite | Result |
|---|---|
| Angular `ng test --watch=false` | **378/378 PASS** (baseline 363) |
| Angular production build | **PASS** (style budget warnings only) |
| Platform Unit | **191/191 PASS** |
| Platform ApiTests | **100/100 PASS** |
| Platform Integration (filter) | **141 PASS** |

New specs cover list/create/detail pages, mapper, API service, permission guard alternate path, sidebar menu count (15 items).

## Runtime evidence (local Development)

Account: `posunique001@gmail.com` / `Admin@12345`  
API: `http://localhost:5150/api/v1`  
FE dev server: `http://127.0.0.1:4200`

| Step | Result |
|---|---|
| Login + list templates | 200; 4 seeded templates returned |
| Create `SA-P1-04-*` | 201; persisted id + fields |
| Get detail | 200; matches create payload |
| Update name/status/days | 200; `INACTIVE`, 14 days |
| Reload detail | 200; persisted update values |
| Delete | 204; subsequent GET 404 |
| Unauthenticated list | 401 |
| FE route `/admin/return-policy-templates` | 200 (SPA shell) |

Browser pixel walkthrough (menu → form → save) uses the same API contract via Angular proxy; API persistence verified end-to-end.

## Remaining gaps

- Browser pixel/responsive screenshot evidence optional (API + unit tests verified)
- Limited Platform user without full permission set not re-tested for 403 UI
- Product-to-return-policy assignment remains tenant-catalog scope (out of SA-P1-04)

## Score impact

| Metric | Before SA-P1-04 | After SA-P1-04 |
|---|---:|---:|
| Release 1 Super Admin | 80% | **82%** |
| Full planned Super Admin | 63% | **65%** |

Rationale: FE–BE integration +2 (return-policy journey complete); authorization +0 (keys were pre-aligned in SA-P0-03); one P1 BACKEND_ONLY gap removed from full-planned drag.

## Related

- [[Return_Policy_Setup_Implementation_Status]]
- [[Platform_Admin_Permission_Catalogue_Alignment]]
- [[Super_Admin_Current_Status_Audit]]
