# Tenant Admin Add Product — Barcode & SKU Specification

<!-- title: Tenant Admin Add Product — Barcode & SKU Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-04 -->

## 1. Executive Summary & Purpose

This document is the **canonical** specification for **Step 5 — SKU & Barcode** of the Tenant Admin Add Product wizard (7-step Product Setup).

It supersedes stale 2026-08-14 descriptions that referenced auto-generated SKUs, `variantIdentifiers` payload shape, and undefined table UX.

**Actor:** Tenant Admin / Catalog Manager with `catalog.barcodes.manage`.  
**Entry:** Steps 1–2 complete; Step 3 when Track Inventory ON for SIMPLE; Step 4 complete for VARIANT / BUNDLE.  
**Persistence tables:** `product_variants.sku`, `product_barcodes` (existing).  
**EF migration for this contract:** **NONE REQUIRED** (`barcode_type` already exists).

---

## 2. Product Structure Matrix

| Structure | Identifier targets | SKU storage | Barcode storage |
|---|---|---|---|
| **SIMPLE** | One default variant | `product_variants.sku` | Primary barcode on that variant |
| **BUNDLE** | One kit parent default variant | Same as SIMPLE | Same as SIMPLE |
| **VARIANT** | Every **included / sellable** Step 4 variant | Per-variant `product_variants.sku` | One primary barcode per variant (optional on Continue) |

`products.product_code` is Internal Code (Step 1), **not** SKU.

**Step 4 is authoritative.** Step 5 must reconcile against persisted Step 4 Variant Configuration. Excluded / archived / deleted variants are **not** normal Step 5 targets.

---

## 3. VARIANT Step 5 — User Journey (Canonical)

1. User completes Step 4 (variant matrix + Include Variant).
2. Step 5 loads all included variants as identifier **targets**.
3. User manually enters SKU (and optional barcode + barcode type) per variant in a **table-first** UI.
4. Hardware scanner (HID keyboard wedge) may fill the focused barcode field; trailing Enter completes one logical scan.
5. Save Draft may leave rows incomplete.
6. Save & Continue requires **every included variant** to have a non-empty SKU (authoritative coverage), uniqueness, ownership, and barcode format when barcode present.
7. On success, wizard advances to Step 6 (Pricing & Tax).

**Explicit non-goals for VARIANT Step 5 R1:**
- No **Auto-generate SKUs** button or silent SKU generation.
- No Additional Barcode multi-row workflow in this table.
- No UOM-specific barcode column in the compact table (primary selling-unit barcode only; `quantity_per_scan = 1`).
- Row selection checkboxes do **not** change sellability and are **not** persisted.

---

## 4. VARIANT UI Contract (Table-First)

### 4.1 Header
- Title: `SKU & Barcode — Variant Product`
- Subtitle: `Assign SKU and barcode to each variant.`
- Search Variants (client-side)
- Status filter: All | Complete | Incomplete | Error
- Completion summary: `{complete} of {total} complete`
- Retain existing Tenant Admin shell, 7-step stepper, wizard footer, OneVerz tokens.

### 4.2 Table columns
1. **Select** — multi-select checkbox; **UI-only**
2. **Variant** — thumbnail (reuse Step 4 image resolution; no N+1), display label, option combination (`Blue / 500ml`)
3. **SKU** — manual text input
4. **Barcode** — text + scan affordance; barcode type via row edit drawer if density requires
5. **Status** — derived chip
6. **Actions** — ⋯ menu → Edit SKU & Barcode, Clear draft identifier values

Reuse `edit_variant_identifier_drawer.dart` for dense editing. Do **not** revive Additional Barcode widgets on this surface.

### 4.3 Status chips (derived, not DB truth)
| Status | Meaning |
|---|---|
| COMPLETE | Non-empty SKU; barcode blank **or** barcode+type valid; no duplicate/invalid |
| INCOMPLETE | Missing required SKU |
| DUPLICATE | SKU or barcode conflicts in-request or tenant |
| INVALID | Barcode present but fails type/format rules |
| VALIDATING | Transient UI only |

Colour: green Complete, amber Incomplete, red Duplicate/Invalid — status also labeled in text.

### 4.4 Responsive (tablet-first 1024×768)
- Fixed wizard footer / shell
- Table body **internally** scrollable (~5 usable rows)
- No traditional pagination
- Do not eagerly allocate hundreds of undisposed `TextEditingController`s

### 4.5 Selection semantics
- Selecting/deselecting rows focuses editing or enables batch UI actions only.
- **VARIANT Apply flow (Flutter):** checkbox select → type SKU/Barcode as local draft → **Apply** commits to assignment rows → status Incomplete→Complete. Typing alone must not flip Complete.
- Deselect **must not** delete identifiers.
- Selection **must not** replace Step 4 Include Variant.
- Selection **must not** be required for Save & Continue coverage (coverage uses committed assignments after Apply / drawer edit).

