<!-- title: E-Commerce Storefront API Test Cases -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-29 -->

# E-Commerce Storefront API Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | 22 Online Store Cart Checkout / E-Commerce Storefront |
| Feature | Public Storefront Browse APIs |
| Feature Type | Read |
| API Endpoint | Multiple storefront read endpoints under `/api/v1/ecommerce/storefront` |
| Application Service | `IStorefrontService` / `StorefrontService` |
| Required Permission | Public read; no authenticated permission for storefront browse APIs |
| Tenant Scoped | Yes, via `X-Tenant-Id` or tenant slug resolution |
| Idempotency Required | No |
| Criticality | High |

## Purpose

Validate the public e-commerce storefront browse APIs used by the mobile/web store UI: home banners, featured categories, root categories, child categories, product listing, search, category-by-slug lookup, product details with variants, best sellers, fulfillment stores, and tenant slug resolution. These APIs must return only active current-tenant data and avoid exposing cross-tenant records.

## Preconditions

- Tenant exists and is active.
- Public storefront request includes `X-Tenant-Id` where required.
- Catalog categories, products, product-category links, variants, option values, images, prices, ratings, inventory rows, attributes, and return policies exist where each scenario needs them.
- Storefront browse APIs remain public read endpoints; admin/customer write actions must use auth separately.

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result |
|---|---|---|---|---|
| ECOM-STOREFRONT-001 | Resolve active tenant slug | API / Unit | High | 200 OK with tenantId |
| ECOM-STOREFRONT-002 | Fetch active banners by type | API / Integration | High | Only active current-tenant banners for requested type |
| ECOM-STOREFRONT-003 | Fetch root categories | API / Integration | High | Active root categories with active sellable item counts |
| ECOM-STOREFRONT-004 | Fetch child categories by parent | API / Integration | High | Active child categories for selected parent only |
| ECOM-STOREFRONT-005 | Fetch product listing by category | API / Integration | High | Paged active sellable product cards for requested category |
| ECOM-STOREFRONT-006 | Fetch featured categories and best sellers | API / Integration | Medium | Active current-tenant records with mapped image/price/rating data |
| ECOM-STOREFRONT-008 | Fetch product details by slug | API / Unit / Integration | High | Active sellable product detail with variants, options, images, price, stock, rating, highlights, and return info |
| ECOM-STOREFRONT-009 | Search catalog | API / Unit / Integration | High | Paged tenant-scoped search results with safe filters and normalized paging |
| ECOM-STOREFRONT-010 | Fetch category by slug | API / Unit / Integration | Medium | Active current-tenant category returned or 404 inside allowed scope |
| ECOM-STOREFRONT-007 | Fetch fulfillment stores | API / Unit | Medium | Active current-tenant store payload from service |

## Success Test Cases

| Test Case ID | Scenario | Preconditions | Input | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|
| ECOM-STOREFRONT-SUCCESS-001 | Tenant slug resolves | Active tenant exists | `slug=demo-store` | Call tenant resolve API | 200 OK with tenantId | Done |
| ECOM-STOREFRONT-SUCCESS-002 | Root categories return | Active root categories exist | `X-Tenant-Id` | Call `/catalog/categories` | 200 OK with root category list | Done |
| ECOM-STOREFRONT-SUCCESS-003 | Child categories return | Active parent and children exist | `X-Tenant-Id`, `categoryId` | Call `/catalog/categories/{categoryId}/children` | 200 OK with child category list | Done |
| ECOM-STOREFRONT-SUCCESS-004 | Product listing returns | Active sellable products linked to category | `X-Tenant-Id`, `categoryId`, `page`, `pageSize` | Call `/catalog/products` | 200 OK with paged product cards | Done |
| ECOM-STOREFRONT-SUCCESS-005 | Best sellers return | Active sellable products exist | `X-Tenant-Id` | Call `/catalog/products/best-sellers` | 200 OK with best seller products | Done |
| ECOM-STOREFRONT-SUCCESS-006 | Stores return | Active stores exist | `X-Tenant-Id` | Call `/fulfillment/stores` | 200 OK with stores | Done |
| ECOM-STOREFRONT-SUCCESS-007 | Product details return | Active sellable product with variants/options exists | `X-Tenant-Id`, `slug` | Call `/catalog/products/{slug}` | 200 OK with product details payload | Done |
| ECOM-STOREFRONT-SUCCESS-008 | Search returns | Active sellable products exist | `X-Tenant-Id`, query/filter params | Call `/catalog/search` | 200 OK with paged search payload | Not Started |
| ECOM-STOREFRONT-SUCCESS-009 | Category by slug returns | Active category exists | `X-Tenant-Id`, category slug | Call `/catalog/categories/by-slug/{slug}` | 200 OK with category payload | Not Started |

