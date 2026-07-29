<!-- title: Customer Wishlist API Test Cases -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-16 -->

# Customer Wishlist API Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | 22 Online Store Cart Checkout / E-Commerce Customer Features |
| Feature | Authenticated Customer Wishlist APIs |
| Feature Type | Read / Create / Delete / Workflow |
| API Endpoint | `GET /api/v1/ecommerce/storefront/wishlist`; `POST /api/v1/ecommerce/storefront/wishlist/items`; `DELETE /api/v1/ecommerce/storefront/wishlist/items/{itemId}`; `DELETE /api/v1/ecommerce/storefront/wishlist` |
| Application Service | `ICustomerWishlistService` / `CustomerWishlistService` |
| Required Permission | ASP.NET Core `CustomerOnly` authorization policy |
| Tenant Scoped | Yes, using authenticated JWT `tenant_id` and customer `sub` claims |
| Idempotency Required | Yes for repeated add of the same product and variant |
| Criticality | High |

## Purpose

Validate the authenticated customer wishlist flow used by the e-commerce product listing and product-details heart actions. The feature must let a customer read the default wishlist, add a product or product variant, remove an owned item, and clear the owned wishlist without accepting tenant or customer identity from request headers or bodies. All catalog and wishlist operations must remain inside the JWT tenant/customer boundary.

## Preconditions

- Tenant exists and is active.
- Customer exists, is active, and has a valid customer access token.
- The access token contains valid `tenant_id` and customer `sub` claims.
- The customer auth session passes the `CustomerOnly` authorization policy.
- Required active and sellable products and variants exist for success scenarios.
- Current price, primary image, and inventory data exist where enrichment is verified.
- `customer_wishlists` and `customer_wishlist_items` migrations are already applied.

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result |
|---|---|---|---|---|
| ECOM-WISHLIST-001 | Read wishlist when no persisted wishlist exists | Integration | High | Empty `My Wishlist` response; no row created by read |
| ECOM-WISHLIST-002 | Add active current-tenant product | Unit / API / Integration | High | Wishlist and item are created and returned |
| ECOM-WISHLIST-003 | Add the same product/variant twice | Integration | High | Safe no-op; only one item remains |
| ECOM-WISHLIST-004 | Remove an owned wishlist item | API / Integration | High | Item is deleted and updated wishlist returned |
| ECOM-WISHLIST-005 | Clear the owned wishlist | Integration | High | All owned items are deleted; wishlist remains empty |
| ECOM-WISHLIST-006 | Missing or invalid JWT customer context | Unit / API | Critical | 401 Unauthorized; repository/service operation is not called |
| ECOM-WISHLIST-007 | Empty product id | Unit | High | Validation failure; repository is not called |
| ECOM-WISHLIST-008 | Product belongs to another tenant | Integration | Critical | Product not found response; no wishlist row created |
| ECOM-WISHLIST-009 | Customer tries to remove another customer's item | Integration | Critical | Item not found/access denied; target item remains protected |
| ECOM-WISHLIST-010 | Missing wishlist item | Unit / API | High | 404 Not Found with stable error code |
| ECOM-WISHLIST-011 | Product response enrichment | Integration | Medium | Name, slug, current price, primary image, stock, and availability are mapped |
| ECOM-WISHLIST-012 | Controller route and authorization contract | API | High | Expected routes exist and controller requires `CustomerOnly` |

## Success Test Cases

| Test Case ID | Scenario | Preconditions | Input | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|
| ECOM-WISHLIST-SUCCESS-001 | Empty default wishlist is returned | Valid customer context; no wishlist row | JWT tenant/customer claims | Call `GET /wishlist` repository flow | `My Wishlist`, zero items, and no database write | Done |
| ECOM-WISHLIST-SUCCESS-002 | Product is added | Active customer and active sellable product | `productId`; optional `productVariantId` | Call `POST /wishlist/items` | 200 OK with one enriched wishlist item | Done |
| ECOM-WISHLIST-SUCCESS-003 | JWT context is forwarded | Valid `tenant_id` and `sub` claims | Add-item request | Call controller add endpoint | Service receives claim tenant/customer and request | Done |
| ECOM-WISHLIST-SUCCESS-004 | Owned item is removed | Item exists in authenticated customer's wishlist | `itemId` | Call remove operation | Item row is deleted and remaining items returned | Done |
| ECOM-WISHLIST-SUCCESS-005 | Wishlist is cleared | Authenticated customer has multiple items | JWT tenant/customer claims | Call `DELETE /wishlist` | Wishlist contains zero items | Done |

## Validation Test Cases

