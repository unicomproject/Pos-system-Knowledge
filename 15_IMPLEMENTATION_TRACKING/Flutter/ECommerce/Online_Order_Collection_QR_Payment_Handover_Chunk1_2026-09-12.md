<!-- status: Chunk 1 COMPLETE — Chunk 2 software implemented; live acceptance pending -->
<!-- last_updated: 2026-09-12 -->

# Online Order Collection — QR / Payment / Handover — Chunk 1

## Chunk 2 follow-up

Software implementation recorded in [[Online_Order_Collection_QR_Payment_Handover_Chunk2_2026-09-12]]. Live device acceptance remains open.

## 1. Scope

Documentation + source-of-truth canonicalization for cashier Click & Collect **customer collection**:

READY → Scan Customer Collection QR → Validate → Verify → Payment branch → Confirm Handover → Collected → Collection Complete → Print/Reprint Receipt.

**Out of scope for Chunk 1:** Flutter runtime, backend runtime, EF entities, migrations, seeds, permission catalog code, API implementation, tests, commit/push.

## 2. Read manifest

### Second Brain (required)

- `00_START_HERE/Current_Source_Of_Truth.md`
- `03_USER_JOURNEYS/Cashier/POS-UJ-036_Online_Order_Fulfilment_Collection.md`
- `04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/01_Module_Overview.md`
- `04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/02_Functional_Rules.md`
- `04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/03_Technical_Contract.md`
- `06_DATABASE_KNOWLEDGE/Tables/23_Fulfilment_And_Pickup_UPDATED.md`
- `08_FLUTTER_POS_KNOWLEDGE/Flutter_Order_ClickCollect_Fulfilment.md`
- `08_FLUTTER_POS_KNOWLEDGE/Frontend_Engineering_Canonical_Standard.md`
- `08_FLUTTER_POS_KNOWLEDGE/Flutter_POS_Payment_Method_Selection_Implementation_Specification.md`
- `08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_Payment_Screen_Implementation_Specification.md`
- `07_UI_UX_KNOWLEDGE/POS_Reusable_Component_Specifications.md`
- `07_UI_UX_KNOWLEDGE/Cashier/Online_Order_Component_Inventory.md`
- `02_ACCESS_CONTROL/Permission_Code_List.md`
- `12_INTEGRATIONS/POS_Hardware_Integration.md` (scanner/printer status via SoT)
- OO-01 → OO-06 trackers under `15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/`

### Source (inspect only)

- Flutter `lib/features/fulfilment_pickup/**`
- Flutter scanner: `PosBarcodeScannerListener`, `PosHidScannerInputService`, `PosCameraBarcodeScanner`
- Flutter sale payment/receipt under `lib/features/sale/**`, `lib/features/receipts/**`, `lib/features/hardware/receipt_printer/**`
- Backend `ClickCollectOrdersController`
- Domain `PickupOrder`, `FulfillmentOrder`, `SalesOrder`
- Catalog `OnlineOrderPermissions.cs`, `CheckoutPermissions` / cash accept
- EF tables: `pickup_orders`, `fulfillment_orders`, `sales_payments*`

## 3. Current architecture findings

| Area | Finding | Label |
|---|---|---|
| Preparation through Ready + Notify | Implemented (OO-01…OO-06 backend ready path; OO-06 Flutter notify/wait UI) | CONFIRMED EXISTING |
| Collection QR UI / route | Missing | GAP |
| QR validate API | Missing | GAP |
| Handover / mark collected API + domain `MarkCollected` | Missing | GAP |
| `pickup_orders.pickup_qr_*` + `collected_at` columns | Present; no issue/validate/consume writers in Application | CONFIRMED EXISTING schema / GAP behaviour |
| Dedicated `pickup_collection_tokens` table | Absent; DB knowledge rejects separate QR table | NOT REQUIRED |
| POS New Sale payment Method/Cash/Receipt | Present; cart/`Lines`-coupled | CONFIRMED EXISTING / GAP for ecommerce outstanding settle |
| OO-01 scan icon | Search input only; not collection validation | CONFIRMED EXISTING / MISMATCH vs target Collection QR entry |
| Enforced permission catalog | Through `collection.notify_customer` only | CONFIRMED EXISTING |
| Documented collection permissions in Permission_Code_List | scan/validate/lookup/verify/handover/collect codes listed | CONFIRMED EXISTING docs / GAP catalog enforcement |

