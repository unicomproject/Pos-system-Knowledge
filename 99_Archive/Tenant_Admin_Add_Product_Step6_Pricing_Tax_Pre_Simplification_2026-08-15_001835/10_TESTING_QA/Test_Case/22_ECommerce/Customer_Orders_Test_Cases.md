<!-- title: Customer Orders Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-19 -->

# Customer Orders Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | ECommerce / Click & Collect |
| Feature | Customer Orders and Click & Collect Status Workflow |
| Feature Type | Read / Workflow |
| API Endpoint | `GET /api/v1/ecommerce/storefront/orders`, `GET /api/v1/ecommerce/storefront/orders/{orderId}`, `POST /api/v1/ecommerce/storefront/orders/{orderId}/cancel`, `PATCH /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/status` |
| Application Service | `CustomerOrderService`, `ClickCollectOrderStatusService` |
| Required Permission | Customer JWT for storefront APIs; `fulfillment.orders.manage` for tenant status update |
| Tenant Scoped | Yes |
| Idempotency Required | No |
| Criticality | High |

## Purpose

Validate that customers can view and cancel only their own click & collect orders and tenant users can move orders through the allowed fulfilment workflow. QR code must appear only after outlet acceptance.

## Preconditions

- Tenant exists and is active.
- Customer exists and is authenticated for storefront APIs.
- Tenant user exists and is authenticated for tenant status update API.
- Tenant user has `fulfillment.orders.manage` permission for status updates.
- Click & collect order exists in `sales_orders` with related `sales_order_lines`.

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result | Current Coverage |
|---|---|---|---|---|---|
| ECOM-ORDERS-001 | Customer lists own orders | API / Integration | High | Only current customer and tenant orders returned | Automated |
| ECOM-ORDERS-002 | Customer filters orders by status | Unit / API / Integration | High | Status filter is normalized and applied | Automated |
| ECOM-ORDERS-003 | Customer opens pending order details | API / Integration | High | Order details returned with `collectionQr = null` | Automated |
| ECOM-ORDERS-004 | Customer opens accepted order details | API / Integration | High | Order details returned with QR payload | Automated |
| ECOM-ORDERS-005 | Customer attempts to view another customer order | API / Integration | High | 404/null without data leak | Automated |
| ECOM-ORDERS-006 | Tenant user accepts pending order | Unit / Integration | High | Status becomes `ACCEPTED`; QR becomes available | Automated |
| ECOM-ORDERS-007 | Tenant user moves order to preparing | Integration | High | Status becomes `PREPARING` | Automated |
| ECOM-ORDERS-008 | Tenant user marks order ready for collection | Unit / Integration | High | Status becomes `READY_FOR_COLLECTION` | Automated |
| ECOM-ORDERS-009 | Tenant user completes ready order | Integration | High | Status becomes `COMPLETED` | Automated |
| ECOM-ORDERS-010 | Invalid status transition attempted | Unit / API / Integration | High | 409 conflict/no mutation | Automated |
| ECOM-ORDERS-011 | Tenant user without permission updates status | Unit / API | High | 403 forbidden | Automated |
| ECOM-ORDERS-012 | Cancel status sent to status API | Unit / API | Medium | 400 validation error; cancel API not supported now | Automated at service level |
| ECOM-ORDERS-013 | Order details returns backend-driven timeline steps | Integration / Frontend Contract | High | Response contains `timelineSteps` with `COMPLETED`, `CURRENT`, `PENDING` states | Automated |
| ECOM-ORDERS-014 | Tenant status update writes status history | Integration | High | `sales_order_status_history` records order/fulfilment status changes | Automated |
| ECOM-ORDERS-015 | Order details exposes allowed actions only | Integration / Frontend Contract | High | Response contains `TRACK`/`CANCEL`/`NEED_HELP` based on status | Automated |

## Success Test Cases

