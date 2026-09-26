# 18. Export and Print Backend

*   **Export Implementation (Release 1 CSV):** The export system (CreateExportAsync) fully supports CSV export for all 12 mandatory Release 1 reports. It enforces IDOR, job ownership, and tenant/user entitlement boundaries. It includes a formula-injection safe CSV generator that produces canonical column schemas, preserves leading zeros without formulas, and prepends a mandatory metadata block (Report, Section, Period, Filters, Currency, Timezone, Snapshot, Generated, User ID). In-memory ConcurrentDictionary manages job lifetime transiently (15-min expiration limit).
*   **Unsupported Formats:** PDF and XLSX exports are explicitly rejected with deferred format exceptions.
*   **Print API:** Basic printing jobs are queued properly for the local print agent.
