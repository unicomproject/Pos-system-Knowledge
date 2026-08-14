<!-- title: Flow 4 Retail Business-Code Migration Resolution Evidence 2026-08-05 -->
<!-- status: Implemented and Verified -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-05 -->

# Flow 4 Retail business-code migration resolution evidence - 2026-08-05

## Executive result

F4-CONFLICT-007 / F4-GAP-006 are resolved for F4-REQ-059 and F4-REQ-069. Disposition **E + C** was implemented in backend commit `877703f`: the existing migration ID now uses provenance-based guarded SQL, and forward migration `20260805120000_ApplyProductionSafeRetailBusinessCodeRepair` covers databases that may already have recorded the original ID. The migration-specific Chunk 1 gate is **GO_TO_CHUNK_2**. Overall Flow 4 production remains NO-GO for unrelated P0 release gaps.

## Repository and deployment evidence

| Item | Evidence |
|---|---|
| Backend path | `C:\Users\User\Desktop\Nytroz__POS\Nytroz POS - Backend New\Unified-Commerce` |
| Branch | `feat/flow4-create-tenant-runtime` |
| Starting commit | `ba1348bf91ec558a66443a5393f73d36fae8ea35` |
| Implementation commit | `877703f` (`fix(flow4): make retail business-code migration production safe`) |
| Original commit containment | Feature branch and its remote only; absent from `origin/main` |
| CI behavior | Restore/build/test only; no migration application or deployment step |
| Recorded prior application | Isolated local Flow 4 PostgreSQL only |
| Shared/staging/production application | No evidence found; manual application cannot be excluded, so treated as potentially recorded |

The unrelated untracked backend email folder was preserved. Angular remained read-only and unchanged.

## Starting migration state

`20260804190000_BackfillDevelopmentRetailBusinessCode` was a data-changing migration against `business_types.business_code`. `Up` set `RETAIL` only for hard-coded UUID `44444444-0002-4000-8000-000000000001` when blank. `Down` cleared `RETAIL` for that UUID. It had no designer/snapshot delta because it changed data only.

The column is required `varchar(80)` with unique index `ix_business_types_business_code`. Flow 4 create-options projects active codes, and `GetActiveBusinessTypeIdByCodeAsync` resolves the selected code for tenant profile finalization. New tenant creation references an existing business type and does not create a catalogue row.

## Files changed

| File | Change |
|---|---|
| `20260804190000_BackfillDevelopmentRetailBusinessCode.cs` | Preserved migration ID; replaced UUID SQL with shared guarded repair; made `Down` non-destructive |
| `RetailBusinessCodeRepairSql.cs` | Added exact natural-provenance selection, ambiguity and case-insensitive collision prechecks, idempotent update |
| `20260805120000_ApplyProductionSafeRetailBusinessCodeRepair.cs` | Added migration-history-safe forward replay with non-destructive `Down` |
| `RetailBusinessCodeMigrationTests.cs` | Added nine PostgreSQL scenarios using per-test disposable databases |

No entity, configuration, model snapshot, API contract, payment state machine, Angular source, Blob, ACS, proof or Playwright fixture was changed.

## SQL and production data behavior

| Database state | Result |
|---|---|
| Development seed absent | No-op |
| Exactly one blank active row with exact development seed provenance | Set only that row to `RETAIL`; update timestamp |
| Exact row already `RETAIL` | No-op; timestamp unchanged |
| Exact row has another nonblank value | No-op; value/timestamp unchanged |
| Another row owns `RETAIL` in any case | Explicit `23505` before update; candidate remains blank |
| Multiple eligible candidates | Explicit `P0001` before update; no partial change |
| Guarded operation repeated | Deterministic no-op after first success |
| Original migration ID already recorded | EF skips the original and applies the forward corrective migration using identical guards |

The target conditions are normalized `business_name=Retail`, exact seed provenance description, active status and blank code. No development UUID participates in selection or mutation. Production rows are not inferred merely because their name is Retail.

## Rollback policy

Both affected migrations use intentionally empty `Down` methods. Downgrade removes their history entries but retains the valid data. Reapply is safe and idempotent. This is a documented forward-data-repair policy: provenance cannot prove that clearing `RETAIL` later would undo only this migration, so destructive symmetry is rejected.

## PostgreSQL evidence