## 4. Current journey (as implemented)

```text
OO-01 list/search (HID = search query)
→ OO-02 detail → OO-03 Start → OO-04/04B Pick → OO-05 Pack → Mark Ready
→ OO-06 Ready for Collection (notify optional; What's Next is copy only)
→ STOP (no QR validate, no balance payment, no handover, no collected mutation)
```

## 5. Canonical target journey (frozen)

```text
OO-01 Online Orders
→ Collection QR entry (permission-gated; distinct from search scan)
→ Scan Customer Collection QR (HID REUSE; manual fallback; camera only if reused existing camera scanner as optional fallback)
→ POST collection QR validate (backend authoritative; ZERO lifecycle/financial mutation)
→ Failure → QR Cannot Be Accepted (safe codes) → rescan
→ Success → Collection Verification (order/customer/pack/items/payment/version)
→ IF balanceDue == 0 / PAID → Confirm Handover
→ IF outstanding > 0 → Collection Payment Required
    → Shared Payment Method (REUSE sale payment method UI)
    → tender (Cash REUSE tender UI; Card REUSE placeholder/terminal flow; other enabled tender)
    → Payment Success ≠ Collected
    → Confirm Handover
→ POST collection/complete (revalidate + expectedVersion + mark collected)
→ Collection Complete
→ Print / Reprint Receipt (REUSE sale receipt/printer; MANUAL print policy)
```

### Lifecycle invariants (frozen)

| Invariant | Status |
|---|---|
| Picked ≠ Packed | CONFIRMED EXISTING |
| Packed ≠ Ready | CONFIRMED EXISTING |
| Ready ≠ Collected | CONFIRMED EXISTING |
| QR Issued ≠ Ready | PROPOSED FOR CHUNK 2 — issue QR material when entering READY (extend Mark Ready / Ready writer) |
| QR Scanned ≠ QR Valid | FROZEN |
| QR Validated ≠ Paid | FROZEN |
| QR Validated ≠ Collected | FROZEN (validate is side-effect free; no `VERIFIED`/`COLLECTED` write) |
| Payment Successful ≠ Collected | FROZEN |
| Notify Customer ≠ Collected | CONFIRMED EXISTING (OO-06) |
| Receipt Printed ≠ Collected | FROZEN |
| Only successful authoritative handover/complete = Collected | FROZEN |
| Frontend success is not lifecycle authority | FROZEN |

## 6. Functional requirements inventory

**Count: FR-001 → FR-048**

### A. Entry

| ID | Requirement |
|---|---|
| FR-001 | OO-01 exposes a Collection QR entry control distinct from order-search scan. |
| FR-002 | Collection QR entry is visible only with collection scan/validate permissions; absence removes the control and reflows. |
| FR-003 | Navigation uses POS shell routes under `/pos/online-orders/...` without a new feature root. |
| FR-004 | Open Till / active device outlet context is required for collection mutations; outlet id comes from device context. |

### B. Scanner

| ID | Requirement |
|---|---|
| FR-005 | REUSE `PosBarcodeScannerListener` + `PosHidScannerInputService` for keyboard-wedge capture. |
| FR-006 | Scanner focus/enabled only on resumed collection scan route when search/manual field is not stealing keys. |
| FR-007 | Captured value is treated as opaque collection credential, not OO-01 search. |
| FR-008 | Empty/incomplete frames are silent; no false hardware-health claim. |
| FR-009 | Duplicate in-flight scans are suppressed while VALIDATING. |
| FR-010 | Manual entry fallback uses the same validate use case. |
| FR-011 | Camera QR is OPTIONAL EXTEND of existing `PosCameraBarcodeScanner` only; not required for MVP if HID/manual suffice. |

### C. Validation

| ID | Requirement |
|---|---|
| FR-012 | Validate sends opaque token (+ outlet context) to staff Click & Collect API. |
| FR-013 | Server resolves tenant, outlet, SalesOrder, FulfillmentOrder, PickupOrder, lifecycle, payment, pack/items, concurrency version. |
| FR-014 | Success returns verification DTO for UI; no Collected/Paid mutation. |
| FR-015 | Failure returns safe non-disclosing outcomes (unknown/expired/revoked/wrong outlet/not ready/cancelled/collected/missing graph/invalid payment). |

### D. Error states