---

## 5. SKU Rules

- **Manual entry only.** No auto-generate. Never overwrite a user-entered SKU.
- Trim outer whitespace before persist.
- Max length: **100** (matches `product_variants.sku`).
- Tenant uniqueness: application validation **and** DB `UNIQUE (tenant_id, sku) WHERE sku IS NOT NULL`.
- **Canonical comparison: case-sensitive (Ordinal)** — must match PostgreSQL unique index behavior.
- Save Draft: SKU may be blank.
- Save & Continue: SKU **required** for every included/sellable VARIANT target (and for SIMPLE/BUNDLE default variant).

---

## 6. Barcode Rules

### 6.1 Persistence
Table: `product_barcodes`  
Fields used: `id`, `tenant_id`, `product_id`, `product_variant_id`, `barcode`, `barcode_type`, `uom_id`, `quantity_per_scan`, `is_primary_barcode`, `status`, audit.

- Barcode is a **string**. Never parse to numeric. Preserve leading zeros.
- Tenant uniqueness: `UNIQUE (tenant_id, barcode)`.
- VARIANT Step 5 R1: **one primary barcode per variant** is sufficient.
- R1: `uom_id = null`, `quantity_per_scan = 1` for primary selling-unit barcode.
- Draft phase may store barcodes as inactive per existing lifecycle; do not hard-delete history casually.

### 6.2 Barcode type (canonical codes)
Persisted codes (no hyphens):

| code | label |
|---|---|
| `EAN13` | EAN-13 |
| `EAN8` | EAN-8 |
| `UPCA` | UPC-A |
| `CODE128` | CODE-128 |
| `CODE39` | CODE-39 |

Returned via Product Create Options (extend existing options endpoint — do not invent a parallel lookup API).

**Must not hard-code `EAN13` on create.** Client-selected `barcodeType` is required whenever barcode is non-empty.

**SIMPLE / BUNDLE (type dropdown hidden):** persist type internally when barcode is non-empty. Infer EAN13 / UPC-A / EAN8 only when the value is all digits with a valid GTIN checksum; otherwise persist `CODE128`. Validate this on **Step 5 Save & Continue** (field error on the barcode input). Do **not** wait until Step 7 Create Product.

### 6.3 Requiredness
- Save Draft: barcode optional.
- Save & Continue: barcode **optional**.
- If barcode is non-empty: `barcodeType` required + format validation for that type.

### 6.4 Format validation (server authoritative)
Centralize validation (do not scatter regex across layers).

| Type | Rules (minimum) |
|---|---|
| EAN13 | 13 digits + checksum |
| EAN8 | 8 digits + checksum |
| UPCA | 12 digits + checksum |
| CODE128 | printable policy per system |
| CODE39 | Code 39 charset policy |

Flutter may mirror for UX only.

### 6.5 Scanner
HID keyboard wedge first. Focus field → characters → trailing Enter completes scan → one logical edit → existing draft debounce. No save-per-keystroke.

---

## 7. API Contract (Canonical Payload)

Endpoint remains:

`PUT /api/v1/tenant-admin/products/{productId}/draft`  
(and create/draft POST pattern already used by wizard)

```json
{
  "currentSetupStep": 5,
  "wizardAction": "SAVE_AND_CONTINUE",
  "advanceStep": true,
  "expectedRowVersion": 12,
  "barcodeSkuConfiguration": {
    "assignments": [
      {
        "productVariantId": "guid-or-null-pre-create",
        "clientCombinationKey": "optA:val1;optB:val2",
        "sku": "AQF-BLU-500",
        "barcode": "0200001111001",
        "barcodeType": "EAN13"
      }
    ]
  }
}
```

**Do not** persist UI selection flags.  
**Obsolete:** top-level `variantIdentifiers`, auto Base SKU seed fields as VARIANT requirements.

GET setup projection must rehydrate: targets, `sku`, `barcode`, `barcodeType`, `clientCombinationKey`, derived assignment presence. Status chips are recomputed client-side.

Duplicate conflicts: HTTP **409** with `product.duplicate_sku` / `product.duplicate_barcode` and safe same-tenant conflict metadata only.

---

## 8. Save Draft vs Save & Continue

| | Save Draft | Save & Continue |
|---|---|---|
| Incomplete SKUs | Allowed | Reject — every included target needs SKU |
| Blank barcodes | Allowed | Allowed |
| Malformed / foreign variant IDs | Reject | Reject |
| Duplicate SKU/barcode | Reject (or 409) | Reject (or 409) |
| Invalid barcode format when present | Reject | Reject |
| Step advance | Stay on 5 | Advance to 6 on success |
| Concurrency | `expectedRowVersion` | same |

