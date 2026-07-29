<!-- title: New Customer Order Flow -->
<!-- status: Active -->
<!-- system: E-Commerce Click & Collect -->
<!-- last_updated: 2026-07-29 -->

# New Customer Order Flow

## Purpose

A seamless ordering journey for new customers covering browsing, registering, verifying, and checking out via Click & Collect.

## Actor

Customer

## Source

Derived from UI/UX User Journeys EC-UJ-01 and EC-UJ-02.

## Trigger

New customer opens the storefront and decides to place an order.

## Preconditions

- The E-Commerce site is online.
- Outlet has available stock.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open Browser / E-commerce Home | System loads the mobile-first storefront. |
| 2 | Select Collection Outlet | System prompts outlet selection (auto-selects if only one exists) and saves to session. |
| 3 | Browse / Search | System displays product categories and enables keyword search. Results are filtered by outlet availability. |
| 4 | Add Product to Cart | Customer selects size/variant/quantity. System validates stock in real-time before adding. |
| 5 | Register Account | Customer enters Name, Email, Mobile, and Password. System validates required fields. |
| 6 | Email Verification | System sends a 6-digit code to the registered email. Customer verifies the code to activate the account. |
| 7 | Checkout | Customer enters checkout details. System validates form fields (e.g., country code for mobile). |
| 8 | Collection Date & Time | System shows valid collection slots based on outlet timings and availability. Customer selects a slot. |
| 9 | Order Review | System displays items, outlet, date/time, and customer details. Re-checks stock and slot availability. |
| 10 | Order Received & Pending Confirmation | System creates order, shows order number, and sets initial status to "Pending Confirmation". |

## Data Used Or Captured

- Outlet ID
- Product Variants and Quantities (Cart)
- Customer Name, Email, Mobile, Password
- 6-digit Verification Code
- Collection Date and Time Slot
- Order Number

## Access And Security Rules

- **Mobile-first storefront:** UI is optimized for mobile interactions.
- **Product visibility:** May be outlet-specific; cart respects outlet stock context.
- **Registration mandatory:** Guest checkout is not allowed in Release 1. Unverified accounts cannot proceed.
- **Email Verification:** Required before order placement. Duplicate email accounts are blocked.
- **Time Slots:** Time slot selection is mandatory and governed by outlet availability.
- **Payment:** Pay at Pickup only. No online payment gateway captured in this release.

## Validation And Error Cases

- Stock runs out while adding to cart or during final order review.
- Invalid or expired email verification code.
- Collection slot becomes unavailable before order confirmation.
- Validation errors on checkout form (e.g., missing phone number).

## Outcome

Customer successfully registers an account and places an order for Click & Collect. The order is stored as "Pending Confirmation" pending store acceptance.

## Related Files

- `00_ECommerce_User_Flow_Analysis.md`
