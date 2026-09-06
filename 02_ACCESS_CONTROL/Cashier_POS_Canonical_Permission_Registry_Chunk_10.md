<!-- title: Cashier POS Canonical Permission Registry — Chunk 10 -->
<!-- status: Active — Home / New Sale / Catalog / Cart / Held Sales Visibility (PASS) -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-05 -->

# Cashier POS Canonical Permission Registry — Chunk 10

## Completion pass

| Field | Value |
| --- | --- |
| Completion pass date | 2026-09-05 |
| Result | **PASS** |
| New canonical codes | **0** |
| Backend / DB changes | **NONE** |

## 1. Part 0 — Bottom Nav Orders verification

| Field | Value |
| --- | --- |
| Bottom-nav label | `Orders` |
| Route | `/pos/orders` |
| Actual screen | `PosReceiptHistoryScreen` (title **Receipt History**) |
| API | `GET /api/v1/pos/receipts` |
| Classification | `TRANSACTION_RECEIPT_HISTORY` |
| Canonical | `pos.receipts.digital.view` (+ legacy `receipts.view`) |
| Correction made | NO |

## 2. Product Detail full matrix

| UI Element | Exact Canonical Permission | Denied | Granted |
| --- | --- | --- | --- |
| Detail container | `pos.catalog.product_detail.view` | sheet does not open / unavailable | open |
| Close chrome | `pos.catalog.product_detail.close` | chrome absent*; structural dismiss kept | Close icon |
| Image | `pos.catalog.product_detail.image` | absent | render |
| Name | `pos.catalog.product_detail.name` | absent | render |
| Price (regular/sale share this) | `pos.catalog.product_detail.price` | absent (no `0.00`) | render |
| Stock | `pos.catalog.product_detail.stock` | absent | badge |
| SKU | `pos.catalog.product_detail.sku` | absent | render |
| Description | `pos.catalog.product_detail.description` | absent | render |
| Variants container | `pos.catalog.product_detail.variants` | absent | labels/chips view |
| Variant select | `pos.catalog.product_detail.variant_select` | non-interactive Chip | ChoiceChip select |
| Available qty | `pos.catalog.product_detail.available_qty` | absent | “Available: N” |
| Quantity display | `pos.catalog.product_detail.quantity_display` | absent | stepper value |
| Qty ± independent | **NO_CANONICAL_MAPPING** | N/A | bundled with `quantity_display`; submit uses cart add/update |
| Note view | `pos.catalog.product_detail.note_view` | absent | read-only note |
| Note entry | `pos.catalog.product_detail.note_entry` | no TextField | editable |
| Recommendations | `pos.catalog.product_detail.recommendations` | absent | panel |
| Add to Cart | `pos.sales.cart.add_item` (+ legacy) | button absent | may submit |
| Business Cancel | `pos.catalog.product_detail.cancel` | button absent | Cancel button |

\*Structural dismiss (barrier / system back / Escape / top Close) preserved so the sheet is never trapped. Documented decision: business Cancel ≠ structural dismiss.

## 3. Cart line + summary matrix

| UI Element | Canonical | Denied | Granted |
| --- | --- | --- | --- |
| Header / title | `pos.new_sale.chrome.header` (or cart summary/lines) | absent | Current Sale |
| Item/line counts | `pos.cart.summary.item_count` | absent | Lines • Items |
| Lines list | `pos.cart.lines.list` | list absent | rows |
| Line name | `pos.cart.lines.name` | absent | identity |
| Line qty | `pos.cart.lines.quantity` | absent | stepper |
| Unit price | `pos.cart.lines.unit_price` | absent | price |
| Line total | `pos.cart.lines.line_total` | absent | total |
| Line note | `pos.cart.lines.note` | absent | note |
| Line image | `pos.cart.lines.image` | absent | thumb |
| Summary container | `pos.cart.summary.view` | shrink | children gated |
| Subtotal | `pos.cart.summary.subtotal` | absent | row |
| Discount | `pos.cart.summary.discount` | absent | row |
| Tax | `pos.cart.summary.tax` | absent | row |
| Total | `pos.cart.summary.total` | absent from payment bar | Total label/amount |
| Empty message | `pos.new_sale.chrome.empty_cart` | absent | empty state |
| Clear Cart trigger | `pos.new_sale.chrome.clear_cart_action` / `pos.sales.cart.clear` | absent | action |
| Proceed Payment | `pos.new_sale.chrome.checkout_action` (+ checkout execute) | absent | button |
| Line count independent of item count | **NO_CANONICAL_MAPPING** | N/A | both shown under `item_count` chip |

Removed prior transparent `Qty N` semantics leak on cart rows.

