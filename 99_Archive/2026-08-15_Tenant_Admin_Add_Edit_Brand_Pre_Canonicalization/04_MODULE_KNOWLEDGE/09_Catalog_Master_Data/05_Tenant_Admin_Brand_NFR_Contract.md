<!-- status: Active canonical target; to be implemented/verified -->
# Tenant Admin Brand Management — NFR Contract

| ID | Category | Canonical requirement | Current status |
|---|---|---|---|
| NFR-01 | Performance | Server paging/search, 300–500ms debounce, set-based ProductCount/no N+1, no automatic detail call. | PARTIAL |
| NFR-02 | Scalability | Support 10/100/1,000/10,000 Brands without loading the catalog into Flutter. | TO VERIFY |
| NFR-03 | Security | Authentication, backend authorization, tenant-scoped queries, IDOR-safe 404, DB tenant integrity. | PARTIAL; Product FK unsafe |
| NFR-04 | File security | Brand-only JPEG/PNG, 2 MB, MIME/extension/signature validation, tenant ownership, replace/orphan cleanup. | PARTIAL; shared policy differs |
| NFR-05 | Data integrity | Preserve Description/SortOrder; max contracts; code uniqueness; tenant-safe Product FK. | FAIL/P0 |
| NFR-06 | Concurrency | CURRENT last-write-wins/no token. TARGET adopt platform-wide standard. | ARCHITECTURAL DECISION REQUIRED |
| NFR-07 | Reliability | Guard duplicate save/delete; explicit profile-saved/image-failed partial success; safe retries. | PARTIAL |
| NFR-08 | Errors | Deliberate UI/API mapping for 400,401,403,404,409,413,415,429,500,503. | PARTIAL |
| NFR-09 | Accessibility | Semantics, tooltips, focus/keyboard, text scale, status text, required indicators, ~44×44 targets. | TO IMPLEMENT |
| NFR-10 | Maintainability | UI/domain/data separation, one authoritative state path, shared constants without weakening Brand policy. | PARTIAL |
| NFR-11 | Observability | Structured create/update/delete/image events with tenant/user/Brand/trace and no sensitive payloads. | NOT VERIFIED |
| NFR-12 | Localization/timezone | Localizable strings and tenant-aware Updated On formatting. | PARTIAL |
| NFR-13 | Rate limiting | Verify inherited platform policy and document 429 handling. | NOT VERIFIED |
| NFR-14 | Responsiveness | Verify seven target viewports; simultaneous regions on usable desktop/laptop; approved tablet adaptation. | TO IMPLEMENT |
| NFR-15 | Testability | Injectable state/data dependencies and deterministic backend/PostgreSQL tests for all contracts. | PARTIAL |