| Test Case ID | Scenario | Invalid Input | Expected Error | Automated |
|---|---|---|---|---|
| ECOM-WISHLIST-VALIDATION-001 | Invalid customer context | Empty tenant or customer id | `customer_wishlist.invalid_customer_context`; repository not called | Done |
| ECOM-WISHLIST-VALIDATION-002 | Missing product id | `Guid.Empty` product id | `customer_wishlist.invalid_product_id`; repository not called | Done |
| ECOM-WISHLIST-VALIDATION-003 | Missing item id | `Guid.Empty` item id | `customer_wishlist.invalid_item_id` | Planned |
| ECOM-WISHLIST-VALIDATION-004 | Product is missing or unavailable | Unknown/inactive/not-sellable product | `customer_wishlist.product_not_found` / 404 | Partial; cross-tenant product case done |
| ECOM-WISHLIST-VALIDATION-005 | Variant is missing or unavailable | Unknown, inactive, unsellable, wrong-product, or wrong-tenant variant | `customer_wishlist.variant_not_found` / 404 | Planned |
| ECOM-WISHLIST-VALIDATION-006 | Item is missing or inaccessible | Unknown or non-owned item id | `customer_wishlist.item_not_found` / 404 | Done |

## Permission Test Cases

| Test Case ID | Scenario | User Permission State | Expected Result | Automated |
|---|---|---|---|---|
| ECOM-WISHLIST-PERMISSION-001 | Authenticated customer calls wishlist | Valid customer identity and session | Feature reaches controller/service | Policy contract done |
| ECOM-WISHLIST-PERMISSION-002 | Claims are missing | No valid customer claims | 401 Unauthorized; service not called | Done |
| ECOM-WISHLIST-PERMISSION-003 | Staff/platform token calls wishlist | Wrong identity policy | Authorization middleware rejects request | Planned end-to-end middleware test |
| ECOM-WISHLIST-PERMISSION-004 | Request tries to supply tenant/customer identity | Header/body identity differs from token | JWT claims remain the only identity source | Controller contract done |

## Tenant Isolation Test Cases

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| ECOM-WISHLIST-TENANT-001 | Tenant A customer adds Tenant A product | Tenant A customer/product exist | Item is added to Tenant A customer's wishlist | Done |
| ECOM-WISHLIST-TENANT-002 | Tenant A customer adds Tenant B product | Tenant B product exists in same test database | `product_not_found`; no wishlist created | Done |
| ECOM-WISHLIST-TENANT-003 | Customer B removes Customer A item | Two customers exist under same tenant | `item_not_found`; Customer A data remains protected | Done |
| ECOM-WISHLIST-TENANT-004 | Wishlist query is scoped | Other tenant/customer wishlists exist | Only JWT tenant/customer wishlist is returned | Repository predicate implemented; dedicated mixed-data read test planned |

## Business Rule Test Cases

| Test Case ID | Scenario | Rule | Expected Result | Automated |
|---|---|---|---|---|
| ECOM-WISHLIST-RULE-001 | First read has no stored wishlist | GET must not mutate state | Empty `My Wishlist` read model; zero persisted wishlists | Done |
| ECOM-WISHLIST-RULE-002 | First valid add | Default wishlist is created lazily | `customer_wishlists` and one item row exist | Done |
| ECOM-WISHLIST-RULE-003 | Duplicate add | Same wishlist/product/variant is unique | Existing item returned; no duplicate row | Done |
| ECOM-WISHLIST-RULE-004 | Variant selection | Variant must belong to selected product and current tenant and be active/sellable | Invalid variant is rejected | Implemented; dedicated automated case planned |
| ECOM-WISHLIST-RULE-005 | Product-card enrichment | Wishlist reads current catalog data | Product name/slug, price, image, stock, and availability returned | Done |
| ECOM-WISHLIST-RULE-006 | Remove/clear ownership | Only authenticated customer's wishlist can change | Cross-customer item cannot be removed | Done |
| ECOM-WISHLIST-RULE-007 | Clear behavior | Clear removes items but not the wishlist identity | Empty wishlist is returned | Implemented; item deletion automated |

## Idempotency Test Cases

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| ECOM-WISHLIST-IDEMPOTENCY-001 | Same product and null variant added twice | First add succeeded | One wishlist and one item row only | Done |
| ECOM-WISHLIST-IDEMPOTENCY-002 | Same product and same variant added twice | First add succeeded | One matching item row only | Domain rule implemented; dedicated variant test planned |
| ECOM-WISHLIST-IDEMPOTENCY-003 | Clear repeated | Wishlist is already empty | Safe no-op with empty wishlist response | Implemented; dedicated automated case planned |

