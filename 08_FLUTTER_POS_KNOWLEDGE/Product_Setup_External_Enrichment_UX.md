<!-- title: Product Setup External Enrichment UX -->
<!-- status: Active -->
<!-- system: OneVerz POS Flutter Client Scope -->
<!-- module: CatalogProduct -->
<!-- last_updated: 2026-09-23 -->

# Product Setup External Enrichment UX

## Purpose

Documents the Flutter-side UX for Category Resolution, Brand Resolution, and Quick Add
Brand inside the Tenant Admin Add Product wizard's Step 1 (Basic Details). This is the
Flutter counterpart to
[[../12_INTEGRATIONS/External_Product_Lookup_Integration]],
[[../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Category_Mapping]], and
[[../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Brand_Mapping]].

## Product Setup E2E Flow

```text
Scan Barcode
    ↓
Local Lookup
    ├─ FOUND → use tenant product
    └─ MISS
         ↓
External Provider Coordinator
         ↓
Product Suggestion
         ↓
Category Resolution
         ↓
Brand Resolution
         ↓
User Review
         ↓
Category/Brand Override if needed
         ↓
Quick Add Brand if needed
         ↓
Continue Product Wizard
         ↓
Review & Create
         ↓
Single Transaction
   Product + Category Mapping + Brand Mapping
         ↓
SUCCESS
         ↓
Next scan resolves locally
```

## Suggestion Chips

Category and Brand both render up to 3 SIMILARITY suggestion chips when no
SAVED/EXACT/NORMALIZED match exists. Selecting a chip sets that field's value; the
user's dropdown selection always remains editable/overridable after picking a chip —
a chip pick is not a locked-in choice.

## Quick Add Brand

Entry point on the Brand field when no suitable tenant Brand match exists:

```text
Brand
[ Select Brand ▼ ] [+ Add Brand]
```

If an external Brand suggestion exists but has no tenant match, the drawer opens
pre-filled:

```text
+ Create "<External Brand>"
```

**Drawer shell:** reuses the same wizard-native slide-in drawer pattern as
`EditVariantDrawer` (`showGeneralDialog`, right-edge slide-in, 280ms `easeOutCubic`) —
no new drawer mechanism was introduced.

**Fields:**

```text
Brand Name *   — prefilled from the external Brand text when available
Brand Code *   — derived from Brand Name, editable; once manually edited by the
                 user it is no longer overwritten by further Name changes
Status         — defaults ACTIVE
Sort Order     — defaults 0
Description    — optional
Logo           — optional, not required
```

**Creation path:** `POST /api/v1/brands` — the same canonical endpoint used by Brand
CRUD (see
[[../15_IMPLEMENTATION_TRACKING/Backend/CatalogProduct/Brand_Collection_CRUD_Implementation_Status]]).
Quick Add Brand is not a separate/shadow creation path.

## Quick Add Permissions

Gated behind (either permission is sufficient):

```text
catalog.brands.create
catalog.brands.manage
```

(Flutter's `canCreateBrand()` also accepts a legacy `tenantBrandsCreate` permission
code alias for the same capability.) Canonical permission definitions:
[[../02_ACCESS_CONTROL/Permission_Code_List]],
[[../02_ACCESS_CONTROL/CANONICAL_MODULE_FEATURE_PERMISSION_CATALOG_R1]].

```text
With permission     → Quick Add button shown, drawer usable
Without permission  → Brand dropdown and suggestion chips still work normally;
                       Quick Add button is hidden/disabled
```

Backend `BrandService` permission enforcement remains authoritative regardless of what
the Flutter UI shows — the Flutter gate is UX convenience only, matching the standing
convention used everywhere else in this wizard (see the Wizard Capability Model in
[[Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification]]).

## Quick Add Persistence — Two Separate Events

This distinction is important and must not be conflated:

```text
Quick Add Brand success
    → the Tenant Brand row is created immediately via POST /api/v1/brands
    → survives wizard cancellation (it is a real, independent Brand from that
      point on, exactly like a Brand created from Brand CRUD directly)

External Brand Mapping
    → NOT saved at Quick Add time
    → saved only after a successful Product creation, inside the same DB
      transaction as the Product graph (see External_Brand_Mapping.md →
      Persistence Rule)
```

Cancelling the wizard after a successful Quick Add still leaves the new Brand in the
tenant's Brand list. It does not leave behind an orphaned/dangling mapping, because no
mapping was ever written at Quick Add time.

## Manual Validation Limitation (honest, not a defect)

Quick Add Brand and the permission-negative case were validated via Flutter widget
tests (`quick_add_brand_test.dart`, `brand_resolution_widget_test.dart`) — real
Flutter widget-tree interaction (tap, form fill, submit) against a fake repository. No
real-device/browser tap-through was completed in this environment. This is a
validation-evidence limitation of the current environment, not a product defect.

## Related

- [[../12_INTEGRATIONS/External_Product_Lookup_Integration]]
- [[../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Category_Mapping]]
- [[../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Brand_Mapping]]
- [[Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification]]
- [[../15_IMPLEMENTATION_TRACKING/Backend/CatalogProduct/External_Product_Enrichment_Implementation_Status]]
