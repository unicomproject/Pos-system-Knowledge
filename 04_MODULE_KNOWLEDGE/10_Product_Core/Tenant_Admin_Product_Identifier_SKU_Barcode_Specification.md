<!-- title: Tenant Admin Product Identifier SKU Barcode Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-11 -->
<!-- supersedes: Tenant_Admin_Product_Barcode_SKU_Specification.md as standalone Step 5 wizard authority -->

# Tenant Admin Product — Identifier (SKU & Barcode) Specification

## 1. Executive Summary & Purpose

This document is the **canonical identifier-domain** specification for Tenant Admin Product Setup.

It replaces the former standalone global stepper authority **“Step 5 — Barcode & SKU / SKU & Barcode”**.

| Concern | Canonical owner |
|---|---|
| Scan / acquire / validate / duplicate-discover / optional external discovery | **Global Step 1 — Scan Barcode** → [[Tenant_Admin_Product_Setup_Scan_Barcode_Specification]] |
| Final sellable SKU & barcode assignment / reconciliation | **Global Step 5 — Product Configuration** (identifier section) |
| Final revalidation | **Global Step 7 — Review & Create** |

**Actor:** Tenant Admin / Catalog Manager with `catalog.barcodes.manage` for final mutations.  
**Persistence tables:** `product_variants.sku`, `product_barcodes` (existing).  
**Scan bootstrap:** `product_setup_scan_context` (**IMPLEMENTED IN SOURCE** — migration `20260912085454_AddProductSetupScannerIdentifierContext`; local test DB applied; prod/shared apply not claimed) — not final barcode ownership.  
**Final Step 5 identifiers:** **B10 IMPLEMENTED** — scanner-first composite Step 5 persists SKU on `product_variants.sku` and optional barcode on `product_barcodes` (+ `identifier_standard`); ScanContext candidate is not auto-finalized.  
**EF migration for existing barcode columns:** none for legacy codes. **B1 IMPLEMENTED IN SOURCE:** nullable `product_barcodes.identifier_standard`, symbology value `UNKNOWN`, and `product_setup_scan_context`. Local PostgreSQL test DB verified; **production/shared apply not claimed**. See [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]] (decision record preserved; implementation status advanced — see [[../../00_START_HERE/Current_Source_Of_Truth]]).

Legacy filename redirect: [[Tenant_Admin_Product_Barcode_SKU_Specification]].

---

## 2. Canonical Global Wizard Context

1. Scan Barcode  
2. Basic Details  
3. Product Type & Tracking  
4. Unit & Pack Conversion  
5. **Product Configuration** ← this document’s final identifier UI lives here  
6. Pricing & Tax  
7. Review & Create  

Step 5 also owns VARIANT matrix / BUNDLE composition per existing Product Configuration authorities. Identifier work is a **section** of Step 5, not a separate global step.

**Entry to identifier section:** Steps 1–3 complete as applicable; Step 4 Unit & Pack when required; Product Configuration structure work complete for VARIANT/BUNDLE before identifier Continue.

---

## 3. Product Structure Matrix

| Structure | Identifier targets | SKU storage | Barcode storage |
|---|---|---|---|
| **SIMPLE** | One default variant | `product_variants.sku` | Primary barcode on that variant |
| **BUNDLE** | One kit parent default variant | Same as SIMPLE | Same as SIMPLE |
| **VARIANT** | Every **included / sellable** Step 5 variant | Per-variant `product_variants.sku` | One primary barcode per variant (optional on Continue) |

`products.product_code` is Internal Code (Basic Details), **not** SKU.

**Product Configuration structure authority is primary for which variants exist.** Identifier assignment must reconcile against included/sellable variants. Excluded / archived / deleted variants are **not** normal identifier targets.

---

## 4. Step 1 → Step 5 Identifier Reconciliation (LOCKED)

