<!-- title: Tenant Admin Inventory Screen Data Field Matrix -->
<!-- status: Canonical -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Tenant Admin Inventory — Screen Data Field Matrix

Only fields visible or required by the approved 29 screens. Not every database column is shown in UI.

Types: string, uuid, decimal, date, datetime, int, enum.

R = required on submit. RO = read-only. E = editable.

## Shared chrome (production)

Production does **not** bind POS till session or Settings-white-sidebar fields. Location context uses Inventory location selector mapped to `inventory_locations`.

## INV-UJ-01

| Screen | Field | Type | R/E | Source |
|---|---|---|---|---|
| S01 | lowStockCount | int | RO | dashboard API |
| S01 | outOfStockCount | int | RO | dashboard API |
| S01 | nearExpiryCount | int | RO | dashboard API |
| S01 | onHandUnitSum | decimal | RO | dashboard API (label Active Stock Counts) |
| S01 | priorityAlerts | list | RO | dashboard API |
| S01 | recentActivity | list | RO | dashboard API |
| S02 | search/filter | string | E | query |
| S02 | sku, name, image, available, status | mixed | RO | stock list |
| S03 | product name, sku, variant, category, status | mixed | RO | product + stock detail |
| S03 | onHand, reserved, available, reorderLevel | decimal | RO | balances + low_stock_threshold |
| S03 | locationBalances[] | list | RO | balances |
| S03 | recentMovements[] | list | RO | stock_movements |

## INV-UJ-02

| Screen | Field | Type | R/E | Persist |
|---|---|---|---|---|
| S01 | productId / variantId | uuid | R | opening entry |
| S01 | inventoryLocationId | uuid | R | opening entry |
| S02 | quantity | decimal | R | opening entry |
| S02 | unitCost | decimal | R | opening entry |
| S02 | openingDate | date | R | opening entry |
| S02 | notes | string | E | opening entry |
| S02 | batchNumber / expiryDate | string/date | R if tracking | product_batches |
| S03 | all of the above | RO | review |
| S04 | referenceNumber, postedAt | string/datetime | RO | opening entry |

## INV-UJ-03

| Screen | Field | Type | R/E | Persist |
|---|---|---|---|---|
| S01 | receipt list + metrics | mixed | RO | receipts |
| S02 | location, receiptMode, product | uuid/enum | R | receipt |
| S03 | quantity, unitCost, supplierName, invoiceNumber, receivedDate | mixed | R | receipt |
| S03 | notes, PO | string | E | receipt |
| S03 | batch/expiry | mixed | per tracking | batch |
| S03 | serialNumbers[] | string[] | R if serial | serial_numbers |
| S04–S05 | review/confirm copy | RO | no extra persist |
| S06 | receiptNumber, previous/new stock | mixed | RO | posted receipt |
| S07 | serial search/filters/table | mixed | E/RO | serial_numbers |

## INV-UJ-04

| Screen | Field | Type | R/E | Persist |
|---|---|---|---|---|
| S01 | search, list, status counts | mixed | E/RO | adjustments |
| S02 | productId | uuid | R | draft |
| S03 | direction, reasonId, quantity, date, notes | mixed | R except notes | draft |
| S03 | onHand/reserved/available | decimal | RO | balances |
| S04 | review | RO | |
| S05 | adjustmentNumber, postedAt | RO | posted |

## INV-UJ-05

| Screen | Field | Type | R/E | Persist |
|---|---|---|---|---|
| S01 | filters, allocation list | mixed | E/RO | allocations |
| S02 | inventoryLocationId | uuid | R | confirm payload |
| S03 | productId | uuid | R | |
| S04 | onHand, reserved, available, alreadyAllocated, safetyBuffer | decimal | RO | setup API |
| S05 | salesChannelId[] | uuid | R | |
| S06 | allocationLimitQuantity per channel, safetyBufferQuantity | decimal | R | allocations |
| S07–S08 | review/confirm | RO then post | |
| S09–S10 | reference, channel breakdown by **sales channel name** | RO | allocations |

View Rules / Export on S01: Export IN SCOPE as CSV of current list. View Rules DEFERRED (no rules screen in pack).
