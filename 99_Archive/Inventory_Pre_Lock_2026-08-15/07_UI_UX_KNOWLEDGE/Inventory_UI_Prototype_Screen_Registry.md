<!-- title: Inventory UI Prototype Screen Registry -->
<!-- status: PROTOTYPE APPROVED -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->
<!-- doc_type: UI prototype screen registry — documentation only -->

# Inventory UI Prototype Screen Registry

Status: PROTOTYPE APPROVED  
Prototype Version: v1.0  
Screen Count: 29/29  
User Journeys (prototype grouping): 5  
Implementation Audit: PASS  
UI/UX Lock: NOT LOCKED — READY TO LOCK  
Frontend: NOT STARTED  
Backend: NOT STARTED

Master specification: [[Tenant_Admin_Inventory_Approved_UI_Prototype]]  
Implementation audit: [[Tenant_Admin_Inventory_Implementation_Audit]]

Canonical prototype folder:

```text
07_UI_UX_KNOWLEDGE/prototypes/inventory_ui_prototype_29_screens/inventory_html_prototype/
```

Canonical files are the **root** HTML screens (`01_` … `29_`). `standalone/` copies are secondary. `index.html` is the pack navigator, not a production screen.

All 29 screens:

```text
Prototype Status: PROTOTYPE APPROVED
Implementation Audit: PASS
UI/UX Lock: NOT LOCKED
```

Visible components below are taken from the approved HTML. Sample product names, dates, quantities, and currency figures are prototype fixture data, not business rules.

Shared chrome (every screen unless noted): OneVerz POS top bar, till session OPEN, outlet selector, till selector, notification bell, Settings sidebar with Inventory active, Settings/Inventory breadcrumb, bottom nav (Home / New Sale / Orders / Customers / Settings).

Previous/Next is **journey-intent**. HTML files are not hyperlinked between steps. See GAP-INV-010.

---

## Registry summary

| Screen ID | Journey ID | Prototype File | Screen Name |
|---|---|---|---|
| INV-UJ01-S01 | INV-UJ-01 | `01_inventory_dashboard.html` | Inventory Dashboard |
| INV-UJ01-S02 | INV-UJ-01 | `02_current_stock.html` | Current Stock |
| INV-UJ01-S03 | INV-UJ-01 | `03_product_stock_detail.html` | Product Stock Detail |
| INV-UJ02-S01 | INV-UJ-02 | `04_opening_stock_select.html` | Opening Stock — Select Product & Outlet |
| INV-UJ02-S02 | INV-UJ-02 | `05_opening_stock_enter.html` | Opening Stock — Enter Quantity |
| INV-UJ02-S03 | INV-UJ-02 | `06_opening_stock_review.html` | Opening Stock — Review |
| INV-UJ02-S04 | INV-UJ-02 | `07_opening_stock_success.html` | Opening Stock — Success |
| INV-UJ03-S01 | INV-UJ-03 | `08_stock_receiving_dashboard.html` | Stock Receiving Dashboard |
| INV-UJ03-S02 | INV-UJ-03 | `09_new_stock_receipt_select.html` | New Stock Receipt — Select Product |
| INV-UJ03-S03 | INV-UJ-03 | `10_receiving_enter_details.html` | Receiving — Enter Details |
| INV-UJ03-S04 | INV-UJ-03 | `11_receiving_review.html` | Receiving — Review Stock Receipt |
| INV-UJ03-S05 | INV-UJ-03 | `12_receiving_confirm.html` | Receiving — Confirm Receive |
| INV-UJ03-S06 | INV-UJ-03 | `13_receiving_success.html` | Receiving — Success |
| INV-UJ03-S07 | INV-UJ-03 | `14_serial_number_registry.html` | Serial Number Registry |
| INV-UJ04-S01 | INV-UJ-04 | `15_stock_adjustment_dashboard.html` | Stock Adjustment Dashboard |
| INV-UJ04-S02 | INV-UJ-04 | `16_stock_adjustment_select.html` | New Stock Adjustment — Select Product |
| INV-UJ04-S03 | INV-UJ-04 | `17_stock_adjustment_enter.html` | Stock Adjustment — Enter Adjustment |
| INV-UJ04-S04 | INV-UJ-04 | `18_stock_adjustment_review.html` | Stock Adjustment — Review |
| INV-UJ04-S05 | INV-UJ-04 | `19_stock_adjustment_success.html` | Stock Adjustment — Success |
| INV-UJ05-S01 | INV-UJ-05 | `20_channel_allocation_dashboard.html` | Channel Stock Allocation Dashboard |
| INV-UJ05-S02 | INV-UJ-05 | `21_channel_select_source.html` | New Channel Allocation — Select Source |
| INV-UJ05-S03 | INV-UJ-05 | `22_channel_search_product.html` | Search Existing Product |
| INV-UJ05-S04 | INV-UJ-05 | `23_channel_product_details.html` | Product Allocation Details |
| INV-UJ05-S05 | INV-UJ-05 | `24_channel_select_channels.html` | Select Sales Channels |
| INV-UJ05-S06 | INV-UJ-05 | `25_channel_enter_quantity.html` | Enter Allocation Quantity |
| INV-UJ05-S07 | INV-UJ-05 | `26_channel_review.html` | Review Channel Allocation |
| INV-UJ05-S08 | INV-UJ-05 | `27_channel_confirm.html` | Confirm Allocation |
| INV-UJ05-S09 | INV-UJ-05 | `28_channel_success.html` | Allocation Completed Successfully |
| INV-UJ05-S10 | INV-UJ-05 | `29_channel_allocation_detail.html` | Allocation Details |

