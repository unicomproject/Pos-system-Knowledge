<!-- title: Cashier POS Canonical Permission Registry — Chunk 12 -->
<!-- status: Active — Customers / Receipt History / Online Orders / Returns Visibility -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-05 -->

# Cashier POS Canonical Permission Registry — Chunk 12

## Result

| Field | Value |
| --- | --- |
| Result | **PASS** |
| New canonical codes | **0** |
| Backend / DB / seed changes | **NONE** |
| Cash Drawer / Till rollout | **NOT implemented (Chunk 13)** |
| Full route-guard overhaul | **NOT implemented** |

## 1. Architecture

```
Backend Chunk 5 effective permissions
  → AuthSession.permissionCodes
  → Chunk 8 EffectivePermissionSet
  → PosCustomersOrdersReturnsVisibility / PosPermissionAccess exact membership
  → PermissionGate / filter-before-build UI
```

Denied = widget absent (no disabled permission placeholder, no lock icon, no blank column).
Backend Chunk 6/7 remain final authorities for actions and sensitive DTO values.
Flutter does not recompute parent→child grants.

## 2. Domain classification

| Surface | Route | Classification |
| --- | --- | --- |
| Bottom Nav “Orders” | `/pos/orders` | Receipt / transaction history (`PosReceiptHistoryScreen`) — `pos.receipts.digital.view` (+ detail children) |
| Online Orders | `/pos/online-orders` | Commerce click & collect — `commerce.online_order.*` |
| Customers | `/pos/customers` | `pos.customers.management.*` + list/history children |
| Returns | `/pos/returns-refunds` (+ flow) | `pos.returns.search_sale.view` + `pos.returns.workflow.create` (+ legacy create/view) |

**Orders ≠ Online Orders** — permissions must not be mixed.

## 3. Customers — mappings

| Element | Exact Canonical | Denied |
| --- | --- | --- |
| Screen | `pos.customers.management.view` (+ legacy) | Forbidden screen |
| Search | `pos.customers.list.search` | search input absent |
| Filters | `pos.customers.list.filters` | filter strip absent |
| Pagination | `pos.customers.list.pagination` | pagination absent |
| ID / Name / Phone / Email / Source / Status / Orders / Spend | `pos.customers.list.*` | column/cell absent |
| Joined | `pos.customers.details.joined_date` | absent |
| AOV | `pos.customers.details.average_order_value` | absent (UI may exist; API may null — no local AOV calc) |
| Recent / History / Amounts | `pos.customers.history.*` | section/amounts absent |
| Create | `pos.customers.management.create` | Add action absent |
| Update | `pos.customers.management.update` | Edit action absent |
| Attach | `pos.customers.management.attach_sale` | Attach / Add-to-Sale absent |
| Deactivate | `pos.customers.management.deactivate` | Deactivate absent |

### Attach independence

View alone does **not** authorize Attach.
Prior incorrect check (`view` + cart manage) replaced with exact `attach_sale`.
Checkout confirm/create-continue also requires `attach_sale`; button absent when denied.

### PII rule

View does not auto-expose phone/email/spend/history.
Permission denied → widget absent (not `—` / Hidden / £0.00).
Permission granted + API null → existing nullable `—` presentation.

Fake hard-coded phone/email defaults removed from detail panel.

## 4. Customer Deactivate audit

| | |
| --- | --- |
| Canonical | `pos.customers.management.deactivate` |
| Flutter UI | **YES** |
| Dedicated POS deactivate endpoint | **NO** (status update reuse) |
| Classification | **NO_ENDPOINT** for dedicated deactivate; UI gated by deactivate |

## 5. Receipt history (`/pos/orders`)

Screen: `pos.receipts.digital.view`.
List/detail fields: `pos.receipts.details.*` (number, cashier, terminal, payment, total, items, qty, rate, value, subtotal, discount, paid, change, store, customer where present).
Reprint: `pos.receipts.history.reprint` (+ legacy) — button absent when denied.
Print ≠ Reprint (Chunk 11 preserved).
Receipt access alone does not authorize Returns entry.