## 4. Clear Cart dialog matrix

| Element | Mapping | Behaviour |
| --- | --- | --- |
| Trigger | clear_cart_action / cart.clear | absent when denied |
| Dialog container / title / message | **NO_CANONICAL_MAPPING** | no invented codes; dialog only opens from permitted trigger |
| Confirm | same clear capability (re-checked) | Confirm absent/unreachable when denied |
| Cancel / barrier dismiss | **STRUCTURAL** | always available — not business Clear |

## 5. Park Sale popup matrix

| Element | Canonical | Denied | Granted |
| --- | --- | --- | --- |
| Popup | `pos.held_sales.popup.view` (+ create compat) | does not open | form |
| Reference | `pos.held_sales.popup.reference` | absent | card |
| Note (view+entry share) | `pos.held_sales.popup.note` | absent | field |
| Note view vs entry split | **NO_CANONICAL_MAPPING** | N/A | single `note` code |
| Expiry | `pos.held_sales.popup.expiry` | absent | banner |
| Confirm Park | `pos.sales.held_sales.create` (+ legacy) | submit absent + no service call | Park Sale |
| Cancel / Close | **STRUCTURAL** | kept | dismiss |

## 6. Held Sales field / filter / action / pagination / summary

| Element | Canonical | Notes |
| --- | --- | --- |
| List access | `pos.sales.held_sales.view` | existing |
| Active count | `pos.held_sales.list.active_count` | gated |
| Reference | **NO_CANONICAL_MAPPING** independent | identity always shown when card renders |
| Customer | `pos.held_sales.list.customer` | gated |
| Value | `pos.held_sales.list.value` | gated |
| Item count | `pos.held_sales.list.item_count` | gated |
| Parked time | `pos.held_sales.list.parked_time` | gated |
| Expiry time | `pos.held_sales.list.expiry_time` | gated |
| Items preview | `pos.held_sales.list.items` | gated |
| Filters strip (Today/This Shift/All) | `pos.held_sales.list.filters` | **single code** — independent chip codes NO_CANONICAL_MAPPING |
| Refresh | **REUSE** `held_sales.view` | no independent refresh code |
| Details | **REUSE** `held_sales.view` | View Details gated |
| Cancel | `pos.sales.held_sales.cancel` **exact** | Create alone ≠ Cancel |
| Recall | `pos.sales.held_sales.recall` **exact** | View alone ≠ Recall |
| Pagination (Prev/Next/Page) | `pos.held_sales.list.pagination` | **single code** — independent Prev/Next/PageSelect NO_CANONICAL_MAPPING |
| Summary values (count+value) | `pos.held_sales.list.summary` | container does not invent children codes; one sensitive field covers metrics |
| Start New Sale | `pos.sales.new_sale.view` | independent; absent when denied (not disabled) |

### Sort decision

| Question | Answer |
| --- | --- |
| Held Sort independent code | **NO** → `NO_CANONICAL_MAPPING` |
| Catalog Sort code | `pos.catalog.sections.sort` exists |
| Catalog Sort UI surface | **NO_UI_SURFACE** in current New Sale (no Sort control) |
| Final behaviour | Do not invent Held Sort; do not invent UI for unused catalog sort |

## 7. Structural dismiss vs business Cancel

Always: permission first, then business state.

Modal usability: barrier / system back / Escape / required Close remain so users are never trapped when business Cancel chrome is denied.

## 8. Permission refresh

All gates read `effectivePermissionSetProvider` — revoke/grant updates without app restart.

## 9. Accessibility / alternate action

- Denied fields omitted from widget tree and Semantics (no Opacity/Offstage placeholders).
- Cart removed font-size-0 Qty leak.
- Variant select denied → non-interactive Chip (no onSelected).
- Add/Clear/Park/Details/Cancel/Recall: no alternate gesture when permission denied.

## 10. Phone / Tablet / Desktop

Same `effectivePermissionSetProvider` / `PosSalesPermissionVisibility` helpers — layout only differs. No device-specific authorization.

## 11. Full-access regression

With compatibility child permissions present, Product Detail / Cart / Clear / Park / Held preserve prior authorized UX (tests updated fixtures accordingly).

## 12. Remaining Chunk 10 gaps

**NONE** (catalog-faithful; undocumented independent children classified NO_CANONICAL_MAPPING / REUSE / NO_UI_SURFACE without inventing codes).

## 13. Chunk 11

**NOT STARTED.** Payments UI rollout deferred.

## Explicit non-scope (unchanged)

Payment / Customers / Orders feature screens / Cash Drawer / Till screens / route-guard overhaul / Tenant Admin UI.
