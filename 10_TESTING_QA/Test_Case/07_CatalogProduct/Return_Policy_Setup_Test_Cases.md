<!-- title: Return Policy Setup Test Cases -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- module: CatalogProduct -->
<!-- feature: Return Policy Templates / Return Policy CRUD -->
<!-- last_updated: 2026-07-03 -->

# Return Policy Templates / Return Policy CRUD Test Cases

## Feature Scope

Platform admins can manage reusable system return policy templates. Tenant-authenticated users can create, list, view, update, and soft-delete tenant return policies.

This feature does not assign return policies to products yet. Product-level return/non-return behavior is a separate feature slice.

## Planned Functional Test Cases

| Case | Expected Result |
|---|---|
| Platform admin creates template with valid data | Template is created with normalized uppercase template code. |
| Platform admin creates duplicate template code | API returns conflict. |
| Platform admin lists templates | API returns non-deleted templates only. |
| Platform admin updates template | Template code/name/window/status are updated. |
| Platform admin deletes template | Template status becomes `DELETED`. |
| Tenant user creates return policy with valid data | Policy is created with normalized uppercase policy code. |
| Tenant user creates duplicate policy code in same tenant | API returns conflict. |
| Tenant user lists return policies | API returns non-deleted policies for current tenant only. |
| Tenant user gets another tenant policy id | API returns not found. |
| Tenant user updates return policy | Policy code/name/window/status are updated. |
| Tenant user deletes return policy | Policy status becomes `DELETED`. |

## Permission Cases

| Endpoint | Permission |
|---|---|
| `GET /api/v1/platform/return-policy-templates` | `platform.return_policy_templates.view` or `platform.return_policy_templates.manage` |
| `GET /api/v1/platform/return-policy-templates/{id}` | `platform.return_policy_templates.view` or `platform.return_policy_templates.manage` |
| `POST /api/v1/platform/return-policy-templates` | `platform.return_policy_templates.create` or `platform.return_policy_templates.manage` |
| `PUT /api/v1/platform/return-policy-templates/{id}` | `platform.return_policy_templates.update` or `platform.return_policy_templates.manage` |
| `DELETE /api/v1/platform/return-policy-templates/{id}` | `platform.return_policy_templates.delete` or `platform.return_policy_templates.manage` |
| `GET /api/v1/return-policies` | `catalog.return_policies.view` or `catalog.return_policies.manage` |
| `GET /api/v1/return-policies/{id}` | `catalog.return_policies.view` or `catalog.return_policies.manage` |
| `POST /api/v1/return-policies` | `catalog.return_policies.create` or `catalog.return_policies.manage` |
| `PUT /api/v1/return-policies/{id}` | `catalog.return_policies.update` or `catalog.return_policies.manage` |
| `DELETE /api/v1/return-policies/{id}` | `catalog.return_policies.delete` or `catalog.return_policies.manage` |

## Tenant Isolation Cases

| Case | Expected Result |
|---|---|
| Tenant return policy request body includes no `tenant_id` | Tenant is resolved from JWT/server context only. |
| Tenant A lists return policies | Tenant B policies are not returned. |
| Tenant A gets/updates/deletes Tenant B policy id | API returns not found. |
| Duplicate tenant policy code exists in another tenant | Current tenant can use the same policy code. |

## Database / Integration Cases

| Case | Expected Result |
|---|---|
| Migration creates `return_policy_templates` | Table exists with unique `template_code` and status/window checks. |
| Migration adds `status` to `return_policies` | Existing rows default to `ACTIVE`; invalid statuses are rejected. |
| Template seed inserts system defaults | `NO_RETURN`, `SAME_DAY`, `7DAYS`, and `14DAYS` are active. |
| Platform permission seed inserts template permissions | Super administrator receives template permissions. |
| Tenant permission seed inserts return policy permissions | Development tenant roles receive expected return policy permissions. |
| Repository list excludes `DELETED` rows | Soft-deleted templates/policies are hidden. |

## Idempotency Cases

No idempotency key is required for Return Policy setup. Duplicate template/policy code is handled with `409 Conflict`.

## Current Automated Test Coverage

| Test Suite | Coverage |
|---|---|
| Unit tests | Template permission denial, template create normalization, tenant return policy create normalization. |
| API tests | Tenant context extraction, platform claim requirement, TenantOnly and PlatformOnly policy attributes. |
| Integration tests | Template deleted filtering, tenant policy isolation, tenant deleted filtering. |

## Test Commands

```powershell
dotnet build E_POS.sln -m:1 --no-restore
dotnet ef migrations has-pending-model-changes --project src\E_POS.Infrastructure --startup-project src\E_POS.Api
dotnet ef database update --project src\E_POS.Infrastructure --startup-project src\E_POS.Api
dotnet test E_POS.sln -m:1 --no-restore
```

## Result Summary

| Command | Result |
|---|---|
| `dotnet build E_POS.sln -m:1 --no-restore` | Passed, 0 warnings, 0 errors on 2026-07-03. |
| `dotnet ef migrations has-pending-model-changes --project src\E_POS.Infrastructure --startup-project src\E_POS.Api` | Passed; no pending model changes. |
| `dotnet ef database update --project src\E_POS.Infrastructure --startup-project src\E_POS.Api` | Passed; Return Policy template/status migration applied. |
| `dotnet test E_POS.sln -m:1 --no-restore` | Passed on 2026-07-03: Unit 142, Integration 59, API 110. |