<!-- title: Reservations, Stock Movements, Serial & Cost Allocation Module Overview -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Reservations, Stock Movements, Serial & Cost — Module Overview

## Contract lock

```text
Inventory Contract Version: v1.0
Status: LOCKED
Prototype: APPROVED
Implementation Audit: PASS
UI/UX Contract: LOCKED
Implementation Contract: LOCKED
Frontend Implementation: NOT STARTED
Backend Implementation: NOT STARTED
QA Execution: NOT STARTED
```

Canonical lock: [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Lock_Manifest]]

## Purpose

Canonical live module folder for reservations and the append-only stock ledger.

Schema source of truth remains:

`06_DATABASE_KNOWLEDGE/Tables/17_Reservations_Stock_Movements_Serial_And_Cost_Allocation.md`

## Module number

17

## Current 29-screen implementation scope

IN SCOPE:

- `stock_movements` as the append-only ledger for Opening Stock, Receiving, and Adjustment
- `stock_movement_references` linking movements to opening/receipt/adjustment documents
- `stock_movement_serials` when serial-tracked receiving occurs
- `idempotency_key` on movements

DEFERRED:

- Creating/editing reservations from Tenant Admin Inventory UI (reservations are POS/order-owned)
- Full movement-history workspace (TA-UJ-050). Product detail shows a recent-movements panel only.

## Authoritative stock

- **Mutable current quantities:** `inventory_balances`
- **Append-only history:** `stock_movements`
- Balances must equal the sum of posted movements for that balance row (enforced in the posting transaction, not by UI).

## Related Files

- [[../16_Inventory_Foundation_Stock_Availability/02_Inventory_Business_Rules]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/17_Reservations_Stock_Movements_Serial_And_Cost_Allocation]]