| Structure | Rule |
|---|---|
| **SIMPLE** | Default sellable variant identity exists; required unique SKU; Step 1 no-barcode AUTO base becomes the final SKU unchanged; optional barcode/GTIN remains independently assigned |
| **VARIANT** | Every included sellable variant requires a unique SKU; Step 1 AUTO base is extended server-side with each variant's ordered stable value codes; one GTIN cannot belong to multiple variants; a Step 1 scanned GTIN must be **explicitly assigned** to the correct sellable variant **or intentionally left unused** |
| **BUNDLE** | Preserve existing SIMPLE-like parent identifier behaviour inside Step 5; no extra global step |

---

## 5. VARIANT Identifier Journey (inside Step 5)

1. User completes variant matrix + Include Variant (Product Configuration).
2. Identifier section loads all included variants as targets.
3. In AUTO mode, the backend composes every included variant SKU from the one Product base plus ordered persisted Variant Value codes. In MANUAL mode, the user enters SKU per variant. Barcode remains optional and explicitly assigned.
4. HID scanner may fill the focused barcode field; trailing Enter completes one logical scan.
5. Save Draft may leave rows incomplete.
6. Save & Continue requires every included variant to have non-empty SKU, uniqueness, ownership, and barcode format when barcode present.
7. On success, wizard advances to Step 6 (Pricing & Tax).

**Explicit non-goals for VARIANT R1 identifier table:**
- No silent SKU generation for every variant from one seed.
- No Additional Barcode multi-row workflow as primary surface.
- No UOM-specific barcode column in the compact table (`quantity_per_scan = 1`).
- Row selection checkboxes do not change sellability and are not persisted.

---

## 6. VARIANT UI Contract (Table-First)

### 6.1 Header
- Title: `SKU & Barcode — Variant Product` (section title inside Product Configuration)
- Subtitle: `Assign SKU and barcode to each variant.`
- Search / Status filter / Completion summary
- Retain Tenant Admin shell, **7-step** stepper (Scan Barcode … Review & Create), wizard footer, OneVerz tokens

### 6.2 Table columns
Select (UI-only) · Variant · SKU · Barcode · Status · Actions

Reuse `edit_variant_identifier_drawer.dart`. Do not revive Additional Barcode widgets on this surface.

### 6.3 Status chips
COMPLETE | INCOMPLETE | DUPLICATE | INVALID | VALIDATING — text labels required; colour not sole signal.

### 6.4 Responsive
1024×768 tablet-first; internal table scroll; fixed shell/footer.

### 6.5 Selection semantics
Unchanged from prior Step 5 VARIANT table rules (Apply commits; selection ≠ Include Variant).

---

## 7. SKU Rules

- Product Setup no-barcode default: **AUTO**. Manual SKU remains supported.
- Step 1 allocates one stable Product base:
  `{CATEGORY_CODE}-{TENANT_PRODUCT_SEQUENCE:000000}`.
- `SIMPLE` final SKU is the base unchanged.
- `VARIANT` final SKU is
  `{PRODUCT_BASE}-{ORDERED_PRODUCT_OPTION_VALUE_CODES}`. Every variant shares
  the parent Product sequence; no per-variant sequence allocation is allowed.
- Category token authority is persisted `categories.category_code` for the
  selected assignable Category. Never derive it from display name or hierarchy.
- Variant suffix authority is persisted `product_option_values.value_code`,
  ordered by `product_options.sort_order`, then `product_options.option_code`.
  Never hardcode known values or depend on dictionary/DB return order.
- The draft base is carried by
  `product_setup_scan_context.generated_sku_candidate`; final ownership remains
  `product_variants.sku`.
- Never overwrite a clearly user-edited MANUAL SKU.
- Category change after AUTO allocation makes the base stale and requires
  explicit regeneration before finalization.
- Trim outer whitespace before persist.
- Max length: **100**.
- Tenant uniqueness: application validation **and** DB `UNIQUE (tenant_id, sku) WHERE sku IS NOT NULL`.
- Canonical comparison: **case-sensitive (Ordinal)**.
- Save Draft: SKU may be blank.
- Save & Continue: SKU **required** for every included/sellable VARIANT target (and for SIMPLE/BUNDLE default variant).

