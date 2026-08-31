<!-- title: Order Tracking and Collection Flow -->
<!-- status: Active -->
<!-- system: E-Commerce Click & Collect -->
<!-- last_updated: 2026-07-29 -->

# Order Tracking and Collection Flow

## Purpose

Enables customers to view order progress, open the collection QR code when the order is ready, complete pickup payment at the outlet, and finish the click & collect journey.

## Actor

Customer, Store Staff

## Source

Derived from UI/UX User Journey EC-UJ-04.

## Trigger

Customer wants to check the status of their placed order or has arrived at the store to collect it.

## Preconditions

- Customer has placed a Click & Collect order.
- Customer is at the store when status is "Ready for Collection".

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | My Orders | System fetches latest orders sorted by most recent. Highlights orders needing customer action. |
| 2 | View Order Details | System loads order details and latest status from the backend. |
| 3 | Pending Confirmation | System shows initial state waiting for tenant/store confirmation. |
| 4 | Accepted / Preparing / Ready | System transitions status based on store staff actions. Triggers customer notification when ready. |
| 5 | Open QR Code | System displays QR code ONLY when status is "Ready for Collection". Shows collection instructions. |
| 6 | Store Scans QR Code | Staff scans QR. System verifies against order status and customer record. Validates pickup. |
| 7 | Pay at Pickup | System shows total payable amount. Staff captures payment and links it to the order. |
| 8 | Order Collected & Completed | System updates final order status to "Completed" after successful handover. Persists completion event. |

## Data Used Or Captured

- Order Status (Pending Confirmation -> Accepted -> Preparing -> Ready for Collection -> Completed)
- Collection QR Code String/Payload
- Total Payable Amount (RM / £ / etc.)
- Payment Confirmation Status

## Access And Security Rules

- **Visibility:** Only signed-in customers can access order history. Orders are scoped to the logged-in customer account.
- **Workflow Rules:**
  - Store confirmation is required before preparation starts.
  - QR code becomes available ONLY when status is "Ready for Collection".
  - QR code must be strictly tied to the exact order and customer.
  - Only a valid, active QR can be used. One collection validation per order pickup.
- **Payment & Handover:** Release 1 operational collection supports Paid Online and Cash on Collection. Already-paid orders must not be charged again; cash is accepted through the unified payment authority. Handover happens only after authoritative payment completion.
- **Finality:** Collected orders can no longer use the QR code.

## Validation And Error Cases

- Customer attempts to show QR code before the order is ready (QR button must be hidden).
- Staff scans an invalid, expired, or already-used QR code (System must reject immediately).

## Outcome

The customer securely collects the paid order, or pays cash when required, and the backend idempotently marks pickup collected and the sales order completed.

## Related Files

- `00_ECommerce_User_Flow_Analysis.md`
