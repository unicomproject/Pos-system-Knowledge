<!-- title: Product Review API Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-16 -->

# Product Review API Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | 22 Online Store Cart Checkout / E-Commerce Product Reviews |
| Feature | Product review read, create, update, and delete APIs |
| Feature Type | Read / Create / Update / Delete / Workflow |
| API Endpoint | `GET/POST /api/v1/ecommerce/storefront/catalog/products/{productId}/reviews`; `PATCH/DELETE /api/v1/ecommerce/storefront/reviews/{reviewId}` |
| Application Service | `IProductReviewService` / `ProductReviewService` |
| Required Permission | GET is anonymous after active-tenant and `online_store` entitlement verification; mutations require `CustomerOnly` |
| Tenant Scoped | Yes; public reads verify `X-Tenant-Id`, mutations use JWT `tenant_id` and customer `sub` only |
| Idempotency Required | No; a second active review for the same tenant/customer/product returns conflict |
| Criticality | High |

## Purpose

Validate the product-details review flow. Approved reviews must be visible immediately, while only a verified purchaser may create one review per product. Customers may update or soft-delete only their own reviews. Every query and mutation must remain inside the verified tenant boundary, require the effective `online_store` entitlement, and keep the product rating summary synchronized.

## Preconditions

- Tenant exists and is active.
- The active `online_store` platform feature is effectively enabled for the tenant.
- Product belongs to the tenant and is active and sellable.
- Customer mutation calls carry a valid `CustomerOnly` token with `tenant_id` and `sub` claims.
- A completed and fulfilled sales order line exists for create-success scenarios.
- Product Review migration `AddCustomerProductReviewApis` is available for deployment.

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result |
|---|---|---|---|---|
| ECOM-REVIEW-001 | Read approved reviews and rating summary | Integration | High | Only current-tenant approved reviews are paged and summarized |
| ECOM-REVIEW-002 | Create review after completed fulfilled purchase | Unit / API / Integration | Critical | 201; review is immediately `APPROVED` and visible |
| ECOM-REVIEW-003 | Create without verified purchase | Unit / Integration | Critical | 403 with `product_reviews.purchase_required`; no row created |
| ECOM-REVIEW-004 | Create duplicate active review | API / Integration | High | 409 with `product_reviews.duplicate_review`; one row remains |
| ECOM-REVIEW-005 | Update owned review | Unit / API / Integration | High | Owned review changes and summary is rebuilt |
| ECOM-REVIEW-006 | Delete owned review | Unit / API / Integration | High | 204; status becomes `DELETED`; summary is rebuilt |
| ECOM-REVIEW-007 | Cross-customer mutation | Integration | Critical | Review is not found/access denied without owner leak |
| ECOM-REVIEW-008 | Cross-tenant product/review access | Integration | Critical | Not found and no cross-tenant data is returned or changed |
| ECOM-REVIEW-009 | Missing JWT customer claims | API | Critical | 401 and service is not called |
| ECOM-REVIEW-010 | Online Store entitlement disabled | Integration | Critical | Repository returns feature-disabled and controller maps 403 |
| ECOM-REVIEW-011 | Rating/paging/sort/length validation | Unit | High | Stable validation error and repository is not called |
| ECOM-REVIEW-012 | Controller route and authorization contract | API | High | GET is anonymous; POST/PATCH/DELETE require `CustomerOnly` |

## Success Test Cases

| Test Case ID | Scenario | Preconditions | Input | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|
| ECOM-REVIEW-SUCCESS-001 | Public approved review read | Active tenant, entitlement, product, approved reviews | Tenant header, product id, paging/sort | Call GET repository flow | Current-tenant approved page and live summary | Done |
| ECOM-REVIEW-SUCCESS-002 | Verified purchaser creates review | Completed/fulfilled order line exists | Rating 1-5; optional title/text | Call POST flow | 201 model is `APPROVED`, persisted, and immediately returned by GET | Done |
| ECOM-REVIEW-SUCCESS-003 | Owner updates review | Authenticated owner and active product | New rating/title/text | Call PATCH flow | 200 with updated review and rebuilt summary | Done |
| ECOM-REVIEW-SUCCESS-004 | Owner deletes review | Authenticated owner | Review id | Call DELETE flow | 204; row retained with `DELETED`; summary excludes it | Done |

## Validation Test Cases