| ID | Requirement |
|---|---|
| FR-016 | Each failure maps to QR Cannot Be Accepted with actionable rescan; no cross-tenant leakage. |
| FR-017 | Backend unavailable / timeout shows retry without inventing success. |

### E. Payment branching

| ID | Requirement |
|---|---|
| FR-018 | Authoritative `paymentStatus` / `balanceDue` from validation/detail drives branch. |
| FR-019 | PAID / balanceDue=0 never offers tender. |
| FR-020 | Outstanding > 0 opens Collection Payment Required then shared Payment Method. |
| FR-021 | Enabled tenders come from existing POS payment method authorization. |
| FR-022 | Cash REUSE cash tender Amount Due / Received / Change Due rules. |
| FR-023 | Card REUSE existing card payment route/flow as authorized. |
| FR-024 | Payment failure/timeout blocks handover; recovery uses payment status reconciliation. |
| FR-025 | Payment success navigates to Handover Ready; does not mark Collected. |
| FR-026 | Do not create a New Sale cart for ecommerce collection settlement. |

### F. Handover

| ID | Requirement |
|---|---|
| FR-027 | Confirm Handover shows order/customer/pack/items/payment checklist from authoritative data. |
| FR-028 | Submit sends `expectedVersion` (FulfillmentOrder.row_version) once; UI locks duplicates. |
| FR-029 | Backend revalidates READY eligibility, payment settled, pack/items, outlet, concurrency. |
| FR-030 | Success marks pickup COLLECTED + fulfilment FULFILLED + sales completion projection atomically with events. |
| FR-031 | HTTP 409 refetches authority; no local Collected. |

### G. Completion

| ID | Requirement |
|---|---|
| FR-032 | Collection Complete shows backend-confirmed collected timestamp and order facts. |
| FR-033 | Print Receipt uses existing receipt/printer stack against the settled sale/payment authority. |
| FR-034 | Reprint uses existing authorized reprint path; no new financial mutation. |
| FR-035 | View details / New scan re-entry do not reverse Collected. |
| FR-036 | Customer tracking projection updates only from backend lifecycle, not notify alone. |

### Cross-cutting

| ID | Requirement |
|---|---|
| FR-037 | Widgets never call Dio; provider → repository → datasource. |
| FR-038 | Realtime events may refresh lists but never invent Collected. |
| FR-039 | Permissions are capability codes only; no role-name checks. |
| FR-040 | Primary layout target 1280×800; also 1180×820 and 1100×700 without clipping or hidden CTAs. |
| FR-041 | QR raw token never logged; only server hash compared. |
| FR-042 | Idempotent payment and collection complete commands. |
| FR-043 | Stale responses cancelled/suppressed on route leave and newer scans. |
| FR-044 | App resume/reconnect re-enables scanner and refreshes authority before handover submit. |
| FR-045 | Manual lookup (if enabled) uses GET lookup and never bypasses validate rules. |
| FR-046 | Quantities immutable during collection; no pick/pack edits on this path. |
| FR-047 | Server clock owns collected_at / event_at. |
| FR-048 | Competing `lib/features/collection/` or new controller families are forbidden. |

## 7. Business rules inventory

**Canonical owner:** `02_Functional_Rules.md` Business Rules section (no separate Business Rules file exists).

**Count: BR-001 → BR-036**

