<!-- title: Tenant Admin Inventory Implementation Audit -->
<!-- status: IMPLEMENTATION AUDIT PASS -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->
<!-- doc_type: Implementation audit + gap resolution — documentation only -->

# Tenant Admin Inventory — Implementation Audit

Status: IMPLEMENTATION AUDIT PASS  
UI/UX Contract: LOCKED  
Implementation Contract: LOCKED  
Prototype: 29/29 APPROVED (unchanged)  
Frontend Implementation: NOT STARTED  
Backend Implementation: NOT STARTED  
QA Execution: NOT STARTED  
Lock Manifest: [[Tenant_Admin_Inventory_Lock_Manifest]]

## Current 29-screen implementation scope

IN SCOPE:

- Inventory Overview / Current Stock
- Opening Stock
- Stock Receiving
- Stock Adjustment
- Channel Stock Allocation

DEFERRED:

- Stock Out
- Stock Transfer
- Stock Count / Stocktake
- Inventory Alerts workspace
- Other inventory capabilities not represented by the approved 29 prototypes

Deferred journeys remain in the canonical index. They are not implementation blockers.

## Prototype-to-journey mapping

| Prototype grouping | Canonical TA-UJ | Result |
|---|---|---|
| INV-UJ-01 | TA-UJ-045 | PASS |
| INV-UJ-02 | TA-UJ-063 (created) | PASS |
| INV-UJ-03 | TA-UJ-046 Stock Receiving (alias Stock In) | PASS |
| INV-UJ-04 | TA-UJ-047 | PASS |
| INV-UJ-05 | TA-UJ-064 (created) | PASS |

`INV-UJ-*` remains prototype grouping only.

## Traceability (29 screens)

| Screen | Journey | Permission | API | Persist |
|---|---|---|---|---|
| INV-UJ01-S01 | TA-UJ-045 | stock.view | GET dashboard | balances (read) |
| INV-UJ01-S02 | TA-UJ-045 | stock.view | GET stock | balances (read) |
| INV-UJ01-S03 | TA-UJ-045 | stock.view | GET stock/{id} | balances + movements (read) |
| INV-UJ02-S01 | TA-UJ-063 | opening_stock.manage | drafts | opening entry |
| INV-UJ02-S02 | TA-UJ-063 | opening_stock.manage | drafts | opening entry |
| INV-UJ02-S03 | TA-UJ-063 | opening_stock.manage | post | opening + balance + movement |
| INV-UJ02-S04 | TA-UJ-063 | opening_stock.manage | GET posted | read |
| INV-UJ03-S01 | TA-UJ-046 | receiving.manage | GET receipts | receipts |
| INV-UJ03-S02 | TA-UJ-046 | receiving.manage | POST receipts | draft |
| INV-UJ03-S03 | TA-UJ-046 | receiving.manage | PUT receipts | draft |
| INV-UJ03-S04 | TA-UJ-046 | receiving.manage | GET draft | no mutation |
| INV-UJ03-S05 | TA-UJ-046 | receiving.manage | POST confirm | receipt + balance + movement |
| INV-UJ03-S06 | TA-UJ-046 | receiving.manage | GET posted | read |
| INV-UJ03-S07 | TA-UJ-046 related | serials.view | GET/POST serials | serial_numbers |
| INV-UJ04-S01 | TA-UJ-047 | stock.view / adjust | GET adjustments | adjustments |
| INV-UJ04-S02 | TA-UJ-047 | stock.adjust | POST draft | draft |
| INV-UJ04-S03 | TA-UJ-047 | stock.adjust | PUT draft | draft |
| INV-UJ04-S04 | TA-UJ-047 | stock.adjust | POST post | adjustment + balance + movement |
| INV-UJ04-S05 | TA-UJ-047 | stock.adjust | GET posted | read |
| INV-UJ05-S01 | TA-UJ-064 | channel_allocation.view | GET allocations | allocations |
| INV-UJ05-S02 | TA-UJ-064 | channel_allocation.manage | setup | none |
| INV-UJ05-S03 | TA-UJ-064 | channel_allocation.manage | setup | none |
| INV-UJ05-S04 | TA-UJ-064 | channel_allocation.manage | setup | none |
| INV-UJ05-S05 | TA-UJ-064 | channel_allocation.manage | setup | none |
| INV-UJ05-S06 | TA-UJ-064 | channel_allocation.manage | setup | none |
| INV-UJ05-S07 | TA-UJ-064 | channel_allocation.manage | review | none |
| INV-UJ05-S08 | TA-UJ-064 | channel_allocation.manage | POST confirm | allocations only |
| INV-UJ05-S09 | TA-UJ-064 | channel_allocation.view | GET | read |
| INV-UJ05-S10 | TA-UJ-064 | channel_allocation.view | GET {id} | read |

