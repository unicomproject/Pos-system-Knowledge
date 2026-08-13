<!-- title: Selected Tenant Journey Readiness Matrix -->
<!-- status: Canonical / Locked -->
<!-- last_updated: 2026-08-12 -->

# Selected Tenant Journey Readiness Matrix

One row per accepted atomic journey. **Lock-ready** = documentation complete for implementation contract.

| Canonical ID | Discovery ID | Functional | Business | Permission | Entitlement | API Req/Res | DB Mapping | Validation | Concurrency | Idempotency | Audit | Security/NFR | UI/Route | Prototype | AC | QA | **Lock-ready** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SA-UJ-048 | SA-ST-UJ-001 Enter Context | Yes | Yes | Yes | Yes | Yes | Yes | Yes | N/A | N/A | Optional telemetry | Yes | Yes | ST-01 | Yes | ST-QA-001 | **YES** |
| SA-UJ-049 | SA-ST-UJ-002 Switch Tenant | Yes | Yes | Yes | Yes | Yes | Yes | Yes | N/A | N/A | Optional | Yes | Yes | ST-SHELL-02 | Yes | ST-QA-004 | **YES** |
| SA-UJ-050 | SA-ST-UJ-003 Exit Context | Yes | Yes | Yes | N/A | N/A | N/A | N/A | N/A | N/A | Optional | Yes | Yes | ST-SHELL-03 | Yes | ST-QA-003 | **YES** |
| SA-UJ-051 | SA-ST-UJ-005 Create Outlet | Yes | Yes | Yes | Yes | Yes | Yes | Yes | `row_version` on outlet | `Idempotency-Key` | Yes | Yes | ST-02 | Yes | Yes | ST-QA-011,012 | **YES** |
| SA-UJ-052 | SA-ST-UJ-006 Create Till | Yes | Yes | Yes | Yes | Yes | Yes | Yes | outlet FK | `Idempotency-Key` | Yes | Yes | ST-03 | Yes | Yes | ST-QA-009 | **YES** |
| SA-UJ-053 | SA-ST-UJ-007 Create Role | Yes | Yes | Yes | Yes | Yes | Yes | Yes | role graph | `Idempotency-Key` | Yes | Yes | ST-04 | Yes | Yes | ST-QA-006 | **YES** |
| SA-UJ-054 | SA-ST-UJ-008 Add User | Yes | Yes | Yes | Yes | Yes | Yes | Yes | email unique | `Idempotency-Key` | Yes | Yes | ST-05 | Yes | Yes | ST-QA-018 | **YES** |
| SA-UJ-055 | SA-ST-UJ-009 Manual Product | Yes | Yes | Yes | Yes | Yes | Yes | Yes | product graph | `Idempotency-Key` | Yes | Yes | ST-06A | Yes | Yes | ST-QA-011 | **YES** |
| SA-UJ-056 | SA-ST-UJ-010 CSV Import | Yes | Yes | Yes | Yes | Yes | Yes | Yes | batch lock | `Idempotency-Key` on commit | Yes | Yes | ST-06B | Yes | Yes | ST-QA-013 | **YES** |
| SA-UJ-057 | SA-ST-UJ-011 Online Store | Yes | Yes | Yes | Yes | Yes | Yes | Yes | settings upsert | `Idempotency-Key` on PUT | Yes | Yes | ST-07 | Yes | Yes | ST-OS-001…013 | **YES** |

## Cross-cutting requirement

| ID | Type | Lock-ready | Implementation |
|---|---|---|---|
| ST-UX-001 Context indicator | UX/security | **YES** | **PASS** (implemented; **not counted** as a journey) |

## Implementation status (production code)

Updated 2026-08-12 after Selected-Tenant **Angular production merge** (`a2330d4`) + backend closed (`5b7e5b0`). Locked product contracts unchanged. Runtime backend integration **ENVIRONMENT_BLOCKED** (localhost:5150 unavailable).

| Canonical ID | Backend | Angular UI | Runtime E2E | Status note |
|---|---|---|---|---|
| SA-UJ-048 | PASS (`GET /bootstrap/summary`) | **PASS** | **PASS** (live API+DB 2026-08-13) | **COMPLETE** — runtime E2E closed; BE `0245053`; FE `8587e04` |
| SA-UJ-049 | N/A (client) | **PASS** (switch shipped) | **PASS** (tenant B isolation + cross-tenant till reject) | **COMPLETE** — runtime E2E closed; BE `0245053`; FE `8587e04` |
| SA-UJ-050 | N/A (client) | **PASS** (exit shipped) | **PASS** (context clear + options rehydrate) | **COMPLETE** — runtime E2E closed; BE `0245053`; FE `8587e04` |
| SA-UJ-051 | PASS | **PASS** | **PASS** (POST outlets 201 + hub CONFIGURED) | **COMPLETE** — runtime E2E closed; BE `0245053`; FE `8587e04` |
| SA-UJ-052 | PASS | **PASS** | **PASS** (POST tills 201 + cross-tenant reject) | **COMPLETE** — runtime E2E closed; BE `0245053`; FE `8587e04` |
| SA-UJ-053 | PASS | **PASS** | **PASS** (POST roles 201 + options reload) | **COMPLETE** — runtime E2E closed; BE `0245053`; FE `8587e04` |
| SA-UJ-054 | PASS | **PASS** | **PASS** (POST users 201 + invite secret) | **COMPLETE** — runtime E2E closed; BE `0245053`; FE `8587e04` |
| SA-UJ-055 | PASS | **PASS** | **PASS** (product + opening stock DB) | **COMPLETE** — runtime E2E closed; BE `0245053`; FE `8587e04` |
| SA-UJ-056 | PASS | **PASS** | **PASS** (validate/commit/retry/errors.csv) | **COMPLETE** — runtime E2E closed; BE `0245053`; FE `8587e04` |
| SA-UJ-057 | PASS (`GET/PUT .../bootstrap/online-store` + hub) | **PASS** | **PASS** (entitled + NOT_ENTITLED) | **COMPLETE** — runtime E2E closed; BE `0245053`; FE `8587e04` |

Route family: `/api/v1/platform-admin/tenants/{tenantId}/bootstrap/*`.  
SA-UJ-048…057 are **COMPLETE** after final independent runtime E2E (2026-08-13). Outlet/role authoritative picker = **RESOLVED**. Evidence: [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/ONEVERZ_SELECTED_TENANT_FINAL_RUNTIME_E2E_CLOSURE_2026-08-13]].
