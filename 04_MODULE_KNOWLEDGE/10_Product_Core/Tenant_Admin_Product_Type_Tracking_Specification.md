# Tenant Admin Add Product — Product Type & Tracking Specification

<!-- title: Tenant Admin Add Product — Product Type & Tracking Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-10 -->

## 1. Executive Summary & Core Architectural Principles

This document defines the canonical Second Brain specification for **Stage 2: Product Type & Tracking** within the Tenant Admin **Add Product Wizard**.

### Canonical Architectural Principles
1. **ONE Unified Add Product Wizard**: Add Product is ONE single 8-stage wizard pipeline (`ProductId`, `CurrentSetupStep`, `RowVersion`, shared footer, shared save endpoints). Stages are configuration steps owned by the wizard, NOT eight independent backend/frontend features.
2. **Semantic Technical Naming Only**: Technical code symbols (Flutter widgets, controllers, DTOs, API endpoints, backend services, commands) MUST use semantic business terms (`ProductTypeTracking`, `product_type_tracking.dart`, `ValidateProductTypeTracking`, `ApplyProductTypeTracking`). Step-number names (e.g. `Step2ProductTypeTracking`, `SaveStep2DraftCommand`) are strictly forbidden in code.
3. **Product Type UI vs Product Structure Domain Mapping**:
   - UI Section Label: `Select Product Type` (Options: `Simple Product`, `Variant Product`, `Bundle / Kit`).
   - Domain & Database Mapping: `productStructure` (`SIMPLE`, `VARIANT`, `BUNDLE`).
   - `products.product_type`: Reserved for merchandise classification (`STANDARD`, `SERVICE`, `DIGITAL`). Default: `STANDARD`.
4. **Structure-Aware Stage Rendering**: The Product Type selection card is common at the top. The tracking content below renders dynamically based on the selected `productStructure`:
   - `SIMPLE`: Simple Inventory Tracking toggles (Track Inventory, Batch, Expiry, Serial).
   - `VARIANT`: Variant Inventory Tracking policy toggles + right-side contextual explanatory card.
   - `BUNDLE`: Read-only Bundle Inventory Behaviour informational cards (Component-based inventory, Component stock deduction, Component tracking rules).
5. **Stage Applicability & Navigation**:
   - `SIMPLE` + Track Inventory ON: Stage 3 (`Units & Pack Conversion`) is `REQUIRED`. Stage 4 (`Product Configuration`) is `NOT_APPLICABLE`. Save & Continue from Stage 3 navigates directly to Stage 5 (`Barcode & SKU`).
   - `VARIANT` + Track Inventory ON: Stage 3 (`Units & Pack Conversion`) is `REQUIRED`. Stage 4 (`Product Configuration`) is `REQUIRED`. Save & Continue from Stage 3 navigates to Stage 4.
   - `SIMPLE` / `VARIANT` + Track Inventory OFF: Stage 3 is `NOT_APPLICABLE` (bypassed).
   - `BUNDLE`: Parent tracking is forced `false` / component-based. Stage 3 is `NOT_APPLICABLE` (bypassed). Save & Continue from Stage 2 navigates directly to Stage 4 (`Product Configuration` — Kit Composition).


---

## 2. Product Structure Domain & Inventory Ownership Models

### 2.1 Simple Product (`productStructure = SIMPLE`)
- **Inventory Owner**: Base Product (`products.id` + `outlets.id`).
- **Identity & Sales**: 1 Product, 1 SKU, 1 Barcode, 1 Base Selling Price. No variant matrix, no bundle components.
- **Inventory Balances**: `inventory_balances.product_id = ProductId`, `product_variant_id = NULL`.
- **Tracking Scopes**:
  - `Track Inventory`: Master toggle. Default `ON`.
  - `Batch Tracking`: Belongs to base product (`product_batches.product_id = ProductId`, `product_variant_id = NULL`).
  - `Expiry Tracking`: Belongs to product batch (`product_batches.expiry_date`).
  - `Serial Tracking`: Belongs to physical product items (`serial_numbers.product_id = ProductId`, `product_variant_id = NULL`).
- **Database Canonical Invariant**: Base sellable Simple Products do NOT require dummy or shadow rows in `product_variants`.

