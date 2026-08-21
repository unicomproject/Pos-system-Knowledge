<!-- title: Tenant Admin Add Product — 7-Step Wizard UI/UX Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Scope -->
<!-- last_updated: 2026-08-11 -->

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

## 3. Step 1 Form Layout — Basic Details
(Maintains standard basic details UI layout specifications).

---

## 4. Step 2 Form Layout — Product Type & Tracking
(Maintains standard product type & tracking rules grid).

---

## 4.1 Step 3 Form Layout — Units & Pack Conversion Setup
(Maintains standard units & pack conversion UI specifications).

---

## 4.2 Step 4 Form Layout — Variant Configuration Setup (VARIANT Mode)

- **Stepper Step Label**: `Product Configuration`
- **Page Heading**: Variant Configuration
- **Page Subtitle**: Define variant options, pick values, generate combination matrix, edit display labels, and manage variant images.

### Layout Overview
Step 4 renders three primary UI regions:
1. **Define Attributes Card** (Top section):
   - Attribute Name dropdown (select from active tenant/platform option templates e.g. Size, Colour).
   - Values multi-select tag input (select active option values).
   - Trash icon button (`Remove Attribute Row`).
   - `+ Add Attribute` button (appends row).
   - `Generate Variants` primary button.
2. **Configuration Summary Card** (Middle info bar):
   - `6 Variants Generated` | `2 Attributes Defined` | `6 Included`.
3. **Generated Variants Table & Actions** (Bottom section):
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

- **Stepper Step Label**: `Pricing & Tax`
- **Page Heading**: Pricing & Tax
- **Page Subtitle**: Set the cost, standard selling price, and applicable tax for this product.

### Layout Overview
Step 6 renders a simplified single-column form:
1. **Pricing Section**:
   - `Cost Price`: Numeric input field. (Required)
   - `Standard Selling Price`: Numeric input field. (Required)
   - `Discount Price`: Numeric input field. (Optional)
2. **Tax Section**:
   - `Tax Name`: Dropdown selector populated from active tenant taxes. (Required)
   - `Tax Rate`: Read-only field auto-filled based on the selected tax.
   - `Tax Exclusive`: Read-only / locked state indicating the pricing model is tax exclusive.

### Exclusions (Important)
- Do NOT display Margin or Margin %.
- Do NOT display a Price List selector.
- Do NOT display Outlet-specific price overrides.
- Do NOT display a Tax Inclusive toggle.

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
- **Far-Right Action**: `Save & Continue` button (`Icons.arrow_forward`). Advances to Step 5 (Barcode & SKU).

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
