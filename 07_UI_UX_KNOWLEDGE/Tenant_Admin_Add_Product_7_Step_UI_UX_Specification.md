<!-- title: Tenant Admin Add Product — 7-Step Wizard UI/UX Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Scope -->
<!-- last_updated: 2026-09-04 -->

# Tenant Admin Add Product — 7-Step Wizard UI/UX Specification

## 1. Overview & Reference UI Alignment

This document defines the complete UI/UX layout, visual styling, responsive behaviors, component contracts, and form field specifications for the **Tenant Admin Add Product / Product Setup** feature in OneVerz POS.

It enforces strict alignment with **Reference UI 2** and replaces legacy 4-step dialog mockups with a **fixed 7-Step wizard layout**.

---

## 2. Global Stepper Header & Layout Structure

### 2.1 Fixed 7-Step Horizontal Stepper Header
1. **Basic Details**
2. **Product Type & Tracking**
3. **Units & Pack Conversion**
4. **Product Configuration** (VARIANT mode: Variant Configuration)
5. **Barcode & SKU**
6. **Pricing & Tax**
7. **Review & Create**

---

## 2.1 Step 5 — VARIANT table-first layout (canonical)

Reference: [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Barcode_SKU_Specification]].

For `productStructure == VARIANT` only:

```text
SKU & Barcode — Variant Product
Assign SKU and barcode to each variant.

[Search Variants]  [Filter ▾]              4 of 6 complete

┌──┬──────────────┬──────────┬──────────┬──────────┬─────────┐
│☐ │ Variant      │ SKU      │ Barcode  │ Status   │ Actions │
├──┼──────────────┼──────────┼──────────┼──────────┼─────────┤
│☐ │ thumb + name │ text     │ text+scan│ chip     │ ⋮       │
│  │ Blue / 500ml │          │          │          │         │
└──┴──────────────┴──────────┴──────────┴──────────┴─────────┘
```

Rules:
- Keep Tenant Admin shell, 7-step stepper, wizard footer, OneVerz tokens.
- **No Auto-generate SKUs** button.
- Multi-select checkboxes are UI selection only — never sellability.
- Barcode type via edit drawer if column density requires; still persisted.
- Internal table scroll at 1024×768; ~5 visible rows; no page-level uncontrolled scroll.
- Do not revive Additional Barcode table as the primary VARIANT Step 5 surface.

SIMPLE / BUNDLE keep a compact single-product identifier form **plus** a one-row assignment table (not the VARIANT multi-row checkbox table).

### 2.1.1 Step 5 — SIMPLE / BUNDLE identifier polish (2026-09-03)

- Product Name is locked. User types **Base SKU** and **Parent Product Barcode**, then **Apply**.
- Apply commits identifiers into the assignment row, then **clears** Base SKU and Parent Product Barcode. Generate may auto-fill SKU from Internal Code only when SKU is still empty.
- Assignment table (SIMPLE/BUNDLE): **no checkbox**; green selected dot; columns Variant | SKU | Barcode | Scan | Status | pencil. Thumbnail hidden. Pencil opens the Edit Variant drawer.
- **Edit Variant SKU & Barcode** drawer: blue info banner; Variant read-only; SKU *; Barcode *; Scan to Replace Barcode; uniqueness banners; Cancel + Update. **Barcode Type dropdown is hidden** (type still persisted internally).

---

## 3. Step 1 Form Layout — Basic Details

TARGET layout for 1024×768 tablet: compact cards, professional spacing, no
unnecessary page-length growth, avoid nested scrolling. Preserve the existing
Add Product visual system. Do not redesign unrelated UI.

```text
STEP 1 — BASIC DETAILS

┌ Product Information ────────────────────────────┐
│ Product Name                                    │
│ Internal Code                                   │
│ Category             Brand                      │
│ Short Description                               │
│ Long Description                                │
│ Product Images                                  │
└─────────────────────────────────────────────────┘

┌ Channel Availability ───────────────────────────┐
│ In-Store POS                         [ON]        │
│ Online Store                         [OFF]       │
└─────────────────────────────────────────────────┘
```

Initial Tracking Details do **not** belong on Step 1 (moved 2026-09-01).

---

