# 13. Filter, Search, Sort & Loading Gaps

*   **Paging/Performance Gap:** In multiple reports, specifically RPT-06 (Product Sales), pagination parameters (Skip/Take) are entirely ignored at the repository level. This will cause severe performance degradation for large tenants.
*   **Search Gap:** Search parameters are sometimes ignored or not mapped to the correct underlying columns (e.g., searching by barcode vs SKU).