## Validation Test Cases

| Test Case ID | Scenario | Invalid Input | Expected Error | Automated |
|---|---|---|---|---|
| ECOM-STOREFRONT-VALIDATION-001 | Tenant resolve blank slug | Blank `slug` | 400 Bad Request; service not called | Done |
| ECOM-STOREFRONT-VALIDATION-002 | Banners missing tenant | Empty `X-Tenant-Id` | 400 Bad Request | Done |
| ECOM-STOREFRONT-VALIDATION-003 | Banners missing bannerType | Blank `bannerType` | 400 Bad Request | Done |
| ECOM-STOREFRONT-VALIDATION-004 | Categories missing tenant | Empty `X-Tenant-Id` | 400 Bad Request | Done |
| ECOM-STOREFRONT-VALIDATION-005 | Child categories missing categoryId | Empty `categoryId` | 400 Bad Request | Done |
| ECOM-STOREFRONT-VALIDATION-006 | Product listing missing categoryId | Empty `categoryId` | 400 Bad Request | Done |
| ECOM-STOREFRONT-VALIDATION-007 | Product listing invalid page/pageSize | `page < 1`, `pageSize < 1`, `pageSize > 50` | Page normalizes to 1, pageSize normalizes to 20 and caps at 50 | Done |
| ECOM-STOREFRONT-VALIDATION-008 | Product details missing tenant | Empty `X-Tenant-Id` | 400 Bad Request; service not called | Done |
| ECOM-STOREFRONT-VALIDATION-009 | Product details missing slug | Blank `slug` | 400 Bad Request; service not called | Done |
| ECOM-STOREFRONT-VALIDATION-010 | Product details missing product | Unknown/inactive product slug | 404 Not Found | Done |
| ECOM-STOREFRONT-VALIDATION-011 | Search invalid price range | Negative min/max or min greater than max | 400 Bad Request | Not Started |
| ECOM-STOREFRONT-VALIDATION-012 | Category by slug missing tenant or unknown slug | Empty tenant or unknown/inactive category slug | 400 or 404 safe response | Not Started |

## Permission Test Cases

| Test Case ID | Scenario | User Permission State | Expected Result | Automated |
|---|---|---|---|---|
| ECOM-STOREFRONT-PERMISSION-001 | Public storefront browse request | Anonymous/public | Feature succeeds when tenant context is valid | Done |
| ECOM-STOREFRONT-PERMISSION-002 | Admin/customer write permission required | Not applicable to browse APIs | Not covered here; write APIs must be tested separately | Not Applicable |

## Tenant Isolation Test Cases

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| ECOM-STOREFRONT-TENANT-001 | Tenant A fetches Tenant A categories | Tenant A active categories exist | Tenant A categories returned | Done |
| ECOM-STOREFRONT-TENANT-002 | Tenant A query has Tenant B category/product data present | Tenant B data exists in same test database | Tenant B data excluded | Done |
| ECOM-STOREFRONT-TENANT-003 | Tenant A product listing with other-tenant products linked | Tenant B products and links exist | Only Tenant A active sellable products returned | Done |
| ECOM-STOREFRONT-TENANT-004 | Tenant A product details with Tenant B data present | Tenant B product exists in same database | Tenant B product is not returned for Tenant A request | Done |

## Business Rule Test Cases

