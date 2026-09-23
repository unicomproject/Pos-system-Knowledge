# 12. Date, Time, and Currency Mapping

*   **Timezone Inconsistency:** Payments rely on `DateTime.UtcNow` for boundaries, while Sales use tenant-configured timezones inconsistently. This breaks midnight boundary accuracy (AC-10).
*   **Currency:** Standardized correctly across the system using appropriate scaling for fiat.
