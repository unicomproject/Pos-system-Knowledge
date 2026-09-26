# 25. Final Backend Gap Register

## P0 (Security & Data Integrity)
| Gap ID | RPT/REP | Requirement | Current Behaviour | Evidence | Required Work |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GAP-01 | RPT-All | AC-13 (Outlet Isolation) | Cashiers can see all outlets if roles empty. | `GetAccessibleOutletIdsAsync` | Enforce explicit outlet/till scope. |
| GAP-02 | RPT-All | AC-12 (Export) | COMPLETED — CSV Export fully implemented for all 12 mandatory Release 1 reports. Enforces IDOR, job ownership, entitlement boundaries, canonical schemas, and formula injection protection. | `CreateExportAsync` | N/A |

## P1 (Required Release Behaviour Missing)
| Gap ID | RPT/REP | Requirement | Current Behaviour | Evidence | Required Work |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GAP-04 | RPT-05 | AC-15 (Return Period) | Returns filtered by Original Sale Date instead of Return Date. | Return queries | Update filtering column for returns. |
| GAP-05 | RPT-08 | AC-08 (Stock Movement) | Opening/Closing period bounds are not calculated. | StockMovement queries | Implement period bounded calculations. |

## P2 (Performance & Completeness)
| Gap ID | RPT/REP | Requirement | Current Behaviour | Evidence | Required Work |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GAP-06 | RPT-06 | Pagination | Pagination parameters entirely ignored. | RPT-06 API | Implement Skip/Take in repository. |
| GAP-07 | RPT-01 | AC-10 (Timezone) | Mixed timezone handling (UTC vs Local) across Sales/Payments. | Date predicates | Unify boundary extraction. |

## P3-A Security Update

### Outlet/Till security
* tenant isolation implemented
* outlet scope implemented
* till scope implemented
* selected Till isolation verified
* no-access scopes fail closed
* Till outside authorized Outlet rejected
* null-Till order hidden from SELECTED_TILLS
* inactive TenantUser fails closed

### Reporting query isolation
Verified for:
* Sales
* Payments
* Product Sales
* Filter Options
* Till/Session path
* Sales Transaction Detail IDOR
* Cross-Tenant isolation

### Entitlement / Permission
Record:
Sales permission × entitlement matrix — PASS
Stock permission × entitlement matrix — PASS
Export authorization permission × entitlement matrix — PASS
Dashboard entitlement — PASS
Filter Options entitlement — PASS

### Test evidence
ReportingSecurityTests:
20 Passed / 0 Failed

ReportingEntitlementSecurityTests:
15 Passed / 0 Failed

### PostgreSQL
POSTGRESQL RELATIONAL SECURITY VERIFICATION — PENDING P3-H