| ID | Rule |
|---|---|
| BR-001 | Collection eligible only when FulfillmentStatus=READY, PickupStatus=READY, ReadyAt present, CollectedAt NULL. |
| BR-002 | Tenant isolation on every read/mutation. |
| BR-003 | Outlet isolation: fulfilment outlet must match authorized POS outlet. |
| BR-004 | QR authority is server-side hash match of `pickup_qr_token_hash` + version + expiry. |
| BR-005 | QR issued only for READY orders; opaque token; never store/log raw token. |
| BR-006 | Expired QR (`pickup_qr_expires_at` ≤ server now) rejects without mutation. |
| BR-007 | Revoked/reissued QR (version mismatch or cleared hash policy) rejects without mutation. |
| BR-008 | Single-use finality: successful collection (`collected_at` set / COLLECTED) rejects replay. |
| BR-009 | Token is not consumed on validate; consumption/finality is on successful complete. |
| BR-010 | Outstanding balance authority is SalesOrder payment projection (`balanceDue` / paymentStatus). |
| BR-011 | Already-paid orders must not be charged again. |
| BR-012 | Tender availability follows POS payment method configuration + `pos.payments.*.accept`. |
| BR-013 | Open till / device context required for cash tender where till authority requires it. |
| BR-014 | Cash change = received − due; under-tender cannot complete. |
| BR-015 | Card failure/timeout leaves order uncollected and unpaid/unknown until reconciled. |
| BR-016 | Payment success ≠ Collected. |
| BR-017 | Handover revalidates payment settled + READY graph + expectedVersion in one transaction. |
| BR-018 | Duplicate handover is idempotent: second success returns original collected result without duplicate events/payment/stock. |
| BR-019 | Stale expectedVersion → 409; no overwrite. |
| BR-020 | Two tills racing: one wins; loser gets 409/already collected safe outcome. |
| BR-021 | Server timestamps only for collected_at / event_at. |
| BR-022 | Line quantities immutable on collection path. |
| BR-023 | Receipt print is MANUAL after Collection Complete; print failure does not roll back Collected. |
| BR-024 | Reprint does not create a new payment or collected event. |
| BR-025 | Customer tracking follows sales/fulfilment/pickup authority; notify is independent. |
| BR-026 | Validate failures: zero lifecycle and zero financial mutation. |
| BR-027 | No New Sale cart created for ecommerce collection settlement. |
| BR-028 | Handover marks pickup COLLECTED, fulfilment FULFILLED, sales completed projection together. |
| BR-029 | Actor/till/device audit prefer event/audit payload over new PickupOrder columns when adequate. |
| BR-030 | `VerifiedAt`/`VERIFIED` are not written by validate in Chunk 2; optional intermediate deferred. |
| BR-031 | Cancelled / EXPIRED pickup or cancelled sales order cannot collect. |
| BR-032 | Missing pickup/fulfilment graph rejects safely. |
| BR-033 | Wrong-outlet token rejects without disclosing other outlets’ orders. |
| BR-034 | Permission absence hides UX; backend still enforces. |
| BR-035 | Role names never authorize. |
| BR-036 | Append-only fulfilment/pickup events for issue/validate outcome (audit) and collect; validate may write audit-only event only if product later requires — default Chunk 2: validate is read-only. |

## 8. State machine (frontend)

```text
INITIAL
→ SCANNER_READY
→ SCANNING
→ VALIDATING
    → INVALID_QR | EXPIRED_QR | REVOKED_QR | WRONG_OUTLET | NOT_READY | CANCELLED | ALREADY_COLLECTED | MISSING_GRAPH | BACKEND_UNAVAILABLE
    → VALID_READY
→ CHECK_PAYMENT
    → HANDOVER_READY (paid)
    → PAYMENT_REQUIRED → PAYMENT_METHOD → PAYMENT_PROCESSING
        → PAYMENT_FAILED → PAYMENT_METHOD (retry)
        → PAYMENT_SUCCESS → HANDOVER_READY
→ HANDOVER_SUBMITTING
    → CONCURRENCY_CONFLICT → refresh → HANDOVER_READY or ALREADY_COLLECTED
    → COLLECTED → COLLECTION_COMPLETE
```

Recovery: cancel in-flight on leave; suppress stale validate/payment/handover responses; duplicate-scan suppress while VALIDATING/HANDOVER_SUBMITTING; timeout after payment success stays PAYMENT_SUCCESS until status poll confirms; timeout after collection success refetches before retry; app resume re-enters SCANNER_READY or refreshes HANDOVER_READY authority.

## 9. Full NFR inventory

**Count: NFR-001 → NFR-064**

### A. Performance

| ID | NFR |
|---|---|
| NFR-001 | QR validate uses indexed lookup by tenant + token hash (unique hash index if missing — Chunk 2 verify). |
| NFR-002 | Validation join must avoid N+1 (order/lines/fulfilment/pickup/payment in bounded queries). |
| NFR-003 | Flutter avoids rebuild storms; scanner callbacks debounce into single validate. |
| NFR-004 | Scan→request starts immediately after complete frame; no artificial delay. |
| NFR-005 | Observe p50/p95/p99 for validate/complete/payment via existing correlation — do not invent SLA numbers. |

### B. Scalability

| ID | NFR |
|---|---|
| NFR-006 | Multi-tenant isolation on every query. |
| NFR-007 | Multi-outlet READY volume supported via outlet-scoped indexes already used by list. |
| NFR-008 | Multi-till concurrent cashiers share DB authority; no sticky in-memory collection lock as sole authority. |
| NFR-009 | Horizontal API scale; shared PostgreSQL authority. |
| NFR-010 | No full-table scans for token validate. |

