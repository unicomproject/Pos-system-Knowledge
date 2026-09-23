# 15. Tenant, Outlet, and Till Scope

*   **Tenant Scope:** Correctly isolated via `TenantId` globally.
*   **Outlet Scope:** Broken (CROSS-OUTLET AUTHORIZATION FAILURE). If no roles assigned, user sees all outlets.
*   **Till Scope:** Completely absent in reporting. Cashiers can view reports for other tills in their outlet.