| Item | Result |
|---|---|
| PostgreSQL | 17.10 (`postgres:17-alpine`) |
| Container | `oneverz-flow4-retail-migration-pg`, localhost `55434`, no host mount or named volume |
| Database isolation | Per-test `flow4_retail_migration_<random>` databases, dropped in `finally` |
| Focused scenarios | 9/9 pass, 0 failed, 1m41s final run |
| Clean full chain | Pass; Retail code valid and current repository resolves `RETAIL` |
| Legacy eligible row | Pass; exactly one intended row changed |
| Correct/different values | Pass; unchanged including timestamps |
| Collision | Pass; `23505`, no partial update |
| UUID/seed absent | Pass; safe no-op |
| Ambiguity | Pass; `P0001`, no partial update |
| Rollback/reapply | Pass; valid code retained and reapply succeeds |
| Existing migration history | Pass; forward corrective migration repairs the legacy state |
| Cleanup | Container removed; no volume existed; unrelated Docker resources untouched |

## Commands and regression evidence

| Command | Result | Count / warnings / failures | Duration |
|---|---|---|---|
| `dotnet restore E_POS.sln` | PASS after approved NuGet network access | 7 projects restored; 0 failures | 4.7s |
| `dotnet build E_POS.sln --no-restore` | PASS | 0 warnings, 0 errors | 1m31.21s authoritative full build; 2.76s final incremental build |
| Focused migration integration filter | PASS | 9/9, 0 failed/skipped | 1m41s final |
| Flow 4 wizard/lifecycle unit filter | PASS | 38/38, 0 failed/skipped | 131ms |
| Migration + tenant repository integration filter | PASS | 21/21, 0 failed/skipped | 1m19s |
| `dotnet test E_POS.sln --no-build --no-restore` | PASS outside sandbox for existing Windows Event Log dependency | Unit 743, API 341, Integration 386; total 1,470/1,470 | 2m00.8s |
| `dotnet ef migrations has-pending-model-changes ... --no-build` | PASS | No pending model changes | 6.1s |
| Scoped `dotnet format` and `git diff --check` | PASS | 4 changed backend files; no whitespace errors | 1m34.8s formatter |

The first sandboxed restore was blocked by NuGet socket permissions and was rerun successfully with approved network access. The first sandboxed all-solution test run produced 10 API failures solely because the existing Windows Event Log provider was access-denied; Unit 743/743 and Integration 386/386 passed in that run. The API project then passed 341/341 outside the sandbox, followed by the authoritative complete 1,470/1,470 pass outside the sandbox.

## Flow 4 regression assessment

The migration changes only development catalogue repair behavior. Existing focused and full tests confirm draft/resume, duplicate prevention, plan/entitlement assignment, paid finalization, subscription/invoice creation, tenant `PENDING_PAYMENT`, payment `AWAITING_PAYMENT`, separate activation and post-activation invitation remain unchanged. No API or Angular contract changed.

## Traceability closure

- F4-REQ-059: `IMPLEMENTED_VERIFIED`; clean/apply/rollback/reapply/history and pending-model gates pass.
- F4-REQ-069: `IMPLEMENTED_VERIFIED`; UUID dependency and destructive rollback removed, collision/ambiguity/existing-data safeguards proven.
- F4-CONFLICT-007: resolved by approved decision record.
- F4-GAP-006: closed.
- P0 verified count: 59/64; five unrelated P0 requirements remain non-verified.

## Remaining risks

### P0

No remaining migration-specific P0. Unrelated Flow 4 P0s remain: F4-REQ-060, F4-REQ-061, F4-REQ-063, F4-REQ-070 and F4-REQ-071.

### P1

Recipient accessibility/responsive acceptance and end-to-end fixture cleanup remain outside this chunk.

### Environment-only

Live ACS, real private-proof lifecycle and the token/state-dependent browser matrix remain blocked by their documented environments/fixture authority.

### Operational note

If an environment is later identified as having run `ba1348b`, record it and apply the forward migration. The repair never automatically clears an existing valid code.

## Final decision

**GO_TO_CHUNK_2 — Migration P0 safely resolved**

## Related

- [[../13_DECISIONS_AND_CHANGES/FLOW_4_RETAIL_BUSINESS_CODE_MIGRATION_DISPOSITION_2026-08-05]]
- [[FLOW_4_REQUIREMENT_TRACEABILITY_MATRIX_2026-08-05]]
- [[FLOW_4_DOCUMENT_CONFLICT_AND_GAP_REGISTER_2026-08-05]]
- [[FLOW_4_APPROVED_NEXT_IMPLEMENTATION_SCOPE_2026-08-05]]
