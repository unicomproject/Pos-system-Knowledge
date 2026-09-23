# 25. Final Backend Gap Register

## P0 (Security & Data Integrity)
| Gap ID | RPT/REP | Requirement | Current Behaviour | Evidence | Required Work |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GAP-01 | RPT-All | AC-13 (Outlet Isolation) | Cashiers can see all outlets if roles empty. | `GetAccessibleOutletIdsAsync` | Enforce explicit outlet/till scope. |
| GAP-02 | RPT-All | AC-12 (Export) | Export API is a dummy stub. No CSV generated. | `CreateExportAsync` | Implement actual CSV generation & storage. |

## P1 (Required Release Behaviour Missing)
| Gap ID | RPT/REP | Requirement | Current Behaviour | Evidence | Required Work |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GAP-03 | RPT-03 | AC-07 (Till Variance) | Variance calculated before close; ClosingTime wrong. | Till queries | Fix variance calculation timing. |
| GAP-04 | RPT-05 | AC-15 (Return Period) | Returns filtered by Original Sale Date instead of Return Date. | Return queries | Update filtering column for returns. |
| GAP-05 | RPT-08 | AC-08 (Stock Movement) | Opening/Closing period bounds are not calculated. | StockMovement queries | Implement period bounded calculations. |

## P2 (Performance & Completeness)
| Gap ID | RPT/REP | Requirement | Current Behaviour | Evidence | Required Work |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GAP-06 | RPT-06 | Pagination | Pagination parameters entirely ignored. | RPT-06 API | Implement Skip/Take in repository. |
| GAP-07 | RPT-01 | AC-10 (Timezone) | Mixed timezone handling (UTC vs Local) across Sales/Payments. | Date predicates | Unify boundary extraction. |
