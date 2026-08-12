<!-- title: Selected Tenant Online Store Bootstrap Contract -->
<!-- status: LOCKED / APPROVED -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->
<!-- approved: 2026-08-12 product-owner explicit approval -->
<!-- supersedes: GAP 5 OUT OF SCOPE in Selected_Tenant_Mode_Contract -->

# Selected Tenant Online Store Bootstrap Contract

## Authority

**LOCKED / APPROVED** — product-owner explicit approval 2026-08-12.

This contract **SUPERSEDES** the historical Phase 1 decision that Selected-Tenant Online Store / e-commerce bootstrap is OUT OF SCOPE (GAP 5 in [[Selected_Tenant_Mode_Contract]]). Historical GAP 5 text is retained with a SUPERSEDED annotation for traceability.

Canonical journey: **SA-ST-UJ-011** → **SA-UJ-057** Configure Initial Online Store.  
Global register: Super Admin **57** / Grand Total **173**.

At documentation-lock (pre-backend evidence): SA-UJ-057 = **NOT_STARTED**. Parent flips to PARTIAL after backend closure.

## Recommendation summary

| Question | Decision |
|---|---|
| In Selected-Tenant scope? | **YES — as optional bootstrap** |
| Scope type | **IN_SCOPE_OPTIONAL_BOOTSTRAP_CAPABILITY** |
| Atomic journeys | **1** — Configure Initial Online Store |
| Click & Collect in SA bootstrap? | **NO** — remain Tenant Admin (collection contract unchanged) |
| Canonical count | Super Admin **57** / Grand Total **173** |

## Why optional (not required for all tenants)

- Not every tenant plan includes `online_store`.
- POS-only tenants must complete Selected-Tenant bootstrap without an Online Store card action.
- Assisted onboarding for entitled tenants benefits from setting initial store readiness before Tenant Admin handoff.
- Full storefront operations (branding, merchandising, SEO, order ops, ongoing C&C) remain Tenant Admin ownership.

## Actor model (unchanged)

| Mode | Actor | Purpose |
|---|---|---|
| Selected-Tenant | Platform User | **Initial assisted** Online Store readiness only |
| Tenant Admin | Tenant Admin | Ongoing Online Store / C&C / channel / order management |

Platform identity is preserved. No Tenant Admin impersonation.

---

## Atomic journey

| Field | Value |
|---|---|
| Discovery ID | **SA-ST-UJ-011** |
| Canonical ID | **SA-UJ-057** |
| Journey name | Configure Initial Online Store |
| Parent flow | Product / Channel Initial Onboarding (Selected-Tenant) |
| Actor | Platform User |
| Trigger | Setup Hub → Online Store → Configure |
| Goal | Set minimum Online Store readiness for an entitled tenant |
| Success outcome | Online Store bootstrap settings persisted; hub card → `CONFIGURED` |
| Atomicity | Single goal (store readiness). Click & Collect is a different goal with distinct dependencies → **not** merged, **not** added as SA journey |
| Overlap with TA | Related to TA storefront config / settings ownership — **different actor/surface** → **Duplicate? NO** |
| Mandatory/Conditional | **CONDITIONAL** — only when effective entitlement `online_store` |
| Implementation status (doc lock) | **NOT_STARTED** |

### Explicitly not SA journeys

| Candidate | Decision |
|---|---|
| Configure Initial Click & Collect | **Keep Tenant Admin** — separate goal; FMO + business hours dependencies |
| Product online channel matrix | Already deferred; product bootstrap is SA-UJ-055/056 only for SIMPLE sellable seed |

## Global count impact

| Metric | Prior canonical | Locked |
|---|---:|---:|
| Super Admin | 56 | **57** |
| Tenant Admin | 62 | 62 |
| Cashier POS | 36 | 36 |
| E-commerce Customer | 18 | 18 |
| **Grand Total** | **172** | **173** |

**SAFE TO UPDATE GLOBAL JOURNEY REGISTER = YES** (this lock).

---

## Field classification (bootstrap boundary)

Canonical source for store defaults: tenant setting key `online_store.defaults`  
Shape: `{ "storeStatus": "DRAFT", "taxDisplayMode": "MATCH_TENANT" }`.

### Approved `storeStatus` vocabulary (LOCKED)

| Value | Meaning |
|---|---|
| `DRAFT` | Initial / unset readiness — hub derives `NOT_STARTED` |
| `ACTIVE` | Approved non-DRAFT readiness — hub derives `CONFIGURED` |