---

# INV-UJ-01 — Inventory Overview / Current Stock

Closest canonical journey: TA-UJ-045. Flow: `10_Inventory_Stock_Management_Flow.md`.

---

## INV-UJ01-S01 — Inventory Dashboard

Journey:  
INV-UJ-01 Inventory Overview / Current Stock

Prototype:  
`01_inventory_dashboard.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Give the Tenant Admin a dashboard overview of inventory health and entry points to inventory actions.

Primary Visible Components:

- Page header (“Inventory Dashboard”)
- Inventory navigation (Settings sidebar, Inventory active)
- Metric cards: Low Stock Items, Out of Stock, Near Expiry, Active Stock Counts
- Quick-action cards: Current Stock, Opening Stock, Stock Adjustment, Stock Count
- Priority Alerts list (product, SKU, outlet, severity, View / Resolve)
- Recent Activity list
- Links labeled View All Alerts / View All

Primary User Action:  
Review inventory health and choose a quick action (Current Stock is the next screen in this journey).

Previous Screen:  
None (module entry)

Next Screen:  
INV-UJ01-S02 (Current Stock)

Notes:  
Quick actions also visually branch to Opening Stock (INV-UJ-02) and Stock Adjustment (INV-UJ-04). Stock Count tile has no screen in this pack (GAP-INV-005). Receiving and Channel Allocation are not dashboard tiles (GAP-INV-005). Sample alert/activity rows are fixture data.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ01-S02 — Current Stock

Journey:  
INV-UJ-01 Inventory Overview / Current Stock

Prototype:  
`02_current_stock.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Show current stock levels across products with on-hand / available / low-stock summary.

Primary Visible Components:

- Page header (“Current Stock”)
- Filter action
- Summary metrics: On Hand, Available, Low Stock
- Product stock list (image, name, SKU, available qty, status In Stock / Low Stock, View)
- Inventory navigation

Primary User Action:  
Open a product’s stock detail via View.

Previous Screen:  
INV-UJ01-S01

Next Screen:  
INV-UJ01-S03

Notes:  
No search field is visually prominent besides Filter. List is a product-level current-stock view, not a full movement history.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ01-S03 — Product Stock Detail