| Test Case ID | Scenario | Invalid Input | Expected Error | Automated |
|---|---|---|---|---|
| ECOM-REVIEW-VALIDATION-001 | Invalid paging | Page below 1 or pageSize outside 1-50 | `product_reviews.invalid_paging`; no repository call | Done |
| ECOM-REVIEW-VALIDATION-002 | Invalid sort | Value outside newest/oldest/highest/lowest | `product_reviews.invalid_sort`; no repository call | Implemented; focused direct case planned |
| ECOM-REVIEW-VALIDATION-003 | Rating outside 1-5 | Rating 0 or 6 | `product_reviews.invalid_rating`; no repository call | Done |
| ECOM-REVIEW-VALIDATION-004 | Title too long | More than 150 characters | `product_reviews.title_too_long`; no repository call | Done |
| ECOM-REVIEW-VALIDATION-005 | Text too long | More than 5000 characters | `product_reviews.text_too_long`; no repository call | Implemented; focused direct case planned |
| ECOM-REVIEW-VALIDATION-006 | Invalid resource id | Empty product/review id | Stable product/review validation error | Implemented; focused direct case planned |

## Permission Test Cases

| Test Case ID | Scenario | User Permission State | Expected Result | Automated |
|---|---|---|---|---|
| ECOM-REVIEW-PERMISSION-001 | Public user reads reviews | Anonymous, valid tenant header | GET reaches verified tenant/entitlement boundary | Attribute and repository coverage done |
| ECOM-REVIEW-PERMISSION-002 | Customer creates/changes owned review | Valid `CustomerOnly` identity | Mutation reaches service with JWT tenant/customer | Policy/claim contract done |
| ECOM-REVIEW-PERMISSION-003 | Mutation claims missing | Missing tenant/customer claim | 401; service not called | Done |
| ECOM-REVIEW-PERMISSION-004 | Staff/platform token calls mutation | Wrong identity policy | Authorization middleware rejects request | Planned end-to-end middleware case |
| ECOM-REVIEW-PERMISSION-005 | Online Store feature disabled | Tenant lacks effective entitlement | 403 feature disabled | Repository boundary done |

## Tenant Isolation Test Cases

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| ECOM-REVIEW-TENANT-001 | Tenant A reads Tenant A product reviews | Tenant A access/product/reviews exist | Only Tenant A approved reviews returned | Done |
| ECOM-REVIEW-TENANT-002 | Tenant A request targets Tenant B product | Product belongs only to Tenant B | `product_not_found`; no review created | Done |
| ECOM-REVIEW-TENANT-003 | Mixed-tenant review rows share requested product id in test data | Tenant A and Tenant B review rows exist | Tenant B row is excluded from count/items/summary | Done |
| ECOM-REVIEW-TENANT-004 | Customer B changes Customer A review | Same tenant, two customers | `review_not_found`; owner data unchanged | Done |

## Business Rule Test Cases

| Test Case ID | Scenario | Rule | Expected Result | Automated |
|---|---|---|---|---|
| ECOM-REVIEW-RULE-001 | Purchase verification | Completed and fulfilled order plus fulfilled product line is required | Missing proof returns `purchase_required` | Done |
| ECOM-REVIEW-RULE-002 | Immediate publication | New customer review is created as `APPROVED` | Same request cycle persists it; following GET includes it | Done |
| ECOM-REVIEW-RULE-003 | One active review | Tenant/customer/product combination is unique | Duplicate returns conflict and one row remains | Done |
| ECOM-REVIEW-RULE-004 | Owner-only mutation | JWT customer must match review customer | Cross-customer mutation returns safe not-found | Done |
| ECOM-REVIEW-RULE-005 | Soft delete | Delete changes status rather than deleting row | Public GET excludes row; audit timestamps remain | Done |
| ECOM-REVIEW-RULE-006 | Summary consistency | Approved mutation rebuilds counts and average immediately | Create/update/delete summary matches approved rows | Done |
| ECOM-REVIEW-RULE-007 | Customer display privacy | Public response avoids full customer identity | Masked name or `Verified customer` returned | Done |

## Idempotency Test Cases

This feature does not treat duplicate review creation as an idempotent success. The business rule is one active review per tenant/customer/product, and the second create returns a conflict.

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| ECOM-REVIEW-DUPLICATE-001 | Same customer creates the same product review twice | First create succeeded | Second create returns `duplicate_review`; no second row | Done |

