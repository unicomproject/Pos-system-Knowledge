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