Journey:  
INV-UJ-01 Inventory Overview / Current Stock

Prototype:  
`03_product_stock_detail.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Show detailed stock information and recent movements for one product.

Primary Visible Components:

- Breadcrumb: Settings / Inventory / Current Stock / Product Detail
- Product banner (name, SKU, variant, category, status)
- Actions: View Batches, Adjust Stock
- Stock strip: On Hand, Reserved, Available, Reorder Level
- Outlet Balances list
- Recent Movements list with View All

Primary User Action:  
Review product stock by outlet, or start Adjust Stock / View Batches.

Previous Screen:  
INV-UJ01-S02

Next Screen:  
None in INV-UJ-01. Adjust Stock visually leads toward INV-UJ-04.

Notes:  
View Batches has no dedicated prototype screen in this pack. Recent Movements is a panel, not TA-UJ-050.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

# INV-UJ-02 — Opening Stock

Canonical journey: **TA-UJ-063**. See `16_Opening_Stock_Flow.md`.

Stepper (screens 04–07): Select Product & Outlet → Enter Quantity → Review → Success

---

## INV-UJ02-S01 — Opening Stock: Select Product & Outlet

Journey:  
INV-UJ-02 Opening Stock

Prototype:  
`04_opening_stock_select.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Let the Tenant Admin select a product and outlet before entering opening-stock quantities.

Primary Visible Components:

- Page header (“Opening Stock”)
- Step indicator (step 1 active)
- Product search (name, SKU, or scan barcode)
- Product radio list
- Outlet cards (Main Outlet, Warehouse, Outlet 03)
- Selection Summary (selected product + outlet)
- Save Draft
- Continue

Primary User Action:  
Select product and outlet, then Continue.

Previous Screen:  
INV-UJ01-S01 (Opening Stock quick action) or module entry

Next Screen:  
INV-UJ02-S02

Notes:  
Save Draft is visible; draft behaviour is not specified in existing journey docs.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ02-S02 — Opening Stock: Enter Stock

Journey:  
INV-UJ-02 Opening Stock

Prototype:  
`05_opening_stock_enter.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Allow the Tenant Admin user to enter opening-stock quantities for the selected product/outlet.

Primary Visible Components:

- Page header
- Inventory navigation
- Step indicator (step 2 Enter Quantity)
- Selected product and outlet summary
- Opening Quantity, Unit Cost, Opening Date
- Notes (optional)
- Batch Details (optional): Batch Number, Expiry Date
- Stock Summary (Current / New Opening Qty / Stock After Posting)
- Back
- Save Draft
- Continue to Review

Primary User Action:  
Enter opening quantity and related fields, then continue to review.

Previous Screen:  
INV-UJ02-S01

Next Screen:  
INV-UJ02-S03

Notes:  
Unit cost and optional batch fields are visible in the prototype. Do not invent posting/costing rules here.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ02-S03 — Opening Stock: Review

Journey:  
INV-UJ-02 Opening Stock

Prototype:  
`06_opening_stock_review.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Review opening-stock details before posting.

Primary Visible Components:

- Page header (“Review Opening Stock”)
- Step indicator (step 3 Review)
- Product Summary
- Opening Details (quantity, unit cost, date)
- Outlet Summary
- Batch Details
- Stock Impact (current → new)
- Completeness note
- Back
- Edit Details
- Post Opening Stock

Primary User Action:  
Post opening stock, or edit details.

Previous Screen:  
INV-UJ02-S02

Next Screen:  
INV-UJ02-S04

Notes:  
Posting confirmation and inventory-update rules are not defined in this registry.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ02-S04 — Opening Stock: Success

Journey:  
INV-UJ-02 Opening Stock

