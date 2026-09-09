<!-- title: POS Checkout Find Or Add Customer Implementation Specification -->
<!-- status: Active -->
<!-- implementation: FLUTTER IMPLEMENTED & VERIFIED -->
<!-- last_updated: 2026-09-03 -->

# POS Checkout Find Or Add Customer — Implementation Specification

## Status And Authority

This is the normative Payment Method checkout-customer contract.

| Area | Status |
|---|---|
| Second Brain | **READY / CANONICALIZED** |
| Flutter | **IMPLEMENTED & VERIFIED** (Full Cart -> Customer -> Payment Journey) |
| Backend | **REUSE EXISTING**; exact normalized-phone behaviour verified |
| Database | **NONE currently required** |
| Authenticated E2E | **VERIFIED VIA AUTOMATED JOURNEY SUITE** |

Documentation readiness is not implementation evidence.

## Scope And Journey

**Canonical Approved Order:**
`New Sale -> Add products -> Proceed to Payment -> Find/Add/Skip Customer -> Payment Method -> Payment execution`

> [!IMPORTANT]
> **Supersession Note (2026-09-03):**
> The old route order (`Cart -> Payment Method -> Customer -> Payment Method`) is explicitly superseded as the primary checkout journey. The customer step is now the canonical intermediate step between Cart and Payment Method. Tapping the Customer card on the Payment Method screen is retained strictly as an optional re-entry path to edit or change the customer.

1. Cashier adds products to Current Sale/cart.
2. Cashier presses **PROCEED TO PAYMENT** on the cart screen.
3. Dedicated full-screen **FIND OR ADD CUSTOMER** screen opens (`/pos/new-sale/customer`).
4. **Customer is OPTIONAL.** From the Customer screen, cashier can:
   - **A. SKIP**: Press **SKIP** on initial phone entry state -> continue as Walk-in customer (`CustomerId = null`) -> revalidate checkout summary -> open Payment Method screen (`/pos/new-sale/payment`).
   - **B. Search existing customer**: Enter mobile -> Found -> Cashier explicitly clicks **ADD TO SALE & CONTINUE** -> customer attached to cart/checkout -> checkout summary revalidated with `CustomerId` -> open Payment Method screen (`/pos/new-sale/payment`).
   - **C. Create new customer**: Enter mobile -> Not Found -> **ADD AS NEW CUSTOMER** -> enter name -> **ADD CUSTOMER & CONTINUE** -> create real customer on backend -> returned customer attached to cart/checkout -> checkout summary revalidated with `CustomerId` -> open Payment Method screen (`/pos/new-sale/payment`).
5. **Back Navigation**: Clicking Back on the Customer screen returns to Current Sale/cart (`/pos/new-sale`), preserving all cart lines, quantities, and discounts. Clicking Back on the Payment Method screen returns to the Customer step with cart and context preserved.
6. **Payment Execution**: Final payment request carries nullable `CustomerId` (`null` for walk-in/skip, real customer GUID when attached).

Walk-in is valid: no selected customer means `CustomerId = null`. Never create a synthetic Walk-in customer row.

## Seven Screen States

| State | Required presentation and behaviour |
|---|---|
| 1. Mobile Entry | Heading **FIND OR ADD CUSTOMER**; Mobile Number; dial-code selector; mobile input; numeric keypad; Backspace; Clear; **SKIP** action to proceed to Payment as Walk-in; Back action to return to Cart. Auto-search only when the phone is valid. |
| 2. Searching | Show **Looking for customer...**; preserve mobile; disable conflicting input/actions; allow one active request. |
| 3. Customer Found | Show verified backend name/mobile and previous-order count only when authoritative. Finding does not attach. Require **ADD TO SALE & CONTINUE** to advance to Payment Method. |
| 4. Customer Not Found | Show **No customer found**, preserve mobile, and offer **ADD AS NEW CUSTOMER** when permitted. |
| 5. Add New Customer | Same full-screen workflow. Mobile is carried read-only with Change Number. Customer Name is required; provide an alphabet keyboard. No email, customer type, notes, loyalty tier, avatar, visits, recent customers, list, filter, or pagination. Cancel/Back returns to phone entry. |
| 6. Create Ready | Enable **ADD CUSTOMER & CONTINUE** only when name and retained phone are valid. |
| 7. Creating | Show **Creating customer...**; preserve phone/name; disable inputs/actions; prevent double submit. Success uses the returned customer, updates cart state, revalidates, and advances to Payment Method. |

