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

## Signoff Notes
- The `Needs Attention` status requested in UI is a derived operational state, not a persisted DB state. Logic needs product definition.
- `Manager` assignment is currently missing from Domain and DB, documented as a pending product decision/future scope.
- Aggregation endpoints (Summary Cards, Outlet Overview, Top Performing Outlet) are currently missing from the Backend and need to be implemented for the UI to be fully functional without mock data.