Prototype:  
`07_opening_stock_success.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Confirm that opening stock was posted and show a reference summary.

Primary Visible Components:

- Success mark and heading (“Opening Stock Posted Successfully”)
- Summary panel: Reference No., Opening Qty, Product, New Stock, Outlet, Posted On
- View Stock
- Add Another
- Back to Dashboard (text/action)

Primary User Action:  
View stock, add another opening-stock entry, or return to dashboard.

Previous Screen:  
INV-UJ02-S03

Next Screen:  
INV-UJ01-S02 (View Stock) or INV-UJ02-S01 (Add Another) or INV-UJ01-S01 (Back to Dashboard)

Notes:  
Reference number format in the prototype is fixture data.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

# INV-UJ-03 — Stock Receiving

Canonical journey: TA-UJ-046 Stock Receiving (alias Stock In). Flow: `12_Stock_In_Flow.md`.

---

## INV-UJ03-S01 — Stock Receiving Dashboard

Journey:  
INV-UJ-03 Stock Receiving

Prototype:  
`08_stock_receiving_dashboard.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Overview of incoming stock receipts and a start point for a new receipt.

Primary Visible Components:

- Page header (“Stock Receiving”)
- Receive Stock action
- Metrics: Today’s Receipts, Pending Review, Received Qty, Recent Suppliers
- Recent Receipts table (Receipt No., Supplier, Date, Outlet, Status, View)
- Pagination
- Quick Actions: Start New Receipt, View Recent Receipts, Low Stock Alerts
- Today’s Summary (receipts, quantity, value)

Primary User Action:  
Start a new receipt (Receive Stock / Start New Receipt).

Previous Screen:  
INV-UJ01-S01 (no dashboard tile; entry path is not shown on the inventory dashboard — GAP-INV-005)

Next Screen:  
INV-UJ03-S02

Notes:  
Supplier and monetary summary are visible. Stock In flow says full supplier management may be out of MVP (GAP-INV-014).

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ03-S02 — New Stock Receipt: Select Product

Journey:  
INV-UJ-03 Stock Receiving

Prototype:  
`09_new_stock_receipt_select.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Select product(s), receiving outlet, and receiving mode to start a stock receipt.

Primary Visible Components:

- Page header (“New Stock Receipt”)
- Step indicator (Select Product → Enter Details → Review → Success)
- Receiving Outlet
- Receiving Mode (sample: Purchase Receipt)
- Product list with current stock and Select
- Receipt Summary
- Back
- Continue (shown disabled in the prototype until selection)

Primary User Action:  
Select a product and continue.

Previous Screen:  
INV-UJ03-S01

Next Screen:  
INV-UJ03-S03

Notes:  
Stepper shows four steps; Confirm and Serial Registry are extra screens (GAP-INV-011).

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ03-S03 — Receiving: Enter Details

Journey:  
INV-UJ-03 Stock Receiving

Prototype:  
`10_receiving_enter_details.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Enter received quantity and receipt details for the selected product/outlet.

Primary Visible Components:

- Page header (“Enter Receiving Details”)
- Step indicator (step 2 Enter Details)
- Product / outlet / current stock banner
- Received Quantity, Unit Cost, Supplier, Invoice Number, Received Date, Notes
- Batch Information (Batch Number, Expiry Date) with “Batch Tracking Enabled”
- Stock Impact panel
- Back
- Continue to Review

Primary User Action:  
Complete receiving fields and continue to review.

Previous Screen:  
INV-UJ03-S02

Next Screen:  
INV-UJ03-S04

Notes:  
Fields shown are UI only. Validation and costing rules are not invented here (GAP-INV-014).

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ03-S04 — Receiving: Review Stock Receipt

Journey:  
INV-UJ-03 Stock Receiving