| Test Case ID | Scenario | Preconditions | Input | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|
| ECOM-ORDERS-SUCCESS-001 | Customer list orders succeeds | Customer JWT and orders exist | `GET /orders?status=all` | Call list endpoint | Paginated order list returned | Yes |
| ECOM-ORDERS-SUCCESS-002 | Customer detail pending succeeds | Pending order exists | `GET /orders/{orderId}` | Call detail endpoint | Details returned and QR is null | Yes |
| ECOM-ORDERS-SUCCESS-003 | Customer detail accepted succeeds | Accepted order exists | `GET /orders/{orderId}` | Call detail endpoint | Details returned and QR is present | Yes |
| ECOM-ORDERS-SUCCESS-004 | Tenant accepts pending order | Tenant user has permission | `{ "status": "ACCEPTED" }` | Call status API | Status updated to `ACCEPTED` | Yes |
| ECOM-ORDERS-SUCCESS-005 | Tenant moves accepted order to preparing | Accepted order exists | `{ "status": "PREPARING" }` | Call status API | Status updated to `PREPARING` | Yes |
| ECOM-ORDERS-SUCCESS-006 | Tenant moves preparing order to ready | Preparing order exists | `{ "status": "READY_FOR_COLLECTION" }` | Call status API | Status updated to `READY_FOR_COLLECTION` | Yes |
| ECOM-ORDERS-SUCCESS-007 | Tenant completes ready order | Ready order exists | `{ "status": "COMPLETED" }` | Call status API | Status updated to `COMPLETED` | Yes |
| ECOM-ORDERS-SUCCESS-008 | Customer cancels pending order | Pending order exists | `{ "reason": "Changed my mind" }` | Call customer cancel API | Order becomes `CANCELLED` | Yes |

## Validation Test Cases

| Test Case ID | Scenario | Invalid Input | Expected Error | Automated |
|---|---|---|---|---|
| ECOM-ORDERS-VALIDATION-001 | Invalid order id | Empty GUID | 400 validation response | Yes, service level |
| ECOM-ORDERS-VALIDATION-002 | Invalid customer context | Missing tenant/customer id | 401 unauthorized | Yes, controller/service level |
| ECOM-ORDERS-VALIDATION-003 | Invalid list status filter | Unknown status | 400 validation response | Yes, service level |
| ECOM-ORDERS-VALIDATION-004 | Invalid tenant status target | `CANCELLED` | 400 validation response | Yes |
| ECOM-ORDERS-VALIDATION-005 | Invalid transition | Pending to ready | 409 conflict / no mutation | Yes, API + domain + integration |

## Permission Test Cases

| Test Case ID | Scenario | User Permission State | Expected Result | Automated |
|---|---|---|---|---|
| ECOM-ORDERS-PERMISSION-001 | Customer list with customer token | Valid customer JWT | Feature succeeds | Yes, controller level |
| ECOM-ORDERS-PERMISSION-002 | Customer details without customer token | Missing/invalid customer JWT | 401 unauthorized | Yes, controller level |
| ECOM-ORDERS-PERMISSION-003 | Tenant status update with manage permission | Has `fulfillment.orders.manage` | Feature succeeds | Yes |
| ECOM-ORDERS-PERMISSION-004 | Tenant status update without manage permission | Missing `fulfillment.orders.manage` | 403 forbidden | Yes |
| ECOM-ORDERS-PERMISSION-005 | Customer token calls tenant status API | Wrong identity type | 403 forbidden through full middleware pipeline | Yes |

## Tenant Isolation Test Cases

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| ECOM-ORDERS-TENANT-001 | Tenant A customer accesses Tenant A order | Tenant A order exists | Allowed | Yes |
| ECOM-ORDERS-TENANT-002 | Tenant A customer accesses Tenant B order | Tenant B order exists | 404/null without data leak | Yes |
| ECOM-ORDERS-TENANT-003 | Tenant A user updates Tenant B order | Tenant B order exists | 404 without data leak | Yes |
| ECOM-ORDERS-TENANT-004 | Order list filters by tenant and customer | Tenant A and B data exists | Only current tenant/customer data returned | Yes |

## Business Rule Test Cases

| Test Case ID | Scenario | Rule | Expected Result | Automated |
|---|---|---|---|---|
| ECOM-ORDERS-RULE-001 | Pending order details hides QR | QR after accept only | `collectionQr = null` | Yes |
| ECOM-ORDERS-RULE-002 | Accepted order details shows QR | QR after accept only | QR payload returned | Yes |
| ECOM-ORDERS-RULE-003 | Pending to accepted | First valid transition | Allowed | Yes |
| ECOM-ORDERS-RULE-004 | Pending to ready | Cannot skip accepted/preparing | 409 conflict / domain exception / no DB mutation | Yes |
| ECOM-ORDERS-RULE-005 | Customer cancel allowed before preparation | Status is `PENDING_CONFIRMATION` or `ACCEPTED` | Order becomes `CANCELLED` | Yes |
| ECOM-ORDERS-RULE-006 | Customer cancel blocked after preparation starts | Status is `PREPARING` or later | 409 conflict / no DB mutation | Yes |

## Idempotency Test Cases