### C. Responsive

| ID | NFR |
|---|---|
| NFR-011 | Primary 1280×800 composition. |
| NFR-012 | Also 1180×820 and 1100×700. |
| NFR-013 | No overflow/clipping; CTAs visible; header/footer retained. |
| NFR-014 | Permission-driven reflow when Collection QR / payment / handover controls absent. |

### D. Reliability

| ID | NFR |
|---|---|
| NFR-015 | Retry-safe validate (read) and idempotent complete/payment. |
| NFR-016 | Partial failure: payment ok / collect fail leaves paid uncollected and recoverable. |
| NFR-017 | Crash after payment success: reconcile via payment status before handover. |
| NFR-018 | Crash after collect success: refetch shows Collected; no double collect. |
| NFR-019 | Printer failure after Collected remains Collected. |
| NFR-020 | Backend restart: clients refetch; no local authority. |

### E. Concurrency

| ID | NFR |
|---|---|
| NFR-021 | `FulfillmentOrder.row_version` / `expectedVersion` on complete. |
| NFR-022 | Two-till race resolved by DB concurrency. |
| NFR-023 | Duplicate handover idempotent. |
| NFR-024 | Stale UI responses suppressed. |
| NFR-025 | Duplicate payment prevented by payment idempotency keys + balance checks. |

### F. Idempotency

| ID | NFR |
|---|---|
| NFR-026 | Payment start/complete idempotent for same intent. |
| NFR-027 | Collection complete idempotent. |
| NFR-028 | Event creation exactly-once per successful transition. |
| NFR-029 | Receipt reprint idempotent regarding financials. |

### G. Security

| ID | NFR |
|---|---|
| NFR-030 | Granular backend permissions; no role checks. |
| NFR-031 | Tenant isolation. |
| NFR-032 | Outlet validation. |
| NFR-033 | Secure opaque QR; hash-at-rest. |
| NFR-034 | Replay protection via collected/version/expiry. |
| NFR-035 | Token secrecy; no raw token in logs. |
| NFR-036 | TLS for API. |
| NFR-037 | Payment data handling reuses POS payment rules (no PAN storage in C&C). |

### H. Privacy

| ID | NFR |
|---|---|
| NFR-038 | Minimal QR payload (opaque token only). |
| NFR-039 | PII minimization in validate responses (need-to-know cashier fields). |
| NFR-040 | Log redaction for phone/email/token. |

### I. Availability

| ID | NFR |
|---|---|
| NFR-041 | Manual entry if HID unavailable. |
| NFR-042 | Backend failure safe error. |
| NFR-043 | Payment provider failure blocks collect. |
| NFR-044 | Printer failure non-blocking for Collected. |

### J. Accessibility

| ID | NFR |
|---|---|
| NFR-045 | Semantics on scan/handover/payment CTAs. |
| NFR-046 | ≥44px touch targets. |
| NFR-047 | Focus order matches visual order. |
| NFR-048 | Screen reader announcements for validate/payment/collect outcomes. |
| NFR-049 | Status not colour-only. |

### K. Maintainability

| ID | NFR |
|---|---|
| NFR-050 | Owner `lib/features/fulfilment_pickup/`. |
| NFR-051 | Reuse-first scanner/payment/receipt. |
| NFR-052 | No Dio from widgets. |
| NFR-053 | No duplicate payment engine. |
| NFR-054 | Domain rules in backend domain/application. |

### L. Configurability

| ID | NFR |
|---|---|
| NFR-055 | Tenant theme applies. |
| NFR-056 | Enabled tenders from configuration/permissions. |
| NFR-057 | Currency from order authority. |
| NFR-058 | Till/device configuration from POS context. |

### M. Observability

| ID | NFR |
|---|---|
| NFR-059 | Correlation ID on validate/payment/complete. |
| NFR-060 | Metrics/events: validate outcome, payment lifecycle, collect, 409, printer failure. |

### N. Auditability

| ID | NFR |
|---|---|
| NFR-061 | Persist actor, tenant, outlet, till/device (via event payload), order, pickup, payment refs, timestamps. |

### O. Localization / Time

| ID | NFR |
|---|---|
| NFR-062 | Locale/currency formatting REUSE; timezone from collection snapshots; server clock authority. |

### P. Testing / Deployment