Prototype:  
`11_receiving_review.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Review receipt header and line items before confirm.

Primary Visible Components:

- Page header (“Review Stock Receipt”)
- Step indicator (Review)
- Receiving Information (outlet, mode, supplier, PO, invoice, delivery date)
- Product Summary table (SKU, current stock, received qty, new stock, batch, expiry)
- Notes
- Receipt summary area
- Edit Receipt
- Confirm Receive

Primary User Action:  
Confirm receive, or edit the receipt.

Previous Screen:  
INV-UJ03-S03

Next Screen:  
INV-UJ03-S05

Notes:  
Review table shows multiple product lines; the enter-details screen shows one product. Line-count behaviour is an audit topic, not resolved here.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ03-S05 — Receiving: Confirm Receive

Journey:  
INV-UJ-03 Stock Receiving

Prototype:  
`12_receiving_confirm.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Final confirmation before inventory is updated for the receipt.

Primary Visible Components:

- Page header (“Confirm Receive”)
- Product banner and metadata
- Outlet, supplier, invoice, quantity received, current stock, new stock, unit cost
- Confirmation note
- Receiving Reference panel
- Final Checklist
- Back
- Cancel
- Confirm Receive

Primary User Action:  
Confirm receive, or cancel/back.

Previous Screen:  
INV-UJ03-S04

Next Screen:  
INV-UJ03-S06

Notes:  
This confirm step is not labelled on the four-step stepper (GAP-INV-011). Sample product on this screen differs from earlier receiving screens (fixture inconsistency for audit).

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ03-S06 — Receiving: Success

Journey:  
INV-UJ-03 Stock Receiving

Prototype:  
`13_receiving_success.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Confirm stock was received and inventory updated.

Primary Visible Components:

- Success heading (“Stock Received Successfully!”)
- Receiving reference and Completed status
- Product / outlet
- Previous Stock / New Stock
- Supplier, invoice, date/time
- View Stock
- Receive Another
- Print Receipt

Primary User Action:  
View stock, receive another, or print receipt.

Previous Screen:  
INV-UJ03-S05

Next Screen:  
INV-UJ01-S02 (View Stock) or INV-UJ03-S02 (Receive Another). Serial registry is a related screen, not the linear next step.

Notes:  
Print Receipt is a visible action; print implementation is not specified.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ03-S07 — Serial Number Registry

Journey:  
INV-UJ-03 Stock Receiving (pack grouping)

Prototype:  
`14_serial_number_registry.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Browse and manage serialized inventory items across outlets.

Primary Visible Components:

- Page header (“Serial Number Registry”)
- Back control
- Add Serial Range, Import Serials, Export, overflow menu
- Search and filters (outlet, status, product)
- Metrics: Total Serials, In Stock, Reserved, Sold
- Serial table (serial, product, variant, outlet, stock status, batch, added on, warranty, actions)
- Detail drawer actions: Edit Serial, Print Label, Mark as Sold

Primary User Action:  
Search/filter serials, or use add/import/export/edit/print/mark-as-sold actions.

Previous Screen:  
INV-UJ03-S01 or INV-UJ03-S06 (related, not a strict wizard step)

Next Screen:  
None in the linear receiving wizard

Notes:  
Grouped under receiving in the 29-screen pack, but the UI is a broader serial registry (GAP-INV-011). Do not invent serial lifecycle rules here.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

# INV-UJ-04 — Stock Adjustment

Closest canonical journey: TA-UJ-047. Flow: `11_Stock_Adjustment_Flow.md`.

---

## INV-UJ04-S01 — Stock Adjustment Dashboard

Journey:  
INV-UJ-04 Stock Adjustment

Prototype:  
`15_stock_adjustment_dashboard.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
List and manage stock adjustments; start a new adjustment.

Primary Visible Components:

- Page header (“Stock Adjustment”)
- New Adjustment action
- Search and Filter
- Metrics: Pending Approval, Draft Adjustments, Posted Today
- Adjustment table (Reference, Product, Outlet, Reason, Adjustment, Status, Date & Time, View)

Primary User Action:  
Start New Adjustment, or view an existing adjustment.

Previous Screen:  
INV-UJ01-S01 (Stock Adjustment quick action) or INV-UJ01-S03 (Adjust Stock)

Next Screen:  
INV-UJ04-S02

Notes:  
Draft / Pending Approval / Posted are visible statuses not described in flow 11 (GAP-INV-015).

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ04-S02 — New Stock Adjustment: Select Product

Journey:  
INV-UJ-04 Stock Adjustment

Prototype:  
`16_stock_adjustment_select.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Select the product to adjust.

