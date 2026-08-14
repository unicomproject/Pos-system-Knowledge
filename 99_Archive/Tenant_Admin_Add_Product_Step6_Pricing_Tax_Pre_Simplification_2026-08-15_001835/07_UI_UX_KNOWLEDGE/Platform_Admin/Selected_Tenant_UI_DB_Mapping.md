# Selected Tenant UI ↔ DB Attribute Mapping

<!-- status: Canonical / Locked -->
<!-- last_updated: 2026-08-12 -->

## ST-02 Create Initial Outlet

| UI Label | Domain Attribute | DB Table.Column | Required | Default | Validation | Editable | Audit |
|---|---|---|---|---|---|---|---|
| Outlet Name | `outletName` | `outlets.outlet_name` | Yes | — | 2–200 chars | Yes | Yes |
| Outlet Code | `outletCode` | `outlets.outlet_code` | Yes (server) | auto `OUT-YYYY-NNNN` | unique/tenant | Read-only | Yes |
| Outlet Type | `outletType` | `outlets.outlet_type` | Yes | `STORE` | `STORE`, `WAREHOUSE` | Yes | Yes |
| Timezone | `timezone` | `outlets.timezone` | Yes | tenant default | IANA | Yes | Yes |
| Phone | `phone` | `outlets.phone` | No | null | max 40 | Yes | Yes |
| Email | `email` | `outlets.email` | No | null | email | Yes | Yes |
| Status | `status` | `outlets.status` | Yes | `ACTIVE` | `ACTIVE`/`INACTIVE` | Yes | Yes |
| Address Line 1 | `addressLine1` | `outlet_addresses.address_line1` | Yes | — | max 255 | Yes | Yes |
| City | `city` | `outlet_addresses.city` | Yes | — | max 120 | Yes | Yes |
| Country | `countryCode` | `outlet_addresses.country_code` | Yes | tenant country | ISO-2 | Yes | Yes |
| Postal Code | `postalCode` | `outlet_addresses.postal_code` | No | null | country rules | Yes | Yes |
| State/Province | `stateOrProvince` | `outlet_addresses.state_or_province` | No | null | max 120 | Yes | Yes |

**Collection point:** NOT in ST-02 — see [[../../03_USER_JOURNEYS/Platform_Admin/Selected_Tenant_Collection_Point_Contract]].

**Deferred:** business hours, manager, image — Tenant Admin.

## ST-03 Create Initial Till

| UI Label | Domain Attribute | DB | Required | Validation |
|---|---|---|---|---|
| Outlet | `outletId` | `tills.outlet_id` | Yes | active outlet FK |
| Till Name | `tillName` | `tills.till_name` | Yes | per till validator |
| Till Code | `tillCode` | `tills.till_code` | Yes | unique per tenant/outlet |

## ST-04 Create Initial Role

| UI Label | Domain Attribute | DB | Required |
|---|---|---|---|
| Role Name | `roleName` | `tenant_roles.name` | Yes |
| Description | `description` | `tenant_roles.description` | No |
| Permission Codes | `permissionCodes[]` | role-permission mapping | Yes (≥1) |

## ST-05 Add Additional User

| UI Label | Domain Attribute | DB | Required |
|---|---|---|---|
| Full Name | `displayName` | `tenant_users.display_name` | Yes |
| Email | `email` | `tenant_users.email` | Yes |
| Phone | `phone` | `tenant_users.phone` | No |
| Role | `roleId` | role assignment | Yes |
| Outlet Access | `outletIds[]` | outlet access mapping | No |

## ST-06A Manual Product Bootstrap

See [[../../03_USER_JOURNEYS/Platform_Admin/Selected_Tenant_Product_Bootstrap_Contract]] — full field table.

## ST-06B CSV Import

See [[../../03_USER_JOURNEYS/Platform_Admin/Selected_Tenant_Product_Import_Contract]] — column table.

## Hub module states

**DERIVED ONLY** — see [[../../03_USER_JOURNEYS/Platform_Admin/Selected_Tenant_Setup_Hub_Status_Model]]. No DB persistence.