## Database / Integration Test Cases

| Test Case ID | Scenario | Database Assertion | Automated |
|---|---|---|---|
| ECOM-WISHLIST-DB-001 | Default read does not persist | `customer_wishlists` remains empty after GET repository operation | Done |
| ECOM-WISHLIST-DB-002 | Add persists rows | One wishlist and one wishlist-item row exist | Done |
| ECOM-WISHLIST-DB-003 | Duplicate add is suppressed | Repeated add leaves one wishlist-item row | Done |
| ECOM-WISHLIST-DB-004 | Cross-tenant product is rejected | No wishlist row is created | Done |
| ECOM-WISHLIST-DB-005 | Remove and clear delete items | `customer_wishlist_items` becomes empty after operations | Done |
| ECOM-WISHLIST-DB-006 | EF model matches migrations | `has-pending-model-changes` reports no model drift | Done |
| ECOM-WISHLIST-DB-007 | PostgreSQL nullable-variant unique constraint and concurrent add | Relational unique/concurrency behavior prevents duplicates | Planned relational-provider coverage |

## Current Automated Test Coverage

| Test Project | Test File | Test Name | Status |
|---|---|---|---|
| E_POS.UnitTests | `tests/E_POS.UnitTests/ECommerce/CustomerWishlist/CustomerWishlistServiceTests.cs` | Invalid context, valid add forwarding, empty product validation, item-not-found mapping | 4 passed |
| E_POS.ApiTests | `tests/E_POS.ApiTests/ECommerce/CustomerWishlist/CustomerWishlistControllerTests.cs` | JWT claim forwarding, missing-claims unauthorized, item-not-found response, policy/routes | 4 passed |
| E_POS.IntegrationTests | `tests/E_POS.IntegrationTests/ECommerce/CustomerWishlist/CustomerWishlistRepositoryTests.cs` | Empty read, enriched idempotent add, cross-tenant rejection, owned remove/clear | 4 passed |

## Test Commands

```powershell
dotnet build E_POS.sln --no-restore --no-dependencies
dotnet test tests\E_POS.UnitTests\E_POS.UnitTests.csproj --no-build --filter FullyQualifiedName~CustomerWishlist
dotnet test tests\E_POS.ApiTests\E_POS.ApiTests.csproj --no-build --filter FullyQualifiedName~CustomerWishlist
dotnet test tests\E_POS.IntegrationTests\E_POS.IntegrationTests.csproj --no-build --filter FullyQualifiedName~CustomerWishlist
dotnet ef migrations has-pending-model-changes --project src\E_POS.Infrastructure\E_POS.Infrastructure.csproj --startup-project src\E_POS.Api\E_POS.Api.csproj --no-build
dotnet test E_POS.sln --no-build --no-restore
```

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Wishlist focused: 4 passed |
| Integration Tests | Wishlist focused: 4 passed |
| API Tests | Wishlist focused: 4 passed; full API project: 285 passed |
| Build | Passed with 0 warnings and 0 errors |
| EF Migration Drift | No pending model changes |
| Full Regression | 967 passed, 3 failed; all 3 failures are existing Storefront placeholder-image expectations, not Wishlist failures |
| Manual Verification | Not Done |
| Known Gaps | End-to-end authorization middleware, dedicated invalid-variant, repeated-clear, mixed-data read, and PostgreSQL concurrent-add coverage |

## Completion Checklist

- [x] Planned test cases written.
- [x] Unit tests added where service/domain logic exists.
- [x] Integration tests added where database behavior matters.
- [x] API tests added for endpoint behavior.
- [x] Permission denied case tested for missing claims; end-to-end wrong-identity middleware case remains planned.
- [x] Tenant isolation cases tested for cross-tenant product and cross-customer removal.
- [x] Idempotency tested for repeated base-product add.
- [x] Regression impact checked; unrelated failures documented.
- [x] Test commands and results recorded.

## Related Standards

- [[../../Testing_Strategy]]
- [[../../API_Testing_Standards]]
- [[../../Permission_Test_Cases]]
- [[../../Tenant_Isolation_Test_Cases]]
- [[../../Idempotency_Test_Cases]]
- [[../../Regression_Checklist]]
- [[../../../06_DATABASE_KNOWLEDGE/Tables/25_ECommerce_Storefront_And_Customer_Features]]
- [[ECommerce_Storefront_API_Test_Cases]]
- [[../../../15_IMPLEMENTATION_TRACKING/Backend/Customer_Wishlist_API_Testing_Status]]