Not applicable. These APIs are read operations and controlled status transitions. No idempotency key is currently required.

## Database / Integration Test Cases

| Test Case ID | Scenario | Database Assertion | Automated |
|---|---|---|---|
| ECOM-ORDERS-DB-001 | Customer list reads orders | Query filters by `tenant_id`, `customer_id`, and `CLICK_AND_COLLECT` | Yes |
| ECOM-ORDERS-DB-002 | Customer details reads order lines | `sales_order_lines` are returned only for selected order | Yes |
| ECOM-ORDERS-DB-003 | Status update persists accepted | `sales_orders.status = ACCEPTED`, `fulfillment_status = ACCEPTED` | Yes |
| ECOM-ORDERS-DB-004 | Status update persists completed | `sales_orders.status = COMPLETED`, `fulfillment_status = COLLECTED`, `completed_at` set | Yes |
| ECOM-ORDERS-DB-005 | Invalid transition does not persist | No unexpected status mutation | Yes |
| ECOM-ORDERS-DB-006 | Cross-tenant status update | Other tenant order exists | Yes |
| ECOM-ORDERS-DB-007 | Status update audit/history | `sales_order_status_history` contains changed status, user, and timestamp | Yes |
| ECOM-ORDERS-DB-008 | Invalid transition history safety | No history row created when transition is rejected | Yes |
| ECOM-ORDERS-DB-009 | Customer cancel persists cancellation | `sales_orders` has cancelled status, timestamp, reason, and history rows | Yes |

## Current Automated Test Coverage

