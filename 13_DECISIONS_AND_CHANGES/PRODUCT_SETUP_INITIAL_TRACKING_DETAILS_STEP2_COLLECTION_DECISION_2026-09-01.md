<!-- title: Product Setup Initial Tracking Details Step 2 Collection Decision 2026-09-01 -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-01 -->

# Product Setup Initial Tracking Details Step 2 Collection Decision 2026-09-01

## Status And Purpose

Approved and active from 2026-09-01. This decision **moves the collection UI**
for optional Initial Tracking Details from Add Product **Step 1 — Basic Details**
to **Step 2 — Product Type & Tracking**, shown only after Product Type is
explicitly selected.

It does **not** change:

- 7-step wizard length
- Tracking **policy** ownership (still Step 2 / `product_inventory_settings`)
- Draft table `product_setup_initial_tracking`
- Publish identity into `product_batches` / `serial_numbers`
- Forbidden Product master columns (`products.batch_number` / `expiry_date` /
  `serial_number`)
- Opening Stock as quantity owner

Canonical contract (filename retained for wikilink stability):
[[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]].

Prior identity decision (still in force except collection surface):
[[PRODUCT_SETUP_INITIAL_TRACKING_DETAILS_STEP1_DECISION_2026-08-24]].

## Context

2026-08-24 placed the three optional inputs on Step 1 so Tenant Admin could
enter known Batch / Expiry / Serial while creating the Product.

That caused a Review/DB mismatch: users entered values on Step 1, then on
Step 2 left Batch/Expiry/Serial **policy** OFF. Compatible-value display on
Review is policy-gated, and Step 2 continue currently applies the clear plan.
Users could not see why Review omitted the values.

## New Decision

| Topic | Locked choice |
|---|---|
| Collection step | **Step 2 — Product Type & Tracking** |
| When the card appears | After Product Type is explicitly selected (`productStructureConfirmed`) |
| SIMPLE | Show Initial Tracking Details under tracking toggles |
| VARIANT | Same card after Variant Product is selected |
| BUNDLE | Do **not** show the card. Bundle parent cannot receive physical identities |
| Step 1 | Product master + images + Channel Availability only. No Initial Tracking card |
| Helper copy | `Optional. Turn on matching Batch, Expiry, or Serial tracking below to keep these values.` |
| Card order | After type select: **Initial Tracking Details first**, then Tracking & Stock Rules |
| Policy vs input | Entering a value still must **not** auto-enable tracking toggles |
| Fields | Unchanged: `initialBatchNumber`, `initialExpiryDate`, `initialSerialNumber` |

Wizard remains exactly 7 steps. No extra tracking step.

## Reasons

- User enters identity on the same screen as tracking policy, so Batch/Expiry/Serial
  ON/OFF is visible while typing.
- Product Type is known before identity is collected (SIMPLE vs VARIANT vs BUNDLE).
- Reduces Review surprise when policy is OFF.
- Keeps identity/persistence architecture from 2026-08-24.

## CURRENT Flutter (2026-09-01)

- Card widget: `product_initial_tracking_card.dart` (path still under `step_1/`).
- Rendered from `product_type_tracking.dart` after type confirmation.
- Shared wizard controllers: `initialBatchNumber` / `initialSerialNumber` /
  `initialExpiryDate` on `AddProductWizardState`.
- Step 2 continue still applies `applyInitialTrackingPlan(confirmed: true)` when
  the compatibility plan requires a clear. TARGET confirmation dialog remains a
  GAP versus BR-TRACK-008.

## Alternatives Rejected

| Alternative | Reason |
|---|---|
| Keep collection on Step 1 | Policy is unknown; Review hides values when policy stays OFF |
| Auto-enable Step 2 toggles from typed values | Violates BR-TRACK-004 / BR-TRACK-005 |
| Show the card before Product Type is selected | Type (especially BUNDLE) is not confirmed |
| Show the card for BUNDLE | Bundle parent cannot receive physical identities |
| 8th wizard step | Conflicts with locked 7-step wizard |

## Related Files

- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]]
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Type_Tracking_Specification]]
- [[../07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_UI_UX_Specification]]
- [[../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification]]
- [[Scope_Change_Log]]
