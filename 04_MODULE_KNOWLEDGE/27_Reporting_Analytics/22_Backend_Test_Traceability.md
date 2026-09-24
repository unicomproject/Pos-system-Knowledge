# 22. Backend Test Traceability

*   **Unit Tests:** Executed successfully. Total = 2155, Passed = 2155, Failed = 0.
*   **Integration Tests:** NOT EXECUTED SUCCESSFULLY â€” TEST ENVIRONMENT / DATABASE AUTHENTICATION FAILURE (`28P01: password authentication failed for user "postgres"`).
*   **Coverage Limitations:** While 2155 unit tests passed, they do not cover complex reporting scenarios like return period matching (AC-15), export completeness (AC-12), or variance timing locks (AC-07). 

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

