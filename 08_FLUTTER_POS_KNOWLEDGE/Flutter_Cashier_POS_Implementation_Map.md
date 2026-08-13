<!-- title: Flutter Cashier POS Implementation Map -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-13 -->


# Flutter Cashier POS Implementation Map

> Checkout Customer Selection / Add: Second Brain is ready for implementation;
> dedicated Flutter implementation, `customers.create` permission seed
> restoration, and authenticated E2E verification remain pending. Normative
> contract: [[Flutter_Checkout_Customer_Selection_Implementation_Specification]].

> Open Till (2026-08-11): API wiring is integrated; approved UI contract
> (Dashboard Top Bar, orange, white parent, Phone+Tablet+Desktop) is
> **PENDING**. Canonical:
> [[Flutter_Open_Till_Screen_Implementation_Specification]],
> [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/04_Open_Till_Feature]].

> Cash Drawer (2026-08-13): Second Brain production alignment complete.
> Financial `/api/v1/pos/cash-drawer/*` APIs are APPROVED_TARGET_NOT_IMPLEMENTED.
> Flutter Cash In/Out remains FRONTEND_ONLY. Physical Open Drawer reuses
> `/api/v1/pos/hardware/drawer/*`. Canonical:
> [[Flutter_Cash_Drawer_Management_Implementation_Specification]],
> [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/06_Cash_Drawer_Feature]],
> [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/Cash_Drawer_Second_Brain_Alignment_2026-08-13]].

## Purpose

Active implementation map for cashier POS in `Nytroz-POS-App` against
`Unified-Commerce` (`E_POS.Api`). Replaces broken links to archived
`Flutter_Cashier_New_Sale_Implementation.md`.

## Verified Bootstrap Flow

| Step | Route / Screen | Backend API | Status |
|---|---|---|---|
| Login | `/tenant-login` | `POST /api/v1/tenant-auth/login` | Integrated |
| Device bootstrap | session bootstrap | `GET /api/v1/devices/current` | Integrated |
| Till session check | bootstrap | `GET /api/v1/tills/current-session` | Integrated |
| Open till | `/pos/till/open` | `POST /api/v1/tills/open` | API integrated; approved UI PENDING |
| POS home | `/pos/home` | `GET /api/v1/pos/home` | Integrated |
| New Sale catalog | `/pos/new-sale` | `GET /api/v1/pos/products` | Partially integrated |
| Search Original Sale | `/pos/returns-refunds` | `GET /api/v1/pos/returns/sales/search` | Integrated |
| Close till | `/pos/cash-drawer/close-till` | `POST /api/v1/tills/close` | Wired; production-blocked by expected-cash/reconciliation gaps |
| End Shift | sidebar action | close till + session clear | Wired; production acceptance pending safe close E2E |

## New Sale Status

| Area | Frontend | Backend | Integration |
|---|---|---|---|
| Product grid | UI complete | `GET /api/v1/pos/products` | Wired; real DB only |
| Catalog fallback mock | Removed 2026-07-10 | N/A | No mock products |
| Product detail / variants | Older `PosProductVariantSheet` and direct-add evidence exist | Production target pending verification/implementation | Partial; full popup pending |
| Product-line note / Frequently Bought Together | Specification only | Target contracts pending | Implementation Pending |
| Category chips API | Datasource exists | Not implemented | UI uses static chips |
| Local cart | In-memory Riverpod | N/A | UI only |
| Checkout summary | Wired | `POST /api/v1/pos/checkout/summary` | Integrated for current online cash flow |
| Cash payment | Wired | Checkout summary/start-payment | Testing |
| Receipt print audit | Wired | `POST /api/v1/pos/receipts/{saleId}/print` | Testing |
| Discovery segments | Toggle buttons styled | `GET /api/v1/pos/products?segment=` | Planned (Not Started) |
| Popular Products | Curation UI planned | Bootstraps `POS_POPULAR` reserved collection | Planned (Not Started) |
| Frequently Sold | UI chip disabled | Aggregates completed order lines on the fly | Planned (Not Started) |
| Offers / Promotions | Card badges planned | Checks active targeted policies and special price lists | Planned (Not Started) |

## POS Home Card Status

| Card | Metrics from `pos/home` | Destination API | Status |
|---|---|---|---|
| Start New Sale | Enabled rules | products + checkout | Partial |
| Returns & Exchanges | Count | `GET /api/v1/pos/returns/sales/search` | Step 1 integrated; exact `returns.view` |
| Customer Management | Count | customers APIs | Wired (`/pos/customers`); separate approved checkout selector remains pending |
| Parked Sales | Device-local count/dialog | Backend `/api/v1/pos/holds` exists but is not called by Flutter | Partial/disconnected |
| Cash Drawer | Balance + actions | Target `/api/v1/pos/cash-drawer/*`; hardware drawer reused | Partial UI; financial APIs NOT_IMPLEMENTED; Cash In/Out FRONTEND_ONLY |
| Online Orders | Placeholder | none | UI only |

