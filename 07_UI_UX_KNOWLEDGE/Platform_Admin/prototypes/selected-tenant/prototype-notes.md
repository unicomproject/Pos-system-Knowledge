# Selected-Tenant Prototype Annotations

**Date:** 2026-08-12  
**Pack path:** `07_UI_UX_KNOWLEDGE/Platform_Admin/prototypes/selected-tenant/`

## Screen annotations

### ST-01 Setup Hub

| Attribute | Value |
|---|---|
| Journey | SA-ST-UJ-001 |
| Entry | Tenant Detail → Configure Tenant |
| Permissions | `platform.tenants.bootstrap.access`, `platform.tenants.view` |
| Primary action | Module Configure CTAs |
| Secondary | Exit Tenant Context, Switch Tenant |
| Success | Hub renders module states |
| Navigation | Child bootstrap screens |
| Backend | `GET /bootstrap/summary` |
| Audit | Optional context enter telemetry |

### ST-02 Create Outlet

| Attribute | Value |
|---|---|
| Journey | SA-ST-UJ-005 |
| Permission | `platform.tenants.bootstrap.outlets.manage` |
| Entitlement | Outlet module |
| Primary | Save Outlet |
| Validation | Required fields per UI/DB mapping |
| Errors | duplicate code, suspended, not entitled |
| Backend | `POST /bootstrap/outlets` |
| Audit | `platform.tenant_bootstrap.outlet_created` |

### ST-03 Create Till

| Journey | SA-ST-UJ-006 |
| Dependency | Active outlet HARD |
| Excluded | Device assignment |

### ST-04 Create Role

| Journey | SA-ST-UJ-007 |
| Note | Bootstrap TA role excluded |

### ST-05 Add User

| Journey | SA-ST-UJ-008 |
| Note | Additional users only |

### ST-06A Manual Product

| Journey | SA-ST-UJ-009 |

### ST-06B CSV Import

| Journey | SA-ST-UJ-010 |
| Note | Upload/preview/result are steps within one journey |

### ST-07 Configure Initial Online Store — APPROVED

| Attribute | Value |
|---|---|
| Discovery journey | SA-ST-UJ-011 |
| Canonical | SA-UJ-057 |
| Scope type | IN_SCOPE_OPTIONAL_BOOTSTRAP_CAPABILITY |
| Permission | `platform.tenants.bootstrap.online_store.manage` |
| Entitlement | Effective `online_store` |
| Fields | `storeStatus` required (`DRAFT`\|`ACTIVE`); `taxDisplayMode` optional (`MATCH_TENANT`) |
| Deferred | Branding, SEO, C&C/FMO, channel matrix, hours, orders |
| Backend | `GET/PUT .../bootstrap/online-store` (`Idempotency-Key` on PUT) |
| Audit | `platform.tenant_bootstrap.online_store_configured` |
| Hub card | NOT_STARTED / CONFIGURED / NOT_ENTITLED (`DECISION_REQUIRED` retired) |
| Count impact | +1 → SA **57** / Total **173** (locked) |
| Doc-lock status | SA-UJ-057 = **NOT_STARTED** until backend evidence |

### ST-SHELL variants

| ID | Purpose |
|---|---|
| ST-SHELL-01 | Entered context (ST-UX-001) |
| ST-SHELL-02 | Switch tenant SA-ST-UJ-002 |
| ST-SHELL-03 | Exit confirm SA-ST-UJ-003 |
| ST-SHELL-04 | Suspended tenant |
| ST-SHELL-05 | Feature not entitled |
| ST-SHELL-06 | Permission denied |

## Responsive review

All main screens include viewport toolbar presets: 1440, 1280, 1024, 768 (ST-01). Hub grid collapses to 1 column below 900px.

## Independent verification (2026-08-12)

See [[../../../10_TESTING_QA/Selected_Tenant_Mode_Test_Contract]] prototype checklist — **15/15 PASS**.