### 2.2 Variant Product (`productStructure = VARIANT`)
- **Inventory Owner**: Each sellable Variant (`product_variants.id` + `outlets.id`).
- **Parent Product Role**: Stores common catalog details (Name, Category, Brand, Media, base tracking policy). Parent product MUST NOT maintain a physical stock ledger or outlet balance.
- **Identity & Sales**: Each Variant has its own SKU, Barcode, Selling Price override, Outlet stock, Batch records, Expiry records, Serial numbers, and active status.
- **Inventory Method (Derived Summary)**: `VARIANT_BASED` (Derived from `productStructure = VARIANT`).
- **Tracking Storage & Inheritance Policy**:
  - Stage 2 stores canonical policy in `product_inventory_settings` (`product_id = ProductId`, `product_variant_id = NULL`).
  - When variants are generated in Stage 4, each variant inherits this policy into variant-level inventory settings (`product_variant_id = VariantId`) where overrides apply.
  - Actual stock records (`inventory_balances`, `product_batches`, `serial_numbers`, `stock_movements`) MUST reference exact `product_variant_id`.

### 2.3 Bundle / Kit Product (`productStructure = BUNDLE`)
- **Inventory Owner**: Configured component products/variants (`combo_components`).
- **Parent Product Role**: 1 Bundle SKU, 1 Bundle Barcode, 1 Selling Price, BUT **NO direct physical bundle stock**.
- **Parent Tracking State Lock**:
  - `is_stock_tracked = false`
  - `requires_batch_tracking = false`
  - `requires_expiry_tracking = false`
  - `requires_serial_tracking = false`
  Backend normalizes/enforces parent tracking flags to `false`.
- **Inventory Method (Derived Summary)**: `COMPONENT_BASED` (Derived from `productStructure = BUNDLE`).
- **Component Deduction**: POS sale of 1 Bundle automatically deducts `configured_quantity × sold_bundle_qty` from component inventory balances using component-level tracking rules (FEFO for batch/expiry, exact serial selection for serials).

---

## 3. Detailed UI / UX Specification & Layout Contracts

### 3.1 Common Header & Product Type Cards
- **Section Heading**: Select Product Type (Mandatory).
- **Cards Grid (3 Selectable Options)**:
  1. `Simple Product`: "Single standalone item with one price and one SKU."
  2. `Variant Product`: "Item with multiple variations (e.g. Size, Color, Material)."
  3. `Bundle / Kit`: "Pre-packaged set composed of multiple items."
- **Visual State**: Radio button + highlight border on active selection.

### 3.2 Dynamic Structure-Aware Tracking Section

#### A. SIMPLE UI LAYOUT
- **Left/Main Card**: Tracking & Stock Rules
  - `Track Inventory` (Toggle, Default ON)
  - `Batch / Lot Tracking` (Toggle, Default OFF, disabled if Track Inventory OFF)
  - `Expiry Tracking` (Toggle, Default OFF, disabled if Batch OFF or Serial ON)
  - `Serial Number Tracking` (Toggle, Default OFF, disabled if Batch/Expiry ON or Track Inventory OFF)
- **Release 1 Mutual Exclusivity Rules**:
  - Expiry requires Batch (`Expiry ON` $\rightarrow$ auto `Batch ON`).
  - Serial is mutually exclusive with Batch and Expiry (`Serial ON` $\rightarrow$ `Batch OFF`, `Expiry OFF`).

#### B. VARIANT UI LAYOUT
- **Left Column**: Tracking & Stock Rules Toggles (Same toggles as Simple).
- **Right Column**: Contextual Explanatory Banner & Guidance Card:
  - Banner: *"Variant options (e.g., size, color) will be configured in Stage 4: Product Configuration."*
  - Contextual Explanations:
    - *Track Inventory*: Stock is tracked independently per Variant at Outlet level.
    - *Batch Tracking*: Policy is set at product level; actual batch ledgers belong to each generated Variant.
    - *Expiry Tracking*: Applies to individual Variant batch records (FEFO enabled).
    - *Serial Tracking*: Serials belong to individual physical Variant units.

#### C. BUNDLE UI LAYOUT
- **Left/Main Section**: Bundle Inventory Behaviour (Read-Only Informational Cards — Editable toggles hidden):
  1. **Component-based Inventory**: Bundle availability is calculated dynamically from available component stock.
  2. **Component Stock Deduction**: Selling a Bundle automatically deducts configured component quantities from physical inventory.
  3. **Component Tracking Rules**: Batch, Expiry, and Serial tracking follow the individual component Product / Variant settings.