### Dashboard implementation update (2026-07-24)

The home screen now uses a responsive cashier-profile + 3x2 action grid and an
API-backed current-till-session summary. Tenant branding, cashier role, device
state, fixed outlet/till context and summary metrics come from the additive
`GET /api/v1/pos/home` contract. End Shift uses the real close-till route.
Online Orders and Resume Held Sales remain visibly disabled when exposed because
their production Flutter destinations are unavailable.

All six approved action illustrations are now available as transparent RGBA
assets under `assets/images`. The shared action card still keeps code-icon
fallbacks for asset-load failure. Dashboard presentation is physically
modularized under `presentation/widgets/home`: the main composition file is 96
lines, while header, branding, session status, operational context, cashier
profile, action configuration/grid/card, dot painter, summary panel/card and
bottom navigation are separate files. No provider, route, access rule or API
contract was duplicated during the refactor.

The five current-session summary cards retain API values and formatting while
using metric-specific Material icon styling: orange Total Sales, green
Transactions, purple Returns, amber Discounts and blue Net Sales. Each icon uses
a 56 logical-pixel pastel circular container and a 30 logical-pixel glyph.

## Returns Step 1 Notes (2026-07-17)

- Route `/pos/returns-refunds` requires exact `returns.view`.
- Continue into `/pos/returns-refunds/summary` requires `returns.view` + `returns.create` and selected-sale context.
- Recent tab = backend newest outlet-scoped eligible sales.
- Recent-search chips = ephemeral in-memory query history only; not persisted.
- Filters, pagination, and stale-response sequencing are wired to the search API.
- No Step 1 draft API.

## Data Rules (2026-07-10)

- No POS catalog seed or mock fallback in Flutter.
- Products must exist via Tenant Admin / `POST /api/v1/products` and price list.
- Empty catalog shows **No products found**, not demo items.

## Product Variant Popup Target

The production popup adds dynamic ID-based option resolution, one image slot, quantity/UOM validation, optional product-line note, manual Frequently Bought Together, atomic authoritative cart response, responsive/error/conflict/accessibility behaviour and duplicate-tap protection. Existing variant-sheet and scanner/direct-add code must be preserved as partial evidence, not marked complete. See [[Flutter_Product_Variant_Popup_Implementation_Specification]].

## Payment And Receipt Map (2026-07-29)

| Area | Active ownership | Status |
|---|---|---|
| Authoritative receipt | Backend completion + `receipt_data_json` | Implemented |
| Completed-sale orchestration | `completed_sale_print_provider.dart` | Implemented; physical matrix incomplete |
| Receipt History reprint | `features/receipts` + same printer service | Implemented; physical reprint unverified |
| Local Agent transport | adapter/client under `hardware/receipt_printer` | Implemented |
| Durable recovery | encrypted operation store + operation lookup | Implemented |
| Card | provider-neutral backend gateway | Externally blocked |
| Split | typed contract groundwork only | Not implemented end to end |

### Hardware Chunk 2C receipt-history map

| Area | Active ownership | Status |
|---|---|---|
| Sale historical reprint | Completed-sale print controller | Implemented; physical pending |
| Refund/Return historical reprint | Receipt History → historical mapper → non-sale orchestrator | Implemented; physical pending |
| Exchange historical reprint | Same typed non-sale path | Implemented; physical pending |
| Non-sale copies | Device printer policy + deterministic copy identity | Implemented; physical pending |
| Copy audit recovery | Per-copy pending audit, audit-only retry | Implemented |

## Related Files

- [[../15_IMPLEMENTATION_TRACKING/Flutter/Sales/Start_Sale_UI_Implementation_Status]]
- [[../15_IMPLEMENTATION_TRACKING/Backend/CatalogProduct/Pos_Products_List_Implementation_Status]]
- [[../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Sales/Cashier_POS_Second_Brain_vs_Code_Comparison_Implementation_Status]]
- [[../04_MODULE_KNOWLEDGE/21_POS_Operations/04_Popular_Product_Discovery_Feature]]
- [[../04_MODULE_KNOWLEDGE/21_POS_Operations/05_Frequently_Sold_Product_Discovery_Feature]]
- [[../04_MODULE_KNOWLEDGE/21_POS_Operations/06_Offers_Product_Discovery_Feature]]
- [[../04_MODULE_KNOWLEDGE/21_POS_Operations/07_Product_Variant_Selection_Popup_Feature]]
- [[Flutter_Product_Variant_Popup_Implementation_Specification]]

### Hardware Chunk 3 scanner map