Recoverable errors preserve entered values and expose safe Retry. Ignore stale
responses so they cannot replace a newer phone result.

## Functional Requirements

- **FR-01:** Cart "Proceed to Payment" navigates directly to Find/Add Customer (`/pos/new-sale/customer`).
- **FR-02:** It is full-screen, never a popup/dialog.
- **FR-03:** Search is mobile-number-only.
- **FR-04:** Generic name/email/customer-code search is excluded.
- **FR-05:** Customer list/filter/pagination/recent UI is excluded.
- **FR-06:** Numeric keypad updates mobile.
- **FR-07:** Backspace deletes the last editable digit.
- **FR-08:** Clear resets mobile.
- **FR-09:** Valid mobile completion starts search automatically.
- **FR-10:** Empty, invalid, or incomplete mobile never calls search.
- **FR-11:** Searching prevents duplicate requests.
- **FR-12:** Stale responses cannot overwrite newer searches.
- **FR-13:** Found customer requires explicit confirmation.
- **FR-14:** Confirmation updates cart `selectedCustomer`.
- **FR-15:** Quick-create requires phone and name only.
- **FR-16:** Create reuses the searched phone.
- **FR-17:** Change Number returns to search without cart mutation.
- **FR-18:** Create executes once; double submit is blocked.
- **FR-19:** Returned created customer becomes checkout customer.
- **FR-20:** Customer change triggers checkout revalidation/recalculation.
- **FR-21:** Success advances to Payment Method screen (`/pos/new-sale/payment`).
- **FR-22:** Back returns to Current Sale (`/pos/new-sale`), preserving cart lines, quantities, and discounts.
- **FR-23:** Search/create errors preserve entered values.
- **FR-24:** Walk-in checkout remains valid; customer is optional.
- **FR-25:** Customer cannot change after the checkout/payment mutation lock.
- **FR-26:** SKIP action on initial phone entry advances to Payment Method with `CustomerId = null`.

## Business Rules

- **BR-01:** Search resolves by normalized mobile identity.
- **BR-02:** Dial code plus local input uses existing phone normalization. `+94`
  may be a configured/presentation default, never permanent domain logic without
  a configuration authority.
- **BR-03:** Customer Found is not Customer Attached.
- **BR-04:** Only **ADD TO SALE & CONTINUE** commits an existing customer.
- **BR-05:** Quick-create phone stays read-only until Change Number.
- **BR-06:** Duplicate-phone races produce safe recovery and no duplicate row.
- **BR-07:** Customer changes revalidate customer-dependent pricing/discounts.
- **BR-08:** Walk-in is null `CustomerId`, not a database customer.

Customer must be same-tenant and `ACTIVE`; `BLOCKED`, `INACTIVE`, and `DELETED`
are ineligible. Trusted device, assigned till, and open-session checks remain
authoritative. Name is required, maximum 150 characters. Phone is required,
maximum 50 characters; normalized value has at least seven digits and satisfies
backend validation. Email is backend-optional but omitted/null here. Normalized
phone uniqueness is tenant-scoped. Backend generates customer code; POS create
uses source `POS` and defaults to `ACTIVE`. Backend revalidates checkout.

## Permissions

| Action | Permission |
|---|---|
| Search/view | `customers.view` |
| Select existing for checkout | `customers.view` |
| Create | `customers.create` |
| Proceed with checkout | `pos.sales.checkout.execute` plus the chosen canonical payment-method permission |

Do not require `customers.update` or `sales.cart.manage` solely for checkout
selection. Do not use the Customer Management Attach-to-Sale permission path.
Frontend gating never replaces backend authorization.

## API Contract

| Use | Contract |
|---|---|
| Search | Reuse `GET /api/v1/customers` if it deterministically resolves exact normalized phone and returns an eligible same-tenant `ACTIVE` customer. |
| Create | `POST /api/v1/customers` with `FullName`, `Phone`, and `Email` omitted/null. |
| Revalidate | `POST /api/v1/pos/checkout/summary` with selected/created `CustomerId`. |
| Final payment | `POST /api/v1/pos/checkout/start-payment`; `CustomerId` is nullable. |

Exact normalized-phone behaviour of the generic GET is an **IMPLEMENTATION
CONTRACT CLARIFICATION / VERIFICATION GAP**. Do not invent a new endpoint. If
needed, extend the existing Customer query/service/repository contract.

