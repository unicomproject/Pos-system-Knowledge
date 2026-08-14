<!-- title: Cashier Customer Management Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-08 -->

# Cashier Customer Management Flow

## Purpose

Defines Release 1 Cashier Customer Management at `/pos/customers`. This is a
POS management surface, not a full CRM and not the checkout-specific customer
selector. The legacy filename is retained to preserve inbound links.

Loyalty and customer membership functionality are deferred and are not part of
OneVerz POS Release 1. No earn, redeem, points, tier, rewards, ledger, or
store-credit loyalty action belongs to this journey.

## Preconditions

- Authenticated tenant user with `customers.view`.
- Valid trusted POS device assigned to a till with an open till session.
- Active tenant context supplied by authentication, never by the client body.

## Main Journey

| Step | Cashier action | Expected result |
|---:|---|---|
| 1 | Open **Customers** from bottom navigation | `/pos/customers` opens |
| 2 | Wait for the customer list | API-backed customers load; no mock rows |
| 3 | Search or filter | Results reset to page 1 and refresh |
| 4 | Select a customer row | Row highlights; list shrinks; detail opens on the same screen |
| 5 | Review profile and aggregates | Contact, status, joined date, spend/order stats appear |
| 6 | Review recent purchases | Existing paginated order-history API supplies preview data |
| 7 | Add a customer, if permitted | Backend generates code; source is `POS`; status is `ACTIVE` |
| 8 | Edit a customer, if permitted | Full name, phone, email, and allowed status are updated |
| 9 | Deactivate a customer, if permitted | Confirmation changes status to `INACTIVE`; no hard delete |
| 10 | Attach an ACTIVE customer to sale | Backend revalidates eligibility and cart permission |
| 11 | Return to or continue the sale | Selected customer remains in the active sale context |

## Dynamic Layout

- Initial `selectedCustomerId = null`: list uses 100%; detail is not rendered.
- Row selection: list is approximately 64%; detail is approximately 36%.
- Detail never overlays the table and does not trigger full-page navigation.
- Clearing or invalidating selection hides detail and restores list to 100%.
- Search/filter/page refresh clears selection when the selected row is absent;
  otherwise selection may be preserved.

## Search And Filters

Search covers display/full name, phone, normalized phone, email, normalized
email, and customer code. Flutter uses a 300 ms debounce, resets page to 1, and
prevents stale responses from replacing newer results.

The customer table shows four server-authoritative rows per page and uses the
pagination footer only. It does not combine pagination with an internal vertical
table scrollbar.

Status values are `ALL`, `ACTIVE`, `INACTIVE`, and `BLOCKED`. `DELETED` is never
shown in normal POS browsing.

Verified customer source values produced by current code are `POS` and
`ECOMMERCE`; `ALL` removes the source filter. `CLICK_AND_COLLECT`, `MANUAL`, and
`IMPORT` are not verified current customer-source producers and must not be
presented as working filters.

## Add, Edit, And Deactivate Rules

- Create: `customers.create`; full name and phone required; email optional.
- Add Customer opens a create-only orange modal with exactly Full Name, Phone
  Number, and Email inputs; it does not search or render existing customers.
- Customer Management shows one toolbar Add Customer action when
  `customers.create` is granted; successful creation refreshes the paginated
  list and selects the backend-created customer.
- Update/deactivate: `customers.update`.
- Name maximum: 150 characters.
- Phone maximum: 50 characters and at least 7 normalized digits.
- Email maximum: 150 characters and valid address syntax when supplied.
- Phone/email duplicates are tenant-scoped and exclude `DELETED` records.
- Update duplicate checks exclude the current customer.
- Customer code is backend-owned and immutable.
- POS create defaults to source `POS` and status `ACTIVE`.
- Update statuses: `ACTIVE`, `INACTIVE`, or `BLOCKED` only.

## Attach Rules

Attach requires `customers.view` plus `sales.cart.manage`. Only an `ACTIVE`
customer is eligible. Current rejection codes are:

- `pos_customers.customer_inactive`
- `pos_customers.customer_blocked`
- `pos_customers.customer_deleted`
- `pos_customers.customer_not_eligible`

Flutter permission state is UX only. Attach and checkout independently recheck
tenant ownership and customer status on the backend.

## Deferred Functionality

Release 1 excludes loyalty points, earn/redeem, membership tiers, Gold/Silver/
VIP/Bronze concepts, rewards, loyalty history/ledger, and store-credit loyalty
UI. Future architecture references do not authorize Cashier Release 1 UI.

## Related Files

- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_POS_Customer_Management]]
- [[../../02_ACCESS_CONTROL/API_Authorization_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../../10_TESTING_QA/Test_Case/21_POS_Operations/POS_Customer_Management_Test_Cases]]
