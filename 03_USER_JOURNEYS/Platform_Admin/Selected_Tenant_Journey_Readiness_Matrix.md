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

| ID | Type | Lock-ready |
|---|---|---|
| ST-UX-001 Context indicator | UX/security | **YES** |

## Implementation status (production code)

Updated 2026-08-12 after Selected-Tenant **backend** Phase 3.6 closure (full suite green). Locked docs unchanged.

| Canonical ID | Backend | Angular UI | Status note |
|---|---|---|---|
| SA-UJ-048 | PASS (`GET /bootstrap/summary`) | Pending | **PARTIAL** — hub API ready; shell UX not started |
| SA-UJ-049 | N/A (client) | Pending | **NOT_STARTED** — frontend-dependent |
| SA-UJ-050 | N/A (client) | Pending | **NOT_STARTED** — frontend-dependent |
| SA-UJ-051 | PASS | Pending | **PARTIAL** — backend closed |
| SA-UJ-052 | PASS | Pending | **PARTIAL** — backend closed |
| SA-UJ-053 | PASS | Pending | **PARTIAL** — backend closed |
| SA-UJ-054 | PASS | Pending | **PARTIAL** — backend closed |
| SA-UJ-055 | PASS | Pending | **PARTIAL** — backend closed |
| SA-UJ-056 | PASS | Pending | **PARTIAL** — backend closed |
| SA-UJ-057 | PASS (`GET/PUT .../bootstrap/online-store` + hub) | Pending | **PARTIAL** — backend closed; Angular pending |

Route family: `/api/v1/platform-admin/tenants/{tenantId}/bootstrap/*`.  
**No journey is globally COMPLETE** until Selected-Tenant Angular ships.  
SA-UJ-057 is **PARTIAL** after Online Store bootstrap backend closure; remains non-COMPLETE until Selected-Tenant Angular ships.
