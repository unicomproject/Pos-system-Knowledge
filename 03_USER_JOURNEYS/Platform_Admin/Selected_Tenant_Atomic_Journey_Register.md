<!-- title: Selected Tenant Atomic Journey Register -->
<!-- status: Canonical -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->

# Selected Tenant Atomic Journey Register

## Authority

Canonical atomic journey register for **Selected-Tenant Mode**.

Companion: [[Selected_Tenant_Mode_Contract]]

## Journey acceptance summary

| Status | Count | IDs |
|---|---:|---|
| **Accepted** | 10 | SA-ST-UJ-001, 002, 003, 005, 006, 007, 008, 009, 010, 011 |
| **Rejected as journey / merged to UX** | 1 | SA-ST-UJ-004 → **ST-UX-001** mandatory context banner requirement |
| **Deferred** | 0 | — |

## Global register mapping (canonical)

Registered in [[../00_Global_User_Journey_Register]] as **SA-UJ-048…057**.

**Implementation status (2026-08-12 — Angular production merge):**

| Canonical ID | Backend | Frontend (Angular) | Global status |
|---|---|---|---|
| SA-UJ-048 | `GET .../bootstrap/summary` + access policy | Setup Hub / context shell + runtime E2E | **COMPLETE** (100%) |
| SA-UJ-049 | Tenant APIs only (client switch) | Switch UX + tenant isolation runtime | **COMPLETE** (100%) |
| SA-UJ-050 | Client exit only | Exit UX + context clear + options rehydrate | **COMPLETE** (100%) |
| SA-UJ-051…056 | Bootstrap mutation APIs closed | Screens + live mutation/DB evidence | **COMPLETE** (100%) |
| SA-UJ-057 | GET/PUT `.../bootstrap/online-store` + hub module closed | ST-07 + live entitled/not-entitled E2E | **COMPLETE** (100%) |

Runtime E2E closed 2026-08-13 against backend `0245053` / Angular `8587e04`. Evidence: [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/ONEVERZ_SELECTED_TENANT_FINAL_RUNTIME_E2E_CLOSURE_2026-08-13]]. ST-UX-001 = **PASS** (not counted).

| Canonical ID | Discovery ID | Journey Name |
|---|---|---|
| SA-UJ-048 | SA-ST-UJ-001 | Enter Selected-Tenant Context |
| SA-UJ-049 | SA-ST-UJ-002 | Switch Selected Tenant |
| SA-UJ-050 | SA-ST-UJ-003 | Exit Selected-Tenant Context |
| SA-UJ-051 | SA-ST-UJ-005 | Create Outlet for Selected Tenant |
| SA-UJ-052 | SA-ST-UJ-006 | Create Till for Selected Tenant Outlet |
| SA-UJ-053 | SA-ST-UJ-007 | Create Tenant Role |
| SA-UJ-054 | SA-ST-UJ-008 | Add Additional Tenant User |
| SA-UJ-055 | SA-ST-UJ-009 | Manually Onboard Initial Products |
| SA-UJ-056 | SA-ST-UJ-010 | Import Initial Products via CSV |
| SA-UJ-057 | SA-ST-UJ-011 | Configure Initial Online Store |

Global journey count: **173** (Super Admin = 57). ST-UX-001 is **not** counted as a journey.

---

## ST-UX-001 — Persistent Selected-Tenant Context Visibility

**Not an atomic journey.** Mandatory UX/security requirement applied to every Selected-Tenant screen.

