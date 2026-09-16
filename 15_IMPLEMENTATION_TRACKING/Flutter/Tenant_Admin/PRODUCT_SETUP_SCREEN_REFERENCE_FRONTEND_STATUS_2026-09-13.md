<!-- title: Product Setup Screen-Reference Frontend Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-13 -->

# Product Setup — User-Supplied Screen-Reference Frontend Status (2026-09-13)

## Scope

Flutter Tenant Admin Product Setup visual alignment to **user-supplied Product Setup screens**, while keeping the **scanner-first 7-step journey** authoritative.

**No Git/GitHub operations.**  
**No backend changes in this task.**

## Visual references used

Desktop folder: `C:\Users\user\Desktop\Product Setup\New folder\Product Setup\`

Analyzed PNGs (non-exhaustive names; all present screens reviewed):

- `1.png` — Products empty / shell
- `2 (1..4).png` — Products list / shell density
- `3 (1..4).png` — Basic Details + right Status & Options
- `5(1..7).png` — Product Type & Tracking
- `6.png`, `7.png` — Units & Pack / related
- `8 (1..3).png` — Product Configuration / variants + right summary
- `9 (1..6).png` — Barcode & SKU visual (reuse inside Step 5 only)
- `10 (1..4).png` — Pricing & Tax
- `11.png`, `12.png`, `14.png` — Review / related

Notes (historical journey only; not functional authority):

- `Tenant admin side la product setup.txt`
- `# Tenant Admin Product Setup Add P.txt`

Inventory: `product_setup_dart_files.md`

## Final stepper (locked)

1. Scan Barcode  
2. Basic Details  
3. Product Type & Tracking  
4. Unit & Pack Conversion  
5. Product Configuration  
6. Pricing & Tax  
7. Review & Create  

**No** global `Barcode & SKU` step. **No** Step 8. **No** Channel Visibility global step.

## Step 1 screens (visual family aligned)

All panels remain inside `scan_barcode/scan_barcode_step.dart` (no parallel `product_setup_v2/` module; no duplicate card files).

| State | Status | Widget/file |
|-------|--------|-------------|
| S1-A Scan ready | IMPLEMENTED | `ScanBarcodeStep` / `_buildScanReady` |
| S1-B Validating | IMPLEMENTED | `_buildValidating` |
| S1-C Existing product | IMPLEMENTED | `_buildLocalMatch` |
| S1-D No local match | IMPLEMENTED | `_buildNoLocalMatch` |
| S1-E Searching | IMPLEMENTED | `_buildExternalLookup` |
| S1-F Product Found | IMPLEMENTED | `_buildExternalFound` (UI ready; real data needs provider) |
| S1-G Product data not found | IMPLEMENTED | `_buildExternalNoMatch` (exact 4 choices) |
| S1-R1 Manual barcode | IMPLEMENTED | `_buildManualEntry` + 8/12/13/14 chips |
| S1-R2 Invalid | IMPLEMENTED | `_buildInvalid` warning card |
| S1-R3 No barcode | IMPLEMENTED | `_buildNoBarcode` selectable reason cards |

Optional wide-desktop tip rail: `_ScanStepHelpCard` in `add_product_wizard.dart` (shown only when width ≥ 1180).

## Step 5 identifier integration

- Global Barcode & SKU step: **removed / not shown**
- SIMPLE: `Step5BarcodeSkuForm` only (section title **Sellable Identity**)
- VARIANT: variant configuration + identifier table (existing `barcode_sku/` widgets)
- BUNDLE composition graph: **out of scope** (placeholder note only)

## External FOUND

FOUND UI exists. Backend currently has **zero concrete providers** → typical runtime result `NO_MATCH`. Do not fake product data in Flutter.

## Tests / analyze (this task)

- `flutter analyze` on touched files: **No issues found**
- Tests: `scan_barcode_step_visual_test.dart` + `scanner_first_journey_test.dart` + `add_product_stepper_test.dart` → **18 passed**

## Out of scope (documented only)

- BUNDLE component graph enhancement
- Configuring concrete external product-data providers
- Product List redesign
- New design tokens / rebuilt Tenant Admin shell
- Backend changes

## Final status

**USER-SUPPLIED SCREEN-REFERENCE PRODUCT SETUP FRONTEND IMPLEMENTED**

Caveat unchanged from journey work: **real external FOUND data remains blocked until a provider is configured** (UI path exists).
