<!-- title: Product Setup External Enrichment UX -->
<!-- status: Active -->
<!-- system: OneVerz POS Flutter Client Scope -->
<!-- module: CatalogProduct -->
<!-- last_updated: 2026-09-24 -->

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

Category and Brand both render up to 3 suggestion chips (whatever `matchType` tier
found them — see below) when no SAVED match already resolved the field. Selecting a
chip sets that field's value; the user's dropdown selection always remains
editable/overridable after picking a chip — a chip pick is not a locked-in choice.

**Category suggestions can now come from a hierarchy match (added 2026-09-24).**
Backend Category resolution gained a hierarchy-aware extension — see
[[../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Category_Mapping]] § Resolution
Order — so `categoryResolution.suggestions` may include a tenant Category matched
against a *parent* node of the provider's category hierarchy (`matchType:
"HIERARCHY_EXACT"` etc.), not only the provider's own leaf category text. **No Flutter
change was required for this**: the suggestion-chip rendering, tap-to-select, and DTO
parsing already treated `matchType` as an opaque string end-to-end (nothing in Flutter
branches on its value), so the new `HIERARCHY_*` values flow through the existing Step
1/Step 2 UI automatically. Brand's `matchType` values are unaffected — Brand has no
hierarchy concept (see [[../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Brand_Mapping]]).

```text
Step 1 (scan_barcode_step.dart):
  displays "Category Hierarchy" (already existing) and, once
  categoryResolution.suggestions is non-empty, a generic "Suggested: <names>" line —
  this line existed before 2026-09-24 but was effectively dead for Category, since the
  backend never returned a hierarchy-derived suggestion until now.

Step 2 (product_basic_details_form.dart, Basic Details form):
  Category *
  [ Select category ▼ ]
  Suggested: [Beverages]        ← tappable chip, key `category_suggestion_<id>`

  Tap "Beverages" → onCategoryChanged(candidate.id) → state.categoryId updated,
  same tap-to-select path already used for LEAF_* suggestions and for Brand.
```

Suggestion chips are filtered to ids present in the wizard's current
`createOptions.categories` (a stale-data safety check, not a `matchType` filter) —
this never drops a hierarchy suggestion in practice, because the backend only ever
suggests Categories drawn from that exact same create-options list.

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