---

## 4. Navigation, Actions & Skip Decision Matrix

### 4.1 Skip Decision Policy (Superseding Rule)
- **Product Structure Selection is NON-SKIPPABLE**: User MUST explicitly select `SIMPLE`, `VARIANT`, or `BUNDLE`. If no structure is selected, `Skip` button is DISABLED and API rejects advance requests.
- **Conditional Skip Allowed After Structure Selection**:
  - `SIMPLE` / `VARIANT` Skip: Persists selected `productStructure`, sets `TrackInventory = true`, `Batch = false`, `Expiry = false`, `Serial = false`. If `SIMPLE`, advances to Stage 3 (`Units & Pack Conversion`).
  - `BUNDLE` Skip: Persists `productStructure = BUNDLE`, parent tracking flags `false`, derived method `COMPONENT_BASED`, auto-bypasses Stage 3, and advances directly to Stage 4 (`Product Configuration` — Kit Composition).

### 4.2 Save Pipeline & Actions
- **Save Draft (`advanceStep: false`)**: Validates current stage inputs, persists draft atomically, updates `row_version` and `draft_saved_at`, refreshes persisted Product Summary, stays on current stage.
- **Save & Continue (`advanceStep: true`)**: Validates structure and tracking rules, normalizes dependent state, persists atomically, updates `current_setup_step` to next applicable stage, returns HTTP 200 with new `rowVersion`.

### 4.3 Stage Applicability Matrix

| Product Structure | Stage 3 (Units) | Stage 4 (Product Config) | Stage 5 (Barcode/SKU) | Stage 8 (Review/Create) |
|---|---|---|---|---|
| `SIMPLE` (Tracked) | Required | **NOT_APPLICABLE** (Auto-skip 3 $\rightarrow$ 5) | Required | Displays "Product Configuration: Not Applicable" |
| `VARIANT` (Tracked) | Required | **REQUIRED** (Variant Matrix) | Required | Validates Variant Matrix completion |
| `BUNDLE` | **NOT_APPLICABLE** (Auto-skip 2 $\rightarrow$ 4) | **REQUIRED** (Kit Composition) | Required | Validates Kit Composition ($\ge$ 2 valid components) |
| `SIMPLE` / `VARIANT` (Untracked) | **NOT_APPLICABLE** | Simple: N/A; Variant: REQUIRED | Required | Standard validation |


---

## 5. Structure Transition & Active Product Edit Safety

### 5.1 Structure Transition Rules (Draft Phase)
When user changes `productStructure` during Add Product draft setup:
- `SIMPLE` $\rightarrow$ `VARIANT`: Show confirmation: *"Changing to Variant Product requires defining variant options and SKU/stock per variant. Continue?"* Upon confirm, clear simple stock mapping, set Stage 4 status to `PENDING`.
- `SIMPLE` $\rightarrow$ `BUNDLE`: Show confirmation: *"Changing to Bundle / Kit replaces direct product stock with component-based availability. Continue?"* Upon confirm, clear simple stock mapping, set Stage 4 status to `PENDING`.
- `VARIANT` $\rightarrow$ `SIMPLE` / `BUNDLE`: Show confirmation: *"Changing structure will remove all configured variant options, combinations, and variant SKUs. Continue?"* Upon confirm, delete draft `product_options`, `product_variants`, reset Stage 4.
- `BUNDLE` $\rightarrow$ `SIMPLE` / `VARIANT`: Show confirmation: *"Changing structure will remove all configured bundle components (`combo_components`). Continue?"* Upon confirm, delete draft `combo_definitions` and `combo_components`, reset Stage 4.

### 5.2 Active Product Edit Safety (Post-Publish)
For published products (`products.status = 'ACTIVE'`):
- **Structural Invariant**: Modifying `productStructure` on an active product with historical sales, stock balances, batch ledgers, or serial numbers is **FORBIDDEN** (HTTP 409 Conflict).
- **Tracking Policy Invariant**: Disabling `track_inventory`, `batch_tracking`, `expiry_tracking`, or `serial_tracking` on an active product with non-zero stock or open transactions is **FORBIDDEN**.

---

## 6. Structure-Aware Product Summary Contract

