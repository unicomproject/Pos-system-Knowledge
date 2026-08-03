<!-- title: Storefront Checkout Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- module: Cart Checkout -->
<!-- feature: Storefront Checkout / Requested Collection Window -->
<!-- last_updated: 2026-07-17 -->

# Storefront Checkout Test Cases

## Feature Scope

Customer-authenticated storefront users can create a checkout from an active cart,
select or change an outlet and requested collection window, read their checkout,
and confirm it into one click-and-collect sales order.

The collection time is a customer request generated from outlet hours and
preparation configuration. It is not a capacity booking: this flow does not
create, reserve, confirm, or release <code>pickup_slots</code> or
<code>pickup_slot_reservations</code>.

Implemented endpoints:

- <code>GET /api/v1/ecommerce/storefront/fulfillment/stores/{outletId}/collection-options?days=5</code>
- <code>POST /api/v1/ecommerce/storefront/checkout/from-cart</code>
- <code>GET /api/v1/ecommerce/storefront/checkout/{sessionId}</code>
- <code>PATCH /api/v1/ecommerce/storefront/checkout/{sessionId}/collection</code>
- <code>POST /api/v1/ecommerce/storefront/checkout/{sessionId}/confirm</code>

<code>POST /checkout/buy-now</code> remains intentionally excluded.

## Collection Configuration Cases

| Case | Expected Result |
|---|---|
| Collection enabled with valid lead/window/open hours | Outlet configuration is stored in <code>fulfillment_method_outlets</code>. |
| Collection enabled without <code>click_collect</code> entitlement | Tenant-admin outlet create/update is rejected. |
| Collection enabled without an open valid business-hours row | Validation fails. |
| Multiple active pickup methods exist | Default pickup method wins; method code/id and mapping id provide stable tie-breaking. |
| Weekend or date-specific closure applies | Closed day returns no collection windows. |
| Preparation lead time applies | Windows earlier than server-now plus lead minutes are omitted/rejected. |
| Same-day cutoff has passed | Today is omitted/rejected. |
| Unsupported outlet timezone | API returns a safe conflict error. |
| DST skipped or ambiguous local time | Window is not offered and PATCH rejects it. |
| Requested date is local day +14 or later | PATCH rejects it; supported range is local today through day +13. |

## Checkout Functional Cases

| Case | Expected Result |
|---|---|
| Create from a valid non-empty cart | Session and immutable line snapshots are created; selected-outlet stock is reserved. |
| Create without <code>X-Cart-Session-Id</code> | API returns validation failure. |
| Create with invalid outlet or empty cart | API returns not found/conflict. |
| Create when outlet stock is insufficient | No checkout session or reservation is created. |
| PATCH a valid requested collection time | UTC start/end and outlet timezone snapshot are stored on <code>checkout_sessions</code>. |
| PATCH changes outlet with enough stock | Old inventory reservation is released and a new outlet reservation is created atomically. |
| PATCH changes outlet without enough stock | Request fails and the original outlet reservation remains intact. |
| Retry the exact same outlet/time after lead time moves | Existing stored selection is returned without duplicate event/reservation changes. |
| Confirm without collection selection | API returns <code>collection_required</code>. |
| Outlet timezone changes after selection | Confirm requires reselection and preserves the original snapshot. |
| Confirm active checkout | One click-and-collect sales order is created with collection start/end/timezone snapshots. |
| Confirm same completed checkout again | Existing order is returned; no duplicate order is created. |
| Confirm expired checkout | Inventory is released and session/reservation become expired. |

## Authentication / Tenant / Entitlement Cases

| Case | Expected Result |
|---|---|
| Checkout endpoint with valid customer JWT | <code>CustomerOnly</code> policy allows access. |
| Missing/invalid customer claims | API returns <code>401 Unauthorized</code>. |
| Tenant/staff/platform JWT used for checkout | <code>CustomerOnly</code> policy denies access. |
| Tenant A/customer A reads or patches Tenant B session | API returns not found; no mutation occurs. |
| Tenant is inactive or <code>online_store</code>/<code>click_collect</code> is ineffective | Storefront collection/checkout access is denied or hidden safely. |
| Payload/header tries to provide checkout tenant/customer | Authorization still uses customer JWT claims. |
| Product, outlet, hours, reservation, checkout, and order queries | Every tenant-owned query is tenant scoped. |

## Database / Migration Cases

| Case | Expected Result |
|---|---|
| Migration <code>AddStorefrontRequestedCollectionWindow</code> applies | Six nullable collection snapshot columns are added and old <code>selected_pickup_slot_id</code> is removed. |
| Existing checkout has a selected pickup slot | Migration backfills requested start/end/timezone before dropping the old column. |
| Checkout selection succeeds | No pickup slot or pickup slot reservation row is written. |
| Checkout confirms | <code>sales_orders</code> receives requested start/end/timezone snapshots. |
| EF model verification runs | No pending model changes remain after the migration. |

## Current Automated Test Coverage

| Test Suite | Coverage |
|---|---|
| Unit | Validation, entitlement gate, option generation, lead/cutoff/closed-day precedence, DST ambiguity, service forwarding/error mapping. |
| API | Customer claims, headers, PATCH forwarding, collection-options routing and safe status mapping. |
| Integration | Config persistence, deterministic pickup mapping, tenant isolation, entitlement checks, horizon/retry/timezone/DST rules, atomic outlet stock move/rollback, order snapshots, expiry. |

## Verification Commands

~~~powershell
dotnet build E_POS.sln -c Release -m:1 --no-restore
dotnet ef migrations has-pending-model-changes --project src\E_POS.Infrastructure\E_POS.Infrastructure.csproj --startup-project src\E_POS.Api\E_POS.Api.csproj --context EPosDbContext --configuration Release --no-build
dotnet test tests\E_POS.UnitTests\E_POS.UnitTests.csproj -c Release --no-build --no-restore
dotnet test tests\E_POS.ApiTests\E_POS.ApiTests.csproj -c Release --no-build --no-restore
dotnet test tests\E_POS.IntegrationTests\E_POS.IntegrationTests.csproj -c Release --no-build --no-restore
~~~

## Result Summary

| Command | Result |
|---|---|
| Release build | Passed with 0 warnings and 0 errors on 2026-07-17. |
| EF pending model changes | Passed; no changes since the latest migration. |
| Unit tests | Passed: 430/430. |
| API tests | Passed: 297/297. |
| Integration tests | Passed: 308/308. |