| ID | NFR |
|---|---|
| NFR-063 | Backwards compatible with existing READY orders once QR issuance backfill/policy defined. |
| NFR-064 | Feature rollout: APIs permission-gated; old clients without collection UI remain safe. |

## 10. Permission audit

### Existing enforced (CashierPos `OnlineOrderPermissions`)

REUSE: `orders.access`, `orders.view`, `fulfilment.start`, picking/packing set, `collection.mark_ready`, `collection.view_ready`, `collection.notify_customer`.

### Existing POS payment (REUSE for tenders)

REUSE: `pos.payments.cash.accept`, `pos.payments.card.accept`, `pos.payments.qr.accept` (as configured), checkout method tiles.

### Documented in Permission_Code_List but NOT in enforced OnlineOrderPermissions catalog

| Code | Classification |
|---|---|
| `commerce.online_order.collection.scan_qr` | NEW REQUIRED (catalog add; name already documented) |
| `commerce.online_order.collection.validate_qr` | NEW REQUIRED |
| `commerce.online_order.collection.manual_lookup` | NEW REQUIRED (if manual lookup shipped) |
| `commerce.online_order.collection.verify_items` | EXTEND/UX — optional for checklist visibility; backend complete still needs handover/collect |
| `commerce.online_order.collection.handover` | NEW REQUIRED |
| `commerce.online_order.collection.collect` | NEW REQUIRED |
| `commerce.online_order.payment.accept_cash` | NOT REQUIRED as separate engine — REUSE `pos.payments.cash.accept` |
| `commerce.online_order.payment.retry` | DEFERRED / EXTEND only if distinct retry UX needs it; else payment status reconcile |

Frontend permissions = UX visibility/reflow. Backend permissions = security authority.

## 11. API audit

Base remains `ClickCollectOrdersController` / `/api/v1/tenant/ecommerce/click-collect`.

| Capability | Classification | Contract |
|---|---|---|
| List/Detail/Start/Pick/Pack/Ready/Notify | REUSE | Existing |
| Validate Customer Collection QR | NEW ACTION IN EXISTING CONTROLLER | `POST /api/v1/tenant/ecommerce/click-collect/collection/qr/validate` body `{ token }` + outlet context; **read-only** |
| Manual lookup | NEW ACTION (optional same chunk) | `GET /api/v1/tenant/ecommerce/click-collect/collection/lookup?outletId=&orderNumber=` |
| Complete collection / handover | NEW ACTION IN EXISTING CONTROLLER | `POST /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/collection/complete?outletId=` body `{ expectedVersion }` |
| Dedicated `/collection/payment/cash` | NOT REQUIRED / SUPERSEDED | Prefer shared POS payment engine |
| Settle ecommerce outstanding | EXTEND EXISTING POS checkout/payment family | Context = existing `SalesOrderId` + balanceDue; **no New Sale cart lines** |
| Receipt read/print | REUSE | Existing receipt/print APIs after payment/sale authority exists |

Competing controller (`CollectionController`, `QrCollectionController`): **NO**.

## 12. Payment reuse audit

| Surface | Classification |
|---|---|
| Payment Method UI | REUSE / EXTEND (entry context: collection order, not new-sale cart) |
| Cash tender UI | REUSE / EXTEND (amount due from order balance) |
| Card flow | REUSE / EXTEND (placeholder maturity unchanged) |
| Existing ecommerce outstanding settlement | GAP (PosCheckout currently Lines/NewSale coupled) |
| New collection payment engine | NO |

## 13. Table / entity audit

| Table | Role |
|---|---|
| `sales_orders` / `sales_order_lines` | REUSE financial + line facts |
| `fulfillment_orders` / `fulfillment_order_lines` | REUSE READY/FULFILLED + packed quantities + `row_version` |
| `pickup_orders` | REUSE QR hash/version/expiry + `collected_at` + status |
| `fulfillment_order_events` / `pickup_order_events` | REUSE append-only audit |
| `sales_payments` / `sales_payment_events` / `sales_payment_transactions` | REUSE payment persistence |
| `pickup_collection_tokens` | NOT REQUIRED |

## 14. Attribute audit