Product Summary visibility is driven strictly by persistence state:
- **Fresh Unsaved Draft**: Summary panel hidden.
- **After First Successful Save Draft / Save & Continue**: Summary panel visible on responsive drawer/sidebar.

### Common Summary Fields
Status (`DRAFT`/`ACTIVE`), Primary Image Thumbnail, Product Name, Internal Code (`product_code`), Category, Brand, Created By, Created On. (SKU displays `Pending (Stage 5)` prior to Stage 5).

### Structure-Specific Summary Fields
- `SIMPLE`: Product Structure = `Simple Product` | Inventory Method = `Product-level` | Track Inventory = `Yes` / `No`.
- `VARIANT`: Product Structure = `Variant Product` | Inventory Method = `Variant-based` | Track Inventory = `Yes` / `No` (Parent Policy).
- `BUNDLE`: Product Structure = `Bundle / Kit` | Inventory Method = `Component-based` | Components = `Not Configured` / `N items`. (Does NOT display parent inventory tracking toggle).

---

## 7. Complete Traceability & Database Contract

### Traceability Matrix

| Concept | UI Label / Widget | Flutter State | API Property | Domain Entity Property | Database Table | Database Column | Constraints & Rules |
|---|---|---|---|---|---|---|---|
| Product Structure | Select Product Type Cards | `productStructure` | `productStructure` | `Product.ProductStructure` | `products` | `product_structure` | NOT NULL; Enum `'SIMPLE'`,`'VARIANT'`,`'BUNDLE'` |
| Stock Tracked | Track Inventory Toggle | `trackInventory` | `trackInventory` | `ProductInventorySetting.IsStockTracked` | `product_inventory_settings` | `is_stock_tracked` | NOT NULL; Default `true` |
| Batch Tracking | Batch / Lot Tracking Toggle | `batchTracking` | `batchTracking` | `ProductInventorySetting.RequiresBatchTracking` | `product_inventory_settings` | `requires_batch_tracking` | NOT NULL; Default `false` |
| Expiry Tracking | Expiry Tracking Toggle | `expiryTracking` | `expiryTracking` | `ProductInventorySetting.RequiresExpiryTracking` | `product_inventory_settings` | `requires_expiry_tracking` | NOT NULL; Default `false` |
| Serial Tracking | Serial Number Tracking Toggle | `serialTracking` | `serialTracking` | `ProductInventorySetting.RequiresSerialTracking` | `product_inventory_settings` | `requires_serial_tracking` | NOT NULL; Default `false` |
| Setup Stage | Wizard Stepper Header | `currentSetupStep` | `currentSetupStep` | `Product.CurrentSetupStep` | `products` | `current_setup_step` | INT 1–8 |
| Concurrency Token | Hidden State | `rowVersion` | `expectedRowVersion` | `Product.RowVersion` | `products` | `row_version` | BIGINT / Timestamp |

### Database Core Schema Alignment
- `products`: `id`, `tenant_id`, `product_name`, `product_code`, `product_type` (default `'STANDARD'`), `product_structure` (`SIMPLE`/`VARIANT`/`BUNDLE`), `status`, `current_setup_step`, `row_version`, `created_at`, `updated_at`.
- `product_inventory_settings`: `id`, `tenant_id`, `product_id`, `product_variant_id` (NULL for parent policy/simple), `is_stock_tracked`, `requires_batch_tracking`, `requires_expiry_tracking`, `requires_serial_tracking`, `inventory_uom_id`.
- `product_variants`: `id`, `tenant_id`, `product_id`, `variant_code`, `sku`, `status`, `row_version`.
- `combo_definitions`: `id`, `tenant_id`, `product_id` (bundle parent), `combo_definitions.pricing_mode / combo_definitions.inventory_deduction_mode`, `status`.
- `combo_components`: `id`, `tenant_id`, `combo_definition_id`, `component_product_id`, `component_variant_id`, `quantity`, `uom_id`.

---

## 8. Permissions, Entitlements & API Endpoints

### 8.1 Permissions Matrix
- Initial Wizard Creation & Draft Save: `catalog.products.create`
- Edit Mode Active Product: `catalog.products.update`
- Resume / View Draft: `catalog.products.view`
- Stage 4 Variant Configuration: `catalog.variants.manage`
- Stage 4 Bundle Configuration: `catalog.combo_components.manage`