| Attribute | Value |
|---|---|
| Requirement | Banner shows tenant name, code, status, plan summary; Exit Tenant Context action always available |
| Contract reference | [[Selected_Tenant_Mode_Contract#selected-tenant-context]] |
| Prototype | All `ST-*` screens and `ST-SHELL-*` variants |
| Implementation status | **PASS** (implemented in Angular production `a2330d4`; **not counted** as a journey) |

---

## SA-ST-UJ-001 — Enter Selected-Tenant Context

| Field | Value |
|---|---|
| **Parent Flow** | Selected-Tenant Mode Shell |
| **Purpose** | Begin assisted bootstrap session for one explicit tenant |
| **Actor** | Platform User |
| **Trigger** | Click **Configure Tenant** on Tenant Detail |
| **Preconditions** | Authenticated; `platform.tenants.view`; `platform.tenants.bootstrap.access`; tenant visible; not `CANCELLED` |
| **Main Flow** | 1. User on Tenant Detail → 2. Clicks Configure Tenant → 3. System sets selected tenant context → 4. Opens Setup Hub |
| **Alternative Flow** | Deep-link to hub URL with valid tenantId after auth |
| **Error Flow** | Missing permission → permission denied; cancelled tenant → blocked at detail |
| **Success Outcome** | Setup Hub loads with context banner and module cards |
| **Business Rules** | Does not change tenant lifecycle; does not impersonate TA |
| **Functional Rules** | Clear prior tenant cache; load tenant summary snapshot |
| **Mandatory/Conditional** | Required capability when bootstrap assistance is used |
| **Condition** | Platform role includes bootstrap access |
| **Permission** | `platform.tenants.view`, `platform.tenants.bootstrap.access` |
| **Feature Entitlement** | None for entry |
| **API Dependency** | `GET /api/v1/platform-admin/tenants/{tenantId}` |
| **DB Dependency** | `tenants`, `tenant_subscriptions`, footprint counts |
| **Audit Event** | Optional `platform.tenant_bootstrap.context_entered` (telemetry) |
| **Security** | Route tenantId validated server-side |
| **NFR** | Hub first paint < 2s on broadband |
| **Acceptance Criteria** | Context banner visible; hub modules reflect permissions/entitlements |
| **Related TA Journey** | None |
| **System Side Effects** | Client selected-tenant state set |
| **Dependencies** | Tenant exists |

---

## SA-ST-UJ-002 — Switch Selected Tenant

| Field | Value |
|---|---|
| **Parent Flow** | Selected-Tenant Mode Shell |
| **Purpose** | Move bootstrap session from one tenant to another |
| **Actor** | Platform User |
| **Trigger** | Tenant picker / navigate to another tenant detail → Configure Tenant |
| **Preconditions** | Already in or entering selected-tenant context; permission on target tenant |
| **Main Flow** | 1. User chooses Switch Tenant → 2. Picker lists authorized tenants → 3. User selects target → 4. System clears old cache → 5. Loads new hub |
| **Alternative Flow** | Exit to tenant list and enter another tenant via detail CTA |
| **Error Flow** | Unauthorized target tenant → blocked |
| **Success Outcome** | New tenant context active; no stale data from prior tenant |
| **Business Rules** | Only one selected tenant at a time |
| **Functional Rules** | Rebuild hub cards; refresh banner |
| **Mandatory/Conditional** | Optional convenience |
| **Permission** | Same as entry |
| **API Dependency** | Tenant list + tenant detail |
| **Audit Event** | Optional `platform.tenant_bootstrap.context_switched` |
| **Acceptance Criteria** | Prior tenant form cache not shown for new tenant |
| **Dependencies** | SA-ST-UJ-001 or equivalent entry |

---

## SA-ST-UJ-003 — Exit Selected-Tenant Context

| Field | Value |
|---|---|
| **Parent Flow** | Selected-Tenant Mode Shell |
| **Purpose** | Return to Platform Mode |
| **Actor** | Platform User |
| **Trigger** | Click **Exit Tenant Context** |
| **Preconditions** | In selected-tenant context |
| **Main Flow** | 1. User clicks Exit → 2. System clears tenant context/cache → 3. Navigates to Tenant Detail (default) or Tenant List |
| **Error Flow** | None |
| **Success Outcome** | Platform Mode restored; banner hidden |
| **Permission** | `platform.tenants.view` |
| **Audit Event** | Optional `platform.tenant_bootstrap.context_exited` |
| **Acceptance Criteria** | Tenant-scoped routes blocked until re-entry |
| **Dependencies** | None |

---

## SA-ST-UJ-005 — Create Outlet for Selected Tenant

| Field | Value |
|---|---|
| **Parent Flow** | Outlet / Collection Point Initial Setup |
| **Screen** | ST-02 |
| **Purpose** | Create first or additional bootstrap outlet |
| **Actor** | Platform User |
| **Trigger** | Setup Hub → Outlet Setup → Configure |
| **Preconditions** | Selected-tenant context; `platform.tenants.bootstrap.outlets.manage`; outlet entitlement; tenant not `SUSPENDED`/`CANCELLED` |
| **Main Flow** | 1. Open create outlet form → 2. Enter approved fields → 3. Save → 4. Outlet created |
| **Alternative Flow** | Cancel returns to hub |
| **Error Flow** | Duplicate code; validation; suspended tenant; not entitled |
| **Success Outcome** | Outlet record created for selected tenant |
| **Business Rules** | Bootstrap create only; no ongoing edit/delete in SA scope |
| **Functional Rules** | Unique `outlet_code` per tenant; timezone required; address required per outlet contract |
| **Mandatory/Conditional** | **CONDITIONAL** — POS tenants typically need ≥1 outlet before tills |
| **Condition** | Outlet entitlement; operational need |
| **Permission** | `platform.tenants.bootstrap.outlets.manage` |
| **Entitlement** | Outlet management module |
| **API Dependency** | `POST /api/v1/platform-admin/tenants/{tenantId}/bootstrap/outlets` |
| **DB Dependency** | `outlets`, `outlet_addresses`, optional `outlet_business_hours` |
| **Audit Event** | `platform.tenant_bootstrap.outlet_created` |
| **Related TA Journey** | TA Create Outlet (`04_Outlet_Management_Flow`) — ongoing ownership |
| **Dependencies** | Selected-tenant context |

**Approved bootstrap fields:** `outlet_name`, `outlet_code` (server-generated), `outlet_type`, `timezone`, address fields, optional phone/email, status default `ACTIVE`. **Collection point excluded** — deferred to Tenant Admin fulfilment config per [[Selected_Tenant_Collection_Point_Contract]]. Business hours deferred to Tenant Admin.

---

## SA-ST-UJ-006 — Create Till for Selected Tenant Outlet

| Field | Value |
|---|---|
| **Parent Flow** | Till Initial Setup |
| **Screen** | ST-03 |
| **Purpose** | Create bootstrap till for an outlet |
| **Actor** | Platform User |
| **Trigger** | Setup Hub → Till Setup → Configure |
| **Preconditions** | ≥1 active outlet; till entitlement; `platform.tenants.bootstrap.tills.manage` |
| **Main Flow** | 1. Select outlet → 2. Enter till name/code → 3. Save → 4. Till created pending device binding |
| **Error Flow** | No outlet; duplicate till code; suspended tenant |
| **Success Outcome** | Till ready for later TA device binding |
| **Mandatory/Conditional** | **CONDITIONAL** — POS operations |
| **Permission** | `platform.tenants.bootstrap.tills.manage` |
| **API Dependency** | `POST .../bootstrap/tills` |
| **DB Dependency** | `tills` |
| **Audit Event** | `platform.tenant_bootstrap.till_created` |
| **Related TA Journey** | `05_Till_Management_Flow`, `05A_Add_Till_And_Hardware_Setup_Flow` |
| **Dependencies** | **HARD:** active outlet |

**Excluded:** device assignment, hardware profiles (TA only).

---

## SA-ST-UJ-007 — Create Tenant Role

| Field | Value |
|---|---|
| **Parent Flow** | Tenant Role / Permission Initial Setup |
| **Screen** | ST-04 |
| **Purpose** | Create additional tenant role beyond bootstrap Tenant Admin role |
| **Actor** | Platform User |
| **Trigger** | Setup Hub → Roles & Permissions → Configure |
| **Preconditions** | Role entitlement; `platform.tenants.bootstrap.roles.manage` |
| **Main Flow** | 1. Enter role name/description → 2. Select permission groups filtered by entitlements → 3. Save |
| **Success Outcome** | Role available for user assignment |
| **Mandatory/Conditional** | **OPTIONAL** |
| **Permission** | `platform.tenants.bootstrap.roles.manage` |
| **API Dependency** | `POST .../bootstrap/roles` |
| **DB Dependency** | `tenant_roles`, role-permission mappings |
| **Audit Event** | `platform.tenant_bootstrap.role_created` |
| **Related TA Journey** | `06_Role_Permission_Management_Flow` |
| **Notes** | Bootstrap Tenant Admin role created at tenant finalize — not this journey |

---

## SA-ST-UJ-008 — Add Additional Tenant User

| Field | Value |
|---|---|
| **Parent Flow** | Additional Tenant User Initial Setup |
| **Screen** | ST-05 |
| **Purpose** | Add tenant user beyond first Tenant Admin from wizard |
| **Actor** | Platform User |
| **Trigger** | Setup Hub → Additional Users → Add User |
| **Preconditions** | User limit not exceeded; role exists; `platform.tenants.bootstrap.users.manage` |
| **Main Flow** | 1. Enter name/email/phone → 2. Assign role → 3. Assign outlet access if approved → 4. Save → 5. Invite queued per activation rules |
| **Success Outcome** | Additional tenant user created |
| **Mandatory/Conditional** | **OPTIONAL** |
| **Permission** | `platform.tenants.bootstrap.users.manage` |
| **API Dependency** | `POST .../bootstrap/users` |
| **DB Dependency** | `tenant_users`, `user_invites`, outlet access tables |
| **Audit Event** | `platform.tenant_bootstrap.user_created` |
| **Related TA Journey** | `07_User_Management_Add_New_User_Flow` |
| **Excluded** | First Tenant Admin from wizard |

---

## SA-ST-UJ-009 — Manually Onboard Initial Products

| Field | Value |
|---|---|
| **Parent Flow** | Product Initial Onboarding |
| **Screen** | ST-06A |
| **Purpose** | Seed initial catalog manually |
| **Actor** | Platform User |
| **Trigger** | Setup Hub → Product Onboarding → Add Products |
| **Preconditions** | Product entitlement; `platform.tenants.bootstrap.products.manage` |
| **Main Flow** | 1. Enter minimum product fields → 2. Optional opening stock per outlet → 3. Save |
| **Success Outcome** | Product(s) available for POS/inventory |
| **Mandatory/Conditional** | **CONDITIONAL** |
| **Permission** | `platform.tenants.bootstrap.products.manage` |
| **API Dependency** | `POST .../bootstrap/products` |
| **DB Dependency** | product core tables, optional stock |
| **Audit Event** | `platform.tenant_bootstrap.product_created` |
| **Related TA Journey** | `09_Product_Management_Flow` |
| **Excluded** | Full 7-step TA wizard parity |

---

## SA-ST-UJ-010 — Import Initial Products via CSV

| Field | Value |
|---|---|
| **Parent Flow** | Product Initial Onboarding |
| **Screen** | ST-06B |
| **Purpose** | Bulk seed catalog from CSV |
| **Actor** | Platform User |
| **Trigger** | Setup Hub → Import CSV |
| **Preconditions** | Product entitlement; `platform.tenants.bootstrap.products.import` |
| **Main Flow** | 1. Upload CSV → 2. Preview/validate → 3. Fix errors → 4. Confirm import → 5. Result summary |
| **Success Outcome** | Valid rows imported |
| **Mandatory/Conditional** | **CONDITIONAL** |
| **Permission** | `platform.tenants.bootstrap.products.import` |
| **API Dependency** | `POST .../bootstrap/products/import` + validation endpoint |
| **Audit Event** | `platform.tenant_bootstrap.products_imported` |
| **Related TA Journey** | TA import if exists |
| **Notes** | Preview/validation are steps within this journey, not separate journeys |

---

## SA-ST-UJ-011 — Configure Initial Online Store

| Field | Value |
|---|---|
| **Canonical ID** | SA-UJ-057 |
| **Parent Flow** | Product / Channel Initial Onboarding |
| **Screen** | ST-07 |
| **Purpose** | Set minimum Online Store readiness for an entitled tenant |
| **Actor** | Platform User |
| **Trigger** | Setup Hub → Online Store → Configure |
| **Preconditions** | Effective `online_store`; `platform.tenants.bootstrap.online_store.manage`; selected-tenant context |
| **Main Flow** | 1. Open ST-07 → 2. Set `storeStatus` (DRAFT/ACTIVE) → 3. Optionally set `taxDisplayMode` → 4. Save (PUT + Idempotency-Key) → 5. Return to hub CONFIGURED |
| **Alternative Flow** | Not entitled → NOT_ENTITLED; C&C notice when entitled but FMO missing (save still allowed) |
| **Error Flow** | 403 permission/entitlement; 409 suspended; 400 invalid status |
| **Success Outcome** | `online_store.defaults` persisted; hub Online Store → `CONFIGURED` when ACTIVE |
| **Mandatory/Conditional** | **CONDITIONAL** — entitlement `online_store` |
| **Permission** | `platform.tenants.bootstrap.online_store.manage` |
| **Feature Entitlement** | `online_store` |
| **API Dependency** | `GET/PUT .../bootstrap/online-store` |
| **DB Dependency** | `tenant_settings` key `online_store.defaults` |
| **Audit Event** | `platform.tenant_bootstrap.online_store_configured` |
| **Related TA Journey** | Tenant Admin storefront / Online Store settings |
| **Excluded** | Click & Collect FMO; branding/SEO; channel matrix; `is_collection_point` |
| **Implementation status** | **COMPLETE** (runtime E2E closed 2026-08-13; BE `0245053`; FE `8587e04`) |

Contract: [[Selected_Tenant_Online_Store_Bootstrap_Contract]]

---

## Parent flow model

| Parent Flow | Atomic journeys |
|---|---|
| Selected-Tenant Mode Shell | SA-ST-UJ-001, 002, 003 |
| Outlet / Collection Point Initial Setup | SA-ST-UJ-005 |
| Till Initial Setup | SA-ST-UJ-006 |
| Tenant Role / Permission Initial Setup | SA-ST-UJ-007 |
| Additional Tenant User Initial Setup | SA-ST-UJ-008 |
| Product Initial Onboarding | SA-ST-UJ-009, 010 |
| Product / Channel Initial Onboarding | SA-ST-UJ-011 |
