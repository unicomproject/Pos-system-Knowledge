# 15. Tenant, Outlet, and Till Scope

*   **Tenant Scope:** Correctly isolated via `TenantId` globally.
*   **Outlet Scope:** Broken (CROSS-OUTLET AUTHORIZATION FAILURE). If no roles assigned, user sees all outlets.
*   **Till Scope:** Completely absent in reporting. Cashiers can view reports for other tills in their outlet.

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

