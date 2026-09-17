# Online Order New → Picking gate closure — 2026-09-12

**Status:** ONLINE ORDER NEW → PICKING GATE MET (Development authenticated API + DB verified)

## Historical failure (retained)

2026-09-10 diagnosis recorded that `ECOMM-SEED-PENDING-001` had no fulfilment row, so Flutter blocked Start before POST. That evidence remains valid as of that date. See [Current_Changes_And_Start_Fulfilment_Diagnosis_2026-09-10](Current_Changes_And_Start_Fulfilment_Diagnosis_2026-09-10.md).

## Root causes fixed

1. **Startable New seed** — PENDING-001 lacked FO / pickup / inventory graph and collection windows aged into DELAYED.
2. **Post-Start projection** — `StartAsync` set FO `PICKING` only; `sales_orders.fulfillment_status` stayed pre-start, so list `DisplayStatus` could remain `NEW`.
3. **List/detail vocabulary** — list used `NEW`/`PREPARING`; detail used customer `MapUiStatus` (`PENDING_CONFIRMATION`/`ACCEPTED`). DELAYED outranked PREPARING when overdue.

## Authoritative POS cashier status contract

| Stage | FO lifecycle | Sales projection | List `status` | Detail `status` |
|---|---|---|---|---|
| Before Start | `PENDING` / `ALLOCATED` | `PENDING` or `ACCEPTED` (pre-start) | `NEW` | `NEW` |
| After Start | `PICKING` | `order_status=ACCEPTED`, `fulfillment_status=PREPARING` | `PREPARING` | `PREPARING` |

Raw detail `fulfillmentStatus` remains `PICKING` for Continue Picking CTA. Active PREPARING outranks overdue DELAYED.

## Changes

- `SalesOrder.ApplyPosStartPreparing`
- `PosOnlineOrderStartFulfillmentRepository.StartAsync` applies sales PREPARING in the same transaction
- `PosOnlineOrderDetailRepository` list filters + `DisplayStatus` precedence; detail uses shared DisplayStatus labels
- Seed: `DevelopmentClickCollectStartableNewOrderSeedData` + migration `20260912120000_RepairDevelopmentClickCollectStartableNewOrder`

## Runtime evidence (Development)

- Order: `ECOMM-SEED-PENDING-001` / `e0000101-0001-4000-8000-000000000001`
- Before: list/detail `NEW`, FO `PENDING`, version `1`
- Start: FO `PICKING`, version `2`
- After: list/detail `PREPARING`, sales `PREPARING`, not in NEW bucket
- Cashier permissions: orders.access, orders.view, fulfilment.start, picking.view present

## Tests

- Unit: Start/concurrency/seed/ApplyPosStartPreparing
- Integration: Start sales PREPARING, Preparing outranks Delayed, list leaves NEW
- Flutter: OO-01/OO-03 Start refresh + missing version guard