## 4. Step 2 Form Layout — Product Type & Tracking

```text
STEP 2 — PRODUCT TYPE & TRACKING

Select Product Type *
Simple / Variant / Bundle / Kit

(after Product Type is selected, SIMPLE / VARIANT)

┌ Initial Tracking Details ───────────────────────┐
│ Batch Number                                    │
│ Expiry Date                                     │
│ Serial Number                                   │
│                                                 │
│ Helper: Optional. Turn on matching Batch,       │
│ Expiry, or Serial tracking below to keep        │
│ these values.                                   │
└─────────────────────────────────────────────────┘

Inventory Tracking
Track Inventory
Batch Tracking
Expiry Tracking
Serial Tracking
```

All three Initial Tracking fields are optional. Date uses a date picker.
Show the card only after Product Type is explicitly selected, **before**
Tracking & Stock Rules. Hide the card for Bundle / Kit.

TARGET confirmation when identity conflicts with selected policy:

```text
Initial Serial Number will be removed because
Batch + Expiry Tracking is selected.
```

Require confirmation before destructive clearing. CURRENT Flutter applies the
clear plan on continue with `confirmed: true` (GAP vs BR-TRACK-008). Canonical
rules:
[[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]].

---

## 4.1 Step 3 Form Layout — Units & Pack Conversion Setup
(Maintains standard units & pack conversion UI specifications).

---

## 4.2 Step 4 Form Layout — Variant Configuration Setup (VARIANT Mode)

- **Stepper Step Label**: `Product Configuration`
- **Page Heading**: Variant Configuration
- **Page Subtitle**: Define variant options, pick values, generate combination matrix, edit display labels, and manage variant images.

### Layout Overview
Step 4 renders four primary UI regions (VARIANT mode):
1. **Define Attributes Card** (Top section):
   - Attribute Name dropdown (select from active tenant/platform option templates e.g. Size, Colour).
   - Values multi-select tag input (select active option values).
   - Trash icon button (`Remove Attribute Row`).
   - `+ Add Attribute` button (appends row).
   - Top-right actions may include `+ Add Attribute` and `All Variants` toggle/filter per current design.
2. **Estimated Variant Count Card** (Live preview — VARIANT only):
   - Title: `Estimated Variant Count`
   - Primary value: `{count} variants`
   - Secondary text: `will be created`
   - Helper: `Based on the selected attributes and values.`
   - Calculation summary: `{AttributeName1} ({N1}) × {AttributeName2} ({N2}) = {count} variants` (dynamic attribute names; no hard-coded examples).
   - Updates immediately on attribute/value add/remove with **no network request**.
   - Incomplete configuration (zero values on any selected attribute, or no valid attributes): show `0 variants will be created` or equivalent design-system incomplete state.
   - MUST NOT render for SIMPLE products.
3. **Generate Variants / Apply Action**:
   - Primary button triggers Actual Variant Generation in wizard state.
4. **Configuration Summary Card** (Post-generation info bar):
   - `6 Variants Generated` | `2 Attributes Defined` | `6 Included`.
5. **Generated Variants Table & Actions** (Bottom section):
    - Columns: `Variant` (`combinationLabel` e.g. `Red / S`), `Actions` (`Edit` icon, `Delete` icon).
   - `Edit` action opens right-side drawer (`Edit Variant`).
   - `Delete` action opens centered confirmation modal (`Delete Variant`).

### Edit Variant Right-Side Drawer
- **Title**: `Edit Variant`
- **Fields**:
  - `Variant Name / Combination Label`: Read-only string.
  - `Attribute Summary`: Badges (`Colour: Red`, `Size: S`).
  - `Variant Image`: Change Image / Remove Override / Apply Image To (`Only this variant`, `All variants with Colour: Red`).
  - `Display Label`: Editable text field (e.g. `Home Jersey - Red / S`).
  - **`Include Variant`** Toggle: Switch labeled **`Include Variant`** (NEVER labeled Availability). Helper text: `Include this variant in your catalog for pricing and inventory setup.`
- **Actions**: `Cancel` / `Save Changes`.

### Delete Variant Confirmation Modal
- **Header**: `Delete Variant`
- **Body**: "Are you sure you want to remove the variant combination 'Red / M'?"
- **Actions**: `Cancel` / `Delete Variant` (Destructive Red).