| Attribute | Decision |
|---|---|
| ReadyAt / CollectedAt / PickupStatus / FulfillmentStatus / RowVersion (FO) / quantities | EXISTING — NO NEW |
| `pickup_qr_token_hash`, `pickup_qr_version`, `pickup_qr_expires_at` | EXISTING — EXTEND writers (issue on Ready; match on validate; finality on complete) |
| `verified_by_tenant_user_id`, `verified_at`, `verification_method` | EXISTING — DEFER writes on validate; may set on complete if useful |
| `collected_by` column | NOT REQUIRED if `pickup_order_events.event_by_tenant_user_id` + payload capture actor/till/device |
| New token table columns | NOT REQUIRED |

## 15. QR token audit

| Question | Result |
|---|---|
| Existing collection token capability | CONFIRMED EXISTING columns on `pickup_orders`; NOT FOUND issue/validate/consume services |
| Decision | **OPTION B — EXTEND `pickup_orders`** |
| OPTION A reuse field | Partial — columns exist but unused |
| OPTION C new `pickup_collection_tokens` | Rejected by DB knowledge + unnecessary for MVP |
| Reason | Schema already stores hash/version/expiry; single-use via `collected_at` + events; avoids duplicate credential model |

## 16. Reuse matrix

| Item | Class |
|---|---|
| POS Header/Footer | REUSE |
| OO-01 search bar | REUSE |
| OO-01 search scan icon | REUSE (search only) |
| Collection QR entry control | EXTEND OO-01 / FEATURE-LOCAL control |
| HID scanner infrastructure | REUSE |
| Camera scanner | EXTEND optional |
| Manual lookup | FEATURE-LOCAL + shared inputs |
| Summary cards / order cards | REUSE |
| Info banner / primary CTA / modal | REUSE |
| Payment method UI | REUSE / EXTEND context |
| Cash tender | REUSE / EXTEND |
| Card flow | REUSE / EXTEND |
| Currency formatting | REUSE |
| Receipt / printer | REUSE |
| Order item list / customer summary | EXTEND from detail widgets |
| Collection scanner panel | FEATURE-LOCAL (compose shared listener) |
| Pack card / failure card / handover checklist / complete composition | FEATURE-LOCAL |
| New Sale cart engine | EXCLUDED |

## 17. Frontend folder structure (Chunk 2 target)

Remain under `lib/features/fulfilment_pickup/`:

```text
presentation/screens/
  collection_qr_scan_screen.dart
  collection_verification_screen.dart
  collection_qr_rejected_screen.dart
  collection_handover_screen.dart
  collection_complete_screen.dart
presentation/widgets/collection/
  ... scanner panel, checklist, payment-required banner ...
presentation/providers/
  pos_online_order_collection_provider.dart (or extend pos_online_orders_provider carefully)
data/datasources|repositories + domain entities
  collection validate/complete DTOs and repo methods
```

Shared payment/receipt remain in `lib/features/sale/` (+ hardware/receipts). Routes in `pos_shell_router.dart`.

## 18. Backend folder structure (Chunk 2 target)

```text
Api/Controllers/.../ClickCollectOrdersController.cs  (+ validate + complete actions)
Application/.../PosOnlineOrderCollectionService.cs   (new if no equivalent; orchestration only)
Domain/.../PickupOrder.cs                            (+ MarkCollected / IssueQr helpers)
Infrastructure repositories                          (hash lookup, complete txn)
POS checkout/payment services                        (EXTEND outstanding SalesOrder settle)
```

No competing controller namespace.

## 19. Screen / branch inventory

### Common

1. Online Orders (OO-01)
2. Scan Customer Collection QR
3. QR Validated / Collection Verification
4. QR Cannot Be Accepted
5. Confirm Handover
6. Collection Complete

### Unpaid branch

7. Collection Payment Required
8. Shared Payment Method
9. Tender-specific Payment Screen
10. Payment Success
11. Payment Failure

### Paths

- **PAID:** 1→2→3→5→6→print
- **UNPAID Cash:** 1→2→3→7→8→9(cash)→10→5→6→print
- **UNPAID Card:** 1→2→3→7→8→9(card)→10→5→6→print
- **Failure/retry:** 4 or 11 → rescan/retry payment
- **Already collected:** 4 (ALREADY_COLLECTED)

## 20. Database mutation matrix

| Step | sales_orders | lines | fulfillment_* | pickup_orders | payment tables | QR fields | events |
|---|---|---|---|---|---|---|---|
| SCAN (client) | none | none | none | none | none | none | none |
| VALIDATE | none | none | none | none | none | none | none (default) |
| PAYMENT | paid/balance | none | none | none | insert/update | none | payment events |
| HANDOVER/COMPLETE | completed projection | none | READY→FULFILLED + version++ | READY→COLLECTED + collected_at | none | finality via collected | FO + pickup events |
| RECEIPT | none | none | none | none | none | none | print audit only if existing |