---

## 8. Barcode Rules

### 8.1 Persistence
Table: `product_barcodes`  
Barcode is a **string**. Never parse to numeric. Preserve leading zeros.  
Tenant uniqueness: `UNIQUE (tenant_id, barcode)`.  
R1: one primary barcode per variant sufficient; `uom_id = null`, `quantity_per_scan = 1`.

### 8.2 Identifier standard vs barcode symbology (LOCKED 2026-09-12 — Option A)

Two **separate** concepts. Authority: [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]] TD-2.

**Barcode symbology** — EXISTING `product_barcodes.barcode_type`:

| code | Meaning |
|---|---|
| `EAN13` | EAN-13 symbology |
| `EAN8` | EAN-8 symbology |
| `UPCA` | UPC-A symbology |
| `CODE128` | CODE-128 |
| `CODE39` | CODE-39 |
| `UNKNOWN` | **IMPLEMENTED** — identifier captured, physical symbology not reported |

**Identifier standard** — **IMPLEMENTED IN BACKEND SOURCE** nullable `product_barcodes.identifier_standard` (migration `20260912085454_AddProductSetupScannerIdentifierContext`; local PostgreSQL test DB verified; **production/shared apply not claimed**):

| code | Meaning |
|---|---|
| `GTIN8` / `GTIN12` / `GTIN13` / `GTIN14` | Derived from validated length + checksum |
| `OTHER` | Non-GTIN identifier |
| NULL | Legacy/unclassified — readers must tolerate |

> **SUPERSEDED:** `barcode_type = 'GTIN14'` (2026-09-11). GTIN-14 is an identifier standard, never a symbology. Do not implement it as a `barcode_type` value.

Returned via Product Create Options (extend existing options endpoint).

**Must not hard-code `EAN13` on create.** When barcode is non-empty: derive `identifier_standard` from the digits/checksum, and persist `barcode_type` only when the symbology is genuinely known — otherwise `UNKNOWN`.

### 8.3 Requiredness
Save Draft: barcode optional. Save & Continue: barcode optional. If present: type + format validation.

### 8.4 Format validation (server authoritative)

| Identifier standard / symbology | Rules (minimum) |
|---|---|
| `GTIN13` (often EAN-13) | 13 digits + checksum |
| `GTIN8` (often EAN-8) | 8 digits + checksum |
| `GTIN12` (often UPC-A) | 12 digits + checksum |
| `GTIN14` | 14 digits + checksum; symbology `UNKNOWN` unless reported |
| `OTHER` + CODE128 / CODE39 | charset policies per system |

Flutter may mirror for UX only.

### 8.5 Scanner (identifier section)
HID keyboard wedge first. Focus field → characters → trailing Enter → one logical edit. No save-per-keystroke. Step 1 acquisition remains the primary scanner-first entry; Step 5 scanning is correction/assignment.

---

## 9. API Contract (Identifier Payload)

Endpoint remains unified draft:

`PUT /api/v1/tenant-admin/products/{productId}/draft`

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

`currentSetupStep: 5` now means **Product Configuration** (including identifiers), not a standalone Barcode & SKU step.

Duplicate conflicts: HTTP **409** with `product.duplicate_sku` / `product.duplicate_barcode` and safe same-tenant conflict metadata only.

Obsolete: top-level `variantIdentifiers` as live shape.

---

## 10. Save Draft vs Save & Continue

| | Save Draft | Save & Continue |
|---|---|---|
| Incomplete SKUs | Allowed | Reject — every included target needs SKU |
| Blank barcodes | Allowed | Allowed |
| Malformed / foreign variant IDs | Reject | Reject |
| Duplicate SKU/barcode | Reject (or 409) | Reject (or 409) |
| Invalid barcode format when present | Reject | Reject |
| Step advance | Stay on 5 | Advance to 6 on success |
| Concurrency | `expectedRowVersion` | same |

Coverage algorithm unchanged in spirit: load authoritative included variants → reconcile assignments → require SKU coverage → bulk uniqueness → ownership → atomic persist.