---

## 4.3 Step 6 Form Layout — Pricing & Tax

Canonical contract: [[../04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract]] §6.1–6.5.  
Tax authority: [[../04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract]]

- **Stepper Step Label**: `Pricing & Tax`
- Currency is **inherited from tenant** (`create-options.currencyCode`) and used as the selling-price prefix / Tax Preview / Effective Tax Rate labels. Multi-country = each tenant’s `base_currency_code`. **No currency info banner** and **no currency dropdown**. Do not hard-code `LKR`.

### 4.3.1 Shared rules

- OneVerz Tenant Admin design system only — no new visual architecture.
- Footer: Back, Cancel, Save Draft, Save & Continue.
- Save Draft may leave pricing incomplete. Save & Continue enforces structure-specific completeness.
- Do NOT display Margin %, Price List selector, outlet overrides, Used For / Goods / Services, or a second conflicting Inclusive toggle.

### 4.3.2 SIMPLE / BUNDLE (CONFIRMED)

- **Page Heading**: Pricing & Tax
- **Page Subtitle**: Set the selling price and tax details for this product.
- Two-column layout at tablet+ (fields left, preview right). Stack on narrow width.

Left fields:
1. `Standard Selling Price *` — numeric, currency prefix from `currencyCode`. No helper text under the field.
2. `Tax Class *` — ACTIVE Tax Setups via create-options. Display: `Standard Rate (15%)` / `Zero Rated (0%)` / `Name (Exempt)`. Rate in label — **no separate Effective Tax Rate field**.
3. `Tax Presentation *` — side-by-side cards:
   - **Tax Exclusive** (default): “Tax will be added at checkout”
   - **Tax Inclusive**: “Tax is included in the price”

Right card — **Tax Preview** (client-side estimate; sale-time tax remains server-authoritative):
- Net Price (Excl. Tax) / Estimated Tax / Final Display Price (Incl. Tax) — highlighted
- Footer: “This is the amount customers will pay.”

**Exclusions:** Do **not** show Cost Price, Discount Price, currency banner, or Effective Tax Rate field. Cost optional on Continue/create.

Formulas (ADR 2026-08-27): Exclusive `tax = price × rate/100`, `final = price + tax`. Inclusive `net = price / (1 + rate/100)`, `tax = price − net`, `final = price`.

### 4.3.3 VARIANT (CANONICAL TARGET)

- **Page Heading**: Pricing & Tax — Variant Product
- **Page Subtitle**: Set pricing and tax details for each variant. Prices are managed at variant level.

| Section | Content |
|---|---|
| A. Product summary | Product Name; Variant Product badge; total included/sellable variants |
| B. Pricing status | Priced count; Pending count; **Price Range** (derived; single price if only one; empty/pending if none) |
| C. Set Same Price for All Variants | Currency prefix + amount; **Apply to All** only (explicit; entering the amount alone must not silently overwrite) |
| D. Variant pricing table | Variant, SKU, Selling Price (edit), Status (Priced/Pending — derived), Actions — **no** Default Price column |
| E. Tax settings | Tax Class *; Effective Tax Rate (read-only, derived from Tax Class) |
| F. Important note | “Each variant can have its own selling price. Use Apply to All only to set the same starting price, then adjust individual variants if needed.” |

**Rules:**
- Rows keyed by stable `ProductVariantId` / combination identity — never by table index.
- **Set Same Price for All Variants** is a **bulk helper only**, not a parent authoritative sale price. Do not label it “Default Selling Price”.
- After Apply to All, each row owns its value; editing one row does not affect others.
- Price Range / Priced / Pending derive from actual row selling prices only — never from the bulk helper input alone.- Tax Class + Inclusive/Exclusive are **product-common** (do not repeat Tax Class on every row unless Tax Management later requires variant override).
- Do **not** show Cost Price / Discount Price on the VARIANT matrix for R1 of this contract (Cost remains product-level architecture if sent).
- Step 6 must not generate variants, change combinations, or generate SKU/barcode.

---

## 5. Conditional Product Summary Card

