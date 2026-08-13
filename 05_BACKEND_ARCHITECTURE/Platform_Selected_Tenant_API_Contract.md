# Platform Selected Tenant API Contract

<!-- status: Canonical / Locked -->
<!-- last_updated: 2026-08-12 -->

Defines platform-admin bootstrap APIs. **Backend implemented** (Phase 3–3.6 closure, 2026-08-12). Angular Selected-Tenant UI remains pending.

Base: `/api/v1/platform-admin/tenants/{tenantId}/bootstrap`

## Global rules

| Rule | Detail |
|---|---|
| Auth | Platform JWT |
| Actor | `platform_user_id` |
| Tenant isolation | `tenantId` route param validated against platform user scope |
| Suspended tenant | Mutations → `409 platform_tenants.bootstrap.tenant_suspended` |
| Cancelled tenant | Entry/mutations blocked → `404` or `403` per security policy |
| Idempotency | `Idempotency-Key` header on all POST mutations |
| Correlation | `X-Correlation-Id` required on mutations |
| Transaction | One aggregate per mutation; import commit per valid row batch |

---

## GET `/summary`

| | |
|---|---|
| Journey | SA-ST-UJ-001 |
| Screen | ST-01 |
| Permission | `platform.tenants.bootstrap.access` |
| Entitlement | None |

**Response 200**

```json
{
  "tenant": { "id", "name", "code", "lifecycleStatus", "planName" },
  "modules": [{ "moduleKey", "status", "count", "entitled", "canConfigure", "dependencyNotice" }]
}
```

**Errors:** `403` permission; `404` tenant not found

---

## POST `/outlets`

| | |
|---|---|
| Journey | SA-ST-UJ-005 |
| Screen | ST-02 |
| Permission | `platform.tenants.bootstrap.outlets.manage` |
| Entitlement | Outlet module |

**Request**

```json
{
  "outletName": "string",
  "outletType": "STORE|WAREHOUSE",
  "timezone": "IANA",
  "phone": "string?",
  "email": "string?",
  "status": "ACTIVE",
  "address": {
    "addressLine1": "string",
    "city": "string",
    "countryCode": "LK",
    "postalCode": "string?",
    "stateOrProvince": "string?"
  }
}
```

**Response 201:** outlet DTO with server-generated `outletCode`

**Validation:** per [[Selected_Tenant_Product_Bootstrap_Contract]] outlet mapping

**409:** `platform_tenants.bootstrap.conflict` duplicate code; `platform_tenants.bootstrap.tenant_suspended`; `platform_tenants.bootstrap.limit_reached`

**Audit:** `platform.tenant_bootstrap.outlet_created`

**Note:** `enablePickupCollection` **not accepted** — see collection contract.

---

## POST `/tills`

| | |
|---|---|
| Journey | SA-ST-UJ-006 |
| Permission | `platform.tenants.bootstrap.tills.manage` |
| Precondition | ≥1 active outlet |

**Request:** `{ "outletId", "tillName", "tillCode" }`

**Response 201:** till DTO, `deviceBindingStatus: "PENDING"`

**409:** `platform_tenants.bootstrap.dependency_missing` (no outlet); duplicate till code

**Audit:** `platform.tenant_bootstrap.till_created`

---

## POST `/roles`

| | |
|---|---|
| Journey | SA-ST-UJ-007 |
| Permission | `platform.tenants.bootstrap.roles.manage` |

**Request:** `{ "roleName", "description?", "permissionCodes": ["..."] }`

**Response 201:** role DTO

**403:** permission codes not entitled for tenant

**Audit:** `platform.tenant_bootstrap.role_created`

---

## POST `/users`

| | |
|---|---|
| Journey | SA-ST-UJ-008 |
| Permission | `platform.tenants.bootstrap.users.manage` |

**Request:** `{ "displayName", "email", "phone?", "roleId", "outletIds?": [] }`

**Response 201:** user DTO + invite status

**409:** duplicate email; user limit reached

**Audit:** `platform.tenant_bootstrap.user_created`

---

## POST `/products`

| | |
|---|---|
| Journey | SA-ST-UJ-009 |
| Permission | `platform.tenants.bootstrap.products.manage` |

**Request:** per [[Selected_Tenant_Product_Bootstrap_Contract]]

**Response 201:** product + variant summary

**Audit:** `platform.tenant_bootstrap.product_created`

---

## GET `/products/import/template`

| | |
|---|---|
| Journey | SA-ST-UJ-010 |
| Permission | `platform.tenants.bootstrap.products.import` |

**Response 200:** `text/csv` — `OVZ-ST-PRODUCT-IMPORT-v1` header

---

## POST `/products/import/validate`

| | |
|---|---|
| Journey | SA-ST-UJ-010 (step) |
| Permission | `platform.tenants.bootstrap.products.import` |
| Content-Type | `multipart/form-data` |

**Response 201:** `{ "importId", "totalRows", "validRows", "invalidRows", "previewInvalidRows": [] }`

---

## POST `/products/import/{importId}/commit`

| | |
|---|---|
| Journey | SA-ST-UJ-010 |
| Permission | `platform.tenants.bootstrap.products.import` |
| Idempotency | Required |

**Response 200:** `{ "importId", "committedRows", "skippedRows" }`

**409:** `import.batch_in_progress`

**Audit:** `platform.tenant_bootstrap.products_imported`

---

## GET `/products/import/{importId}/errors.csv`

Returns error CSV per [[Selected_Tenant_Product_Import_Contract]].

---

## GET `/online-store`

| | |
|---|---|
| Journey | SA-ST-UJ-011 / SA-UJ-057 |
| Permission | `platform.tenants.bootstrap.online_store.manage` |
| Entitlement | Effective `online_store` (else 403 not_entitled) |

**Response 200:**

```json
{
  "entitled": true,
  "storeStatus": "DRAFT",
  "taxDisplayMode": "MATCH_TENANT",
  "clickCollectEntitled": false,
  "clickCollectConfigured": false,
  "dependencyNotice": null
}
```

`storeStatus` vocabulary (LOCKED): `DRAFT` | `ACTIVE`.

---

## PUT `/online-store`

| | |
|---|---|
| Journey | SA-ST-UJ-011 / SA-UJ-057 |
| Permission | `platform.tenants.bootstrap.online_store.manage` |
| Entitlement | Effective `online_store` |
| Idempotency | `Idempotency-Key` **required** |

**Request:**

```json
{
  "storeStatus": "ACTIVE",
  "taxDisplayMode": "MATCH_TENANT"
}
```

`taxDisplayMode` optional; default `MATCH_TENANT`.

**Response 200:** Updated settings DTO (same shape as GET).

**400:** Validation (invalid `storeStatus`)  
**403:** Permission / not entitled  
**404:** Tenant  
**409:** Suspended tenant; idempotency conflict  

**Audit:** `platform.tenant_bootstrap.online_store_configured`

Contract: [[../03_USER_JOURNEYS/Platform_Admin/Selected_Tenant_Online_Store_Bootstrap_Contract]]

> Implementation note: endpoints are **contract-locked**; production backend evidence pending (SA-UJ-057 = NOT_STARTED until closed).