Tax row: **NO_CANONICAL_MAPPING** — omitted from gated detail to avoid unmapped financial leak.

## 6. Online Orders

Access (route/queue/detail feature pair):
- `commerce.online_order.orders.access`
- `commerce.online_order.orders.view`

Both are required (Flutter route guard + backend detail service). Access alone does **not** unlock the route.

Start Fulfilment: `commerce.online_order.fulfilment.start` (British spelling — **not** `fulfillment`).
Access/view alone does not render Start.

Continue Picking requires `commerce.online_order.picking.view`.
Picking/packing/collection actions already exact-gated on production surfaces.

### Runtime reconciliation (2026-09-06)

Root cause was **MIXED**:
1. **BACKEND_CATALOG_DRIFT** — Permission_Code_List commerce Online Order children were missing from `CashierPosCanonicalPermissionCatalog`, so Chunk 5 stripped them from JWT (`commerce.*` is a managed namespace).
2. **SEED_GRANT_MISMATCH** — historical seeds used legacy `pos.online_orders.*` while Flutter/APIs authorize `commerce.online_order.*`.
3. **SPELLING_MISMATCH** (docs only) — Chunk 12 previously wrote `fulfillment.start`; production canonical is `fulfilment.start`.

Fix: reconcile Existing catalog entries + migration `20260906140000_ReconcileCommerceOnlineOrderCanonicalPermissions` (definition upsert + legacy→canonical grant backfill). Route guard unchanged (still access AND view).

### Workflow gap classification

| Stage | Status | Permission rollout |
| --- | --- | --- |
| Queue | PRODUCTION_COMPLETE | Access+View gated (router + provider) |
| Detail | PRODUCTION_COMPLETE | Start/Continue gated |
| Start Fulfilment | PRODUCTION_COMPLETE | `fulfilment.start` |
| Picking / Pick Item | PRODUCTION_COMPLETE | picking.* |
| Issue Handling | PARTIAL | report_issue gated where UI exists |
| Review & Pack | PRODUCTION_COMPLETE | packing.* |
| Ready for Collection | PRODUCTION_COMPLETE | collection.mark_ready |

Fine-grained Online Order list field children beyond commerce action codes: largely **NO_CANONICAL_MAPPING** in Chunk 2 cashier splits.

## 7. Returns

Search/entry: `pos.returns.search_sale.view` (+ legacy view).
Mutations: `pos.returns.workflow.create` (+ legacy `returns.create`).
Refund/Exchange create codes used for branch selection.
View does not auto-grant mutation (route guard + screen checks).

### `pos.refund.approve`

| | |
| --- | --- |
| Flutter dedicated approval UI | **NO** |
| Backend complete path | unused / deferred (Chunk 6) |
| Status | **UNUSED / NO_UI_SURFACE** — not invented |

## 8. Runtime refresh

`effectivePermissionSetProvider` drives Customers / Receipt History widgets.
Revoke → fields/actions disappear without app restart.
Full route-guard overhaul deferred; if top-level screen permission disappears mid-session, child controls update and backend remains authority.

## 9. Multi-device

Same permission fixtures → same logical visibility helpers on Phone/Tablet/Desktop.
Layout may differ; permission results must not.

## 10. Canonical freeze

Added 0 / Removed 0 / Renamed 0 / Invented **NO**

## 11. NO_CANONICAL_MAPPING / NO_UI_SURFACE / NO_ENDPOINT

- Dedicated POS customer deactivate endpoint: **NO_ENDPOINT**
- `pos.refund.approve` UI: **NO_UI_SURFACE**
- Receipt Tax field: **NO_CANONICAL_MAPPING** (omitted in gated detail)
- Customer create form per-field children: **NO_CANONICAL_MAPPING** (create action only)
- Online Order list field fine children: **NO_CANONICAL_MAPPING** where catalog lacks cashier splits

## 12. Chunk 13 deferred

Cash Drawer / Till / Cash In-Out-Drop / Open-Close Till permission rollout — **NOT started**.