| Candidate | Classification | Mapping / note |
|---|---|---|
| Store status (`storeStatus`) | **REQUIRED_FOR_BOOTSTRAP** | `tenant_settings` / `online_store.defaults.storeStatus` — initial `DRAFT`; approved non-DRAFT = `ACTIVE` |
| Tax display mode (`taxDisplayMode`) | **OPTIONAL_FOR_BOOTSTRAP** | Same setting JSON; default `MATCH_TENANT`; editable optional bootstrap field |
| Online Store entitled? | **DERIVED** | Effective feature entitlement `online_store` |
| Click & Collect enabled | **DEFER_TO_TENANT_ADMIN** | Entitlement `click_collect` + `fulfillment_method_outlets` |
| Eligible collection outlet(s) | **DEFER_TO_TENANT_ADMIN** | Per [[Selected_Tenant_Collection_Point_Contract]] |
| Default collection outlet | **DEFER_TO_TENANT_ADMIN** | |
| Business hours | **DEFER_TO_TENANT_ADMIN** | Required before TA enables pickup |
| Product-by-product online visibility | **DEFER_TO_TENANT_ADMIN** | Wizard Step 7 / `product_channel_visibility` |
| Branding / banners / SEO / theme | **DEFER_TO_TENANT_ADMIN** | |
| Merchandising / content / policies | **DEFER_TO_TENANT_ADMIN** | |
| Order operations | **DEFER_TO_TENANT_ADMIN** | |
| Store display name (custom) | **NOT_APPLICABLE** until a locked storefront display-name attribute is proven; do not invent | `sales_channels.custom_name` is channel naming, not approved ST bootstrap field |
| `is_collection_point` on outlets | **NOT_APPLICABLE** | Forbidden — relation model only |

## Collection Point / Click & Collect decision

| Question | Answer |
|---|---|
| Can Online Store bootstrap complete without collection point? | **YES** |
| Must SA configure FMO / pickup? | **NO** |
| Is delivery-only / catalog-online without pickup valid? | **YES** for store readiness bootstrap |
| Are business hours mandatory before enabling pickup? | **YES** (existing collection contract) — therefore pickup stays TA |
| Hub treatment of C&C | Informational dependency notice only; not a separate SA journey |

Do **not** introduce `is_collection_point` on outlets.

---

## Permission (LOCKED)

| Permission | Description | Journey | Route | API | Entitlement | Audit |
|---|---|---|---|---|---|---|
| `platform.tenants.bootstrap.online_store.manage` | Configure initial Online Store bootstrap settings for a selected tenant | SA-ST-UJ-011 | ST-07 | `GET/PUT .../bootstrap/online-store` | Effective `online_store` | `platform.tenant_bootstrap.online_store_configured` |

Also requires: `platform.tenants.view`, `platform.tenants.bootstrap.access` for hub entry.

Do **not** invent create/view/edit/delete variants.

## Entitlements

| Code | Role |
|---|---|
| `online_store` | Gates hub card configure + mutation |
| `click_collect` | **Not** required for Online Store bootstrap success; used only for informational C&C readiness copy |

### Hub card derivation (LOCKED)

| Condition | Status |
|---|---|
| Effective `online_store` = false | `NOT_ENTITLED` |
| Entitled + `storeStatus` = `DRAFT` (or unset defaults) | `NOT_STARTED` |
| Entitled + `storeStatus` = `ACTIVE` | `CONFIGURED` |
| Entitled but tenant suspended for mutations | Read-only hub; mutations blocked (existing ST suspended rules) |

No `IN_PROGRESS`. No parallel setup checklist table.  
`DECISION_REQUIRED` is **retired** for this card.

Companion: [[Selected_Tenant_Online_Store_Hub_Status_Derivation]]

---

## API contract (LOCKED)

Base: `/api/v1/platform-admin/tenants/{tenantId}/bootstrap`

### `GET /online-store`

| | |
|---|---|
| Journey | SA-ST-UJ-011 / SA-UJ-057 |
| Permission | `platform.tenants.bootstrap.online_store.manage` |
| Entitlement | `online_store` (else 403 not_entitled) |
| Response 200 | `{ "entitled": true, "storeStatus": "DRAFT"|"ACTIVE", "taxDisplayMode": "MATCH_TENANT", "clickCollectEntitled": bool, "clickCollectConfigured": bool, "dependencyNotice": string? }` |
| Errors | 403 permission/entitlement; 404 tenant; suspended → read allowed per Mode Contract |

### `PUT /online-store`