Primary Visible Components:

- Page header (“New Stock Adjustment”)
- Step indicator (Select Product → Enter Adjustment → Review & Post)
- Scan Barcode
- Product list with On Hand / Available
- Selected Product summary
- Back
- Continue

Primary User Action:  
Select a product and continue.

Previous Screen:  
INV-UJ04-S01

Next Screen:  
INV-UJ04-S03

Notes:  
Outlet selection is not a dedicated step on this screen; outlet appears on the enter screen.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ04-S03 — Stock Adjustment: Enter Adjustment

Journey:  
INV-UJ-04 Stock Adjustment

Prototype:  
`17_stock_adjustment_enter.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Enter increase/decrease quantity, reason, and notes for the selected product/outlet.

Primary Visible Components:

- Page header (“New Stock Adjustment”)
- Step indicator (step 2 Enter Adjustment)
- Product / outlet banner
- On Hand, Reserved, Available
- Increase Stock / Decrease Stock
- Reason, Adjustment Date, Quantity stepper, Notes
- Adjustment Summary (On-Hand After, Available After)
- Warning note about reserved quantity
- Back, Save Draft, Review Adjustment

Primary User Action:  
Enter adjustment details and continue to review.

Previous Screen:  
INV-UJ04-S02

Next Screen:  
INV-UJ04-S04

Notes:  
Reserved-stock warning is visible UI copy, not a locked business rule.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ04-S04 — Stock Adjustment: Review

Journey:  
INV-UJ-04 Stock Adjustment

Prototype:  
`18_stock_adjustment_review.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Review adjustment details and post.

Primary Visible Components:

- Page header (“Review Stock Adjustment”)
- Step indicator (Review & Post)
- Product Summary
- Adjustment Details (type, reason, quantity, date, notes)
- Stock Impact
- Stock Validation note
- Back
- Edit Adjustment
- Post Adjustment

Primary User Action:  
Post the adjustment, or edit.

Previous Screen:  
INV-UJ04-S03

Next Screen:  
INV-UJ04-S05

Notes:  
Approval vs immediate post is not decided here (GAP-INV-015).

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ04-S05 — Stock Adjustment: Success

Journey:  
INV-UJ-04 Stock Adjustment

Prototype:  
`19_stock_adjustment_success.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Confirm the adjustment was posted.

Primary Visible Components:

- Success heading (“Stock Adjustment Posted Successfully”)
- Reference Number, Posted On, Product, On-Hand After, Outlet, Available After, Reason, Updated By, Adjustment
- View Adjustments
- New Adjustment
- Back to Dashboard

Primary User Action:  
Return to the adjustment list, start another adjustment, or go to the inventory dashboard.

Previous Screen:  
INV-UJ04-S04

Next Screen:  
INV-UJ04-S01 (View Adjustments / New Adjustment) or INV-UJ01-S01 (Back to Dashboard)

Notes:  
Reference format is fixture data.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

# INV-UJ-05 — Channel Stock Allocation

Canonical journey: **TA-UJ-064**. See `17_Channel_Stock_Allocation_Flow.md`. Canonical stepper in that flow (GAP-INV-012 RESOLVED).

---

## INV-UJ05-S01 — Channel Stock Allocation Dashboard

Journey:  
INV-UJ-05 Channel Stock Allocation

Prototype:  
`20_channel_allocation_dashboard.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Overview of channel allocations and a start point for a new allocation.

Primary Visible Components:

- Page header (“Channel Stock Allocation”)
- New Allocation, Export, View Rules
- Metrics: Total Allocated Today, Pending Review, Active Channels, Low Buffer Alerts
- Search and filters (source location, channels, status)
- Recent Allocations table
- Allocation Summary
- Helpful Tip about safety buffer

