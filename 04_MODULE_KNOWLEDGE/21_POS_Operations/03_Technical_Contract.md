<!-- title: POS Operations Technical Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# POS Operations Technical Contract

## Purpose

Defines the implementation contract for `POS_Operations`. This contract is based on
new OneVerz POS MVP scope images and the uploaded Unified Commerce database design.

## API Contract

| Area | Contract |
|---|---|
| API groups | `/api/v1/pos/home`, `/api/v1/pos/holds`, `/api/v1/pos/receipts`, `/api/v1/pos/till-summary`, `/api/v1/pos/events` |
| Request format | Typed request DTOs; no raw map payloads in application layer |
| Response format | Typed response DTOs with safe fields only |
| Error format | Standard API error response |
| Tenant context | Resolved server-side for tenant-owned records |
| Auth | Staff/customer/platform auth boundary must match module surface |

## API Groups

| API Group | Purpose |
|---|---|
| `/api/v1/pos/home` | Module API group |
| `/api/v1/pos/holds` | Module API group |
| `/api/v1/pos/receipts` | Module API group |
| `/api/v1/pos/till-summary` | Module API group |
| `/api/v1/pos/events` | Module API group |

## Database Contract

| Table | Contract |
|---|---|
| `pos_order_holds` | Used by this module |
| `receipts` | Used by this module |
| `receipt_print_logs` | Used by this module |
| `receipt_templates` | Used by this module |
| `receipt_template_versions` | Used by this module |
| `receipt_template_assignments` | Used by this module |
| `till_session_summaries` | Used by this module |
| `till_session_payment_summaries` | Used by this module |
| `till_session_events` | Used by this module |
| `till_cash_movements` | Used by this module |

Entity mappings must preserve exact table names, column names, tenant foreign keys,
unique constraints, CHECK constraints, hash-only token rules, and append-only
history/ledger behavior where applicable.

## Frontend Contract

- Use feature-owned folders and typed services/providers.
- Widgets/components must not call HTTP APIs directly.
- Completed-sale and Receipt History flows map the backend receipt snapshot into
  a typed domain receipt before invoking printer orchestration.
- Durable print-operation state is persisted before the external print side
  effect. Local Agent transport must not fall back to direct TCP.
- `PosParkedSaleNotifier` persists `pos.parked_sales` in secure storage and does
  not call `PosHoldsController`.
- This is a current implementation gap. The approved target is typed Flutter Holds integration, stable create idempotency, backend PS reference, backend 24-hour expiry, and backend recall recalculation. See [[08_Park_Recall_Sale_Feature]].
- Cash Drawer/Cash In/Cash Drop routes and forms exist, but no backend
  cash-movement datasource is wired.
- Use DTOs in data layer, domain/view models in UI layer.
- Permission and entitlement checks are UX helpers only; backend remains final authority.
- Browser online store and Flutter business app must share backend rules but keep separate user/auth surfaces.

## Backend Contract

- Target product detail, Frequently Bought Together and cart-line contracts are defined in [[04_MODULE_KNOWLEDGE/21_POS_Operations/07_Product_Variant_Selection_Popup_Feature]]. They remain pending unless code evidence proves otherwise.

- Controllers stay thin.
- Application services own use cases.
- Domain entities/value objects hold stable business invariants.
- Repository interfaces stay in application layer; EF implementations stay in infrastructure layer.
- Audit/event rows are written for sensitive state changes.
- Idempotency keys are required for retryable commands that can create duplicates.
- `POST /api/v1/pos/receipts/{saleId}/print` records an authorized result using
  `printRequestId`, copy type/index, reason, operator and device context.
- Receipt detail/reprint reads `receipts.receipt_data_json`; no normalized
  tender/tax/copy receipt tables were introduced for this slice.

## Permission And Entitlement Contract

- Permission codes must be database-seeded and module-scoped.
- Do not create one giant global enum as the source of truth.
- Tenant feature entitlement must be checked before tenant staff permission where the feature is plan-controlled.
- Customer-facing actions use customer account/session rules, not tenant staff role permissions.

## Test Contract

Test coverage must include:

