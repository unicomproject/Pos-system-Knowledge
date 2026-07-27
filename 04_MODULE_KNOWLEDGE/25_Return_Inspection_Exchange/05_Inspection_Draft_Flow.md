<!-- title: POS Return Inspection Draft Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-17 -->

# POS Return Inspection Draft Flow (Step 6)

## Purpose

Documents durable Step 6 inspection persistence, optimistic concurrency, media lifecycle, validation, and atomic consumption at `CompleteReturnAsync`.

## Migrations

- `20260716190000_AddReturnInspectionDraftsAndMediaFinalization` — initial drafts, staging, finalization
- `20260717150000_HardenReturnInspectionDraftMediaLifecycle` — draft `version`/`expires_at`, media soft-delete, tenant-safe FKs, CHECKs

## Endpoint-to-permission mapping

| Endpoint | Permissions |
| --- | --- |
| `GET .../inspection/conditions` | `returns.view` AND `returns.create` |
| `GET .../sales/{saleId}/inspection/draft` | `returns.view` AND `returns.create` |
| `PUT .../sales/{saleId}/inspection/draft` | `returns.view` AND `returns.create` |
| `POST .../sales/{saleId}/inspection/validate` | `returns.view` AND `returns.create` |
| `POST/DELETE/GET .../inspection/media...` | `returns.view` AND `returns.create` |
| Final complete return | Existing complete permissions AND validated draft |

No separate Step 6 Continue, finalize, or approval APIs. Continue to later steps is local navigation; `POST .../inspection/validate` marks the draft `VALIDATED` when all lines pass. Finalization happens atomically inside `CompleteReturnAsync`.

## Flow

1. Cashier selects conditions, notes, and photos on Step 6.
2. Flutter saves draft via `PUT .../inspection/draft?deviceId=` with optional `version` (status becomes `DRAFT`, `version` increments).
3. Photos upload to staging (`STAGED`, `expires_at` aligned with draft lifetime, default 24h) with magic-byte validation.
4. Flutter validates via `POST .../inspection/validate`, which evaluates the persisted draft (optional inline save first), merges Step 4+5+6 flags, and marks `VALIDATED` when `canContinue`.
5. Step 7 loads and persists authoritative REFUND/EXCHANGE resolution against the
   `VALIDATED` draft using `expectedVersion`.
6. `CompleteReturnAsync` (serializable transaction):
   - Requires draft `VALIDATED` for tenant/outlet/sale, not expired
   - Creates `sales_returns` / `sales_return_lines`
   - Creates `return_inspections` mapped to new return lines
   - Links staging files into `return_inspection_media` (same `storage_key`; file not duplicated)
   - Marks staging `CONSUMED` and draft `CONSUMED`

## Draft status values

`DRAFT` → `VALIDATED` → `CONSUMED` | `CANCELLED`

- Line/media mutation resets draft to `DRAFT` and bumps `version`
- Successful validate sets `VALIDATED` and bumps `version`
- Expired drafts are cancelled by cleanup hosted service
- `CONSUMED` drafts reject further mutation (409 `inspection_draft_consumed`)
- Resolution selection stores type, selected timestamp, and same-tenant tenant-user
  atomically; the three fields are all-null or all-populated.
- `requires_inspection` and `requires_manager_approval` are durable, OR-merged
  validation outputs and are never downgraded by later requests.
- Re-editing inspection clears resolution, refund-method draft, and exchange
  replacement lines in one transaction.

## Optimistic concurrency

- Draft responses include `version` and `expiresAt`
- `PUT .../draft` and validate inline-save accept optional `version`
- Resolution PUT requires `expectedVersion`; a successful branch change increments
  version while an identical selection at the latest version is idempotent.
- Mismatch → HTTP **409** `pos_returns.inspection_draft_conflict`
- Flutter must reload draft and retry after conflict

## Draft expiry

- `expires_at = created_at + 24h` (default); refreshed on each `MarkDraft` / `MarkValidated`
- Aligned with attached staging media `expires_at` (extended to draft expiry when linked)
- Expired draft → **409** `pos_returns.inspection_draft_expired`; restart inspection

## Staging media lifecycle

Statuses: `STAGED` → `CONSUMED` | `EXPIRED` | `DELETED`

- `DELETE .../inspection/media/{mediaId}` — row `DELETED` + physical file removed
- Cleanup hosted service (30 min): cancels expired drafts; marks orphan `STAGED` past `expires_at` as `EXPIRED` and deletes file
- Skips `STAGED` media still tied to a non-expired draft
- `CONSUMED` media is never deleted (final row references same `storage_key`)

## Outlet isolation

Resolved from trusted till session (`deviceId` → open session → `outletId`). Sale access requires matching **sale receipt outlet** (`SaleBelongsToOutletAsync`: `sales_orders` + `receipts.outlet_id`). Staging media queries filter `outlet_id`. Flutter must not supply outlet ID.

## Step 4 + 5 + 6 flag merge

Validate recomputes eligibility (Step 4), re-reads reason flags from DB (Step 5 `reasonRefs`), and evaluates condition catalog (Step 6). Merge is **OR**, never downgrade:

- `requiresInspection = step4 OR step5 OR step6`
- `requiresManagerApproval = step4 OR step5 OR step6`
- `requiresReview` mirrors `requiresManagerApproval` for existing Flutter clients

Client-supplied approval/inspection booleans are not trusted.

## Error status contract (Step 6)

| HTTP | Codes |
| --- | --- |
| 400 | `invalid_sale_id`, `invalid_device_id`, `invalid_lines`, `invalid_sale_line_id`, `inspection_media_required`, `inspection_conditions_unavailable`, … |
| 403 | `permission_denied`, `device_not_trusted` |
| 404 | `sale_not_found`, `media_not_found`, `inspection_draft_not_found`, till/device not-found codes |
| 409 | `inspection_draft_conflict`, `inspection_draft_expired`, `inspection_draft_consumed`, `inspection_draft_required`, `inspection_media_limit_reached`, `inspection_media_consumed` |
| 413 | `inspection_media_too_large` (max 5 MiB) |
| 415 | `inspection_media_invalid_type` (JPEG/PNG/WebP + magic bytes) |
| 500 | `inspection_operation_failed`, `inspection_media_failed`, `inspection_media_storage_failed` |

## Media security

- Tenant-scoped staging and final media rows
- Content-Type plus JPEG/PNG/WebP magic-byte checks
- Max 5 photos per line, notes max 200 chars
- Authenticated Flutter preview loads bytes via Dio (not bare `Image.network`)

## Local storage deployment

R1 registers `LocalReturnInspectionMediaStorage` (`ReturnInspectionMedia:StorageRoot`, default `App_Data/return-inspection-media`).

- **Single instance** or **shared volume across instances** — local disk acceptable (`LOCAL_SHARED_VOLUME_ACCEPTED`)
- **Multi-instance without shared volume** — object storage required (not registered in R1 DI; ops must not rely on per-node local paths)

## Inventory / restock impact

- Final inspection sets `restock_decision` / quantities from condition `is_resellable`
- Completion still uses reason `requires_inspection` for line disposition `QUARANTINE` vs `RESTOCKED`
- Conditions with `requires_approval` block completion (`approval_required`)

## Known limitations

- EF model snapshot is not regenerated for hand-written return/inspection migrations; `PendingModelChangesWarning` is ignored for this convention
- Quarantine → sellable stock relocation after inspection is not a separate post-completion inventory workflow yet
- No separate malware scanner beyond type/size/signature checks
- Only `LocalReturnInspectionMediaStorage` is wired in DI
