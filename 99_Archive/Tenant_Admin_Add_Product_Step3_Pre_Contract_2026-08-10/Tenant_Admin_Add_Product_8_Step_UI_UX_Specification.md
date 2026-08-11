<!-- title: Tenant Admin Add Product 8-Step UI/UX Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-09 -->

# Tenant Admin Add Product 8-Step UI/UX Specification

## 1. Overview & Screen Layout

This specification documents the UI/UX design for the **Tenant Admin Add Product** screen (Reference UI 2 alignment).

The screen operates within the **Tenant Admin Application Shell**:
- **Sidebar**: Left sidebar navigation with "Products" expanded and "Add Product" highlighted as active menu item.
- **Header**: Top navigation bar with tenant switcher, search, notification bell, and user profile.
- **Breadcrumbs**: Explicitly **NO** "Product / Add Product" text breadcrumb header on this page.
- **Page Title**: "Add Product" (Font size: 24px, Bold)
- **Page Subtitle**: "Create a new catalog product with inventory, pricing, and channel visibility."

---

## 2. Stepper Component (Fixed 8-Step Horizontal Stepper)

Positioned directly below the header. Responsive horizontal track displaying 8 step nodes:

1. **Basic Details**
2. **Product Type & Tracking**
3. **Units & Pack Conversion**
4. **Product Configuration**
5. **Barcode & SKU**
6. **Pricing & Tax**
7. **Channel Visibility**
8. **Review & Create**

### Node States:
- **Selected/Active Step**: Primary blue circle with step number, bold text label, glowing blue underline indicator.
- **Completed Step**: Green circle with checkmark icon (`Icons.check`), clickable to jump back.
- **Future/Upcoming Step**: Muted gray circle with step number, gray text label, non-clickable until reached.
- **Skipped / N/A Step (Step 4 for Simple Products)**: Muted gray badge labeled "N/A (Skipped)", automatically bypassed when clicking Continue from Step 3.

---

## 3. Step 1 Form Layout (Reference UI 2 Detailed Spec)

Step 1 uses a 2-column or 3-column responsive grid:

### Left Column: Main Form Fields
- **Product Name \***: Input text field with icon `Icons.inventory_2_outlined`. Placeholder: "e.g. Wireless Bluetooth Headphones".
- **Short Name / Internal Code**: Input text field with icon `Icons.qr_code_2_outlined`. Placeholder: "e.g. PROD-HEADPHONE-01". Helper text: "Internal reference code for reporting."
- **Category \***: Searchable Select Dropdown with icon `Icons.category_outlined`. Placeholder: "Select category".
- **Brand (Optional)**: Searchable Select Dropdown with icon `Icons.sell_outlined`. Placeholder: "Select brand (optional)". Badge: `Optional`.
- **Short Description**: Textarea (2 lines) with icon `Icons.notes_outlined`. Placeholder: "Brief summary for POS grid...".
- **Long Description**: Rich Text / Markdown Editor (5 lines). Placeholder: "Detailed description for online store storefront...".

### Right Column (Upper): Status & Options Card
Container background `#F9FAFB`, border `1px solid #E5E7EB`, border-radius `8px`, padding `16px`.
Title: **Status & Options**
- **Active Status** (Toggle Switch): Subtitle: "Enable immediate active status after publish." Defaults to `ON`.
- **POS Sellable** (Toggle Switch): Subtitle: "Available for sale in POS tills." Defaults to `ON`.
- **Track Inventory** (Toggle Switch): Subtitle: "Enable stock tracking & alerts." Defaults to `ON`.
- **Allow Online Sale** (Toggle Switch): Subtitle: "Visible on e-commerce storefront." Defaults to `ON`.

### Right Column (Lower): Product Image Upload Card (Reference Image 1 Alignment)
Container background `#FFFFFF`, border `1px solid #E5E7EB`, border-radius `8px`, padding `20px`.
- **Card Title**: `Product Image`
- **Action Button**: `Upload Product Image` (Primary button).
- **Format Subtext**: `PNG, JPG up to 5MB`
- **Click Action**: Opens **Product Images Manager** overlay panel beside/above Step 1.

### Product Images Manager Panel (Overlay / Slide-out Panel)
- **Header**: `Product Images`, Close `X` icon, `Replace Images` button.
- **Subheader Counter**: `N / 10` (e.g. `0 / 10` up to `10 / 10`).
- **Instruction**: `Drag & drop to reorder images`
- **Thumbnail Grid**: Compact 1:1 image tiles supporting:
  - Drag-and-drop handle
  - `Primary` pill badge on primary image tile
  - Delete `X` button
  - `Upload More` tile (when `count < 10`)
- **Image Guidelines Card**:
  - `Front image is recommended as primary.`
  - `Use high quality images for better visibility.`
  - `Supported formats: PNG, JPG.`
  - `Maximum file size: 5MB per image.`

> [!CAUTION]
> The legacy permanently expanded black drag/drop gallery and empty `Add Image` grid tiles occupying the main Step 1 form (Reference Image 2 style) are **LEGACY UI** and must NOT be rendered.

---

## 4. Step 2 Form Layout — Product Type & Tracking Setup

- **Page Title**: Product Type & Tracking Setup
- **Page Subtitle**: Choose the product type and how this product should be tracked.

### Product Type Selection Cards (3 Cards Row)
Renders a 3-column selection grid (1 column on mobile, 2 or 3 on tablet/desktop):

1. **Simple Product Card**:
   - Icon: `Icons.inventory_2_outlined`
   - Title: **Simple Product**
   - Subtitle: Single item with one SKU. No variants or components.
   - Behavior: Selects `productStructure = "SIMPLE"`. Step 4 (Product Configuration) will be marked `N/A (Skipped)` and bypassed automatically.