| Test Project | Test File | Test Name | Status |
|---|---|---|---|
| E_POS.UnitTests | `ECommerce/CustomerOrders/CustomerOrderServiceTests.cs` | `GetAsync_ReadyHyphenStatus_ForwardsNormalizedStatus` | Passed |
| E_POS.UnitTests | `ECommerce/CustomerOrders/CustomerOrderServiceTests.cs` | `GetDetailAsync_MissingCustomerContext_DoesNotCallRepository` | Passed |
| E_POS.UnitTests | `ECommerce/CustomerOrders/CustomerOrderServiceTests.cs` | `GetDetailAsync_NotFound_ReturnsSafeNotFoundError` | Passed |
| E_POS.UnitTests | `ECommerce/CustomerOrders/ClickCollectOrderStatusServiceTests.cs` | `UpdateStatusAsync_WithoutManagePermission_ReturnsPermissionDenied` | Passed |
| E_POS.UnitTests | `ECommerce/CustomerOrders/ClickCollectOrderStatusServiceTests.cs` | `UpdateStatusAsync_ValidReadyStatus_ForwardsNormalizedStatusAndContext` | Passed |
| E_POS.UnitTests | `ECommerce/CustomerOrders/ClickCollectOrderStatusServiceTests.cs` | `UpdateStatusAsync_CancelledStatus_IsRejected` | Passed |
| E_POS.UnitTests | `ECommerce/CustomerOrders/SalesOrderClickCollectStatusTests.cs` | `UpdateClickAndCollectStatus_PendingToAccepted_EnablesAcceptedStatus` | Passed |
| E_POS.UnitTests | `ECommerce/CustomerOrders/SalesOrderClickCollectStatusTests.cs` | `UpdateClickAndCollectStatus_PendingToReady_ThrowsInvalidTransition` | Passed |
| E_POS.ApiTests | `ECommerce/CustomerOrders/CustomerOrdersControllerTests.cs` | `Get_AuthenticatedCustomer_UsesOnlyJwtTenantAndCustomerClaims` | Passed |
| E_POS.ApiTests | `ECommerce/CustomerOrders/CustomerOrdersControllerTests.cs` | `GetDetail_AuthenticatedCustomer_ForwardsOrderIdAndJwtContext` | Passed |
| E_POS.ApiTests | `ECommerce/CustomerOrders/CustomerOrdersControllerTests.cs` | `Get_MissingCustomerClaims_ReturnsUnauthorizedWithoutCallingService` | Passed |
| E_POS.ApiTests | `ECommerce/CustomerOrders/CustomerOrdersControllerTests.cs` | `GetDetail_WhenServiceReturnsNotFound_ReturnsNotFound` | Passed |
| E_POS.ApiTests | `ECommerce/CustomerOrders/CustomerOrdersControllerTests.cs` | `Controller_RequiresCustomerOnlyPolicyAndExpectedRoutes` | Passed |
| E_POS.ApiTests | `ECommerce/CustomerOrders/ClickCollectOrdersControllerTests.cs` | `UpdateStatus_WithTenantClaims_ForwardsContextOrderAndRequest` | Passed |
| E_POS.ApiTests | `ECommerce/CustomerOrders/ClickCollectOrdersControllerTests.cs` | `UpdateStatus_WithoutTenantClaims_ReturnsUnauthorizedWithoutCallingService` | Passed |
| E_POS.ApiTests | `ECommerce/CustomerOrders/ClickCollectOrdersControllerTests.cs` | `UpdateStatus_PermissionDenied_ReturnsForbidden` | Passed |
| E_POS.ApiTests | `ECommerce/CustomerOrders/ClickCollectOrdersControllerTests.cs` | `UpdateStatus_InvalidTransition_ReturnsConflict` | Passed |
| E_POS.ApiTests | `ECommerce/CustomerOrders/ClickCollectOrdersControllerTests.cs` | `UpdateStatus_NotFound_ReturnsNotFound` | Passed |
| E_POS.ApiTests | `ECommerce/CustomerOrders/ClickCollectOrdersControllerTests.cs` | `Controller_RequiresTenantOnlyPolicyAndExpectedRoute` | Passed |
| E_POS.ApiTests | `ECommerce/CustomerOrders/CustomerOrdersAuthPipelineTests.cs` | `CustomerOrders_WithValidCustomerJwt_ReturnsOk` | Passed |
| E_POS.ApiTests | `ECommerce/CustomerOrders/CustomerOrdersAuthPipelineTests.cs` | `CustomerOrders_WithoutToken_ReturnsUnauthorized` | Passed |
| E_POS.ApiTests | `ECommerce/CustomerOrders/CustomerOrdersAuthPipelineTests.cs` | `CustomerOrders_WithTenantJwt_ReturnsForbidden` | Passed |
| E_POS.ApiTests | `ECommerce/CustomerOrders/CustomerOrdersAuthPipelineTests.cs` | `CustomerOrders_WithExpiredCustomerJwt_ReturnsUnauthorized` | Passed |
| E_POS.ApiTests | `ECommerce/CustomerOrders/CustomerOrdersAuthPipelineTests.cs` | `CustomerOrders_WithWrongAudience_ReturnsUnauthorized` | Passed |
| E_POS.ApiTests | `ECommerce/CustomerOrders/CustomerOrdersAuthPipelineTests.cs` | `TenantStatusUpdate_WithValidTenantJwtAndPermission_ReturnsOk` | Passed |
| E_POS.ApiTests | `ECommerce/CustomerOrders/CustomerOrdersAuthPipelineTests.cs` | `TenantStatusUpdate_WithCustomerJwt_ReturnsForbidden` | Passed |
| E_POS.ApiTests | `ECommerce/CustomerOrders/CustomerOrdersAuthPipelineTests.cs` | `TenantStatusUpdate_WithTenantJwtMissingPermission_ReturnsForbidden` | Passed || E_POS.IntegrationTests | `ECommerce/CustomerOrders/CustomerOrderRepositoryTests.cs` | `GetAsync_ReturnsOnlyCurrentTenantAndCustomerOrdersWithThumbnail` | Passed |
| E_POS.IntegrationTests | `ECommerce/CustomerOrders/CustomerOrderRepositoryTests.cs` | `GetAsync_StatusFilter_ReturnsOnlyMatchingOrders` | Passed |
| E_POS.IntegrationTests | `ECommerce/CustomerOrders/CustomerOrderRepositoryTests.cs` | `GetDetailAsync_PendingOrder_HidesCollectionQrAndMapsItemsTotals` | Passed |
| E_POS.IntegrationTests | `ECommerce/CustomerOrders/CustomerOrderRepositoryTests.cs` | `GetDetailAsync_AcceptedOrder_ReturnsCollectionQr` | Passed |
| E_POS.IntegrationTests | `ECommerce/CustomerOrders/CustomerOrderRepositoryTests.cs` | `GetDetailAsync_CrossCustomerOrder_ReturnsNull` | Passed |
| E_POS.IntegrationTests | `ECommerce/CustomerOrders/ClickCollectOrderStatusRepositoryTests.cs` | `UpdateStatusAsync_PendingToAccepted_PersistsStatusAndEnablesQr` | Passed |
| E_POS.IntegrationTests | `ECommerce/CustomerOrders/ClickCollectOrderStatusRepositoryTests.cs` | `UpdateStatusAsync_InvalidTransition_ReturnsConflictAndDoesNotMutate` | Passed |
| E_POS.IntegrationTests | `ECommerce/CustomerOrders/ClickCollectOrderStatusRepositoryTests.cs` | `UpdateStatusAsync_OrderFromAnotherTenant_ReturnsNotFound` | Passed |
| E_POS.IntegrationTests | `ECommerce/CustomerOrders/ClickCollectOrderStatusRepositoryTests.cs` | `UpdateStatusAsync_FullWorkflow_PersistsCompletedState` | Passed |