No orphan screens.

## Shell vs content

```text
Prototype content contract:
The Inventory workspace (page title, metrics, tables, steppers, forms, CTAs,
and screen composition of the 29 HTML screens) is the visual UI/UX reference.

Production Tenant Admin shell contract:
TenantAdminSharedShell — black header, black sidebar, white content canvas,
black footer. Inventory is top-level menu item 8 (not nested under Settings).
Approved label is Inventory. Route alias /tenant-admin/stock/* may remain.
POS till-session chrome in the HTML mock is not a Tenant Admin production
requirement.
```

## Flutter readiness (docs only)

- Feature destination: Tenant Admin Inventory feature folder
- Routes: `/tenant-admin/inventory/*` canonical; `/tenant-admin/stock/*` alias
- Pages follow 29 screens; shared TA components for tables/steppers
- State: per-journey providers; no widget tree lock
- API: [[../../05_BACKEND_ARCHITECTURE/Tenant_Admin_Inventory_API_Contract]]
- READY at documentation level

## Backend readiness (docs only)

- Module: Inventory application services under `/api/v1/inventory`
- Controllers thin; domain posting transactional
- Schema mapping includes required header tables to migrate in implementation
- READY at documentation level (migrations not created)

## Original 16 gaps — closure

### GAP-INV-001

Original: INV-UJ vs TA-UJ IDs.  
Evidence: canonical index; prototype registry.  
Decision: INV-UJ remains prototype grouping; map to TA-UJ-045/046/047/063/064.  
Docs: this audit, canonical index, global register.  
Final status: **RESOLVED**

### GAP-INV-002

Original: Opening Stock had no TA-UJ.  
Evidence: 29 screens 04–07; no prior journey.  
Decision: Create TA-UJ-063.  
Docs: `16_Opening_Stock_Flow.md`.  
Final status: **RESOLVED**

### GAP-INV-003

Original: Channel allocation had no TA-UJ.  
Evidence: screens 20–29; `inventory_channel_allocations`.  
Decision: Create TA-UJ-064. Model B.  
Docs: `17_Channel_Stock_Allocation_Flow.md`.  
Final status: **RESOLVED**

### GAP-INV-004

Original: Stock Out / Count / Transfer / History / Alerts / Report lack prototype screens.  
Evidence: TA-UJ-048–051, 054, flow 14.  
Decision: DEFERRED / OUT OF CURRENT 29-SCREEN SCOPE. Keep index rows.  
Final status: **DEFERRED**

### GAP-INV-005

Original: Dashboard tiles vs flow 10 actions.  
Evidence: prototype 01 vs flow 10.  
Decision: Dashboard follows prototype. Live tiles: Current Stock, Opening Stock, Stock Adjustment. Stock Count tile visible but deferred. Receiving and Channel Allocation enter via Inventory module navigation, not dashboard tiles.  
Final status: **RESOLVED**

### GAP-INV-006

Original: Module 18 transfer vs flow 14 deferred.  
Evidence: module overview vs `14_Stock_Transfer_Flow.md`.  
Decision: Transfer remains deferred for this release. Flow 14 wins for 29-screen scope. Module 18 tables retained.  
Final status: **DEFERRED**

