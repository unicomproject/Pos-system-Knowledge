<!-- title: Cash Drawer Management Screen Second Brain Alignment 2026-08-14 -->
<!-- status: Historical evidence — superseded for Cash In/Drop ledger status and automatic Cash Sale drawer acceptance -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-18 -->

# Cash Drawer Management Screen Second Brain Alignment — 2026-08-14

> **Supersession (2026-08-16 hardware canonicalization):** Cash In and Cash Drop
> financial software acceptance are **COMPLETE** (see
> [[Cash_In_Chunk_3_Final_Production_Acceptance]] and
> [[POS_Cash_Drop_Chunk_2_Production_Acceptance_2026-08-16]]).
> Physical Open Drawer remains **PARTIAL** overall. Automatic Cash Sale physical
> acceptance passed on 2026-08-17 for POSPrinter POS80 / Cashbox #1 /
> `drawerPin2`; untested drawer scenarios remain pending. See
> [[Cash_Drawer_Runtime_Integration_Issue_Resolution_2026-08-17]].
> Overall POS hardware remains **BLOCKED**.
> Current hardware authority:
> [[POS_Hardware_Production_Readiness_Canonicalization_2026-08-16]],
> [[../../../12_INTEGRATIONS/POS_Hardware_Integration]],
> [[../../../12_INTEGRATIONS/Cash_Drawer_Integration]],
> [[../../../12_INTEGRATIONS/Local_Print_Agent]].
> Retain this file as dated alignment evidence only.

## Result

**DOCUMENTATION CANONICALIZATION COMPLETE (as of 2026-08-14).** This status applies to Second Brain
alignment only, not installed physical-drawer acceptance.

## Classification by layer (snapshot 2026-08-14 — do not use as current SoT)

| Layer | Classification (2026-08-14) |
|---|---|
| Existing screen, route, responsive sections | IMPLEMENTED |
| Flutter remote datasource/repository/provider | IMPLEMENTED |
| Financial summary/read/mutation APIs | IMPLEMENTED |
| Legacy Cash In/Out/Drop persistence | IMPLEMENTED (historical) |
| Canonical `cash_movements` persistence | PENDING then → **VERIFIED 2026-08-15** |
| Backend movement-type catalog API | PENDING then → **IN VERIFIED; OUT PENDING** |
| Till current/open/close reuse | IMPLEMENTED |
| Physical drawer software integration | IMPLEMENTED |
| Physical installed-device smoke | PHYSICAL ACCEPTANCE PENDING |
| New Cash Drawer table | NOT REQUIRED |

## Already implemented

- Five-card Till Summary, four drawer actions, recent movement presentation.
- `GET /api/v1/pos/cash-drawer/summary`.
- `GET /api/v1/pos/cash-drawer/movements` with pagination.
- `POST /api/v1/pos/cash-drawer/movements`.
- Backend-authoritative Expected Cash and CASH-only sale/refund projection.
- Tenant/device/Till/session validation and code-based permissions.
- Persistent tenant-scoped request-id idempotency and concurrency handling.
- Flutter refresh after accepted manual movement; no local fake success.
- Existing Close Till and physical drawer paths reused.

## Implemented but preserve/refactor carefully

- Keep `features/cash_drawer` and `features/till` ownership.
- Keep screen sections as the component boundary; split providers only for a
  real state-lifetime or testability need.
- Keep payment/refund records as their own source and project them into recent
  movements rather than duplicating them.

## Canonical persistence decision

`cash_movements` is the canonical manual cash ledger and
`cash_movement_types` is its classification/reason authority.
`till_cash_movements` is existing implementation drift. Dual-write is
forbidden; cut-over, durable idempotency, and catalog-backed reason mapping are
required before Cash In is canonically complete.

## Contradictions corrected

The 2026-08-13 planning documents said the financial API and Flutter data layer
were missing and Cash In/Drop were frontend-only. Source proves a legacy API
and writer exist, but does not prove canonical persistence. Current documents
therefore classify UI/legacy mutation as existing and canonical alignment as
pending.

## Remaining gaps

1. Installed physical cash-drawer pulse acceptance evidence is pending.
2. Full authenticated runtime coverage of all device/printer policies remains a
   release-environment acceptance responsibility.
3. `cash_movements` cut-over and movement-type API are required next work.

## Source changes

Flutter/backend/database production source changes in this task: **NONE**.

## Canonical specification

[[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_Drawer_Management_Screen_Implementation_Specification]]