`POST /api/v1/customers/{customerId}/attach-to-sale` belongs to Customer
Management and is never invoked here.

## Database Contract

Existing `customers` fields cover `id`, `tenant_id`, `customer_code`,
`display_name`, `phone`, `normalized_phone`, optional email/normalized email,
`source`, `status`, and audit timestamps. Existing nullable
`sales_orders.customer_id` references the selected customer. Sale snapshot
fields retain their Unified Order/Sales contract; this feature does not newly
claim phone/email snapshot population.

No new table, checkout-customer table, country-code column, other column, or
migration is required solely for this screen.

## Ownership And Target Structure

Customer entities, repositories, datasource, mapping, use cases, and state stay
under `lib/features/customers/`; do not duplicate them under `sale/`.

```text
lib/features/customers/
|-- data/{datasources/remote,models_or_dtos,mappers,repositories}/
|-- domain/
|   |-- {entities,repositories}/
|   `-- usecases/{search_checkout_customer_by_phone.dart,create_checkout_customer.dart}
`-- presentation/
    |-- providers/checkout_customer_provider.dart
    |-- routing/
    |-- screens/pos_checkout_customer_screen.dart
    `-- widgets/checkout_customer/
        |-- customer_mobile_input.dart
        |-- customer_numeric_keypad.dart
        |-- customer_search_loading.dart
        |-- customer_found_card.dart
        |-- customer_not_found_card.dart
        |-- add_customer_form.dart
        |-- customer_name_keyboard.dart
        `-- customer_creation_loading.dart
```

Sale/payment owns route entry, cart preservation, selection through the approved
cart boundary, checkout recalculation, and return to Payment Method.

Backend remains `API -> Application -> Domain -> Infrastructure`. Lookup/create
stays in the Customer module; revalidation stays in POS Operations checkout.
Never create duplicate checkout-customer modules, repositories, or entities.

## Management Versus Checkout

| Customer Management | Checkout Customer Selection |
|---|---|
| Standalone Customers navigation | Launched from Current Sale before Payment Method; Payment Customer card may re-enter it |
| Rich list/filter/paging/detail/history/edit | Mobile-only full-screen find/confirm or quick-create |
| May expose Attach-to-Sale | Sets active cart customer; never calls Attach-to-Sale |
| Management add may collect email | Quick-create collects phone and name only |

## Non-Functional Requirements

- Support canonical POS phone/tablet/desktop sizes without overflow or text-scale
  breakage.
- Numeric/alphabet keyboards are touch-friendly. Keys, Backspace, Clear, Change
  Number, and actions have accessible semantic names.
- Loading disables repeat/conflicting actions; protect double submits and stale
  requests; provide safe retry.
- Back preserves cart; recoverable failure preserves phone/name.
- Do not unnecessarily log full PII. No mock customers/order counts or hardcoded
  API responses.
- Consume shared theme tokens. OneVerz orange `#FF6A00` and black `#000000` are
  theme authorities, not repeated component literals.

## Future Acceptance Contract

1. Empty phone: no search. 2. Incomplete phone: no search. 3. Valid phone: one
search. 4. Customer found. 5. No attach before confirmation. 6. Confirmation
attaches once. 7. Not-found state. 8. Add-as-new enters create. 9. Phone is
read-only. 10. Change Number returns to search. 11. Empty name disables create.
12. Valid name enables create. 13. Create called once. 14. Duplicate phone safe.
15. Search failure preserves phone. 16. Create failure preserves phone/name.
17. Back preserves cart. 18. Found customer updates Payment card. 19. Created
customer updates Payment card. 20. Summary receives `CustomerId`. 21. Walk-in
keeps null. 22. Inactive/blocked/deleted rejected. 23. Customer change
revalidates. 24. No Attach-to-Sale call. 25. Stale response ignored. 26. Repeated
taps create no duplicate. 27. Permission-denied states. 28. Responsive layout.
29. Accessibility/semantics. 30. No PII leakage in logs.

## Related Files

- [[../03_USER_JOURNEYS/Cashier/06_Customer_Loyalty_Flow]]
- [[Flutter_POS_Customer_Management]]
- [[../02_ACCESS_CONTROL/API_Authorization_Rules]]
- [[../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../06_DATABASE_KNOWLEDGE/Tables/20_Unified_Order_And_Sales_UPDATED]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Sales/POS_Checkout_Find_Or_Add_Customer_Implementation_Status]]