- Happy path for each primary API group.
- Missing authentication.
- Permission denied or customer access denied.
- Feature disabled / entitlement missing.
- Tenant isolation failure.
- Validation failure.
- Duplicate/conflict behavior.
- Safe error display.
- Audit/event/history creation where required.
- Original/reprint idempotency, duplicate audit, physical-success/audit-failure,
  and unknown-outcome recovery behavior.
- Offline/cache behavior where this module touches POS, checkout, order, inventory, payment, or sync.
- Add Flutter-to-backend Hold contract tests before describing Park/Recall as
  backend persisted.
- Add Cash In/Out controller, repository and integration tests before enabling a
  persisted-success state.

## Implementation Sequence

1. Confirm scope and table coverage from this module file.
2. Create DTOs, validators, and application service methods.
3. Create repository interface and EF repository/mapping if missing.
4. Add entitlement, permission, tenant, outlet, till, device, customer, or offline checks as relevant.
5. Build frontend route/screen/component/provider/service.
6. Add loading, empty, error, denied, feature-disabled, offline, and conflict states.
7. Add unit/integration/API/widget tests.
8. Review against new OneVerz POS MVP module boundaries.

## Out Of Scope

- Online storefront browsing
- Customer account password reset
- Subscription invoice payment links
- Warehouse stock transfer approval

## Hardware Chunk 2C receipt-history contract (2026-07-29)

- Receipt detail exposes the persisted historical snapshot for typed
  non-sale mapping; current product, tax, discount and payment configuration are
  never queried to rebuild a reprint.
- Reprint authorization stays as an immutable pending authorization audit.
  Each physical customer/merchant copy is a separate child print log linked by
  `reprint_operation_id`.
- `(tenant_id, receipt_id, print_request_id)` remains the physical/audit
  idempotency boundary. Reprint operation indexing is non-unique because one
  authorized operation may contain multiple independently audited copies.
- Reprint copy types distinguish duplicate customer and merchant output.

## Product Discovery Segment Contract (Planned)

- The POS product grid endpoint `GET /api/v1/pos/products` accepts an optional `segment` parameter (valid values: `all`, `popular`, `frequently-sold`, `offers`).
- The response returns a unified `PosProductSummaryResponseDto` structure.
- **Popular**: Filters products mapped to the tenant's `POS_POPULAR` collection, sorted by `sort_order`.
- **Frequently Sold**: Aggregates net quantities sold ($max(quantity - cancelled - returned, 0)$) dynamically on the backend for the outlet over a rolling 30-day lookback.
- **Offers**: Computes current promotional prices or labels from active discount policies and price lists. Returns the lowest effective unit price, setting conditional flags where applicable.

## Related Files

- [[04_MODULE_KNOWLEDGE/21_POS_Operations/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/21_POS_Operations/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/21_POS_Operations/04_Popular_Product_Discovery_Feature]]
- [[04_MODULE_KNOWLEDGE/21_POS_Operations/05_Frequently_Sold_Product_Discovery_Feature]]
- [[04_MODULE_KNOWLEDGE/21_POS_Operations/06_Offers_Product_Discovery_Feature]]
- [[04_MODULE_KNOWLEDGE/21_POS_Operations/07_Product_Variant_Selection_Popup_Feature]]

## Hardware Chunk 3 barcode contract (2026-07-29)

Exact lookup remains
`GET /api/v1/pos/products/by-barcode/{barcode}?deviceId={activatedDeviceId}`.
Barcode identity remains a string. Tenant uniqueness prevents random
selection; zero matches are not-found, multiple matches ambiguous, and
inactive product/variant or unavailable price is rejected. Only a successful
authoritative response reaches existing cart rules.

## Checkout persistence conflict classification (2026-08-03)

Checkout returns `pos_checkout.idempotency_conflict` only when PostgreSQL names
the tenant/payment idempotency unique constraint. After that race, rollback and
perform authoritative replay lookup: identical committed request returns its
existing result; different hash remains conflict. Other `DbUpdateException`
constraints return `pos_checkout.persistence_failed` (HTTP 500), not a false
409. Structured logs include only one-way correlation, database state and
constraint, never the raw key.
