# 02 API Endpoint Register

| RPT | REP | Method | Route | Controller | Action | Request | Response | Service | Permission | Entitlement | Scope | Tests | Status | Gap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| RPT-01 | REP-00 | GET | /api/v1/tenant-admin/reports/dashboard | TenantAdminReportsController | GetDashboard | ReportQueryRequest | ReportResponse | TenantAdminReportsService | TenantOnly | REQUIRED — NOT IMPLEMENTED | Tenant | NOT IMPLEMENTED | PARTIAL | Missing Outlet/Till isolation tests |
| RPT-01 | REP-01A | GET | /api/v1/tenant-admin/reports/sales | TenantAdminReportsController | GetSales | ReportQueryRequest | ReportResponse | TenantAdminReportsService | TenantOnly | REQUIRED — NOT IMPLEMENTED | Tenant | NOT IMPLEMENTED | PARTIAL | Missing dedicated RPT-01 specific API |
| RPT-07 | REP-07A | GET | /api/v1/tenant-admin/reports/stock | TenantAdminReportsController | GetStock | ReportQueryRequest | ReportResponse | TenantAdminReportsService | TenantOnly | REQUIRED — NOT IMPLEMENTED | Tenant | NOT IMPLEMENTED | PARTIAL | Missing dedicated RPT-07 specific API |
| RPT-02 | REP-02A | GET | /api/v1/tenant-admin/reports/sales (aggregated) | TenantAdminReportsController | GetSales | ReportQueryRequest | ReportResponse | TenantAdminReportsService | TenantOnly | REQUIRED — NOT IMPLEMENTED | Tenant | NOT IMPLEMENTED | IMPLEMENTATION GAP | No dedicated Payments API |
