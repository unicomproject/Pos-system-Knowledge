<!-- title: Flow 4 Retail Business-Code Migration Disposition 2026-08-05 -->
<!-- status: Approved and Implemented -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-05 -->

# Flow 4 Retail business-code migration disposition - 2026-08-05

## Decision identity

| Item | Value |
|---|---|
| Conflict | F4-CONFLICT-007 |
| Gap | F4-GAP-006 |
| Requirements | F4-REQ-059, F4-REQ-069 |
| Original migration | `20260804190000_BackfillDevelopmentRetailBusinessCode` |
| Selected disposition | **E + C: retain with production-safe guards and add a forward corrective migration** |
| Approval | Approved and implemented in backend commit `877703f` |

## Original purpose and risk

Flow 4 finalization resolves an active `BusinessType` by its platform-global `business_code`. The historical development Retail seed entered the chain with code `RETAIL`, but `20260707185919_UpdateTenantAuthAndFoundationEntities` replaced the former key column with required `business_code` defaulting to an empty string. The original 20260804190000 repair restored the development row so create-options and finalization could resolve it.

The original repair was not production-safe: it selected a development UUID, did not preflight semantic `RETAIL` ownership, and its `Down` cleared `RETAIL` without provenance. A production row reusing that UUID could be changed, a second owner could cause a deployment-time unique violation, and rollback could erase a later legitimate value.

## Business-code semantics established

- `BusinessType` owns `business_code`; tenants reference the catalogue through `tenant_profiles.business_type_id`.
- The catalogue is platform-global, not tenant-scoped.
- `business_code` is `varchar(80)`, required, and protected by unique index `ix_business_types_business_code`.
- Flow 4 selects an existing active business type by code. Tenant creation does not generate or mutate catalogue codes.
- The entity exposes code only during `BusinessType.Create`; no runtime edit operation was found.
- `RETAIL` is the canonical value of the historical development seed, but no canonical document reserves it for every production Retail record. Production rows therefore cannot be inferred from name alone.
- The only approved repair target is a blank active row carrying the exact seed provenance: normalized name `Retail` and description `Development retail tenant seed business type.`

## Deployment-history assessment

The unsafe migration was committed and pushed at `ba1348b` only on `feat/flow4-create-tenant-runtime`. It is not contained in `origin/main`. Repository CI triggers on main/develop pushes and pull requests and performs restore/build/test only; it does not deploy or apply migrations. Existing release evidence records application only to an isolated local Flow 4 PostgreSQL database.

There is no repository or environment evidence that the migration reached shared development, staging, or production. There is also no authoritative evidence that excludes a manual application. Under the mandatory unknown-deployment rule, a database may already have the original ID in `__EFMigrationsHistory`; the solution therefore preserves that ID and adds a later corrective migration.

## Selected disposition

Disposition **E + C** is approved:

1. Keep migration ID `20260804190000_BackfillDevelopmentRetailBusinessCode` for history compatibility.
2. Replace its unsafe UUID SQL with a guarded, natural-provenance repair for databases that have not recorded it.
3. Add `20260805120000_ApplyProductionSafeRetailBusinessCodeRepair`, which replays the same guarded operation for databases that may already have recorded the original migration.
4. Make both `Down` methods intentionally non-destructive.

The guarded operation:

- selects only blank-code, active rows with the exact development seed name and description;
- never selects or mutates by development UUID;
- changes no nonblank code;
- returns without mutation when the seed is absent or already correct;
- raises before update if multiple eligible candidates exist;
- performs a case-insensitive `RETAIL` ownership precheck and raises `23505` before update on collision;
- updates exactly one eligible row and its `updated_at`; and
- is deterministic and idempotent.

## Options rejected

| Option | Reason rejected |
|---|---|
| A - keep as-is | UUID targeting, collision handling and destructive rollback violate F4-REQ-069. |
| B/D - replace or remove only | External manual application cannot be disproved; replacement alone would not repair a database that recorded the original ID. |
| C alone | A later correction cannot protect a not-yet-upgraded database from the unsafe original migration executing first. |
| D - development startup seed only | It would not account for the already-recorded migration case and would leave clean-chain Flow 4 catalogue resolution environment-dependent. |
| F alone | No production schema change is involved; the required split is history behavior, addressed more directly by E + C. |
| Broad production Retail inference | Name-only matching is not authoritative and could normalize legitimate production catalogue data. |

## Rollback policy

This is a forward data repair with intentionally non-destructive rollback. Once an eligible row has a valid `RETAIL` code, migration rollback removes only the EF history entries and does not clear or rewrite business data. Reapply is an idempotent no-op for that row. This policy protects later legitimate reliance on the code and is preferable to unverifiable reversal.

## Test strategy and result

PostgreSQL 17.10 tests cover clean full-chain apply, one eligible legacy seed, already-correct data, a different valid code, an existing `RETAIL` owner, absent seed/development UUID, multiple candidates, idempotent repair, rollback/reapply, and an original migration ID pre-recorded in `__EFMigrationsHistory`. The clean-chain test also resolves `RETAIL` through the current Flow 4 repository lookup. All 9 focused cases and all 1,470 backend tests pass; EF reports no pending model changes.

## Release impact and follow-up

F4-CONFLICT-007 and F4-GAP-006 are closed. F4-REQ-059 and F4-REQ-069 are `IMPLEMENTED_VERIFIED`. This migration P0 no longer blocks Chunk 2, but overall Flow 4 production remains NO-GO because the unrelated token/fixture, 20/20 browser, private-proof and live ACS P0 gates remain open.

Any environment known to have run backend commit `ba1348b` before `877703f` should still record that fact in its deployment log and apply the current forward chain. No automatic reversal of an already-valid `RETAIL` value is authorized.

## Related

- [[../15_IMPLEMENTATION_TRACKING/FLOW_4_RETAIL_BUSINESS_CODE_MIGRATION_RESOLUTION_EVIDENCE_2026-08-05]]
- [[../15_IMPLEMENTATION_TRACKING/FLOW_4_REQUIREMENT_TRACEABILITY_MATRIX_2026-08-05]]
- [[../15_IMPLEMENTATION_TRACKING/FLOW_4_DOCUMENT_CONFLICT_AND_GAP_REGISTER_2026-08-05]]
- [[../06_DATABASE_KNOWLEDGE/Migration_Rules]]
- [[FLOW_4_CREATE_TENANT_WIZARD_DECISION_REGISTER]]
