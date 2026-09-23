# 25 Backend Gap Register

| Area | Requirement | Backend Evidence | Status | Gap | Recommended Next Backend Work |
|---|---|---|---|---|---|
| API | Endpoints for all reports | Found GetSales, GetStock, GetOutlets | PARTIAL | Missing dedicated endpoints for Returns and Till Closing | Implement dedicated endpoints for RPT-02, 03, 04, 05 |
| DB Tables | Separate sales and refund summaries | Seed data found, no physical summary tables | VERIFIED MISSING IMPLEMENTATION | Physical reporting tables missing | Create daily_sales_summaries |
| Security | Outlet/Till scope | TenantOnly policy verified | IMPLEMENTATION GAP | No outlet/till specific scope enforced in API | Add outlet-level RBAC |
| Export | CSV Export full dataset | /exports POST endpoint | PARTIAL | Snapshot metadata missing | Add Snapshot ID to export jobs |
