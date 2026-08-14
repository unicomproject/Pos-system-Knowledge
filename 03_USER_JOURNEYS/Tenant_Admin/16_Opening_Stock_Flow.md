<!-- title: Tenant Admin Opening Stock Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->
<!-- canonical_id: TA-UJ-063 -->

# Tenant Admin Opening Stock Flow

**TA-UJ-063 — LOCKED FOR CURRENT INVENTORY RELEASE**

## Contract lock (current Inventory release)

```text
Journey contract: LOCKED FOR CURRENT INVENTORY RELEASE
Prototype: APPROVED
Implementation Audit: PASS
UI/UX Contract: LOCKED
Implementation Contract: LOCKED
Frontend Implementation: NOT STARTED
Backend Implementation: NOT STARTED
QA Execution: NOT STARTED
```

Canonical lock: [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Lock_Manifest]]

Canonical journey ID: **TA-UJ-063**  
Prototype grouping: INV-UJ-02  
Prototype screens: INV-UJ02-S01 … INV-UJ02-S04

## Purpose

Record the first on-hand quantity for a tracked SIMPLE product or VARIANT at one inventory location.

## Actor

Tenant Admin

## Current 29-screen implementation scope

IN SCOPE for this journey.

## Trigger

Tenant Admin opens Opening Stock from the Inventory dashboard quick action or Inventory module navigation.

## Preconditions

- Authenticated Tenant Admin.
- Feature entitlement `inventory_tracking`.
- Permission `inventory.opening_stock.manage`.
- Product/variant belongs to the tenant, is ACTIVE, `is_stock_tracked = true`.
- Product structure is SIMPLE or VARIANT (not BUNDLE).
- Location belongs to the tenant.
- No posted opening-stock entry already exists for the same tenant + location + product + variant.
- No prior `stock_movements` exist for that same balance key (SKU + location). If any movement exists, opening stock is rejected; use Receiving or Adjustment instead.

## Screen sequence

| Step | Screen ID | Prototype | User action | Stock mutation |
|---:|---|---|---|---|
| 1 | INV-UJ02-S01 | `04_opening_stock_select.html` | Select product and location | None |
| 2 | INV-UJ02-S02 | `05_opening_stock_enter.html` | Enter quantity, cost, date, optional batch/notes | None (Save Draft allowed) |
| 3 | INV-UJ02-S03 | `06_opening_stock_review.html` | Review; Edit returns to step 2 | None |
| 4 | Confirm post | same review CTA **Post Opening Stock** | Post | **Yes — on successful POST only** |
| 5 | INV-UJ02-S04 | `07_opening_stock_success.html` | View Stock / Add Another / Back to Dashboard | None |

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open Opening Stock | System shows select product & location. |
| 2 | Search/select product | System lists tracked SIMPLE/VARIANT products. |
| 3 | Select location | System lists tenant inventory locations (outlet/warehouse). |
| 4 | Continue | System requires product + location. |
| 5 | Enter opening quantity | Quantity must be > 0 in inventory UOM precision. |
| 6 | Enter unit cost, opening date, optional notes | Unit cost >= 0. Date required. |
| 7 | Enter batch/expiry if product requires batch/expiry | Required when tracking flags demand it; otherwise optional. |
| 8 | Save Draft (optional) | Persists DRAFT. No balance change. |
| 9 | Continue to Review | Shows preview: current 0, new qty, stock after posting. |
| 10 | Post Opening Stock | Atomic post: opening entry POSTED, balance created/updated, OPENING_STOCK movement, cost layer if cost provided, serials if required, audit. |
| 11 | Success | Shows reference number. View Stock → current stock. Add Another → step 1. Back to Dashboard → inventory dashboard. |

## Back / Cancel

- Back on enter/review returns to the previous wizard step. Draft is kept if saved.
- There is no separate Cancel on opening-stock wizard except leaving the module via shell navigation. Unposted DRAFT remains DRAFT.
- Review **Edit Details** returns to enter screen.

## Failure / Retry

- Validation 400, business 422, duplicate opening 409, concurrency 409, permission 403.
- Retry of the same `Idempotency-Key` returns the original posted result without a second movement.

## Data Used Or Captured

Product, variant (if VARIANT), location, opening quantity, unit cost, opening date, notes, optional batch number, optional expiry, reference number (system), posted by, posted at.

## Access And Security Rules

- Tenant isolation on every identifier.
- Backend authorization is authoritative.
- Audit on post.

## Outcome

Posted opening stock becomes on-hand at the location. Available is derived from the quantity model.

## Related Files

- 07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Approved_UI_Prototype.md
- 04_MODULE_KNOWLEDGE/16_Inventory_Foundation_Stock_Availability/02_Inventory_Business_Rules.md