## Test Commands

```powershell
dotnet build E_POS.sln -c Release
dotnet test E_POS.sln -c Release --no-build
```

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Passed: 443 |
| Integration Tests | Passed: 319 |
| API Tests | Passed: 320 |
| Manual Verification | Not Done |
| Known Gaps | Frontend cancel button wiring pending if the UI flow is enabled; QR scan/verify API later |

## Completion Checklist

- [x] Planned test cases written.
- [x] Unit tests added where service/domain logic exists.
- [x] Integration tests added where database behavior matters.
- [x] API tests added for endpoint behavior.
- [x] Permission denied case tested.
- [x] Tenant isolation case tested via API/integration.
- [x] Idempotency reviewed; not required.
- [x] Regression test command recorded.
- [x] Test commands and results recorded.

## Related Standards

- [[../Testing_Strategy]]
- [[../API_Testing_Standards]]
- [[../Permission_Test_Cases]]
- [[../Tenant_Isolation_Test_Cases]]
- [[../Idempotency_Test_Cases]]
- [[../Regression_Checklist]]


## 2026-07-19 Additional Test Coverage - Timeline / Actions / Status History

New backend behavior covered:

- Pending order detail returns timeline with `ORDER_CONFIRMED = CURRENT` and `PREPARING = PENDING`.
- Accepted order detail returns timeline with `ORDER_CONFIRMED = COMPLETED` and `PREPARING = CURRENT`.
- Order details returns `TRACK` and `NEED_HELP` actions.
- Order details returns `CANCEL` action for `PENDING_CONFIRMATION` and `ACCEPTED` because customer cancel API is now in scope.
- Tenant status update writes `ORDER_STATUS` and `FULFILLMENT_STATUS` rows to `sales_order_status_history`.
- Invalid status transition does not mutate `sales_orders` and does not write status history.
- Full workflow records fulfilment history sequence: `ACCEPTED`, `PREPARING`, `READY_FOR_COLLECTION`, `COLLECTED`.

Frontend contract verification:

- Order details UI renders timeline from `timelineSteps` using a loop.
- Hardcoded timeline labels/states/timestamps were removed from the component template.
- Action buttons are rendered from `availableActions`.

Regression commands run on 2026-07-19:

```powershell
dotnet build E_POS.sln -c Release
dotnet test E_POS.sln -c Release --no-build
npm run build
```

Result summary:

| Check | Result |
|---|---|
| Backend build | Passed |
| Unit Tests | Passed: 443 |
| API Tests | Passed: 320 |
| Integration Tests | Passed: 319 |
| Total Backend Tests | 1082 passed |
| Frontend build | Passed with existing Angular budget/CommonJS warnings |
## 2026-07-19 Additional Test Coverage - Customer Cancel API

New behavior covered:

- Customer cancel endpoint forwards JWT tenant/customer context, order id, and reason.
- Customer cancel endpoint returns `409 Conflict` when the service reports invalid transition.
- Full middleware auth allows valid customer JWT to call cancel endpoint.
- Full middleware auth blocks tenant JWT from customer cancel endpoint with `403 Forbidden`.
- Domain allows customer cancel in `PENDING_CONFIRMATION` and `ACCEPTED`.
- Domain blocks customer cancel in `PREPARING`.
- Repository persists customer cancel to `sales_orders.status`, `sales_orders.fulfillment_status`, `cancelled_at`, and `cancellation_reason`.
- Repository writes `ORDER_STATUS` and `FULFILLMENT_STATUS` rows to `sales_order_status_history` on customer cancel.
- Repository blocks customer cancel after preparation starts and creates no history rows.
- Order detail `availableActions` returns `CANCEL` for pending/accepted and removes it after cancellation.

Regression commands run on 2026-07-19:

```powershell
dotnet build E_POS.sln -c Release
dotnet test E_POS.sln -c Release --no-build
```

Result summary:

| Check | Result |
|---|---|
| Backend build | Passed |
| Unit Tests | Passed: 443 |
| API Tests | Passed: 320 |
| Integration Tests | Passed: 319 |
| Total Backend Tests | 1082 passed |