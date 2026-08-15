<!-- status: Active reconciled tracking; Brand NOT READY -->
<!-- last_updated: 2026-08-12 -->
# Brand / Collection CRUD Implementation Status

Collection status is unchanged and outside this reconciliation. Brand overall status: **NOT READY**. The historical claim that `20260728103522_AddBrandSortOrder` exists is false; no SortOrder migration is present.

| Requirement | Current Source | Target | Status | Priority | Backend/DB Needed | Flutter Needed | Tests Needed |
|---|---|---|---|---|---|---|---|
| Description-safe edit | Summary edit; response omits Description | full detail before edit/preserve | CURRENT DEFECT | P0 | response | selection/detail | regression |
| Name max | backend 200 / DB 150 | 150 | CURRENT DEFECT | P0 | validator | maxLength | 150/151 |
| Product→Brand | service check; no FK/index | tenant-composite FK/Restrict/index | CURRENT DEFECT | P0 | yes | no | PostgreSQL |
| Workspace | modal/overlay | continuous two regions | MISSING | P1 | no | yes | widget/responsive |
| SortOrder | Flutter concept only | end-to-end/default/check/order | MISSING | P1 | yes | align | all layers |
| ProductCount | absent/default fake zero | server-derived | MISSING | P1 | set projection | display | lifecycle/query |
| Selection/detail | absent | no-selection/row detail | MISSING | P1 | complete detail | yes | state/widget |
| Pagination | backend partial; Flutter 1/50 | totalPages, initial 10/UI | PARTIAL | P1 | response | yes | API/widget |
| Mutation refresh | wrong provider invalidated | authoritative refetch | DEFECT | P1 | no | yes | state |
| Logo permission | Update then View reload | internal safe reload | DEFECT | P1 | yes | error mapping | permission |
| Brand media policy | shared 5 MB/WebP | 2 MB JPEG/PNG | PARTIAL | P1 | boundary | local UX | security |
| Shell state | Settings active | Settings inactive | DEFECT | P1 | no | yes | shell |
| Partial image failure | non-atomic/generic result | explicit partial success | PARTIAL | P1 | response design | UX | reliability |
| Table | SortOrder/default alignment | exact centered seven | DEFECT | P2 | no | yes | widget |
| Search | immediate calls | debounce/reset/stale guard | PARTIAL | P2 | no | yes | state |
| Accessibility | incomplete | canonical a11y rules | PARTIAL | P2 | no | yes | a11y |
| Documentation | stale claims | reconciled | UPDATED | P2 | no | no | consistency |
| Observability/rate limit | not verified | verified policy/logging | NOT VERIFIED | P2 | yes | error UX | NFR |

Do not mark Brand complete until source, migration, real PostgreSQL and automated tests verify the target.
