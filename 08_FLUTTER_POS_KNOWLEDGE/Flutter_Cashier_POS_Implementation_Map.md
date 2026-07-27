<!-- title: Flutter Cashier POS Implementation Map -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-23 -->


# Flutter Cashier POS Implementation Map

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
| Open till | `/pos/till/open` | `POST /api/v1/tills/open` | Integrated |
| POS home | `/pos/home` | `GET /api/v1/pos/home` | Integrated |
| New Sale catalog | `/pos/new-sale` | `GET /api/v1/pos/products` | Partially integrated |
| Search Original Sale | `/pos/returns-refunds` | `GET /api/v1/pos/returns/sales/search` | Integrated |
| Close till | `/pos/cash-drawer/close-till` | `POST /api/v1/tills/close` | Integrated |
| End Shift | sidebar action | close till + session clear | Integrated |

## New Sale Status

| Area | Frontend | Backend | Integration |
|---|---|---|---|
| Product grid | UI complete | `GET /api/v1/pos/products` | Wired; real DB only |
| Catalog fallback mock | Removed 2026-07-10 | N/A | No mock products |
| Product detail / variants | UI expects API | Not implemented | Blocked |
| Category chips API | Datasource exists | Not implemented | UI uses static chips |
| Local cart | In-memory Riverpod | N/A | UI only |
| Checkout summary | Wired | `POST /api/v1/pos/checkout/summary` | Integrated for current online cash flow |
| Cash payment | Wired | Not in Unified-Commerce | Blocked |
| Receipt print audit | Wired in Flutter | Not in Unified-Commerce | Blocked |

## POS Home Card Status

| Card | Metrics from `pos/home` | Destination API | Status |
|---|---|---|---|
| Start New Sale | Enabled rules | products + checkout | Partial |
| Returns & Exchanges | Count | `GET /api/v1/pos/returns/sales/search` | Step 1 integrated; exact `returns.view` |
| Add Customer | Count | customers APIs | Wired (`/pos/customers`) |
| Parked Sales | Device-local count/dialog | Backend `/api/v1/pos/holds` exists but is not called by Flutter | Partial/disconnected |
| Cash Drawer | Balance | drawer detail API | Partial (balance only) |
| Online Orders | Placeholder | none | UI only |

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

## Related Files

- [[../15_IMPLEMENTATION_TRACKING/Flutter/Sales/Start_Sale_UI_Implementation_Status]]
- [[../15_IMPLEMENTATION_TRACKING/Backend/CatalogProduct/Pos_Products_List_Implementation_Status]]
- [[../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Sales/Cashier_POS_Second_Brain_vs_Code_Comparison_Implementation_Status]]