---

## 11. Ownership & Security

For every `productVariantId`: tenant match, product match, not archived/deleted, applicable identifier target. Never silently ignore unknown/cross-product IDs.

Permissions:
- Create flow: `catalog.products.create` + `catalog.barcodes.manage`
- Edit flow: `catalog.products.update` + `catalog.barcodes.manage`
- Entitlement: `product_catalog`

---

## 12. Uniqueness Implementation

In-request Ordinal checks + bulk DB queries + DB unique constraints as final race defense → 409.

---

## 13. Configuration ↔ Identifier Reconciliation

| Configuration change | Identifier effect |
|---|---|
| New included variant | New Incomplete target; blank SKU/barcode |
| Display label change only | Preserve SKU/barcode |
| Exclude / archive / delete | Remove from required targets; follow tombstone/lifecycle |
| Regen with stable combination key | Preserve identifiers for matching keys |
| Step 1 GTIN candidate | Must be explicitly assigned or left unused; never fan-out |

---

## 14. SIMPLE / BUNDLE

One SKU + optional parent/variant barcode. Same uniqueness/type/string rules. No-barcode path may prefill generated SKU candidate once.

UI polish (compact editors + one-row assignment table + Apply/clear pattern) remains valid inside Step 5 Product Configuration.

---

## 15. Permissions & Concurrency & NFR

Optimistic concurrency via product `rowVersion`. No N+1 uniqueness or image loading. Scanner debounce must not create rowVersion storms.

---

## 15A. Duplicate Product Contract (TARGET)

Duplicating a product must **never** clone unique identity.

| Copied | Never copied |
|---|---|
| Non-identifier configuration: name basis, descriptions, category/brand, structure, options, tracking policy, pricing/tax template values | GTIN/barcodes, unique SKUs, stock/inventory balances, stock movements, audit history, publish timestamps |

Rules:

- Result is a **NEW DRAFT**; the source product is untouched.
- Unique sellable identifiers are **cleared** (or regenerated as non-reserved candidates per §15.1 semantics of the Scan spec).
- The duplicate cannot publish until unique identifiers exist and pass revalidation.
- Duplication is **not** an alias for "Edit Existing Product" from a Step 1 local match.
- Status: **TARGET** — no implementation evidence is claimed.

Authority: [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]] TD-8.

---

## 16. Test Matrix (Summary)

Backend: coverage Continue, ownership, bulk dupes, `barcodeType` vs `identifierStandard` separation (no `GTIN14` symbology), leading zeros, case-sensitive SKU, 409 races, permissions, rehydrate, Step 1 candidate assignment, duplicate-product identifier clearing.  
Flutter: table-first UI, search/filter, UI-only selection, type round-trip, scanner Enter, 1024×768, draft reopen, config reconcile, no silent GTIN fan-out.

Full cases: [[../../10_TESTING_QA/Test_Case/10_Product_Core/Product_Setup_Step1_Scan_Barcode_Test_Cases]] and identifier coverage therein / Product CRUD cases.

---

## 17. Superseded Statements

Obsolete as active global-step authority:
- Standalone global **Step 5 — Barcode & SKU**
- Pre-2026-09-14 B5 `SKU-{name stem}` / `SKU-NB`, non-sequential candidate
  behavior. It is superseded for `NO_BARCODE_PRODUCT` by
  [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SKU_AUTO_GENERATION_CANONICAL_DECISION_2026-09-14]].
- `UpdateProductDraftStep5RequestDto` / top-level `variantIdentifiers` as the live shape name if still used only historically
- Hard-coded default barcode type without client/server inference rules
- Treating GTIN-14 as EAN-13/UPC-A symbology
- **`barcode_type = 'GTIN14'`** as an allowed symbology value (2026-09-11 statement corrected 2026-09-12; use `identifier_standard` instead)
- Flat `baseSku` / `parentProductBarcode` / top-level `variantIdentifiers[]` draft payload shape

Decisions: [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]] (current technical authority) · [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11]] (Step 1 flow authority).
