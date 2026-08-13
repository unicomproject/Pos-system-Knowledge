<!-- title: Selected Tenant Online Store UI API DB Mapping -->
<!-- status: LOCKED / APPROVED -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->

# Selected-Tenant Online Store — UI / API / DB Mapping

## Screen ST-07 — Configure Initial Online Store

| UI field | API request/response | Domain | Table.Column | Existing | Migration |
|---|---|---|---|---|---|
| Store status * | `storeStatus` (`DRAFT`\|`ACTIVE`) | `online_store.defaults.storeStatus` | `tenant_settings.setting_value` (JSON) | YES | NO |
| Tax display mode | `taxDisplayMode` (`MATCH_TENANT`) | `online_store.defaults.taxDisplayMode` | same | YES | NO |
| Entitlement badge | `entitled` (read) | Effective feature | entitlements | YES | NO |
| C&C notice | `clickCollectEntitled`, `clickCollectConfigured` | Feature + FMO existence | read-only derived | YES | NO |

## Routes

| UI route | Method | API |
|---|---|---|
| `/tenants/:tenantId/configure/online-store` | GET | `GET /api/v1/platform-admin/tenants/{tenantId}/bootstrap/online-store` |
| same | PUT | `PUT /api/v1/platform-admin/tenants/{tenantId}/bootstrap/online-store` |

PUT requires `Idempotency-Key`.

## Permission

`platform.tenants.bootstrap.online_store.manage`

## Audit

`platform.tenant_bootstrap.online_store_configured`

Contract: [[../03_USER_JOURNEYS/Platform_Admin/Selected_Tenant_Online_Store_Bootstrap_Contract]]