| Test Case ID | Scenario | Rule | Expected Result | Automated |
|---|---|---|---|---|
| ECOM-STOREFRONT-RULE-001 | Root category listing | `ParentCategoryId == null` | Child categories are excluded | Done |
| ECOM-STOREFRONT-RULE-002 | Child category listing | `ParentCategoryId == categoryId` | Root and other-parent categories are excluded | Done |
| ECOM-STOREFRONT-RULE-003 | Category item count | Count only active sellable products | Inactive/not sellable products excluded from itemCount | Done |
| ECOM-STOREFRONT-RULE-004 | Product listing visibility | Product must be active and sellable | Inactive/not sellable products excluded | Done |
| ECOM-STOREFRONT-RULE-005 | Product listing variants | Listing API is lightweight | Variants are not returned; Product Details API returns variants | Done |
| ECOM-STOREFRONT-RULE-006 | Product listing image fallback | Missing primary image | Uses `https://via.placeholder.com/300` | Done |
| ECOM-STOREFRONT-RULE-007 | Product listing stock flag | Inventory rows available | `isInStock` reflects available quantity | Done |
| ECOM-STOREFRONT-RULE-008 | Product listing sorting | `price_asc`, `price_desc`, `newest`, default | Products returned in expected order | Done |
| ECOM-STOREFRONT-RULE-009 | Product detail visibility | Product must be active, sellable, and current tenant | Inactive/not sellable/other-tenant products are not returned | Done |
| ECOM-STOREFRONT-RULE-010 | Product detail variants | Active sellable variants linked to product | Variants include sku, colour, size, price, default flag, and stock flag | Done |
| ECOM-STOREFRONT-RULE-011 | Product detail selectable options | Variant-linked colour and size option values exist | Distinct colour and size lists are returned in sort order | Done |
| ECOM-STOREFRONT-RULE-012 | Product detail enrichment | Rating, images, attributes, return policy, inventory exist | Detail payload maps badge, gallery, highlights, return info, delivery info, and stock | Done |

## Idempotency Test Cases

Use this section only when `Idempotency Required = Yes`.

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| ECOM-STOREFRONT-IDEMPOTENCY-001 | Storefront browse APIs are GET-only | Read-only APIs | Idempotency key not required | Not Applicable |

## Database / Integration Test Cases

| Test Case ID | Scenario | Database Assertion | Automated |
|---|---|---|---|
| ECOM-STOREFRONT-DB-001 | Banner filtering | Only active current-tenant matching type returned in SortOrder | Done |
| ECOM-STOREFRONT-DB-002 | Root category filtering | Active current-tenant roots only; item counts from active sellable products | Done |
| ECOM-STOREFRONT-DB-003 | Child category filtering | Active current-tenant children for selected parent only | Done |
| ECOM-STOREFRONT-DB-004 | Product listing filtering | Active sellable current-tenant products linked to category only | Done |
| ECOM-STOREFRONT-DB-005 | Product listing enrichment | Price, primary image, rating, review count, stock, badge, pagination mapped | Done |
| ECOM-STOREFRONT-DB-006 | Best seller enrichment | One current price, one primary image, and rating attached per product | Done |
| ECOM-STOREFRONT-DB-007 | Product detail aggregation | Product, current price, images, variants, option values, inventory, attributes, rating, and return policy mapped | Done |
| ECOM-STOREFRONT-DB-008 | Search filtering | Results stay tenant-scoped and respect active/sellable/product filter rules | Not Started |
| ECOM-STOREFRONT-DB-009 | Category slug lookup | Only active current-tenant category can be returned by slug | Not Started |

## Current Automated Test Coverage

Update this section after automated tests are implemented.

| Test Project | Test File | Test Name | Status |
|---|---|---|---|
| E_POS.ApiTests | tests/E_POS.ApiTests/ECommerce/Storefront/StorefrontControllerTests.cs | Tenant resolve, banners, categories, child categories, product listing, product details, best sellers, stores controller tests | Done |
| E_POS.UnitTests | tests/E_POS.UnitTests/ECommerce/Storefront/StorefrontServiceTests.cs | Storefront service mapping and repository delegation tests, including product details | Done |
| E_POS.IntegrationTests | tests/E_POS.IntegrationTests/ECommerce/Storefront/StorefrontRepositoryTests.cs | Storefront repository filtering, mapping, sorting, pagination, and product detail aggregation tests | Done |

## Test Commands

```powershell
dotnet build E_POS.sln
dotnet test E_POS.sln --no-build
```

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | 268 passed |
| Integration Tests | 216 passed |
| API Tests | 195 passed |
| Manual Verification | Not Done |
| Known Gaps | Fulfillment raw SQL repository needs relational provider coverage |

## Completion Checklist

- [x] Planned test cases written.
- [x] Unit tests added where service/domain logic exists.
- [x] Integration tests added where database behavior matters.
- [x] API tests added for endpoint behavior.
- [x] Permission denied case evaluated; public read APIs do not require permission.
- [x] Tenant isolation case tested.
- [x] Idempotency tested if required; not required for GET-only APIs.
- [x] Regression impact checked.
- [x] Test commands and results recorded.

## Related Standards

- [[../../Testing_Strategy]]
- [[../../API_Testing_Standards]]
- [[../../Permission_Test_Cases]]
- [[../../Tenant_Isolation_Test_Cases]]
- [[../../Idempotency_Test_Cases]]
- [[../../Regression_Checklist]]