| | |
|---|---|
| Journey | SA-ST-UJ-011 / SA-UJ-057 |
| Permission | `platform.tenants.bootstrap.online_store.manage` |
| Entitlement | Effective `online_store` |
| Idempotency | `Idempotency-Key` required |
| Correlation | Reuse `X-Correlation-Id` / TraceIdentifier rules |
| Request | `{ "storeStatus": "DRAFT"|"ACTIVE", "taxDisplayMode": "MATCH_TENANT"? }` |
| Response 200 | Updated settings DTO |
| 400 | Validation |
| 403 | Permission / not entitled |
| 404 | Tenant |
| 409 | Suspended tenant; idempotency conflict |
| Audit | `platform.tenant_bootstrap.online_store_configured` with platform actor + entityType OnlineStoreSettings |
| Transaction | Single settings upsert |

No Tenant Admin controller calls from Platform Admin.

## DB / entity mapping

| UI field | Domain | Table.Column | Nullable | Default | Existing? | Migration? |
|---|---|---|---|---|---|---|
| Store status | `online_store.defaults.storeStatus` | `tenant_settings.setting_value` (JSON) | No in JSON | `DRAFT` | **Existing** | **NO** (update value only) |
| Tax display mode | `online_store.defaults.taxDisplayMode` | same | No in JSON | `MATCH_TENANT` | **Existing** | **NO** |
| Entitled | feature entitlement | `tenant_feature_entitlements` (effective) | — | — | Existing | NO |

Do **not** create `platform_online_store_bootstrap` or setup status tables.

**Migration required?** **NO** for the minimum approved field set (existing setting key).

## Backend reuse matrix

| Capability | Classification |
|---|---|
| `online_store.defaults` setting domain | **REUSE_AS_IS** |
| Settings HTTP for Platform bootstrap | **NEW_PLATFORM_USE_CASE_USING_SHARED_DOMAIN** |
| Hub evaluator Online Store card | **NEW_PLATFORM_USE_CASE_USING_SHARED_DOMAIN** |
| Outlet C&C / FMO | **NOT_REQUIRED** for this journey (TA) |
| Storefront fulfillment read APIs | **NOT_REQUIRED** for Setup Hub |
| Product channel visibility | **NOT_REQUIRED** for this journey |
| Feature codes `online_store` / `click_collect` | **REUSE_AS_IS** |

## Security / NFR

Reuse Selected-Tenant Mode security:

- Platform JWT; actor = `platform_user_id`
- Route `tenantId` validated; no cross-tenant settings writes
- Permission + entitlement fail-closed
- Structured audit + correlation
- Idempotency on PUT
- Suspended tenant: mutations blocked
- ST-UX-001 banner on all ST-07 screens
- No Online Store item in primary Platform sidebar

## QA coverage

| ID | Scenario | Expected |
|---|---|---|
| ST-OS-001 | Entitled + DRAFT → configure ACTIVE | Save succeeds; hub CONFIGURED |
| ST-OS-002 | Not entitled | NOT_ENTITLED; configure blocked |
| ST-OS-003 | Missing permission | 403 |
| ST-OS-004 | Suspended tenant mutation | 409 |
| ST-OS-005 | Idempotent PUT replay | Same result; no duplicate audit noise |
| ST-OS-006 | Cross-tenant route tamper | 403/404; no write |
| ST-OS-007 | C&C not configured | Online Store still configurable; notice shown |
| ST-OS-008 | Refresh / deep-link | Context + settings rehydrate |
| ST-OS-009 | Switch / Exit | No stale settings |
| ST-OS-010 | Validation invalid status | 400 |

See [[../../10_TESTING_QA/Selected_Tenant_Online_Store_QA_Contract]] and [[../../10_TESTING_QA/Selected_Tenant_Mode_Test_Contract]].

## Prototype

| Screen | File |
|---|---|
| Hub (updated card) | `prototypes/selected-tenant/setup-hub.html` |
| Online Store bootstrap | `prototypes/selected-tenant/online-store.html` (ST-07) |

Status: **APPROVED**.

## Supersession traceability

| Historical claim | Action |
|---|---|
| GAP 5 OUT OF SCOPE | **SUPERSEDED** — annotated in Mode Contract; this contract is authority |
| Hub `DECISION_REQUIRED` / card hidden | **SUPERSEDED** — NOT_ENTITLED / NOT_STARTED / CONFIGURED |
| Planning / contradiction audits saying ST e-commerce excluded | **SUPERSEDED** annotations with link here |

See [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/ONEVERZ_SELECTED_TENANT_ONLINE_STORE_SCOPE_REOPEN_2026-08-12]].