### GAP-INV-007

Original: Modules 16/17 folders missing.  
Evidence: only DB docs existed.  
Decision: Created live module overviews pointing at existing schema.  
Docs: `04_MODULE_KNOWLEDGE/16_…/01_Module_Overview.md`, `17_…/01_Module_Overview.md`.  
Final status: **RESOLVED**

### GAP-INV-008

Original: Prototype Settings chrome vs TA shell / Inventory vs Stock label.  
Evidence: Tenant_Admin_UI_Rules; Inventory Navigation.  
Decision: Production uses TA shared shell; Inventory top-level; content from prototypes.  
Final status: **RESOLVED**

### GAP-INV-009

Original: No inventory.css.  
Evidence: inline `<style>` in HTML.  
Decision: Not a production blocker. Flutter does not consume prototype CSS. Do not add a CSS file to the pack.  
Final status: **NOT APPLICABLE**

### GAP-INV-010

Original: HTML screens not hyperlinked.  
Evidence: static HTML; index.html navigator.  
Decision: Production navigation is the journey sequences in registry + this audit.  
Final status: **RESOLVED**

### GAP-INV-011

Original: Receiving 4-step stepper vs Confirm + Serial Registry.  
Evidence: screens 08–14.  
Decision: Wizard is Select → Enter → Review → Confirm → Success. Confirm is required before stock increase. Serial Registry is a related screen, not a wizard step.  
Final status: **RESOLVED**

### GAP-INV-012

Original: Channel stepper labels inconsistent.  
Evidence: screens 21–27.  
Decision: Canonical order in TA-UJ-064. Prototype label drift ignored.  
Final status: **RESOLVED**

### GAP-INV-013

Original: Stock In vs Stock Receiving.  
Evidence: TA-UJ-046 name vs prototype.  
Decision: Production UI label **Stock Receiving**. Journey ID TA-UJ-046 retained. Alias Stock In.  
Final status: **RESOLVED**

### GAP-INV-014

Original: Supplier MVP vs prototype supplier/invoice/cost/batch.  
Evidence: flow 12 vs screens 09–13.  
Decision: Keep prototype fields. Supplier is required display name, not full supplier master.  
Final status: **RESOLVED**

### GAP-INV-015

Original: Draft / Pending Approval / Posted vs simple save flow.  
Evidence: screen 15 vs flow 11; `requires_manager_approval`.  
Decision: DRAFT + POSTED in scope. Pending-approval queue DEFERRED. Tenant Admin with adjust permission posts immediately.  
Final status: **RESOLVED** (approval queue **DEFERRED** as a sub-capability, not blocking)

### GAP-INV-016

Original: Details screen used outlet names as channels.  
Evidence: screen 29 vs 24–28.  
Decision: Production details MUST show sales channels. Prototype fixture is not domain truth.  
Final status: **RESOLVED**

## Newly established canonical behaviour

Documented in `02_Inventory_Business_Rules.md` and `03_Inventory_Quantity_Model.md`: opening duplicate rule, receiving post-on-confirm, Model B allocation, negative-stock forbidden for TA mutations, quantity formulas, location = `inventory_locations`.

## Blocking gaps

0

## Related Files

- [[Tenant_Admin_Inventory_Lock_Manifest]]
- [[Inventory_UI_Prototype_Screen_Registry]]
- [[Tenant_Admin_Inventory_Approved_UI_Prototype]]
- [[../04_MODULE_KNOWLEDGE/16_Inventory_Foundation_Stock_Availability/02_Inventory_Business_Rules]]
- [[../05_BACKEND_ARCHITECTURE/Tenant_Admin_Inventory_API_Contract]]
- [[../02_ACCESS_CONTROL/Tenant_Admin_Inventory_Permission_Matrix]]
- [[../10_TESTING_QA/Tenant_Admin_Inventory_QA_Acceptance]]
