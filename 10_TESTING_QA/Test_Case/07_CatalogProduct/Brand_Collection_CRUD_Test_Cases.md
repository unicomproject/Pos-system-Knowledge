<!-- status: Active canonical test contract -->
<!-- last_updated: 2026-08-12 -->
# Brand and Collection CRUD Test Contract

Collection tests retain their existing scope. No future Brand test below is marked passed until executed against reconciled source.

## Existing Brand coverage

| Area | Status |
|---|---|
| Mapper fields; code derivation helper | EXISTING/PARTIAL |
| Backend create permission and normalization | EXISTING |
| Controller tenant context/401/409/policy | EXISTING/PARTIAL |
| Repository tenant/deleted filtering | EXISTING/PARTIAL |
| Media projection/replacement/signature mismatch | EXISTING/PARTIAL |
| Selection, detail-safe edit, pagination, responsive, accessibility | MISSING |

## Flutter tests — TO IMPLEMENT

- no auto-selection and no initial detail request; exact no-selection wording
- row selection/transfer, regional loading/error and full detail before edit
- Description and SortOrder preservation
- Add in right region; Create Cancel to no selection; Edit Cancel restores persisted detail
- selected delete to no selection; orange confirmation and duplicate-submit guard
- exact seven columns, SortOrder absent, centered headers/cells, proportional table usage
- real ProductCount, search debounce/clear/page reset/stale protection, pagination/final-page correction
- JPEG/PNG 2 MB image UX and partial-success message; permission UX
- continuous workspace, shell active states, seven-viewport responsive matrix
- semantics, labels/tooltips, keyboard/focus, text scaling and ~44×44 targets

## Backend tests — TO IMPLEMENT

- Name lengths 150 accepted/151 rejected; trim behavior
- Description 255 accepted/256 rejected and detail/update preservation
- SortOrder default/nonnegative/rejection/order
- ProductCount same tenant; include DRAFT/ACTIVE/INACTIVE; exclude ARCHIVED; no N+1
- list paging metadata including totalPages, search and bounds
- CRUD tenant isolation, soft delete, duplicate code and unresolved deleted-code policy once decided
- Brand JPEG/PNG 2 MB policy, MIME/extension/signature/ownership/cleanup
- logo Update-only/no-View mutation response succeeds without weakening public detail GET
- partial storage/save failures, duplicate submissions and concurrency decision

## PostgreSQL/integration tests — TO IMPLEMENT

- SortOrder default/check and target index/query plan
- Product BrandId nullable; valid same-tenant accepted
- missing Brand and cross-tenant Brand rejected
- physical Brand delete with linked Product is RESTRICT
- migration preflight detects orphan/cross-tenant rows and fails safely
- constraints/indexes/snapshot and real PostgreSQL migration verification

Status vocabulary: EXISTING, PARTIAL, MISSING, TO IMPLEMENT, VERIFIED PASS.