## Database / Integration Test Cases

| Test Case ID | Scenario | Database Assertion | Automated |
|---|---|---|---|
| ECOM-REVIEW-DB-001 | Valid create persists review | One `APPROVED` row with tenant/product/customer and audit timestamps | Done |
| ECOM-REVIEW-DB-002 | Purchase failure does not persist | `product_reviews` remains empty | Done |
| ECOM-REVIEW-DB-003 | Duplicate is suppressed | One review row remains | Done |
| ECOM-REVIEW-DB-004 | Update/delete rebuild summary | Counts and average contain only approved rows | Done |
| ECOM-REVIEW-DB-005 | Schema constraints exist | Rating/status checks and tenant-product-customer unique index are in migration | Migration reviewed |
| ECOM-REVIEW-DB-006 | EF snapshot matches model | `has-pending-model-changes` reports no drift | Done |
| ECOM-REVIEW-DB-007 | PostgreSQL concurrent create/update | Per-product summary and unique constraint remain correct under parallel requests | Planned relational concurrency coverage |

## Current Automated Test Coverage

| Test Project | Test File | Covered Areas | Status |
|---|---|---|---|
| E_POS.UnitTests | `tests/E_POS.UnitTests/ECommerce/ProductReviews/ProductReviewServiceTests.cs` | Paging, sort forwarding, rating/title validation, purchase/not-found mapping, authenticated context/clock | 6 passed |
| E_POS.ApiTests | `tests/E_POS.ApiTests/ECommerce/ProductReviews/ProductReviewsControllerTests.cs` | Public GET, JWT claim forwarding, missing claims, duplicate conflict, delete status, routes/policies | 6 passed |
| E_POS.IntegrationTests | `tests/E_POS.IntegrationTests/ECommerce/ProductReviews/ProductReviewRepositoryTests.cs` | Tenant filtering, entitlement, verified purchase, immediate visibility, duplicate, ownership, summary, cross-tenant product | 6 passed |

## Test Commands

```powershell
dotnet build E_POS.sln --no-restore
dotnet test tests\E_POS.UnitTests\E_POS.UnitTests.csproj --no-build --filter FullyQualifiedName~E_POS.UnitTests.ECommerce.ProductReviews
dotnet test tests\E_POS.ApiTests\E_POS.ApiTests.csproj --no-build --filter FullyQualifiedName~E_POS.ApiTests.ECommerce.ProductReviews
dotnet test tests\E_POS.IntegrationTests\E_POS.IntegrationTests.csproj --no-build --filter FullyQualifiedName~E_POS.IntegrationTests.ECommerce.ProductReviews
dotnet ef migrations has-pending-model-changes --project src\E_POS.Infrastructure\E_POS.Infrastructure.csproj --startup-project src\E_POS.Api\E_POS.Api.csproj --no-build
```

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Product Review focused: 6 passed; full project: 404 passed, 2 unrelated failed |
| Integration Tests | Product Review focused: 6 passed; full project: 290 passed, 1 unrelated failed |
| API Tests | Product Review focused: 6 passed; full project: 291 passed |
| Build | Passed with 0 warnings and 0 errors |
| EF Migration Drift | No pending model changes |
| Full Regression | 985 passed, 3 failed; all failures are existing Storefront placeholder-image expectations |
| Manual Verification | Not done |
| Known Gaps | End-to-end wrong-identity authorization, real PostgreSQL constraint/concurrency, and manual token-based API verification |

## Completion Checklist

- [x] Planned test cases written.
- [x] Unit tests added where service/domain logic exists.
- [x] Integration tests added for database behavior.
- [x] API tests added for endpoint and authorization contracts.
- [x] Permission denial tested for missing claims and disabled entitlement.
- [x] Tenant and owner isolation tested.
- [x] Duplicate business rule tested.
- [x] Regression impact checked; unrelated failures documented.
- [x] Test commands and results recorded.

## Related Standards

- [[../../Testing_Strategy]]
- [[../../API_Testing_Standards]]
- [[../../Permission_Test_Cases]]
- [[../../Tenant_Isolation_Test_Cases]]
- [[../../Idempotency_Test_Cases]]
- [[../../Regression_Checklist]]
- [[../../../06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED]]
- [[../../../15_IMPLEMENTATION_TRACKING/Backend/Product_Review_API_Testing_Status]]
