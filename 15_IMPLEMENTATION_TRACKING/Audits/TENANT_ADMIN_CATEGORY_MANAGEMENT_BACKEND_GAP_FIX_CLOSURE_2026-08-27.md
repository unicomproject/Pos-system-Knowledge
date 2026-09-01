<!-- title: Tenant Admin Category Management Backend Gap Fix Closure -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-27 -->
<!-- verification: Backend + EF Core + PostgreSQL + tests executed -->

# Tenant Admin Category Management Backend Gap Fix Closure (2026-08-27)

## Verdict

**CATEGORY MANAGEMENT BACKEND GAP FIX COMPLETE — READY FOR FLUTTER IMPLEMENTATION**

Flutter Category Management journeys **TA-UJ-035 … TA-UJ-039 remain NOT COMPLETE**.

The Second Brain Category contract was not redesigned. This report is correction/hardening evidence after the permission-first backend implementation.

---

## 1. Scope

Fixed remaining backend gaps only. Did not rewrite Category Management, did not add Flutter/Angular, did not add `GET /categories/{id}/children` or `PATCH /categories/{id}/status`.

The only added Category API is:

```http
DELETE /api/v1/tenant-admin/categories/{categoryId}/image
```

---

## 2. Gap results

| Gap | Result | Evidence |
| --- | --- | --- |
| Category image entitlement | PASS | `CategoryAccessPolicy` reused by `CatalogMediaService` (`product_catalog` then `catalog.categories.update` OR `manage`) |
| Image same-tenant security | PASS | Tenant-scoped `GetCategoryForImageUpdateAsync`; cross-tenant → `category.not_found`; foreign media not inactivated |
| Category image remove | PASS | `DELETE .../categories/{id}/image`; no-op when no image; clears `image_media_asset_id`; owned media marked inactive |
| Safe media errors | PASS | No `Exception.Message` in API; `media.save_failed` / `media.unexpected_failure`; 400/403/404/500 classified |
| Legacy ImageUrl handling | PASS | Removed from `CategoryCreateRequest` / `CategoryUpdateRequest`. Response `ImageUrl` remains derived from media |
| Legacy SubCategoryId handling | PASS | Deprecated compatibility field; mapped as selected Category ID only; no SubCategory entity/table |
| Product CategoryId-only target | PASS | Canonical persist is one `product_categories` row for `ResolveSelectedCategoryId()`; no ancestor mappings |
| Hierarchy migration preflight | PASS | CAT-MIG-PREFLIGHT-001 now also stops on dangling/cross-tenant/self-parent/cycle/depth>5 |
| Migration rollback safety | PASS | `Down()` throws; forward-only; rollback requires DB backup restore |
| Tree filter semantics | PASS | Tree always ACTIVE+INACTIVE, DELETED excluded; `status` ignored; no fake-root promotion |
| Entitlement exception classification | PASS | Disabled → 403; missing permission → 403; cancel propagates; evaluator infra → `category.unexpected_failure` 500 |
| Audit JSON serialization | PASS | `System.Text.Json.JsonSerializer`; quotes/slashes/newlines/Unicode remain valid JSON |
| Audit media coverage | PASS | `category.image_uploaded` / `category.image_removed`; no blob credentials |
| Unit tests | PASS | Focused 82/82; CatalogProduct 206/206; UnitTests 1213/1213 |
| API tests | PASS | Focused 22/22; ApiTests 494/494 |
| PostgreSQL tests | PASS | CategoryPostgreSqlTests 11/11 including hierarchy; IntegrationTests 592/592 |
| Product Setup regression | PASS | create-options + CategoryId mapping tests |
| Full backend regression | PASS | 2366/2366 |

---

## 3. Decisions

### ImageUrl

Removed from Category Create/Update. No remaining supported compatibility path required unmanaged URL persistence. Canonical media is `image_media_asset_id` via Category media APIs. Response `ImageUrl` is still projected from current-tenant active media.

### SubCategoryId

Kept on Product Create/Update as **deprecated compatibility only**. If present, it is the selected recursive Category identity and is persisted as the single mapping. It is never a separate entity/table. New canonical flow uses `CategoryId` only.

### Tree status filter

Unsupported for management tree integrity. `GET /api/v1/categories/tree` ignores `status` and always returns ACTIVE+INACTIVE with DELETED excluded. Real `ParentCategoryId` / level / hierarchyPath are preserved. An ACTIVE child of an INACTIVE parent is not promoted to root.

### Migration rollback

Option B — **forward-only architecture migration**. Department association cannot be reconstructed without fake `department_id` values. `Down()` is intentionally blocked. Rollback requires database backup restore.

---

## 4. Source occurrence classification

| Search | Classification |
| --- | --- |
| Category `DepartmentId` / `department_id` | TARGET REMOVE completed. Remaining historical SQL/seed is compatibility for old migrations. Unrelated Department module: DO NOT TOUCH |
| Product `SubCategoryId` | LEGACY COMPATIBILITY — maps as selected Category ID |
| Seed `*SubCategoryId` constants | VALID CURRENT names for child Category GUIDs |
| `SubCategories` API on create-options | TARGET REMOVE completed in permission-first backend |
| Category Create/Update `ImageUrl` | TARGET REMOVE completed |
| Category/Product/Storefront response `ImageUrl` | VALID CURRENT derived media URL |
| Category image upload/remove | VALID CURRENT |
| `GET /categories/tree` | VALID CURRENT management tree |
| `EntitlementDenied` | VALID CURRENT for disabled `product_catalog`; infra failure is `category.unexpected_failure` |

---

## 5. Test evidence

Focused unit filter (Category service/media/audit/migration + Catalog media): **82/82**

Focused API (`DepartmentCategoryControllerTests` + `CatalogMediaCategoryControllerTests`): **22/22**

Focused PostgreSQL (`CategoryPostgreSqlTests`): **11/11**

Affected CatalogProduct unit regression: **206/206**

Full backend suite: **2366/2366**

```text
UnitTests 1213
ApiTests 494
IntegrationTests 592
LocalPrintAgent.Tests 50
Flow4FixtureCli.Tests 17
```

---

## 6. Unchanged

- Flutter: NO
- Angular: NO
- Second Brain Category contract: NO (implementation status/evidence only)
- TA-UJ-035 … TA-UJ-039: NOT COMPLETE