Appears on the top right area after the first Save Draft or when Resuming a Draft:
- **Header**: Product Summary
- **Thumbnail**: 48x48 px cover image thumbnail
- **Product Name**: Displayed in bold (or `Untitled Product`)
- **Product Code**: Displayed in subtitle (or `Product Code: Pending`)
- **Product Structure Badge**: `SIMPLE`, `VARIANT`, `BUNDLE`
- **Category & Brand**: Displayed as subtle metadata badges
- **Inventory Tracking Badge**: `Tracked` / `Not Tracked`
- **Status Badge**: Amber `DRAFT` badge during wizard completion
- **Step Progress Bar**: e.g., "Step 4 of 7 Completed"

---

## 6. Wizard Footer Actions

Sticky bottom bar spanning the wizard content width:
- **Left Action**: `Cancel` button.
- **Center-Right Action**: `Save Draft` button (`Icons.save_outlined`).
- **Far-Right Action**: `Save & Continue` button (`Icons.arrow_forward`). On Step 7 the label is `Create Product`.

### 6.1 Post-create success screen (canonical)

After **Create Product** succeeds, replace the wizard (stepper + review + footer) with a full success card. **Do not** show a create-success toast and **do not** auto-redirect to Product List.

```text
Product Created Successfully!
Your product has been created and is ready to use.

[thumbnail] Product Name
Product Code / SKU | Status | Total SKUs
Product Type       | Total Variants (VARIANT only) | Created At

[View Product]  [Add Another Product]  [Back to Products]
Great job! {Product Name} has been successfully added to your catalog.
```

- Summary values are the created product (wizard state after backend create). SIMPLE vs VARIANT fields follow structure (hide Total Variants for SIMPLE).
- **View Product** → product detail view `/tenant-admin/products/{productId}`.
- **Add Another Product** → fresh wizard at Step 1.
- **Back to Products** → Product List.
- Product List providers still refresh so the list is current when the user returns.

---

## 7. Responsive Breakpoint Rules

- **Desktop (>= 1280px)**: 2-column main form grid + right-side Status & Image cards side-by-side. 7-Step stepper fully expanded horizontally.
- **Laptop (1024px - 1279px)**: Main form grid single column, right-side cards stacked underneath form.
- **Tablet / Touchscreen (768px - 1023px)**: Touch targets min 44x44 px. Right-side drawer covers 60% viewport width.
- **Mobile (< 768px)**: Compact vertical step view. Drawer covers 100% viewport width.

---

## 8. Related Documents
- [[../04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification]]
- [[08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification]]
- [[../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_INITIAL_TRACKING_DETAILS_STEP2_COLLECTION_DECISION_2026-09-01]]
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]]
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Barcode_SKU_Specification]]
- [[../04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract]]

## Implementation-Grade UI Contract: Add Component Drawer

**Header**: `Add Component`
**Controls**: X close, Cancel, Add to Bundle

**Search**:
Placeholder: `Search by product name, SKU or barcode`
Support: Product Name, Product SKU, Product Barcode, Variant SKU, Variant Barcode.
Requires minimum search length, debounce, loading states, no result, error handling, pagination, reset, and stale request handling.

**Search Result Card**:
Displays: Product Image, Product Name, SKU, Product Structure, Tracking Type, Available Stock at selected Outlet.

**Selected Component Panel**:
Displays: Product, exact Variant, SKU, tracking type, Unit, Required Quantity, Available Stock, Supports Bundles.

**Buttons**:
`Add to Bundle` = disabled initially, enabled only after required data is valid. In edit mode, button says `Update Component`.

**Drawer vs Page State**:
Cancel/X/Escape only clears drawer temporary state. It never clears already-added Bundle components. Changes only reflect on the page state upon clicking Add/Update, and only persist to backend upon Save Draft / Save & Continue.

## Permission-aware UX

Flutter permission checks are UX only. Backend authorization is authoritative.

Hide Add Product when start eligibility fails (create + barcodes.manage + pricing.manage + tax lookup). Disable VARIANT/BUNDLE cards at Step 2 without specialized manage permissions. Hide/disable media, channels, cost, and advanced tracking according to the canonical matrix. Never dead-end the wizard after Step 1.

Authority: [[../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]].