2. **Variant Product Card**:
   - Icon: `Icons.dashboard_customize_outlined`
   - Title: **Variant Product**
   - Subtitle: Items with multiple variants such as size, color, material.
   - Behavior: Selects `productStructure = "VARIANT"`. Step 4 will render the Variant Matrix & Options setup.

3. **Bundle / Kit Card**:
   - Icon: `Icons.inventory_outlined`
   - Title: **Bundle / Kit**
   - Subtitle: Pre-packaged items sold together as a bundle.
   - Behavior: Selects `productStructure = "BUNDLE"`. Step 4 will render Kit Assembly & Component Search.

#### Card Styling & Theme States:
- **Default Card**: Border `1px solid #E5E7EB`, background `#FFFFFF`, border-radius `8px`, padding `20px`.
- **Hover State**: Border `1px solid #FF8C00` (OneVerz approved product theme orange accent), box-shadow `0 4px 6px -1px rgba(0, 0, 0, 0.1)`.
- **Selected State**: Border `2px solid #FF8C00`, background `#FFF8F0` (light orange tint), top-right checked indicator badge icon `Icons.check_circle` in `#FF8C00`.
- **Focus State**: Visible ring outline `2px solid #FF8C00`, outline-offset `2px`.

---

### Tracking & Stock Rules Grid (2-Column Grid)

Container title: **Tracking & Stock Rules**

1. **Track Inventory** (Master Toggle):
   - Switch label: **Track Inventory**
   - Subtitle: "Maintain stock counts, reorder rules, and stock ledgers."
   - Default: `ON` (`true`).
   - Behavior: Toggling `OFF` locks and disables all three sub-toggles below.

2. **Batch / Lot Tracking** (Toggle Switch):
   - Switch label: **Batch / Lot Tracking**
   - Subtitle: "Track stock by batch or lot numbers for traceability."
   - Default: `OFF` (`false`).
   - Gating: Disabled when `Track Inventory = OFF`. Disabled when `Serial Number Tracking = ON`.

3. **Expiry Tracking** (Toggle Switch):
   - Switch label: **Expiry Tracking**
   - Subtitle: "Track shelf life and expiry dates for perishable items."
   - Default: `OFF` (`false`).
   - Gating: Disabled when `Track Inventory = OFF` OR `Batch / Lot Tracking = OFF`. Automatically turns OFF if Batch Tracking is turned OFF.

4. **Serial Number Tracking** (Toggle Switch):
   - Switch label: **Serial Number Tracking**
   - Subtitle: "Track individual serialized items with unique serial numbers."
   - Default: `OFF` (`false`).
   - Gating: Disabled when `Track Inventory = OFF`. Toggling `ON` automatically forces `Batch / Lot Tracking = OFF` and `Expiry Tracking = OFF`.

---

### Footer Actions on Step 2
- **Back**: Primary outline button (`Icons.arrow_back`). Navigates to Step 1.
- **Save Draft**: Outlined primary button (`Icons.save_outlined`). Persists Step 2 to server without advancing.
- **Skip**: **DISABLED / HIDDEN**. (Step 2 is non-skippable).
- **Save & Continue**: Filled primary button (`Icons.arrow_forward`). Validates Step 2 tracking matrix, persists atomically, and advances to Step 3.

---

## 5. Conditional Product Summary Card

Appears on the top right area after the first Save Draft or when Resuming a Draft:
- **Header**: Product Summary
- **Thumbnail**: 48x48 px cover image thumbnail (or fallback icon)
- **Product Name**: Displayed in bold (or `Untitled Product`)
- **Product Code**: Displayed in subtitle (or `Product Code: Pending`)
- **Product Structure Badge**: `SIMPLE`, `VARIANT`, `BUNDLE`
- **Category & Brand**: Displayed as subtle metadata badges
- **Inventory Tracking Badge**: `Tracked` / `Not Tracked`
- **Status Badge**: Amber `DRAFT` badge during wizard completion
- **Step Progress Bar**: e.g., "Step 2 of 8 Completed (25%)"

---

## 6. Wizard Footer Actions

Sticky bottom bar spanning the wizard content width:
- **Left Action**: `Cancel` button (Text button, gray hover).
  - If dirty & unsaved: Prompts "Discard unsaved changes?" modal.
  - If confirmed: Navigates back to `/tenant-admin/products`.
- **Center-Right Action**: `Save Draft` button (Outlined primary button, icon `Icons.save_outlined`).
  - Performs draft-level validation, saves partial state to server, shows toast "Draft saved successfully", stays on current step.
- **Far-Right Action**: `Save & Continue` button (Filled primary button, icon `Icons.arrow_forward`).
  - Validates current step mandatory fields. On success, advances to next step. On Step 8, label changes to `Publish & Create Product`.

---

## 7. Responsive Breakpoint Rules

- **Desktop (>= 1280px)**: 2-column main form grid + right-side Status & Image cards side-by-side. 8-step stepper fully expanded horizontally.
- **Laptop (1024px - 1279px)**: Main form grid single column, right-side cards stacked underneath form. Stepper labels slightly condensed.
- **Tablet / Touchscreen (768px - 1023px)**: Stepper wraps to 2 rows of 4 nodes or horizontal touch scroll. Touch targets min 44x44 px. Switches and dropdowns optimized for finger taps.
- **Mobile (< 768px)**: Compact vertical step view with collapsible step accordion. Footer buttons full width stacked.

---

## 8. Related Documents
- [[04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_8_Step_Contract]]
- [[08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_Flutter_Implementation_Specification]]