Primary User Action:  
Start New Allocation, or open an allocation row (detail).

Previous Screen:  
None shown on Inventory Dashboard (GAP-INV-005)

Next Screen:  
INV-UJ05-S02 (new) or INV-UJ05-S10 (existing row)

Notes:  
View Rules has no dedicated prototype screen in this pack.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ05-S02 — New Channel Allocation: Select Source

Journey:  
INV-UJ-05 Channel Stock Allocation

Prototype:  
`21_channel_select_source.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Choose the outlet or warehouse to allocate stock from.

Primary Visible Components:

- Page header (“New Channel Allocation”)
- Step indicator
- Source location cards (stock health labels)
- Allocation Setup summary (source, product, channels, total qty)
- Back
- Continue

Primary User Action:  
Select a source location and continue.

Previous Screen:  
INV-UJ05-S01

Next Screen:  
INV-UJ05-S03

Notes:  
Sample addresses are fixture data.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ05-S03 — Search Existing Product

Journey:  
INV-UJ-05 Channel Stock Allocation

Prototype:  
`22_channel_search_product.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Find and select a product to allocate to sales channels.

Primary Visible Components:

- Page header (“Search Existing Product”)
- Source chip
- Step indicator
- Scan
- Product list (name, SKU, category, available stock, Select)
- Allocation Summary
- Helpful Tip
- Back
- Continue

Primary User Action:  
Select a product and continue.

Previous Screen:  
INV-UJ05-S02

Next Screen:  
INV-UJ05-S04

Notes:  
Stepper labels on this screen differ from neighbouring screens (GAP-INV-012).

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ05-S04 — Product Allocation Details

Journey:  
INV-UJ-05 Channel Stock Allocation

Prototype:  
`23_channel_product_details.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Review product stock figures before choosing channels.

Primary Visible Components:

- Page header (“Product Allocation Details”)
- Step indicator
- Product stock figures: current, reserved, available, already allocated, reorder level
- Available to Allocate
- Safety Buffer
- Active Channels
- Allocation Rules list
- Setup Summary
- Back
- Continue

Primary User Action:  
Review details and continue.

Previous Screen:  
INV-UJ05-S03

Next Screen:  
INV-UJ05-S05

Notes:  
Allocation-rule bullets are visible UI copy, not locked business rules.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ05-S05 — Select Sales Channels

Journey:  
INV-UJ-05 Channel Stock Allocation

Prototype:  
`24_channel_select_channels.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Choose sales channels that should receive allocation.

Primary Visible Components:

- Page header (“Select Sales Channels”)
- Step indicator
- Channel cards: POS, Online Store, Click & Collect, Delivery, Marketplace (Beta, disabled)
- Note that disabled channels cannot receive allocation
- Allocation Summary
- Back
- Continue

Primary User Action:  
Select channels and continue.

Previous Screen:  
INV-UJ05-S04

Next Screen:  
INV-UJ05-S06

Notes:  
Marketplace (Beta) is shown disabled. Channel set vs MVP channel scope is an audit topic.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ05-S06 — Enter Allocation Quantity

Journey:  
INV-UJ-05 Channel Stock Allocation

Prototype:  
`25_channel_enter_quantity.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Assign quantity to each selected sales channel, including safety buffer.

Primary Visible Components:

- Page header (“Enter Allocation Quantity”)
- Step indicator
- Product / available stock / source
- Per-channel quantity steppers
- Safety Buffer stepper
- Totals: Total Allocated, Remaining Stock, Available Stock
- Validity note
- Back
- Continue

Primary User Action:  
Enter quantities and continue to review.

Previous Screen:  
INV-UJ05-S05

Next Screen:  
INV-UJ05-S07

Notes:  
Quantity math on screen is fixture demonstration, not a locked calculation spec.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ05-S07 — Review Channel Allocation

Journey:  
INV-UJ-05 Channel Stock Allocation

Prototype:  
`26_channel_review.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Review allocation breakdown and validation checks before confirm.

