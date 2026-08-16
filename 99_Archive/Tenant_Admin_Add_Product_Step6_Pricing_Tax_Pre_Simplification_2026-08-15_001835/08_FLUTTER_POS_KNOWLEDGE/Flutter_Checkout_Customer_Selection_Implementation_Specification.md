<!-- status: SECOND BRAIN READY FOR IMPLEMENTATION -->
<!-- implementation: FLUTTER PENDING; PERMISSION SEED FIX PENDING -->
<!-- last_updated: 2026-08-07 -->

# Flutter Checkout Customer Selection / Add — Implementation Specification

## Status and Authority

This is the normative implementation contract for the cashier checkout customer
selection and Add Customer screen entered from Payment Method.

- Second Brain: **READY FOR IMPLEMENTATION**
- Backend core customer and nullable checkout APIs: **SUPPORTED**
- Flutter screen and journey: **PENDING**
- Cashier `customers.create` permission definition/seed restoration: **PENDING**
- Authenticated end-to-end acceptance: **NOT COMPLETE**

Existing Customer Management UI, customer models, cart customer state, or
nullable checkout request support must not be presented as completion of this
screen.

## Scope Boundary

The screen belongs to the active New Sale checkout and is opened only by the
Payment Method Customer card. It is a dedicated full-screen route, not a popup,
dialog, bottom sheet, or `/pos/customers`. Customer Management and its explicit
attach-to-sale workflow remain separate.

Customer is optional. Walk-in checkout means `selectedCustomer == null`, the
checkout request omits or sends null `customerId`, and
`sales_orders.customer_id` remains null.

Customer selection is mutable only on Payment Method. It must not be changed on
the payment-execution screen, while payment is processing, or after completion.
The cashier must return to Payment Method before changing it and the payment
must be revalidated/restarted.

## Approved MVP Layout

- Header: **SELECT / ADD CUSTOMER**, an explicit **Optional** indication, and
  **Back to Payment**.
- Wide tablet: existing-customer search/list on the left and Add Customer form
  on the right.
- Narrow width: the same sections stack/reflow without clipping or overflow.
- Existing-customer area: search, eligible active list, and **Load More**.
- Create area: Full Name, Mobile, Email, and **Add Customer**.
- Show **Use Walk-in Customer** when a customer is currently selected.
- Use the established OneVerz POS orange theme and existing shell components.

Do not add checkout Filter, Recent Customers, Customer Type, Notes, tiers,
loyalty balance, visits, photos, fake avatars, or management-only controls.

## Create Customer Field Contract

| Field | Required | Maximum | Validation and normalization |
|---|---:|---:|---|
| Full Name | Yes | 150 | Trim; must remain nonblank. |
| Mobile / Phone | Yes | 50 | Backend-compatible normalization; normalized value must contain at least 7 digits. |
| Email | No | 150 | Trim/normalize; when supplied it must be syntactically valid. |

`customerId`, `customerCode`, `status`, and `sourceType` are backend generated.
POS creation uses `sourceType = POS` and `status = ACTIVE`. The create request
must not expose or accept management/profile fields outside the table above.

The Add action must prevent double submission. On success, use the customer
returned by the create API, set it as the checkout customer, revalidate/reprice,
and return automatically to Payment Method. Do not require re-search, Attach,
Save/Attach, or a confirmation step.

## Duplicate Contact Contract

Normalized phone and normalized nonblank email are tenant-unique among
non-deleted customers. Map backend conflicts such as `duplicate_phone`,
`duplicate_email`, or `duplicate_contact` to safe field/form errors.

On a duplicate response:

- remain on the screen and preserve entered fields;
- do not set a customer or navigate;
- allow correction or searching for the existing customer; and
- never expose a raw exception, SQL detail, or internal error.

## Permissions and Eligibility

| Capability | Required permission |
|---|---|
| Search and select an existing customer | `customers.view` |
| Create a customer | `customers.create` |

A normal Cashier using New Sale is approved to receive `customers.create`.
Current backend history removed that permission definition/assignment, so this
is an **APPROVED REQUIREMENT — IMPLEMENTATION/PERMISSION SEED FIX PENDING**.
Until restored, hide or safely disable Add Customer and show an understandable
permission message. Selection must not use the Customer Management
attach-to-sale permission path.

An eligible customer is in the same tenant, not deleted, and `ACTIVE`. The
backend remains authoritative and must revalidate eligibility before checkout
or payment persistence.

## Search Contract

- Search by name, phone, and email; customer-code matching may be supported
  transparently by the backend.