### 8.2 Feature Entitlements
- Runtime Feature Entitlement Code: `product_catalog` (Module Code: `product_management`).
- Inventory Tracking Controls: Enforces `inventory_tracking` entitlement where advanced stock tracking (batch/expiry/serial) is enabled.

### 8.3 Unified API Contract

#### Shared Draft Endpoint
- `POST /api/v1/tenant-admin/products/draft`
- `PUT /api/v1/tenant-admin/products/{productId}/draft`
- `GET /api/v1/tenant-admin/products/{productId}/setup`

#### Payload Schema (Stage 2 Focus)
```json
{
  "productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "currentSetupStep": 2,
  "productStructure": "VARIANT",
  "trackInventory": true,
  "batchTracking": true,
  "expiryTracking": true,
  "serialTracking": false,
  "advanceStep": true,
  "expectedRowVersion": 1042
}
```

---

## 9. Non-Functional Requirements (NFR)

1. **Atomic Transactionality**: Saving Stage 2 draft updates `products` and `product_inventory_settings` within a single database transaction.
2. **Optimistic Concurrency**: Enforced via `row_version` matching. Conflicting edits return HTTP 409.
3. **Tenant Isolation**: Every backend query and mutation includes strict `tenant_id` filter from authenticated JWT claims.
4. **Performance**: Setup query response time $< 150\text{ms}$ at 95th percentile. Bundle availability calculation batched per selected outlet.
5. **Accessibility & Responsive UI**: 44x44 pt minimum touch targets for all toggles and cards; screen reader semantic labels for toggles; keyboard tab order.

---

## 10. Test Matrix

1. **Simple Product Tests**: Structure saved as `SIMPLE`; stock balance owned by product; Stage 4 marked `NOT_APPLICABLE`; Stage 3 Save & Continue skips Stage 4 and navigates to Stage 5.
2. **Variant Product Tests**: Structure saved as `VARIANT`; parent product has 0 physical stock balance; tracking policy saved to product level; Stage 4 marked `REQUIRED`.
3. **Bundle Product Tests**: Structure saved as `BUNDLE`; parent tracking toggles set to `false`; informational behaviour cards rendered; Stage 4 marked `REQUIRED`; bundle availability derived from component MIN usable stock.
4. **Skip & Validation Tests**: Skip rejected if structure unselected; Skip with structure selected persists structure + default toggles; Batch/Expiry/Serial mutual exclusivity enforced.
5. **Concurrency & Auth Tests**: Stale `rowVersion` returns HTTP 409; missing `product_catalog` entitlement returns HTTP 403.

---

## 11. Architecture Specifications for Implementation

### 11.1 Flutter Semantic Naming Architecture
File Structure:
```text
lib/features/tenant_admin/products/
├── presentation/
│   ├── widgets/
│   │   ├── basic_details.dart
│   │   ├── product_type_tracking.dart
│   │   ├── units_pack_conversion.dart
│   │   ├── product_configuration.dart
│   │   ├── barcode_sku.dart
│   │   ├── pricing_tax.dart
│   │   ├── channel_visibility.dart
│   │   ├── review_create.dart
│   │   ├── product_wizard_stepper.dart
│   │   ├── product_wizard_actions_footer.dart
│   │   └── product_wizard_summary.dart
│   └── controllers/
│       └── add_product_wizard_controller.dart
```

### 11.2 Backend Architecture (.NET Core)
Single Unified Wizard Pipeline (`SaveProductWizardAsync`) with semantic stage helper methods:
- `ValidateProductTypeTracking(SaveProductDraftCommand command)`
- `ApplyProductTypeTracking(Product product, SaveProductDraftCommand command)`
- `ResolveNextApplicableStage(ProductStructure structure, int currentStage)`

## Step 2 Bundle UI Contract
For `Product Structure = Bundle / Kit`, the following UI is displayed:
```text
Product Structure: Bundle / Kit
Inventory Method: Component-based
```
Helper texts:
- `Bundle availability is calculated from component stock.`
- `Selling this bundle deducts the configured component quantities.`
- `Batch, expiry and serial tracking follow component settings.`
- `Add and manage bundle components in Step 4 — Product Configuration.`

Do NOT expose Bundle parent controls for: Track Inventory, Batch Tracking, Expiry Tracking, Serial Tracking, Unit & Pack Conversion, Bundle Pricing, SKU Prefix, Barcode, Component substitution, Sell when component unavailable.