## 21. Error taxonomy

`collection.qr.invalid` · `expired` · `revoked` · `wrong_outlet` · `not_ready` · `cancelled` · `already_collected` · `missing_graph` · `payment_required` · `payment_unsettled` · `concurrency_conflict` · `forbidden` · `unavailable`

All safe for UI; no cross-tenant existence leaks.

## 22. Concurrency / idempotency contract

- Complete requires positive `expectedVersion` matching `fulfillment_orders.row_version`.
- Payment uses existing POS idempotency intent keys extended for `salesOrderId`.
- Complete replay after success returns original collected DTO.
- Validate is read-only and naturally retry-safe.

## 23. Receipt contract

- MANUAL print after Collection Complete (align Payment Success → Print Receipt policy).
- REUSE `CanonicalReceiptPresentation` / printer service / reprint authorization.
- Print/reprint ≠ Collected authority.
- Physical printer acceptance remains hardware-gated (SoT BLOCKED) but software path REUSE.

## 24. Confirmed gaps

1. Collection QR Flutter screens/routes/provider.
2. OO-01 Collection QR entry distinct from search scan.
3. QR issue writer on Ready path (hash/version/expires).
4. `POST .../collection/qr/validate`.
5. `POST .../orders/{orderId}/collection/complete`.
6. Domain `MarkCollected` (+ optional IssueQr).
7. POS payment EXTEND to settle existing ecommerce SalesOrder balance without cart Lines.
8. Catalog enforcement for collection.scan_qr/validate_qr/handover/collect (+ optional lookup/verify).
9. Unique index on `pickup_qr_token_hash` verification (confirm/add in Chunk 2 if absent).
10. C&C wiring to receipt print after collect.

## 25. Confirmed no-change areas

- OO-01…OO-06 preparation contracts (except Ready QR issuance extend).
- No new competing feature folders/controllers.
- No `pickup_collection_tokens` table.
- No dedicated `/collection/payment/cash` engine.
- No role-based auth.
- Existing payment tender permissions (`pos.payments.*`).
- Fulfillment `row_version` remains concurrency authority.

## 26. Chunk 2 implementation scope (frozen)

1. Flutter collection screens/widgets/provider/repo/datasource + routes.
2. OO-01 Collection QR entry + HID reuse for collection token.
3. Backend validate + complete on `ClickCollectOrdersController`.
4. `PosOnlineOrderCollectionService` (or equivalent) + PickupOrder domain methods.
5. Ready-path QR issuance (hash/version/expiry).
6. EXTEND POS checkout/payment for existing SalesOrder outstanding settle.
7. Wire Payment Method/Cash/Card/Receipt reuse with collection context.
8. Add missing collection permissions to CashierPos catalog + seed/reconcile.
9. Migration only if index/`row_version` on pickup proven required — prefer no new columns.
10. Focused unit/integration/Flutter tests + runtime acceptance matrix.

## 27. Acceptance criteria (Chunk 1)

- [x] Second Brain owners updated consistently
- [x] Gaps labelled CONFIRMED/GAP/PROPOSED
- [x] Chunk 2 scope frozen
- [x] No runtime source / migration / commit

## 28. Blockers / unknowns

| Item | Status |
|---|---|
| Exact POS checkout DTO shape for SalesOrderId settle | PROPOSED FOR CHUNK 2 design within existing checkout family |
| Whether historical READY rows lack QR hash | Chunk 2 must define backfill/reissue policy |
| Card terminal physical readiness | OUT OF CURRENT HARDWARE RELEASE per SoT — software placeholder REUSE |
| Guest label semantics | OPEN elsewhere; not blocking collection PAID/UNPAID |

## Related authorities

- [[../../../00_START_HERE/Current_Source_Of_Truth]]
- [[../../../03_USER_JOURNEYS/Cashier/POS-UJ-036_Online_Order_Fulfilment_Collection]]
- [[../../../04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/02_Functional_Rules]]
- [[../../../04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/03_Technical_Contract]]
- [[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Order_ClickCollect_Fulfilment]]
- [[../../../06_DATABASE_KNOWLEDGE/Tables/23_Fulfilment_And_Pickup_UPDATED]]
