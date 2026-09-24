# 24. Final RPT Status and Readiness

| Report | Status | Evidence |
| :--- | :--- | :--- |
| **RPT-01 Daily Sales Summary** | **PARTIAL** | Query verified but timezone/midnight boundaries are incorrectly evaluated. |
| **RPT-02 Payments Summary** | **PARTIAL** | Query verified but lacks correct filtering for PENDING payments and refund event dates. |
| **RPT-03 Till / Shift Closing** | **PARTIAL** | Variance calculated early; ClosingTime defaults incorrectly. |
| **RPT-04 Online Orders / Collection** | **PARTIAL** | Inventory is not deducted upon collection. |
| **RPT-05 Returns / Refunds** | **PARTIAL** | Failed/Pending refund states not persisted by backend. Wrong period selection. |
| **RPT-06 Product Sales** | **PARTIAL** | Pagination ignored. Return filtering uses wrong date boundary. |
| **RPT-07 Stock on Hand / Movements** | **PARTIAL** | Current stock is correct. Movement period Opening/Closing logic missing. |

**Release 1 Backend State:** `PARTIAL / NOT READY`

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

