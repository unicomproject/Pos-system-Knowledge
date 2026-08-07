<!-- title: Scope Change Log -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# Scope Change Log

## 2026-08-06 — Park / Recall gap closure implementation

- Implemented Done closes success modal only; cart clears after `201` before
  success dialog; no second API on Done; double-tap create guarded.
- Home `/pos/parked-sales` is real `PosParkedSalesScreen` (same provider);
  recall navigates to New Sale.
- DB idempotency: `idempotency_key` + `request_fingerprint` on
  `pos_order_holds`; partial unique `(tenant_id, idempotency_key)`; same
  fingerprint replay; different fingerprint conflict; PG concurrency tests.
- Reference `PS-{UTC_YEAR}-{5 digit}` preserved; Flutter display-only.
- Park does not reserve/deduct stock; soft validate on park; recall returns
  StockWarnings; checkout remains hard stock authority.
- Partially paid cannot park:
  `pos_holds.sale_partially_paid_cannot_be_parked` via optional `SourceSaleId`.
- Expiry: server UTC+24h; `ExpireDueHolds` persists `EXPIRED`; list/count/recall/
  cancel invoke it.
- Recall leaves SalesOrder `DRAFT` intentionally.
- Audit table `pos_order_hold_events` (`PARK_CREATED`, `PARK_IDEMPOTENT_REPLAY`,
  `PARK_RECALLED`, `PARK_CANCELLED`, `PARK_EXPIRED`).
- Permissions: canonical `sales.park.create|view|recall`; cancel uses create;
  Flutter home uses canonical; legacy `pos.sale.park*` demoted.
- Home count aligned with active hold predicate; cancel reason mandatory at
  service.
- Migration `20260806190000_AddPosHoldIdempotencyAndEvents`; controller
  `PosHoldsController`.
- Automated evidence recorded: Flutter park suites + screen/router tests passed;
  Backend Unit PosHold 19; API PosHold 9; Integration PosHold Postgres
  concurrency 4 passed.
- Authenticated full cashier runtime E2E still pending. Status remains
  Runtime Verification Pending / Testing — not Fully Completed.

Decision: [[ADR/ADR_008_Park_Recall_Sale_Authority_And_Expiry]].

## 2026-08-06 — Park / Recall product-contract clarifications

- Approved mutually exclusive **Park Sale** / **Recall Sale** visibility from valid
  cart lines (customer-only or discount-only counts as empty).
- Approved no silent overwrite of a non-empty cart by Recall.
- Approved Parked Sales product-name summary: first two names + `+N more`.
- Approved mandatory **Cancel Reason** as the product target (later the same day,
  gap closure enforced reason at service — see gap closure entry above).
- Approved Parked Sales list scope: current tenant + current till + holding cashier
  + `HELD` + non-expired; till comes from trusted device/open session.
- Documentation-only product-contract clarification at time of writing. Superseded
  for implementation status by the 2026-08-06 gap closure entry above.

Decision: [[ADR/ADR_008_Park_Recall_Sale_Authority_And_Expiry]].

## 2026-08-06 — Park Sale canonical POS channel seed remediation

- Confirmed the Park 500 was caused by missing canonical global POS sales-channel reference data and a platform-channel check constraint that did not permit `POS`.
- Added a deterministic, conflict-guarded, idempotent migration seed for the canonical POS channel; historical seed migration SQL remains unchanged.
- Added safe HTTP 503 `pos_holds.system_pos_channel_unavailable` handling with structured operator context.
- Local Development now has exactly one canonical platform POS row and one tenant link. Authenticated `PS-2026-00001` create/list and no-payment/no-stock side effects are verified.
- Full backend automation passes 1,694/1,694. Runtime same-idempotency-key replay capture and Recall/Cancel Chunk 4 remain pending.

## 2026-08-06 — Park / Recall backend Chunk 1 alignment

- Implemented backend `PS-{YYYY}-{NNNNN}` references using tenant/year
  transaction advisory locking plus the existing unique index.
- Implemented server-clock 24-hour expiry; request `ExpiresAt` remains compatible
  but is ignored and excluded from the idempotency hash.
- Verified canonical definitions/catalogue seed and Development Cashier grants.
- No migration was required; Local Development schema/history were read-only
  verified. Automated backend suites passed; authenticated create runtime is
  pending because an approved normal Cashier credential was unavailable.
- Flutter implementation was not started.

## 2026-08-06 — Park / Recall Sale contract alignment

- Approved backend `pos_order_holds` and `/api/v1/pos/holds` as authority.
- Approved a required reason, backend-generated reference, 24-hour default
  expiry, backend-user/till visibility, transactional recall revalidation, and
  idempotent park creation as the implementation target.
- **Historical snapshot at that time (now superseded by gap closure):** backend
  then accepted optional reason/client expiry, generated `HOLD-######`, scoped
  lists to holding user; Flutter was still local secure-storage only.
- Documentation phase only at that time.

Decision: [[ADR/ADR_008_Park_Recall_Sale_Authority_And_Expiry]].

## [2026-08-02] POS Payment Method Screen

- Final release methods are Cash, Card, QR Pay and Split Payment only.
- Pay Later is excluded.
- The reusable equal-card layout supports counts 1 through 5; the active four
  method screen is 2 x 2.
- Existing Cash checkout, receipt, printer and drawer flows are preserved.
- Card, QR Pay and Split Payment remain unavailable and cannot fall back to Cash.
- No backend, database or migration change was made.

## [2026-08-01] Cashier Product Variant Selection Popup Production Scope Locked

- **Change**: Include the Release 1 Cashier New Sale production popup with dynamic variant resolution, quantity, optional product-line note and manually configured Frequently Bought Together.
- **Image decision**: The popup displays one resolved image only; no thumbnails/gallery/carousel. Shared product-media multi-image capability remains unchanged.
- **Recommendation decision**: Frequently Bought Together is manually configured and distinct from Frequently Sold. AI/ML recommendations are excluded.
- **Status**: Documentation Ready. Database migration, backend, Flutter, automated tests and production validation remain pending/partial according to code evidence.
- **Authority**: [[../04_MODULE_KNOWLEDGE/21_POS_Operations/07_Product_Variant_Selection_Popup_Feature]].

## [2026-07-31] Product Discovery Segments Added
- **Change**: Define Cashier New Sale product discovery segments: Popular, Frequently Sold, and Offers.
- **Reason**: Enable cashiers to quickly find products that are manually curated as popular, dynamically calculated as top-selling, or currently eligible for discounts/special pricing.
- **Impact**:
  - Backend extended to support the planned `segment` parameter on `GET /api/v1/pos/products`.
  - Frontend extended to toggle between segments (preserving cart and session states) and display offer badges/strike-through pricing on tiles.
  - Curation of Popular products managed under the reserved `POS_POPULAR` collection in Tenant Admin.
  - Code implementation status set to `Not Started` / `Not Run`.
