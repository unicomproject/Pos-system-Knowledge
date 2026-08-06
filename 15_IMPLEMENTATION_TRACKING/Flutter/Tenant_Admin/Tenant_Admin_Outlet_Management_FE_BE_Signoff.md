# Tenant Admin Outlet Management FE-BE Signoff

| Capability | UI | Flutter | API | Domain | DB | Permissions | Tests | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Outlet list | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Pending | Implemented |
| Search | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Pending | Implemented |
| Type filter | ✅ | Pending | Pending | ✅ | ✅ | ✅ | Pending | Needs API Support |
| Status filter | ✅ | Pending | Pending | ✅ | ✅ | ✅ | Pending | Needs API Support |
| Pagination | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Pending | Implemented |
| Sorting | ✅ | Pending | Pending | ✅ | ✅ | ✅ | Pending | Needs API Support |
| Summary cards | ✅ | ✅ (Model) | ❌ | N/A | N/A | ✅ | N/A | **API Gap** |
| Outlet details | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Pending | Implemented |
| Create | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Pending | Implemented |
| Edit | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Pending | Implemented |
| Delete/deactivate | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Pending | Implemented |
| Manager display | ✅ | ❌ | ❌ | ❌ | ❌ | N/A | N/A | **Domain Gap (Future Scope)** |
| City display | ✅ | ✅ | ✅ | ✅ (Address) | ✅ | N/A | N/A | Implemented (Via Address) |
| Till count | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | N/A | Implemented |
| Outlet overview | ✅ | ✅ (UI) | ❌ | N/A | N/A | ✅ | N/A | **API Gap** |
| Top performing outlet | ✅ | ✅ (UI) | ❌ | N/A | N/A | ✅ (Report) | N/A | **API Gap** |
| Mobile responsive view | ✅ | ✅ | N/A | N/A | N/A | N/A | N/A | Implemented |

## Task 4A Backend Contract Completion (Implemented 2026-08-04)

- Tenant Admin paginated outlet list, server-side search, combined type/status/health filters, safe manager/image preview, till summary, and operational-health preview are implemented at `GET /api/v1/tenant-admin/outlets`.
- The lifecycle action is `PUT /api/v1/tenant-admin/outlets/{outletId}/status`; it supports `ACTIVE` and `INACTIVE`, is permission-enforced and audit-logged, and does not use delete for disable.
- Flutter integration remains a separate Task 4B. It must use this dedicated route and must not make overview calls for each list item.

## Signoff Notes
- The `Needs Attention` status requested in UI is a derived operational state, not a persisted DB state. Logic needs product definition.
- `Manager` assignment is currently missing from Domain and DB, documented as a pending product decision/future scope.
- Aggregation endpoints (Summary Cards, Outlet Overview, Top Performing Outlet) are currently missing from the Backend and need to be implemented for the UI to be fully functional without mock data.