```text
New Sale -> scanner listener -> HID service -> FIFO scan controller
-> exact product API -> existing resolved-variant cart action
```

```text
Hardware Testing -> scanner-test controller -> backend registration
<!-- title: Flutter Cashier POS Implementation Map -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->


# Flutter Cashier POS Implementation Map

## Park / Recall Sale implementation boundary

Current Flutter code uses `PosParkedSaleNotifier` and the
`pos.parked_sales` secure-storage key. It generates local `Parked Sale #N`
references, records device time, serializes cart/customer/discount data, and
deletes the local record during recall before restoring the cart. No Flutter
integration with `/api/v1/pos/holds` was found.

Target implementation must replace local authority with the backend holds API,
retain local state only as a cache, show backend hold references and expiry,
and remove a cached hold only after recall succeeds. Detailed target:
[[Flutter_Park_Recall_Sale_Implementation_Specification]].

## Purpose

Active implementation map for cashier POS in `Nytroz-POS-App` against
`Unified-Commerce` (`E_POS.Api`). Replaces broken links to archived
`Flutter_Cashier_New_Sale_Implementation.md`.

## Verified Bootstrap Flow

| Step | Route / Screen | Backend API | Status |
|---|---|---|---|
| Login | `/tenant-login` | `POST /api/v1/tenant-auth/login` | Integrated |
| Device bootstrap | session bootstrap | `GET /api/v1/devices/current` | Integrated |
| Till session check | bootstrap | `GET /api/v1/tills/current-session` | Integrated |
| Open till | `/pos/till/open` | `POST /api/v1/tills/open` | API integrated; approved UI PENDING |
| POS home | `/pos/home` | `GET /api/v1/pos/home` | Integrated |
| New Sale catalog | `/pos/new-sale` | `GET /api/v1/pos/products` | Partially integrated |
| Search Original Sale | `/pos/returns-refunds` | `GET /api/v1/pos/returns/sales/search` | Integrated |
| Close till | `/pos/cash-drawer/close-till` | `POST /api/v1/tills/close` | Wired; production-blocked by expected-cash/reconciliation gaps |
| End Shift | sidebar action | close till + session clear | Wired; production acceptance pending safe close E2E |

## New Sale Status

| Area | Frontend | Backend | Integration |
|---|---|---|---|
| Product grid | UI complete | `GET /api/v1/pos/products` | Wired; real DB only |
| Catalog fallback mock | Removed 2026-07-10 | N/A | No mock products |
| Product detail / variants | Older `PosProductVariantSheet` and direct-add evidence exist | Production target pending verification/implementation | Partial; full popup pending |
| Product-line note / Frequently Bought Together | Specification only | Target contracts pending | Implementation Pending |
| Category chips API | Datasource exists | Not implemented | UI uses static chips |
| Local cart | In-memory Riverpod | N/A | UI only |
| Checkout summary | Wired | `POST /api/v1/pos/checkout/summary` | Integrated for current online cash flow |
| Cash payment | Wired | Checkout summary/start-payment | Testing |
| Receipt print audit | Wired | `POST /api/v1/pos/receipts/{saleId}/print` | Testing |
| Discovery segments | Toggle buttons styled | `GET /api/v1/pos/products?segment=` | Planned (Not Started) |
| Popular Products | Curation UI planned | Bootstraps `POS_POPULAR` reserved collection | Planned (Not Started) |
| Frequently Sold | UI chip disabled | Aggregates completed order lines on the fly | Planned (Not Started) |
| Offers / Promotions | Card badges planned | Checks active targeted policies and special price lists | Planned (Not Started) |

## POS Home Card Status

| Card | Metrics from `pos/home` | Destination API | Status |
|---|---|---|---|
| Start New Sale | Enabled rules | products + checkout | Partial |
| Returns & Exchanges | Count | `GET /api/v1/pos/returns/sales/search` | Step 1 integrated; exact `returns.view` |
| Customer Management | Count | customers APIs | Wired (`/pos/customers`); not the approved full-screen checkout selector |
| Parked Sales | Device-local count/dialog | Backend `/api/v1/pos/holds` exists but is not called by Flutter | Partial/disconnected |
| Cash Drawer | Balance + actions | Target `/api/v1/pos/cash-drawer/*`; hardware drawer reused | Partial UI; financial APIs NOT_IMPLEMENTED; Cash In/Out FRONTEND_ONLY |
| Online Orders | Placeholder | none | UI only |

### Dashboard implementation update (2026-07-24)

The home screen now uses a responsive cashier-profile + 3x2 action grid and an
API-backed current-till-session summary. Tenant branding, cashier role, device
state, fixed outlet/till context and summary metrics come from the additive
`GET /api/v1/pos/home` contract. End Shift uses the real close-till route.
Online Orders and Resume Held Sales remain visibly disabled when exposed because
their production Flutter destinations are unavailable.

