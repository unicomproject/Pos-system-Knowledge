<!-- title: Tenant Admin Inventory — Approved UI Prototype -->
<!-- status: PROTOTYPE APPROVED -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->
<!-- doc_type: UI prototype registration — documentation only -->

# Tenant Admin Inventory — Approved UI Prototype

Status: PROTOTYPE APPROVED  
Prototype Version: v1.0  
Screen Count: 29  
User Journeys: 5 (prototype grouping IDs `INV-UJ-01` … `INV-UJ-05`)  
Implementation Audit: PASS  
UI/UX Lock: NOT LOCKED — READY TO LOCK  
Frontend: NOT STARTED  
Backend: NOT STARTED

---

## A. Prototype Status

```text
Prototype Phase: COMPLETE
Prototype Review: APPROVED
Prototype Screens: 29/29
Implementation Audit: PASS
UI/UX Lock: NOT YET LOCKED — READY TO LOCK
Frontend Implementation: NOT STARTED
Backend Implementation: NOT STARTED
```

Per-screen statuses (all 29):

```text
PROTOTYPE APPROVED
IMPLEMENTATION AUDIT PENDING
UI/UX LOCK PENDING
```

Do not treat this registration as:

```text
LOCKED
IMPLEMENTATION READY
PRODUCTION READY
```

Canonical screen registry: [[Inventory_UI_Prototype_Screen_Registry]]

---

## B. Prototype Purpose

The HTML/CSS prototype exists to establish the approved visual and UX reference before production implementation.

The prototype will be used later for:

* implementation audit
* UI/UX contract finalization
* Flutter implementation
* visual comparison
* QA acceptance

This document registers the approved pack. It does not lock UI/UX, rewrite Inventory business rules, or start Flutter/.NET work.

---

## C. Source-of-Truth Rule

```text
The approved rendered prototype is the visual UI/UX reference.

The HTML/CSS implementation is retained as prototype source material.

Production Flutter code does not need to reproduce the HTML DOM/CSS structure.

Production UI must reproduce the approved visual result,
interaction intent,
screen composition,
and approved responsive behaviour after the implementation audit and UI/UX lock are complete.
```

```text
HTML/CSS CODE != PRODUCTION IMPLEMENTATION LOCK
```

---

## Canonical Prototype Location

Do not duplicate this pack. One canonical source:

```text
07_UI_UX_KNOWLEDGE/prototypes/inventory_ui_prototype_29_screens/inventory_html_prototype/
```

| Asset | Canonical use |
|---|---|
| `01_inventory_dashboard.html` … `29_channel_allocation_detail.html` | Approved screen prototypes (reference implementation) |
| `index.html` | Pack navigator only — not a production screen |
| `assets/` | Product photography used by root HTML files |
| `reference/` | Side-by-side screenshot references (PNG/JPEG) |
| `standalone/` | Self-contained copies (embedded CSS/images) for offline/online compilers — **not** the canonical source |
| `README.txt` | Pack usage notes from the prototype package |

Open `index.html` in a browser to browse all 29 screens.

### Shared CSS note

Expected filename `inventory.css` was **not** found in the pack.

CSS is inlined in each HTML file (`<style>` in `<head>`). Root screens share the same visual system (colors, chrome, cards, steppers). This is recorded as **GAP-INV-009**. Do not invent a shared CSS file during registration.

---

## Prototype Journey Grouping vs Canonical TA Journeys

`INV-UJ-01` … `INV-UJ-05` are **prototype screen-group IDs**. They do **not** replace canonical Tenant Admin journey IDs `TA-UJ-045` … `TA-UJ-051`.

| Prototype grouping | Screens | Closest canonical TA journey / flow | Mapping note |
|---|---|---|---|
| INV-UJ-01 Inventory Overview / Current Stock | 01–03 | TA-UJ-045 · `10_Inventory_Stock_Management_Flow.md` | Mapped. |
| INV-UJ-02 Opening Stock | 04–07 | **TA-UJ-063** · `16_Opening_Stock_Flow.md` | Created during implementation audit. |
| INV-UJ-03 Stock Receiving | 08–14 | TA-UJ-046 Stock Receiving (alias Stock In) · `12_Stock_In_Flow.md` | Production label Stock Receiving. |
| INV-UJ-04 Stock Adjustment | 15–19 | TA-UJ-047 · `11_Stock_Adjustment_Flow.md` | DRAFT+POSTED in scope. |
| INV-UJ-05 Channel Stock Allocation | 20–29 | **TA-UJ-064** · `17_Channel_Stock_Allocation_Flow.md` | Model B. |

Canonical journeys **without** screens in this 29-pack:

| Canonical ID | Name | Note |
|---|---|---|
| TA-UJ-048 | Stock Out | Flow `13_Stock_Out_Flow.md` exists; no prototype screen. |
| TA-UJ-049 | Stock Count | Flow `15_Stock_Count_Flow.md` exists; dashboard tile visible; no count screens. |
| TA-UJ-050 | View Stock Movement History | Product detail shows a “Recent Movements” list only. |
| TA-UJ-051 | View Stock Alerts | Dashboard shows “Priority Alerts”; no dedicated alerts screen. |
| TA-UJ-054 | View/Export Inventory Report | Not in this pack. |
| Flow 14 | Stock Transfer | Documented as Deferred; Module 18 still includes transfer. |

Resolution of mapping conflicts is recorded in [[Tenant_Admin_Inventory_Implementation_Audit]]. Original GAP-INV-001…016 are closed (Resolved / Deferred / Not Applicable). Blocking: 0.

---

## Traceability (current)

```text
User Journey (TA-UJ / flow doc)
      ↓
Prototype grouping (INV-UJ-xx)
      ↓
Screen ID (INV-UJxx-Sxx)
      ↓
Prototype HTML
      ↓
Prototype Registry
```

Later (not this phase):

```text
User Journey
      ↓
Approved Prototype
      ↓
Implementation Audit
      ↓
Locked UI/UX Contract
      ↓
Flutter Screen
      ↓
QA Test
```

---

## Shared Visible Chrome (all 29 screens)

Documented from the HTML prototypes. Not a production layout lock.

- OneVerz POS top bar
- Till session indicator (`OPEN` / Till Session)
- Outlet selector (sample: Main Outlet)
- Till selector (sample: Till 01)
- Notification bell with badge
- Settings sidebar (white): General, Hardware, Users, Products, Categories, Brands, Pricing & Tax, **Inventory** (active), Import
- Breadcrumb starting `Settings / Inventory / …`
- Bottom nav: Home, New Sale, Orders, Customers, Settings (active)
- Desktop-oriented frame (`min-width: 1180px`)

HTML files are static: screens are **not** wired with `href` links between steps. Previous/Next in the registry is journey-intent from the pack index, steppers, and visible CTAs.

---

## Screen Index

| Screen ID | Journey | Prototype file | Screen name (from pack index) |
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

Full per-screen fields: [[Inventory_UI_Prototype_Screen_Registry]]

---

## Pending Implementation Audit Gaps

**Closed in the implementation audit (2026-08-15).** Canonical closure table: [[Tenant_Admin_Inventory_Implementation_Audit]].

Do not re-open these as undecided. UI/UX remains NOT LOCKED until the separate lock phase.

### GAP-INV-001

Prototype: Uses grouping IDs `INV-UJ-01` … `INV-UJ-05`.  
Existing Second Brain: Canonical journeys are `TA-UJ-045` … `TA-UJ-051`.  
Status: REQUIRES IMPLEMENTATION AUDIT  
Resolution: NOT DECIDED DURING PROTOTYPE REGISTRATION.

### GAP-INV-002

Prototype: Opening Stock is a four-screen journey (`INV-UJ-02`).  
Existing Second Brain: No dedicated TA-UJ or flow file for Opening Stock.  
Status: REQUIRES IMPLEMENTATION AUDIT  
Resolution: NOT DECIDED DURING PROTOTYPE REGISTRATION.

### GAP-INV-003

Prototype: Channel Stock Allocation is a ten-screen journey (`INV-UJ-05`).  
Existing Second Brain: No dedicated TA-UJ. Database knowledge includes `inventory_channel_allocations`.  
Status: REQUIRES IMPLEMENTATION AUDIT  
Resolution: NOT DECIDED DURING PROTOTYPE REGISTRATION.

### GAP-INV-004

Prototype: 29 screens cover five prototype journeys only.  
Existing Second Brain: Stock Out (`TA-UJ-048` / flow 13), Stock Count (`TA-UJ-049` / flow 15), Stock Transfer (flow 14, Deferred), Movement History (`TA-UJ-050`), Stock Alerts (`TA-UJ-051`), Inventory Report (`TA-UJ-054`) remain documented without matching prototype screens.  
Status: REQUIRES IMPLEMENTATION AUDIT  
Resolution: NOT DECIDED DURING PROTOTYPE REGISTRATION.

### GAP-INV-005

Prototype dashboard (`01_inventory_dashboard.html`) quick actions: Current Stock, Opening Stock, Stock Adjustment, Stock Count.  
Existing Second Brain flow 10: choose adjustment / stock in / stock out / transfer / stock count.  
Prototype does not show Stock Receiving or Channel Allocation as dashboard tiles; Stock Count is a tile with no screens in this pack.  
Status: REQUIRES IMPLEMENTATION AUDIT  
Resolution: NOT DECIDED DURING PROTOTYPE REGISTRATION.

### GAP-INV-006

Module 18 overview: transfer is in unified-commerce scope.  
Flow 14: stock transfer is Deferred / not MVP unless approved.  
Prototype pack has no transfer screens.  
Status: REQUIRES IMPLEMENTATION AUDIT  
Resolution: NOT DECIDED DURING PROTOTYPE REGISTRATION.

### GAP-INV-007

