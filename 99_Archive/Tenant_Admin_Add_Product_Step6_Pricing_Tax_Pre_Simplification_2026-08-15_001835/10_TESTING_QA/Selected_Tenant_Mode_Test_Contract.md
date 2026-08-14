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
9. TA-only actions excluded — **PASS**
10. E-commerce excluded — **PASS**
11. Conditional setup clear — **PASS**
12. Activation separate from ops setup — **PASS**
13. First TA not duplicated — **PASS**
14. Error states covered in shell-states.html — **PASS**
15. Consistent with Super Admin design system — **PASS**
