<!-- title: Tenant Admin Inventory API Contract — 29-Screen Scope -->
<!-- status: Canonical -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Tenant Admin Inventory API Contract

**API CONTRACT: LOCKED** for the current 29-screen Inventory implementation. Do not generate controller or DTO classes from this lock task.

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

Canonical lock: [[../07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Lock_Manifest]]

Base: `/api/v1/inventory`  
Auth: Tenant Admin bearer. Tenant resolved server-side.  
Entitlement: `inventory_tracking`  
Envelope: [[API_Standards]] success/error.  
Pagination: `page` default 1, `pageSize` default 20, max 100.  
Idempotency: `Idempotency-Key` required on every POST listed as mutating.

Feature entitlement missing → 403 `FEATURE_DISABLED`.

---

## Permission by endpoint

| Method | Route | Permission |
|---|---|---|
| GET | `/api/v1/inventory/dashboard` | `inventory.stock.view` |
| GET | `/api/v1/inventory/stock` | `inventory.stock.view` |
| GET | `/api/v1/inventory/stock/{productId}` | `inventory.stock.view` |
| GET | `/api/v1/inventory/opening-stock/drafts` | `inventory.opening_stock.manage` |
| POST | `/api/v1/inventory/opening-stock/drafts` | `inventory.opening_stock.manage` |
| POST | `/api/v1/inventory/opening-stock/{id}/post` | `inventory.opening_stock.manage` |
| GET | `/api/v1/inventory/receipts` | `inventory.receiving.manage` or `inventory.stock.view` |
| POST | `/api/v1/inventory/receipts` | `inventory.receiving.manage` |
| PUT | `/api/v1/inventory/receipts/{id}` | `inventory.receiving.manage` |
| POST | `/api/v1/inventory/receipts/{id}/confirm` | `inventory.receiving.manage` |
| GET | `/api/v1/inventory/serials` | `inventory.serials.view` |
| POST | `/api/v1/inventory/serials` | `inventory.serials.view` (gap-fill register) |
| GET | `/api/v1/inventory/adjustments` | `inventory.stock.adjust` or `inventory.stock.view` |
| GET | `/api/v1/inventory/adjustment-reasons` | `inventory.stock.adjust` |
| POST | `/api/v1/inventory/adjustments` | `inventory.stock.adjust` |
| POST | `/api/v1/inventory/adjustments/{id}/post` | `inventory.stock.adjust` |
| GET | `/api/v1/inventory/channel-allocations` | `inventory.channel_allocation.view` |
| GET | `/api/v1/inventory/channel-allocations/setup` | `inventory.channel_allocation.manage` |
| POST | `/api/v1/inventory/channel-allocations/confirm` | `inventory.channel_allocation.manage` |
| GET | `/api/v1/inventory/channel-allocations/{id}` | `inventory.channel_allocation.view` |

List receipts with only `inventory.stock.view` is read-only (no confirm).

---

## GET `/api/v1/inventory/dashboard`

Query: optional `inventoryLocationId`.

Response data:

- `lowStockCount`, `outOfStockCount`, `nearExpiryCount`, `onHandUnitSum`
- `priorityAlerts[]`: productId, variantId, sku, name, locationName, severity (`HIGH`/`MEDIUM`/`LOW`), reasonCode (`LOW_STOCK`/`OUT_OF_STOCK`/`NEAR_EXPIRY`)
- `recentActivity[]`: movementNumber, type, locationName, occurredAt
- `quickActions`: CurrentStock, OpeningStock, StockAdjustment enabled; StockCount `{ enabled: false, reason: "DEFERRED" }`

---

## GET `/api/v1/inventory/stock`

Query: `search`, `inventoryLocationId`, `status` (`IN_STOCK`/`LOW_STOCK`/`OUT_OF_STOCK`), `page`, `pageSize`, `sort` default `name`.

Search fields: product name, SKU, barcode.

Row: productId, variantId, name, sku, imageUrl, onHand, available, status, tracking flags.

Empty: `items: []`, totalCount 0.

---

## GET `/api/v1/inventory/stock/{productId}`

Query: `variantId` required for VARIANT.

Response: identity, tracking, totals, `locationBalances[]`, `recentMovements[]` (max 20; not TA-UJ-050).

---

## Opening stock

### POST `/api/v1/inventory/opening-stock/drafts`

Request:

```json
{
  "inventoryLocationId": "uuid",
  "productId": "uuid",
  "productVariantId": "uuid|null",
  "quantity": 25,
  "unitCost": 22.50,
  "openingDate": "2025-05-19",
  "notes": "string|null",
  "batchNumber": "string|null",
  "expiryDate": "date|null"
}
```

Validation: quantity > 0; unitCost >= 0; location/product in tenant; tracked SIMPLE/VARIANT; batch/expiry per tracking flags.

Response: `{ "id", "status": "DRAFT", "preview": { "currentOnHand", "quantity", "onHandAfter" } }`

### POST `/api/v1/inventory/opening-stock/{id}/post`

Empty body. Idempotency-Key required.

Success 200: `{ "id", "status": "POSTED", "referenceNumber", "onHandAfter", "postedAt" }`

Errors: `OPENING_STOCK_ALREADY_POSTED`, `OPENING_STOCK_NOT_ELIGIBLE`, `CONCURRENT_UPDATE`, `IDEMPOTENCY_CONFLICT`.

---

## Receiving

### POST `/api/v1/inventory/receipts`

Creates DRAFT.

```json
{
  "inventoryLocationId": "uuid",
  "receiptMode": "PURCHASE_RECEIPT",
  "supplierName": "string",
  "invoiceNumber": "string",
  "purchaseOrderNumber": "string|null",
  "receivedDate": "date",
  "notes": "string|null",
  "lines": [
    {
      "productId": "uuid",
      "productVariantId": "uuid|null",
      "quantity": 25,
      "unitCost": 849.00,
      "batchNumber": "string|null",
      "expiryDate": "date|null",
      "serialNumbers": ["string"]
    }
  ]
}
```

`serialNumbers` required length = quantity when serial tracked.

### PUT `/api/v1/inventory/receipts/{id}`

Update DRAFT only.

### POST `/api/v1/inventory/receipts/{id}/confirm`

Idempotency-Key required. Transitions DRAFT → POSTED. Increases on-hand. Writes movements `RECEIPT`.

GET list/detail for dashboard and success screen.

---

## Serials

GET `/api/v1/inventory/serials?search&inventoryLocationId&status&productId&page&pageSize`

POST gap-fill:

```json
{ "productId": "uuid", "productVariantId": "uuid|null", "inventoryLocationId": "uuid", "serialNumbers": ["..."] }
```

Does not change on-hand.

---

## Adjustments

GET `/api/v1/inventory/adjustment-reasons` — ACTIVE reasons.

POST `/api/v1/inventory/adjustments` — DRAFT:

```json
{
  "inventoryLocationId": "uuid",
  "productId": "uuid",
  "productVariantId": "uuid|null",
  "reasonId": "uuid",
  "direction": "INCREASE|DECREASE",
  "quantity": 5,
  "adjustmentDate": "date",
  "notes": "string|null",
  "expectedRowVersion": 3
}
```

`quantity` is the absolute delta (> 0). Direction signs the movement.

POST `/api/v1/inventory/adjustments/{id}/post` — Idempotency-Key. Mutates balance.

---

## Channel allocation

GET `/api/v1/inventory/channel-allocations` — dashboard list + summary counts.

GET `/api/v1/inventory/channel-allocations/setup?inventoryLocationId&productId&variantId` — available, reserved, already allocated, channels with current limits, safety buffer.

POST `/api/v1/inventory/channel-allocations/confirm` — Idempotency-Key:

```json
{
  "inventoryLocationId": "uuid",
  "productId": "uuid",
  "productVariantId": "uuid|null",
  "safetyBufferQuantity": 5,
  "expectedAvailableQuantity": 90,
  "channels": [
    { "salesChannelId": "uuid", "allocationLimitQuantity": 40 }
  ]
}
```

Does not change on-hand. 422 `ALLOCATION_EXCEEDS_AVAILABLE`. 409 if `expectedAvailableQuantity` stale.

GET `/api/v1/inventory/channel-allocations/{id}` — details. Response `channels[]` uses sales channel names, never outlet names.

---

## Tenant resolution

All ids must belong to the token tenant. No client-supplied `tenantId`.

## Flutter destination (not implemented here)

Feature folder: Tenant Admin Inventory under existing TA feature tree.  
Routes may keep `/tenant-admin/stock/*` aliases; canonical paths `/tenant-admin/inventory/*`. Backend does not depend on Flutter routes.