Journey docs reference modules `16_Inventory_Foundation_Stock_Availability` and `17_Reservations_Stock_Movements_Serial_Cost`.  
Live `04_MODULE_KNOWLEDGE` currently has module 18; modules 16 and 17 exist as database table docs, not as live module folders.  
Status: REQUIRES IMPLEMENTATION AUDIT  
Resolution: NOT DECIDED DURING PROTOTYPE REGISTRATION.

### GAP-INV-008

Prototype: Inventory is nested under Settings, white Settings sidebar, POS-style top/bottom chrome.  
Existing Second Brain: approved top-level label is **Inventory**; current Flutter catalog label is **Stock**; Tenant Admin shared layout uses a different sidebar contract.  
Status: REQUIRES IMPLEMENTATION AUDIT  
Resolution: NOT DECIDED DURING PROTOTYPE REGISTRATION.

### GAP-INV-009

Expected shared file `inventory.css` is absent. CSS is inlined in each HTML file.  
Status: REQUIRES IMPLEMENTATION AUDIT (pack completeness / how Flutter should consume styles)  
Resolution: NOT DECIDED DURING PROTOTYPE REGISTRATION.

### GAP-INV-010

Prototype HTML screens are static (no inter-screen `href` wiring). Pack `index.html` is the navigator.  
Status: REQUIRES IMPLEMENTATION AUDIT (production navigation contract)  
Resolution: NOT DECIDED DURING PROTOTYPE REGISTRATION.

### GAP-INV-011

Receiving stepper on select/enter/review shows four steps (Select Product → Enter Details → Review → Success/Complete).  
The pack also includes Confirm Receive (`INV-UJ03-S05`) and Serial Number Registry (`INV-UJ03-S07`).  
Status: REQUIRES IMPLEMENTATION AUDIT  
Resolution: NOT DECIDED DURING PROTOTYPE REGISTRATION.

### GAP-INV-012

Channel allocation stepper labels are not identical across `21`–`27` (step names and order shift: Search Product vs Allocation Type vs Select Channels vs Enter Allocation).  
Status: REQUIRES IMPLEMENTATION AUDIT  
Resolution: NOT DECIDED DURING PROTOTYPE REGISTRATION.

### GAP-INV-013

Canonical journey name is **Stock In**. Prototype labels the flow **Stock Receiving** / **Receive Stock**.  
Status: REQUIRES IMPLEMENTATION AUDIT  
Resolution: NOT DECIDED DURING PROTOTYPE REGISTRATION.

### GAP-INV-014

Stock In flow notes that supplier management is not full MVP scope; source/reference may be basic.  
Prototype receiving screens show Supplier, Invoice Number, PO/reference, unit cost, batch/expiry as prominent fields.  
Status: REQUIRES IMPLEMENTATION AUDIT  
Resolution: NOT DECIDED DURING PROTOTYPE REGISTRATION.

### GAP-INV-015

Adjustment flow 11 is a direct enter/review/save path.  
Prototype adjustment dashboard shows Draft, Pending Approval, and Posted states plus a list of past adjustments.  
Status: REQUIRES IMPLEMENTATION AUDIT  
Resolution: NOT DECIDED DURING PROTOTYPE REGISTRATION.

### GAP-INV-016

`INV-UJ05-S10` Allocation Details shows “Selected Channels” using outlet/warehouse names (Main Outlet, Outlet 02, Outlet 03, Warehouse).  
Earlier channel screens (`24`–`28`) use sales-channel names (POS, Online Store, Click & Collect, Delivery).  
Status: REQUIRES IMPLEMENTATION AUDIT  
Resolution: NOT DECIDED DURING PROTOTYPE REGISTRATION.

AUDIT GAP — DO NOT RESOLVE DURING PROTOTYPE REGISTRATION.

---

## Related Files

- [[Inventory_UI_Prototype_Screen_Registry]]
- [[Tenant_Admin_Inventory_Implementation_Audit]]
- [[prototypes/inventory_ui_prototype_29_screens/prototype-notes]]
- [[../03_USER_JOURNEYS/Tenant_Admin/10_Inventory_Stock_Management_Flow]]
- [[../03_USER_JOURNEYS/Tenant_Admin/11_Stock_Adjustment_Flow]]
- [[../03_USER_JOURNEYS/Tenant_Admin/12_Stock_In_Flow]]
- [[../03_USER_JOURNEYS/Tenant_Admin/CANONICAL_USER_JOURNEY_INDEX]]
- [[../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Inventory_Navigation]]
- [[../06_DATABASE_KNOWLEDGE/Tables/16_Inventory_Foundation_Product_Tracking_And_Stock_Availability]]
- [[../04_MODULE_KNOWLEDGE/18_Stock_Adjustment_Transfer_Stocktake/01_Module_Overview]]

---

## Next Phase

```text
INVENTORY UI/UX + IMPLEMENTATION CONTRACT LOCK
```

Implementation audit is PASS. Do not start Flutter/.NET until the lock phase completes.