All six approved action illustrations are now available as transparent RGBA
assets under `assets/images`. The shared action card still keeps code-icon
fallbacks for asset-load failure. Dashboard presentation is physically
modularized under `presentation/widgets/home`: the main composition file is 96
lines, while header, branding, session status, operational context, cashier
profile, action configuration/grid/card, dot painter, summary panel/card and
bottom navigation are separate files. No provider, route, access rule or API
contract was duplicated during the refactor.

The five current-session summary cards retain API values and formatting while
using metric-specific Material icon styling: orange Total Sales, green
Transactions, purple Returns, amber Discounts and blue Net Sales. Each icon uses
a 56 logical-pixel pastel circular container and a 30 logical-pixel glyph.

## Returns Step 1 Notes (2026-07-17)

- Route `/pos/returns-refunds` requires exact `returns.view`.
- Continue into `/pos/returns-refunds/summary` requires `returns.view` + `returns.create` and selected-sale context.
- Recent tab = backend newest outlet-scoped eligible sales.
- Recent-search chips = ephemeral in-memory query history only; not persisted.
- Filters, pagination, and stale-response sequencing are wired to the search API.
- No Step 1 draft API.

## Data Rules (2026-07-10)

- No POS catalog seed or mock fallback in Flutter.
- Products must exist via Tenant Admin / `POST /api/v1/products` and price list.
- Empty catalog shows **No products found**, not demo items.

## Product Variant Popup Target

The production popup adds dynamic ID-based option resolution, one image slot, quantity/UOM validation, optional product-line note, manual Frequently Bought Together, atomic authoritative cart response, responsive/error/conflict/accessibility behaviour and duplicate-tap protection. Existing variant-sheet and scanner/direct-add code must be preserved as partial evidence, not marked complete. See [[Flutter_Product_Variant_Popup_Implementation_Specification]].

## Payment And Receipt Map (2026-07-29)

| Area | Active ownership | Status |
|---|---|---|
| Authoritative receipt | Backend completion + `receipt_data_json` | Implemented |
| Completed-sale orchestration | `completed_sale_print_provider.dart` | Implemented; physical matrix incomplete |
| Receipt History reprint | `features/receipts` + same printer service | Implemented; physical reprint unverified |
| Local Agent transport | adapter/client under `hardware/receipt_printer` | Implemented |
| Durable recovery | encrypted operation store + operation lookup | Implemented |
| Card | provider-neutral backend gateway | Externally blocked |
| Split | typed contract groundwork only | Not implemented end to end |

### Hardware Chunk 2C receipt-history map

| Area | Active ownership | Status |
|---|---|---|
| Sale historical reprint | Completed-sale print controller | Implemented; physical pending |
| Refund/Return historical reprint | Receipt History → historical mapper → non-sale orchestrator | Implemented; physical pending |
| Exchange historical reprint | Same typed non-sale path | Implemented; physical pending |
| Non-sale copies | Device printer policy + deterministic copy identity | Implemented; physical pending |
| Copy audit recovery | Per-copy pending audit, audit-only retry | Implemented |

## Cash Payment Screen Target (2026-08-04)

The new Cash Payment screen redesign is fully documented but its implementation remains pending/not completed by this task. See the dedicated specification: [[Flutter_Cash_Payment_Screen_Implementation_Specification]]. Documentation Status: Documentation Ready.

## Related Files

- [[../15_IMPLEMENTATION_TRACKING/Flutter/Sales/Start_Sale_UI_Implementation_Status]]
- [[../15_IMPLEMENTATION_TRACKING/Backend/CatalogProduct/Pos_Products_List_Implementation_Status]]
- [[../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Sales/Cashier_POS_Second_Brain_vs_Code_Comparison_Implementation_Status]]
- [[../04_MODULE_KNOWLEDGE/21_POS_Operations/04_Popular_Product_Discovery_Feature]]
- [[../04_MODULE_KNOWLEDGE/21_POS_Operations/05_Frequently_Sold_Product_Discovery_Feature]]
- [[../04_MODULE_KNOWLEDGE/21_POS_Operations/06_Offers_Product_Discovery_Feature]]
- [[../04_MODULE_KNOWLEDGE/21_POS_Operations/07_Product_Variant_Selection_Popup_Feature]]
- [[Flutter_Product_Variant_Popup_Implementation_Specification]]

### Hardware Chunk 3 scanner map

```text
New Sale -> scanner listener -> HID service -> FIFO scan controller
-> exact product API -> existing resolved-variant cart action
```

```text
Hardware Testing -> scanner-test controller -> backend registration
-> isolated HID/camera execution -> result finalization -> history
```

The camera dialog observes app lifecycle, stops while inactive/backgrounded,
resumes only on its active dialog and gates the first valid frame.
