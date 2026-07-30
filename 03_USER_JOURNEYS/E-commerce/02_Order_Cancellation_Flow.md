<!-- title: Order Cancellation Flow -->
<!-- status: Active -->
<!-- system: E-Commerce Click & Collect -->
<!-- last_updated: 2026-07-29 -->

# Order Cancellation Flow

## Purpose

Allows customers to review eligible orders, request cancellation, provide a reason, confirm the request, and receive cancellation confirmation.

## Actor

Customer

## Source

Derived from UI/UX User Journey EC-UJ-03.

## Trigger

Customer realizes they made a mistake or changed their mind regarding a placed order.

## Preconditions

- Customer is authenticated.
- Customer has at least one active order in "Pending Confirmation" or "Accepted" state.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | My Orders | System fetches recent orders and their current statuses. Displays order list. |
| 2 | Select Order | System loads latest order information from the backend and passes context to details view. |
| 3 | Order Details | System displays full order details. "Cancel Order" CTA is shown ONLY if the order is eligible. |
| 4 | Cancel Order | System displays cancellation policy and warnings. Let's customer begin cancellation flow. |
| 5 | Select Cancellation Reason | System captures reason (e.g., Changed my mind) and optional additional comments. Draft is linked to current order. |
| 6 | Confirm Cancellation | System shows final review. Revalidates current status before processing. Prevents duplicate submission. |
| 7 | Order Cancelled | On success, system updates order record to "Cancelled". Writes reason and timestamp to order history/audit log. |

## Data Used Or Captured

- Order Number
- Cancellation Reason (e.g., Changed my mind, Ordered by mistake, Want to change collection time, Found a better product elsewhere, Other)
- Additional Comments (Optional)
- Cancellation Timestamp

## Access And Security Rules

- **Ownership:** Only the customer's own orders are shown. The selected order must belong to the signed-in customer.
- **Eligibility:** Order cancellation is available ONLY for "Pending Confirmation" and "Accepted" orders.
- **Blockers:** Cancellation is NOT allowed after preparation starts ("Preparing", "Ready for Collection", or "Completed").
- **Payment:** Click & Collect Release 1 uses Pay at Pickup, so no online refund flow is required.
- **Finality:** Completed and Cancelled orders cannot be cancelled.

## Validation And Error Cases

- The order status changes to "Preparing" on the store side right before the customer hits "Confirm Cancellation" (System must block and show warning).
- Duplicate cancellation submission clicks.

## Outcome

Order is marked as Cancelled. The reserved stock and collection slot are released if applicable. Customer is notified of the status change.

## Related Files

- `00_ECommerce_User_Flow_Analysis.md`
