<!-- title: Product Setup Initial Tracking Details Step 1 Decision 2026-08-24 -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-24 -->

# Product Setup Initial Tracking Details Step 1 Decision 2026-08-24

## Status And Purpose

Approved and active from 2026-08-24. This is the Product Setup authority for
optional initial Batch Number, Expiry Date, and Serial Number capture inside
Tenant Admin Add Product **Step 1 — Basic Details**.

Canonical contract:
[[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]].

This is a Second Brain decision. Flutter, backend, and database production
implementation were not performed in this documentation phase.

## Context

Previously:

- Step 1 = Product master information only (name, code, category, brand,
  descriptions, images, channel availability).
- Step 2 = Product Type & tracking **policy** (`product_inventory_settings`).
- Actual Batch / Expiry / Serial identity was owned by inventory operations
  (`product_batches`, `serial_numbers`) and later stock receiving / opening stock.

That separation remains correct for **policy** and **lifetime inventory**. It
was slow for one-product-at-a-time Tenant Admin onboarding when the physical
identity is already known at Product creation time.

## New Decision

The Add Product Wizard remains a **fixed 7-step** wizard. No extra tracking
step. No Channel Visibility step. No return to 8 stages.

Step 1 now accepts optional initial:

- Batch Number (`initialBatchNumber`)
- Expiry Date (`initialExpiryDate`)
- Serial Number (`initialSerialNumber`)

These are **INITIAL TRACKING INPUT**, not tracking policy.

Step 2 remains authoritative for:

- Product Structure (`SIMPLE` / `VARIANT` / `BUNDLE`)
- Track Inventory, Batch Tracking, Expiry Tracking, Serial Tracking

Step 2 must reconcile Step 1 values. Incompatible values require confirmation
before clearing. Silent discard is forbidden.

Final physical identity is created at Step 7 Publish into canonical inventory
tables, not into `products.batch_number` / `products.expiry_date` /
`products.serial_number` (those columns must not be invented).

## Reasons

- Faster manual Product onboarding.
- Tenant Admin can enter known physical identity while creating the Product.
- Avoids forcing an immediate jump to Inventory screens for the first identity.
- Keeps tracking-policy separation in Step 2.
- Preserves existing inventory data ownership for later batches/serials.

## Locked Architectural Choices

| Topic | Locked choice |
|---|---|
| Wizard length | 7 steps. Step 7 = Review & Create. `current_setup_step` 1–7. |
| Draft API | Option A: reuse existing `POST/PUT /api/v1/tenant-admin/products[/{id}]/draft` and `GET .../setup`. |
| Draft storage | Option B: TARGET `product_setup_initial_tracking` (1:1 draft entity). Option C Product identity columns rejected. |
| Policy table | `product_inventory_settings` unchanged. |
| Batch + Expiry owner | `product_batches.batch_number`, `product_batches.expiry_date` |
| Serial owner | `serial_numbers.serial_number` |
| Quantity | Product Setup must not invent on-hand qty, movements, or cost layers. Opening Stock remains quantity owner. |
| SIMPLE | Identity on base Product (`product_variant_id` NULL). |
| VARIANT | Option 2: remain provisional until exact included Variant is selected at Step 7. Never assign variant inventory to the parent Product. |
| BUNDLE | Confirm and clear. No Bundle-parent physical identity rows. |
| Release 1 exclusivity | Serial mutually exclusive with Batch and Expiry. Batch + Expiry allowed. Expiry requires Batch. |

## Consequences

- Draft persistence is an **implementation GAP** until the dedicated table and
  DTO fields exist. Resume/back/restart must restore Step 1 values.
- Step 2 needs confirmation UX and a confirmation API flag.
- VARIANT Review needs `initialTrackingAssignedVariantId`.
- Bundle parent must warn and clear after confirmation.
- Flutter wizard state must add the three fields on the shared controller, not
  inside isolated widgets.
- Additional publish validation: uniqueness, expiry, structure ownership.
- QA must cover preservation, conflict confirmation, no fake stock, and Review
  display of applicable values only.

## Alternatives Rejected

| Alternative | Reason |
|---|---|
| 8th wizard step for tracking identity | Conflicts with locked 7-step wizard |
| Put identity on `products` master columns | Pollutes Product semantics; implies one lifetime Batch/Serial |
| Create `product_batches` / `serial_numbers` at Step 1 | Structure, policy, and variant ownership are unknown |
| Auto-enable Step 2 toggles from Step 1 input | Violates BR-TRACK-004 / BR-TRACK-005 |
| Silently drop incompatible Step 1 values | Violates BR-TRACK-008 |
| Assign VARIANT identity to parent Product | Parent must not hold physical inventory |

## Related Files

- [[../04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract]]
- [[Scope_Change_Log]]
- [[../15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-08-24_Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Second_Brain_Alignment_Audit]]
