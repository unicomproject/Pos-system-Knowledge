# 20. Performance, Index, and Query Audit

*   **Paging Issues:** Pagination is ignored in complex reporting queries (like Product Sales), leading to full dataset loading into memory.
*   **Indexes:** Unique indexes like `TenantId` + `IdempotencyKey` are correctly implemented and performant.
*   **Query Translation:** Many EF queries in Reporting execute client-side evaluation due to complex grouping, further impacting performance.