**Coverage algorithm (Continue):**
1. Load authoritative Step 4 included/sellable variants.
2. Reconcile submitted assignments to those targets (by `productVariantId` and/or `clientCombinationKey`).
3. Fail if any authoritative target lacks SKU.
4. Fail if client omits required targets (do not validate only what was submitted).
5. Bulk uniqueness checks (in-request + one SKU query + one barcode query).
6. Validate ownership of every `productVariantId`.
7. Persist atomically; bump rowVersion.

---

## 9. Ownership & Security

For every `productVariantId`:
- `tenant_id` = authenticated tenant
- `product_id` = current draft product
- variant not archived/deleted
- variant is an applicable Step 5 target

Never silently ignore unknown/cross-product IDs — return structured field errors.  
Tenant ID never trusted from payload.

Permissions (unchanged matrix):
- Create flow: `catalog.products.create` + `catalog.barcodes.manage`
- Edit flow: `catalog.products.update` + `catalog.barcodes.manage`
- Entitlement: `product_catalog`

---

## 10. Uniqueness Implementation

- Detect duplicates **inside request** in memory (Ordinal / case-sensitive).
- Bulk DB conflict queries (no N+1).
- Exclude the exact record being updated when comparing.
- DB unique constraints remain final race defense → map to 409.

---

## 11. Step 4 ↔ Step 5 Reconciliation

| Step 4 change | Step 5 effect |
|---|---|
| New included variant | New Incomplete target; blank SKU/barcode |
| Display label change only | Preserve SKU/barcode |
| Exclude / archive / delete | Remove from required targets; follow existing tombstone/lifecycle |
| Regen with stable combination key | Preserve identifiers for matching keys |

---

## 12. SIMPLE / BUNDLE

SIMPLE/BUNDLE remain **one SKU + optional parent/variant barcode** (not the VARIANT multi-row checkbox table). Same uniqueness, type, and string barcode rules. Manual SKU only (no auto-gen for R1).

### 12.1 SIMPLE / BUNDLE UI (2026-09-03)

- Compact editors: Product Name (locked), Base SKU, Parent Product Barcode.
- **Apply** commits to the assignment row via `updateSimpleBaseSku` / `updateSimpleParentBarcode` / `commitSimpleBarcodeSkuToState`, then **clears** the SKU and barcode fields (product name stays). Live keystroke write to wizard state is **not** used; commit on Apply only.
- Generate SKU from Internal Code only when Base SKU is still empty (`generateSimpleIdentifiers(overwriteSku: false)`).
- Assignment table: no checkbox; **green selected dot**; columns Variant | SKU | Barcode | **Scan** | Status | **pencil**. White row; thumbnail hidden.
- Edit drawer (`edit_variant_identifier_drawer.dart`): title **Edit Variant SKU & Barcode**; blue info banner; Variant read-only; SKU *; Barcode *; Scan to Replace Barcode; uniqueness banners; Cancel + Update. **Barcode Type dropdown is not shown**; persist type internally (GTIN checksum → EAN13/UPCA/EAN8, else CODE128). Invalid barcode+type is a Step 5 field error, not a Step 7 Create toast.

VARIANT keeps checkbox + ⋮ + inline edit.

---

## 13. Permissions & Concurrency & NFR

- Optimistic concurrency via product `rowVersion` / `expectedRowVersion`.
- No N+1 uniqueness or image loading.
- Efficient Flutter rendering for large matrices.
- Scanner debounce must not create rowVersion storms.

---

## 14. Test Matrix (Summary)

Backend: coverage Continue, ownership, bulk dupes, barcodeType persist, no EAN13 hard-code, leading zeros, case-sensitive SKU, 409 races, permissions, rehydrate.  
Flutter: table-first UI, search/filter, UI-only selection, no auto-gen, type round-trip, scanner Enter, 1024×768 scroll, draft reopen, Step 4 reconcile.

Full cases: `10_TESTING_QA/Test_Case/10_Product_Core/Tenant_Admin_Product_Barcode_SKU_Step5_Test_Cases.md`.

---

## 15. Superseded Statements

The following are **obsolete** and must not be treated as active contract:
- Auto Generate SKU as a Step 5 primary flow
- `UpdateProductDraftStep5RequestDto` / top-level `variantIdentifiers` as the live shape
- Hard-coded default barcode type without client selection
- Aug 14 readiness audits claiming IMPLEMENTATION READY under the old DTO

See also: `15_IMPLEMENTATION_TRACKING/99_AUDITS/PRODUCT_SETUP_STEP5_VARIANT_SKU_BARCODE_AUDIT_MATRIX_2026-09-03.md`.