- Tenant scope, active-only eligibility, deleted-record exclusion, and contact
  normalization are backend authoritative.
- Matching is case-insensitive where supported by the data store.
- Debounce typed search by approximately 300 ms.
- Cancel obsolete requests or ignore responses whose request sequence is stale.
- Empty search loads the initial eligible list.
- Keyboard Enter triggers an immediate search.

## Pagination Contract

- Initial request: `page = 1`, `pageSize = 20`.
- **Load More** appends the next page to the current result set.
- Prevent concurrent or duplicate page loads.
- Hide or disable Load More when the backend indicates the final page.
- Do not use numbered pagination and do not load the entire customer catalogue.

## Existing Customer Row Contract

The whole eligible row is the selection target. Show name and phone. Customer
code, order count, and last-purchase summary are optional when authoritative
data exists. Label `totalOrderCount` as orders or purchases, never visits.
Initials are allowed; fabricated photos/avatars, tiers, loyalty values, and fake
history are not.

The current checkout customer must be visibly recognizable. Selecting another
customer replaces the previous selection; exactly zero or one customer may be
selected.

## Selection, Walk-In, and Back Navigation

Selecting an eligible row must:

1. set the active checkout `selectedCustomer`;
2. revalidate/recalculate the checkout;
3. keep the screen open with a safe error if revalidation fails; and
4. automatically return to Payment Method only after success.

**Use Walk-in Customer** clears `customerId`, revalidates/recalculates, and
returns to Payment Method. It never deletes or edits the customer record.

Back returns to the same Payment Method instance with cart products,
quantities, current customer, discount, totals, till, and checkout context
unchanged. It must not navigate to `/pos/new-sale` or `/pos/customers`.

## Discount Revalidation Contract

Every customer transition—walk-in to customer, customer A to B, and customer to
walk-in—must invoke the existing backend-authoritative checkout/discount
revalidation and recalculation path. Preserve a discount that remains valid.
If it is no longer valid, the discount engine must remove or reject it,
recalculate totals, and return a clear cashier message. Do not hardcode customer
discount rules in this screen.

## Required States and Error Behaviour

- Initial-list loading skeleton/progress.
- Empty/no-results state with Add Customer available when permitted.
- Separate pagination loading without clearing current rows.
- Create loading with form and submit disabled against duplicate submission.
- Inline field validation for name, phone, and optional email.
- Duplicate-contact error that preserves the form.
- Network error that preserves search/form state and provides Retry.
- Permission state that hides/disables unauthorized actions with a safe message.
- Selection/revalidation failure that remains on this screen and preserves the
  prior checkout customer.
- Safe, user-readable errors only; no tokens, stack traces, SQL, or internal
  response details.

## Non-Functional Contract

- Tablet is the primary form factor; wide and narrow layouts must have no
  overflow, clipping, or unreachable action.
- Whole rows and actions must be touch-friendly; use at least approximately
  44 logical pixels where no stricter design-system rule applies.
- The software keyboard must not cover required fields or primary actions.
- Focus order must be logical, with no focus trap; initial search focus is
  optional.
- Critical labels and actions must remain usable at increased text scale.
- Provide meaningful semantics labels for search, rows, form fields, selected
  state, Walk-in, Back, Load More, and Add Customer.
- Debounce, stale-response protection, pagination, and bounded loading are
  mandatory performance behaviours.

## Privacy and Data Handling

The screen is authenticated and permission gated. Display only the name, phone,
and optional minimal authoritative summary required for selection. Do not fetch
or expose unnecessary full-profile data. Never log raw phone, email, form
content, authentication tokens, or secrets. Do not introduce a persistent local
customer cache for this feature.

## Backend and Data Contract

The existing core API surface is sufficient:

- `GET /api/v1/customers` for tenant-scoped eligible search and paging;
- `POST /api/v1/customers` for create;
- checkout summary/revalidation with nullable `customerId`; and
- start-payment/completed-sale persistence with nullable `customerId`.

No customer schema, sale schema, or new attach API is required. A selected
customer persists `sales_orders.customer_id` and the existing customer-name
snapshot. Walk-in persists null. Email/phone sale snapshots are not a blocker
and are outside this feature unless a later approved sale-snapshot contract adds
them.

## Acceptance Gate

Implementation is complete only after focused tests and authenticated runtime
evidence prove search, paging, stale-request protection, select/replace/walk-in,
create and duplicate handling, permissions, discount revalidation, back-state
preservation, responsive/accessibility states, nullable checkout propagation,
and payment persistence. Until then the Flutter and E2E statuses remain pending.
