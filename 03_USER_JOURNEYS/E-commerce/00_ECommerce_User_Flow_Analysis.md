<!-- title: E-Commerce User Flow Analysis -->
<!-- status: Active -->
<!-- system: E-Commerce Click & Collect -->
<!-- last_updated: 2026-07-29 -->

# E-Commerce User Flow Analysis

## Purpose

Summarizes the E-Commerce Click & Collect journey flows and outlines the generated user journey documentation files.

## Actor

Customer

## Source

Derived from E-Commerce UX/UI design diagrams (EC-UJ-01 through EC-UJ-05) and aligned to the Click & Collect MVP scope.

## Trigger

E-Commerce customer interaction with the web application storefront.

## Preconditions

- The E-Commerce web application is accessible and online.
- Store outlets, products, and collection slots are configured by the Tenant Admin.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Analyze UX diagrams | Evaluated the 5 provided user journey images for E-Commerce flows. |
| 2 | Map customer flows | Converted visual flows into standardized text-based Markdown user journeys. |
| 3 | Align with MVP scope | Covered Registration, New Order, Order Cancellation, and Order Tracking/Collection. |

## Data Used Or Captured

- Customer credentials (email, password, mobile)
- Order details (products, quantities, totals)
- Outlet selection and collection date/time slots
- Payment status (Pay at Pickup)
- QR Code validation data

## Access And Security Rules

- Customers must be authenticated to place orders and track order history (No guest checkout in Release 1).
- Customers can only view and cancel their own orders.
- Email verification is mandatory before account activation and order placement.
- QR Codes for collection are strictly tied to specific authenticated user sessions and orders.

## Validation And Error Cases

- Stock unavailability handled before cart checkout.
- Invalid collection slots prevented.
- Duplicate email registration blocked.
- Cancellation denied if order preparation has already started.

## Outcome

Individual E-Commerce journey files are ready and documented under `03_USER_JOURNEYS/E-commerce`.

## Related Files

- `01_New_Customer_Order_Flow.md`
- `02_Order_Cancellation_Flow.md`
- `03_Order_Tracking_Collection_Flow.md`
- `04_New_Customer_Registration_Flow.md`
