<!-- title: Flutter POS Customer Management -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-08 -->

# Flutter POS Customer Management

## Release 1 Boundary

Route: `/pos/customers`
Bottom navigation: **Customers**

This is the Cashier POS Customer Management screen, not a full CRM and not the
checkout-specific customer selector. Customer Management is included in Release
1. Loyalty, membership tiers, loyalty points, rewards, earn/redeem, loyalty
ledger, and store-credit loyalty UI are deferred.

## Component Contract

```text
POSCustomerManagementScreen
|-- CustomerListSection
|   |-- CustomerToolbar
|   |   |-- CustomerSearchField
|   |   |-- CustomerFilterButton
|   |   `-- AddCustomerButton
|   |-- CustomerFilterBar
|   |   |-- StatusFilter
|   |   |-- SourceFilter
|   |   `-- ResetFilterButton
|   |-- CustomerTable
|   |   |-- CustomerTableHeader
|   |   `-- CustomerTableRow
|   `-- CustomerPagination
|-- CustomerDetailPanel (conditional)
|   |-- CustomerProfileHeader
|   |-- CustomerContactInfo
|   |-- CustomerStats
|   |   |-- TotalSpendCard
|   |   |-- OrderCountCard
|   |   `-- AverageOrderValueCard
|   |-- RecentPurchases
|   `-- CustomerActions
|-- AddCustomerDialog
|-- EditCustomerDialog
|-- PurchaseHistoryDialog
`-- DeactivateConfirmationDialog
```

## Master-Detail Behaviour

Initial state is `selectedCustomerId = null`.

| State | List | Detail |
|---|---:|---:|
| No selection | 100% available customer-content width | Not rendered |
| Customer selected | approximately 64% | approximately 36% |

The ratios are responsive guidance, not fixed pixels. Before selection there is
no right-side placeholder. After selection, the row highlights, the table
shrinks, and detail appears without overlay or page navigation. Clearing
selection restores full width.

Row selection sets `selectedCustomerId`, preserves the selected detail and order
history state, and loads missing detail/recent purchases. Search, filter, page,
or refresh clears selection when the customer is no longer present; otherwise
selection should be retained where practical.

## Customer Table

Columns:

- Customer: avatar/initial, full name, customer code
- Phone
- Email
- Last Purchase
- Total Spend
- Actions

No tag/loyalty, tier, Gold, Silver, VIP, Bronze, membership, or points column is
allowed in Release 1.

## Search, Filter, And Pagination

Search authority covers full/display name, phone, normalized phone, email,
normalized email, and customer code. Flutter must debounce by 300 ms, reset to
page 1, and cancel or ignore stale responses.

Status filters: `ALL`, `ACTIVE`, `INACTIVE`, `BLOCKED`. `DELETED` is excluded.

The Customer Management list uses server-side pagination as its only row
navigation mechanism. The table body must not introduce an additional internal
vertical scrollbar. Flutter requests four customer rows per page so the rows,
table header, and pagination footer remain fixed within the supported tablet
content area. Detail and purchase-history surfaces may retain their own scoped
scrolling where their content is not page-based.

Verified backend customer sources produced today are `POS` and `ECOMMERCE`.
The backend accepts a source string and compares it to `customers.source_type`;
`CLICK_AND_COLLECT`, `MANUAL`, and `IMPORT` are not verified customer-source
producers. Do not expose them as functional filters until implementation proves
them. Record any target desire as a gap.

## Detail Panel

Profile: initials/avatar, full name, customer code, status, phone, email, joined
date. Stats: total spend, completed order count, and derived average order value.

Average Order Value:

```text
totalSpentAmount / totalOrderCount
```

Show `—` when order count is zero or `isMixedCurrencySpend` is true. Otherwise
format with the aggregate `currencyCode`. It is presentation-derived: no DB
column and no new API field.

Recent purchases use the existing customer orders endpoint and show order
number, purchase date/time, amount, currency, status, and
`outletDisplayName`. **Implementation gap:** the DTO does not expose till name;
the target's “Till 01” cannot be claimed. A future DTO extension could resolve
the existing `sales_orders.till_id` relation without a migration. **View All**
opens the existing paginated purchase-history UI/API.

Actions: View Profile, Attach to Sale, Edit Customer, Deactivate Customer.

## Backend DTO Authority

Customer DTO fields are `customerId`, `fullName`, `phone`, `email`, `status`,
`customerCode`, `sourceType`, `joinedAt`, `totalOrderCount`,
`totalSpentAmount`, `currencyCode`, `lastPurchaseAt`, and
`isMixedCurrencySpend`.

Order/spend aggregates include only same-tenant, same-customer `COMPLETED`
orders where `cancelled_at` is null. Mixed currencies are never summed into a
fake monetary total.

## Add, Edit, And Deactivate

Create requires `customers.create`; full name and phone are required, email is
optional. Backend validation is name <=150, phone <=50 with at least 7 normalized
digits, and optional valid email <=150. Duplicate normalized phone/email checks
are tenant-scoped; update excludes self.

The dedicated Add Customer modal is create-only. It contains exactly three
customer inputs: full name, phone number, and optional email. It must not load or
display the existing customer list and must not contain customer search. Existing
customer discovery remains the responsibility of the Customer Management list or
the checkout customer-selection screen. The modal follows the OneVerz orange
primary-action theme and submits only to `POST /api/v1/customers`.

Customer Management exposes one orange `Add Customer` toolbar action only when
the authenticated user has `customers.create`. The duplicate page-header action
and customer summary cards remain removed. After a successful create, Flutter
reloads the first server page and selects the backend-created customer.

POS create defaults to `sourceType = POS`, `status = ACTIVE`; customer code is
generated by the backend. Flutter neither generates nor edits customer code.

Editable fields are `fullName`, `phone`, `email`, and `status`; allowed statuses
are `ACTIVE`, `INACTIVE`, `BLOCKED`. Tenant/customer IDs, code, source,
aggregates, and creation audit values are immutable.

Deactivate requires confirmation and uses the existing update endpoint to set
`INACTIVE`; no DELETE endpoint exists. Refresh detail and list afterward. If an
ACTIVE-only list drops the row, clear selection and restore full width.

## Attach And Permissions

| Capability | Permission |
|---|---|
| Navigation/list/search/detail/history/profile | `customers.view` |
| Add | `customers.create` |
| Edit/deactivate | `customers.update` |
| Attach to sale | `customers.view` + `sales.cart.manage` |

Only ACTIVE customers attach. Backend attach and final checkout revalidate
tenant/status eligibility. UI permission handling never replaces backend checks.

## Runtime States And Responsive Rules

Support initial loading, loaded list, empty database, no result, list error,
detail loading, order-history loading, permission denied, invalid/untrusted
device, till not open, duplicate conflict, and network/backend unavailable.
Never inject mock customer rows in production runtime.

The entire row is selectable. Use touch-sized targets, avoid horizontal
overflow, keep detail from overlaying the table, and do not block the list while
detail loads. Supported POS tablet sizes must retain usable controls.

## Persistence Contract

No new table, customer column, or endpoint is required. Existing `customers`,
`sales_orders`, `sales_order_lines`, `tills`, `pos_devices`, `till_sessions`,
and access-control tables are sufficient. Do not add loyalty tier, membership,
points balance, average-order-value, or customer-notes columns for this screen.

## Related Files

- [[../03_USER_JOURNEYS/Cashier/06_Customer_Loyalty_Flow]]
- [[../02_ACCESS_CONTROL/API_Authorization_Rules]]
- [[../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../10_TESTING_QA/Test_Case/21_POS_Operations/POS_Customer_Management_Test_Cases]]
