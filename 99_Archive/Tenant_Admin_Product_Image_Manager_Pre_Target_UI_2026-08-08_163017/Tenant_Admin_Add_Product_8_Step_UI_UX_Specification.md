<!-- title: Tenant Admin Add Product 8-Step UI/UX Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-08 -->

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

### Right Column (Lower): Product Image Upload Card
Container background `#FFFFFF`, border `1px dashed #3B82F6`, border-radius `8px`, padding `20px`.
- **Drop Zone**: Cloud upload icon `Icons.cloud_upload_outlined`.
- **Text**: "Drag & drop product images here or **browse files**"
- **Format Subtext**: "PNG, JPG, JPEG, WEBP up to 5MB each"
- **Image Grid**: Horizontal scroll / wrap tile grid showing image previews. First tile has a blue **COVER** badge.
- **Hover Actions**: Replace Image button, Delete Image button.

---

## 4. Conditional Product Summary Card

Appears on the top right area after the first Save Draft or when Resuming a Draft:
- **Header**: Product Summary
- **Thumbnail**: 48x48 px cover image thumbnail (or fallback icon)
- **Product Name**: Displayed in bold
- **Category & Brand**: Displayed as subtle metadata badges
- **Status Badge**: Amber `DRAFT` badge during wizard completion
- **Step Progress Bar**: e.g., "Step 1 of 8 Completed (12%)"

---

## 5. Wizard Footer Actions

Sticky bottom bar spanning the wizard content width:
- **Left Action**: `Cancel` button (Text button, gray hover).
  - If dirty & unsaved: Prompts "Discard unsaved changes?" modal.
  - If confirmed: Navigates back to `/tenant-admin/products`.
- **Center-Right Action**: `Save Draft` button (Outlined primary button, icon `Icons.save_outlined`).
  - Performs draft-level validation, saves partial state to server, shows toast "Draft saved successfully", stays on current step.
- **Far-Right Action**: `Save & Continue` button (Filled primary button, icon `Icons.arrow_forward`).
  - Validates current step mandatory fields. On success, advances to next step. On Step 8, label changes to `Publish & Create Product`.

---

## 6. Responsive Breakpoint Rules

- **Desktop (>= 1280px)**: 2-column main form grid + right-side Status & Image cards side-by-side. 8-step stepper fully expanded horizontally.
- **Laptop (1024px - 1279px)**: Main form grid single column, right-side cards stacked underneath form. Stepper labels slightly condensed.
- **Tablet / Touchscreen (768px - 1023px)**: Stepper wraps to 2 rows of 4 nodes or horizontal touch scroll. Touch targets min 44x44 px. Switches and dropdowns optimized for finger taps.
- **Mobile (< 768px)**: Compact vertical step view with collapsible step accordion. Footer buttons full width stacked.

---

## 7. Related Documents
- [[04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_8_Step_Contract]]
- [[08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_Flutter_Implementation_Specification]]