Primary Visible Components:

- Page header (“Review Channel Allocation”)
- Step indicator
- Source, product, allocation ref (DRAFT), effective date
- Channel Allocation Breakdown (with percentages)
- Safety Buffer
- Stock Summary
- Validation Checks
- Back
- Edit
- Confirm Allocation

Primary User Action:  
Confirm allocation, or edit.

Previous Screen:  
INV-UJ05-S06

Next Screen:  
INV-UJ05-S08

Notes:  
Validation checks are visible UI, not an invented rule set.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ05-S08 — Confirm Allocation

Journey:  
INV-UJ-05 Channel Stock Allocation

Prototype:  
`27_channel_confirm.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Final confirmation before channel stock is updated.

Primary Visible Components:

- Page header (“Confirm Allocation”)
- Step indicator (Confirmation)
- Source, product, selected channels, total allocated, safety buffer, allocation reference
- Stock Update Summary
- Channels Included
- Cancel
- Confirm Allocation

Primary User Action:  
Confirm allocation, or cancel.

Previous Screen:  
INV-UJ05-S07

Next Screen:  
INV-UJ05-S09

Notes:  
None beyond GAP-INV-012 stepper wording.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ05-S09 — Allocation Completed Successfully

Journey:  
INV-UJ-05 Channel Stock Allocation

Prototype:  
`28_channel_success.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
Confirm channel allocation is active.

Primary Visible Components:

- Success heading (“Allocation Completed Successfully!”)
- Allocation reference, product, source, posted on
- Channel Allocation Breakdown including Safety Buffer
- View Allocation
- Allocate Another
- Back to Dashboard

Primary User Action:  
View allocation detail, allocate another, or return to the allocation dashboard.

Previous Screen:  
INV-UJ05-S08

Next Screen:  
INV-UJ05-S10 (View Allocation) or INV-UJ05-S02 (Allocate Another) or INV-UJ05-S01 (Back to Dashboard)

Notes:  
Reference format is fixture data.

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## INV-UJ05-S10 — Allocation Details

Journey:  
INV-UJ-05 Channel Stock Allocation

Prototype:  
`29_channel_allocation_detail.html`

Prototype Status:  
PROTOTYPE APPROVED

Implementation Audit:  
PASS

UI/UX Lock:  
NOT LOCKED

Purpose:  
View full details of a completed channel allocation.

Primary Visible Components:

- Page header (“Allocation Details”)
- Allocation Status (Completed)
- Source, product/SKU, updated on, allocation reference
- Selected Channels / allocated qty list
- Quantity Breakdown
- Allocation Timeline (Created / Reviewed / Confirmed)
- Print Allocation
- Allocate Again
- Back

Primary User Action:  
Review the completed allocation, print, allocate again, or go back.

Previous Screen:  
INV-UJ05-S01 (table row) or INV-UJ05-S09 (View Allocation)

Next Screen:  
INV-UJ05-S02 (Allocate Again) or INV-UJ05-S01 (Back)

Notes:  
This screen’s “Selected Channels” list uses outlet/warehouse names, unlike POS/Online Store/Click & Collect/Delivery on earlier screens (GAP-INV-016).

Important:  
The approved prototype defines the intended rendered UI. Production implementation architecture is not locked at this stage.

---

## Related Files

- [[Tenant_Admin_Inventory_Approved_UI_Prototype]]
- [[prototypes/inventory_ui_prototype_29_screens/prototype-notes]]
- [[../03_USER_JOURNEYS/Tenant_Admin/10_Inventory_Stock_Management_Flow]]
- [[../03_USER_JOURNEYS/Tenant_Admin/11_Stock_Adjustment_Flow]]
- [[../03_USER_JOURNEYS/Tenant_Admin/12_Stock_In_Flow]]
- [[../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Inventory_Navigation]]
