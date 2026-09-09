# OO-03 — Start Fulfilment Confirmation Popup Prototype

This package is the componentized prototype for the **Start Fulfilment confirmation popup** shown from OO-02 Order Detail.

## Component breakdown

| Component | Responsibility |
|---|---|
| `AppShell` | Canonical OneVerz POS header + bottom navigation |
| `BackgroundOrderDetail` | Dimmed OO-02 reference screen behind the popup |
| `StartFulfilmentModal` | Confirmation popup content and actions |
| `PrototypeQaPanel` | Prototype-only permission, error and stress controls |
| `PermissionService` | Simulates canonical entitlement/permission gates |

## Modal data shown

- Order number
- Customer
- Collection outlet
- Collect-by time
- Remaining time
- Item count
- Unit count

The popup explicitly states that starting fulfilment assigns the order to the current staff member.

## Permission / entitlement

The underlying detail screen requires:
- `click_collect`
- `commerce.online_order.orders.access`
- `commerce.online_order.orders.view`

The confirm action additionally requires:
- `commerce.online_order.fulfilment.start`

If the start permission is missing, the popup remains visible but the confirm CTA is disabled and the required permission is shown.

## Canonical action

On confirmation:

`POST /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/fulfilment/start`

Success handoff:
`OO-03 Start Fulfilment → OO-04 Pick Order`

Cancel:
`OO-03 → remain on OO-02 Order Detail`

Command failure:
- do not navigate
- keep modal open
- allow retry/cancel
- production should use canonical error handling

## Responsive behavior

- Desktop: centered modal, max width ~540px.
- Tablet: centered modal, max width ~520px.
- Phone: bottom-sheet style confirmation, full usable width, scroll-safe within viewport.
- Header/footer remain present.
- Long order/customer/outlet/time values are stress-testable through Prototype QA.

## Production handoff

This prototype is a UI/interaction reference only. Production Flutter must reuse the existing POS shell, dialog/button/state components first and keep the backend authoritative for permission, outlet, reservation, assignment and concurrency validation.
