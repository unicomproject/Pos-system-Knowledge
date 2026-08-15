<!-- title: Selected Tenant Mode Test Contract -->
<!-- status: Canonical -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->

# Selected Tenant Mode Test Contract

## Scope

QA acceptance for Selected-Tenant Mode documentation, UI prototypes, and future implementation.

## Visual / interaction acceptance

| ID | Scenario | Expected |
|---|---|---|
| ST-QA-001 | Enter from Tenant Detail Configure CTA | Hub loads with context banner |
| ST-QA-002 | Context banner | Tenant name, code, status, plan visible on all ST screens |
| ST-QA-003 | Exit Tenant Context | Returns to Platform Mode; cache cleared |
| ST-QA-004 | Switch tenant | No stale data from prior tenant |
| ST-QA-005 | Direct URL unauthorized tenant | Permission denied or not found |
| ST-QA-006 | Permission denial | ST-SHELL-06; no login redirect |
| ST-QA-007 | Feature not entitled | NOT ENTITLED card + route block |
| ST-QA-008 | Suspended tenant | Mutations blocked; read-only hub |
| ST-QA-009 | Till without outlet | Dependency notice; create blocked |
| ST-QA-010 | Browser refresh on hub | Context rehydrated from route |
| ST-QA-011 | Form validation | Inline errors |
| ST-QA-012 | Duplicate outlet/till code | Conflict message |
| ST-QA-013 | CSV import errors | Error summary before confirm |
| ST-QA-014 | Success return to hub | Module state updates |
| ST-QA-015 | Responsive layout | 1440 / 1280 / 1024 / 768 viewports |
| ST-QA-016 | Keyboard focus | Exit and primary CTAs reachable |
| ST-QA-017 | Sidebar | No ST modules in platform sidebar |
| ST-QA-018 | First TA not duplicated | Add User screen copy clarifies additional users only |

## Online Store bootstrap (ST-07 / SA-UJ-057)

See [[Selected_Tenant_Online_Store_QA_Contract]] for full ST-OS-* matrix. Summary:

| ID | Scenario | Expected |
|---|---|---|
| ST-OS-001 | Entitled DRAFT → ACTIVE | Hub CONFIGURED |
| ST-OS-002 | Not entitled | NOT_ENTITLED; PUT 403 |
| ST-OS-003 | Missing permission | 403 |
| ST-OS-004 | Suspended mutation | 409 |
| ST-OS-006 | C&C/FMO missing | Save OK; notice |
| ST-OS-009 | Idempotent PUT | Same result |
| ST-OS-013 | No FMO post from SA | Rejected / out of journey |

## Security / backend acceptance

| ID | Scenario | Expected |
|---|---|---|
| ST-SEC-001 | Platform identity preserved | Audit shows platform_user_id |
| ST-SEC-002 | Cross-tenant API | Blocked |
| ST-SEC-003 | Suspended mutation | 409 |
| ST-SEC-004 | Missing entitlement | 403 fail closed |
| ST-SEC-005 | Audit on mutation | actor + tenant + entity |

## Prototype verification checklist (2026-08-12)

Independent review performed against static prototypes:

1. Every screen maps to approved journey — **PASS**
2. Every button maps to documented action — **PASS**
3. Every field maps to approved data — **PASS** (collection deferred per locked contract)
4. Permissions reflected — **PASS**
5. Entitlements reflected — **PASS**
6. Selected tenant always obvious — **PASS**
7. Platform identity preserved — **PASS**
8. Cross-tenant risks avoided in UX — **PASS**
9. TA-only actions excluded — **PASS** (C&C/FMO remain TA; OS readiness only)
10. Full e-commerce ops excluded from SA — **PASS** (optional OS bootstrap APPROVED; GAP 5 SUPERSEDED)
11. Conditional setup clear — **PASS**
12. Activation separate from ops setup — **PASS**
13. First TA not duplicated — **PASS**
14. Error states covered in shell-states.html — **PASS**
15. Consistent with Super Admin design system — **PASS**
16. Online Store ST-07 APPROVED — **PASS** (`DRAFT`/`ACTIVE`; hub NOT_ENTITLED/NOT_STARTED/CONFIGURED)

## Angular production evidence (2026-08-12)

Selected-Tenant Angular production merged to frontend `origin/main` (`a2330d4e5ccb5e3b6eb065068eaf4ee70730f327`); backend closed on `origin/main` (`5b7e5b0b3dc7d37db8785c29d6bf3b951dd2ce13`).

| Check | Result |
|---|---|
| Angular unit tests | **577 passed** |
| `ng build` | **succeeded** |
| Runtime backend integration / E2E | **ENVIRONMENT_BLOCKED** (localhost:5150 unavailable) |

Journey status implication: SA-UJ-048…057 = **COMPLETE** after final independent runtime E2E (2026-08-13). ST-UX-001 = **PASS** (implemented; not counted). Full evidence: [[../15_IMPLEMENTATION_TRACKING/99_AUDITS/ONEVERZ_SELECTED_TENANT_FINAL_RUNTIME_E2E_CLOSURE_2026-08-13]].
