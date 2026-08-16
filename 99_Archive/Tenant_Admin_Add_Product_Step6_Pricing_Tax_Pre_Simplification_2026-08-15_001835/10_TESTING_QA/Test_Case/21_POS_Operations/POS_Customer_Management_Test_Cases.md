<!-- title: POS Customer Management Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-08 -->

# POS Customer Management Test Cases

## Scope

QA contract for `/pos/customers`. Use authenticated tenant fixtures and real
API-backed records; production runtime must not substitute mock customers.

## Navigation And Layout

| ID | Test | Expected |
|---|---|---|
| PCM-01 | User lacks `customers.view` | Customers navigation/action unavailable; API denies direct access |
| PCM-02 | Open with no selection | Table uses full customer-content width |
| PCM-03 | Inspect initial screen | No detail panel or empty right placeholder |
| PCM-04 | Tap entire customer row | Row becomes selected |
| PCM-05 | Select row at supported tablet width | List shrinks without overflow |
| PCM-06 | Detail load succeeds | Conditional detail panel appears without overlay/navigation |
| PCM-07 | Clear/invalidate selection | Detail hides and list returns to full width |
| PCM-08 | Tablet widths/text scale | Touch targets usable; no horizontal/vertical overflow |

## Search, Filter, And Paging

| ID | Test | Expected |
|---|---|---|
| PCM-09 | Search display/full name | Matching tenant customers only |
| PCM-10 | Search phone/normalized phone | Matching customers returned |
| PCM-11 | Search email/normalized email | Case/normalization authority respected |
| PCM-12 | Search customer code | Matching customer returned |
| PCM-13 | Type rapidly within 300 ms | Older response cannot overwrite newest query |
| PCM-14 | Change search/filter | Page resets to 1 |
| PCM-15 | Status ALL/ACTIVE/INACTIVE/BLOCKED | Correct records; DELETED absent |
| PCM-16 | Source ALL/POS/ECOMMERCE | Current implemented sources filter correctly |
| PCM-17 | Navigate pages | Stable count, page, selection handling |

## Customer Mutations

| ID | Test | Expected |
|---|---|---|
| PCM-18 | Add valid customer | 201; backend code; POS/ACTIVE defaults |
| PCM-19 | Duplicate normalized phone in tenant | Conflict; no duplicate row |
| PCM-20 | Duplicate normalized email in tenant | Conflict; no duplicate row |
| PCM-21 | Edit allowed fields | Detail/list refresh; immutable fields unchanged |
| PCM-22 | Confirm deactivate | Existing update sets INACTIVE; no hard delete |
| PCM-23 | Cancel deactivate | No mutation |

## Attach, Security, And Aggregates

| ID | Test | Expected |
|---|---|---|
| PCM-24 | Attach ACTIVE with both permissions | Customer attached after backend validation |
| PCM-25 | Attach INACTIVE | `pos_customers.customer_inactive` |
| PCM-26 | Attach BLOCKED | `pos_customers.customer_blocked` |
| PCM-27 | Cross-tenant ID/search | No disclosure or mutation |
| PCM-28 | Missing create/update/cart permission | Backend denies corresponding action |
| PCM-29 | Invalid/untrusted device or no open till | Current context error shown; no fake data |
| PCM-30 | Completed and cancelled orders exist | Count includes completed, non-cancelled only |
| PCM-31 | Same fixture as PCM-30 | Spend includes completed, non-cancelled only |
| PCM-32 | Multiple currencies | No fake combined total; mixed flag drives `—` |
| PCM-33 | Zero/completed orders | Average is `—` for zero; otherwise total/count |
| PCM-34 | Select customer | Recent purchase preview uses existing history API |
| PCM-35 | Tap View All | Existing paginated history opens |
| PCM-36 | Inspect entire R1 screen | No loyalty/member/tier/points/earn/redeem UI |

## Evidence Rule

Record automated suite, authenticated runtime, viewport, API, database-read,
and commit/PR evidence in implementation tracking. Documentation completion is
not implementation completion.

## Related Files

- [[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_POS_Customer_Management]]
- [[../../../03_USER_JOURNEYS/Cashier/06_Customer_Loyalty_Flow]]

