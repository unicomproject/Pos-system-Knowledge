# 14. RBAC, Permissions, and Entitlements

*   **Feature Entitlements:** `ReportFeaturePolicy.cs` contains dead code. Feature flags (e.g., `ReportExport`) are not enforced at the controller level.
*   **Role Enforcement:** Basic `TenantOnly` policies exist.
*   **Outlet Scope Leak:** `GetAccessibleOutletIdsAsync` defaults to returning all outlets if the `TenantUser` lacks explicit `OutletUserRoles`. This is a P0 security gap.
