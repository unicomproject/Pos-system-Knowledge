# Online Order UI ↔ Database Mapping

Status: **OO-01 TARGET DB MAPPING CANONICALIZED; NO SCHEMA CHANGE** · Journey: `POS-UJ-036` · Updated: 2026-08-27

## Authorities

Persistence authority is [[../../06_DATABASE_KNOWLEDGE/Tables/23_Fulfilment_And_Pickup_UPDATED]], supplemented by [[../../06_DATABASE_KNOWLEDGE/Tables/20_Unified_Order_And_Sales_UPDATED]], [[../../06_DATABASE_KNOWLEDGE/Tables/24_Payment_And_Refund_UPDATED]], [[../../06_DATABASE_KNOWLEDGE/Tables/17_Reservations_Stock_Movements_Serial_And_Cost_Allocation]], and [[../../06_DATABASE_KNOWLEDGE/Tables/16_Inventory_Foundation_Product_Tracking_And_Stock_Availability]]. UI does not query tables directly; mapping is traceability through canonical APIs/services.

## Field mapping

| UI | Display/decision facts | Canonical persistence / derivation |
|---|---|---|
| OO-01 | order/pickup reference, customer/contact, collection window, item/unit counts, display/payment state, product previews, six summary counts | existing sales-order/line, customer, fulfilment/line, pickup, payment, product/variant/image, outlet/method/slot records via API; counts and card facts are server projections |
| OO-02 | source, customer or Guest classification, outlet, collection window, payment/value, items, variant, SKU, quantity | sales order + lines; fulfilment order + lines; pickup; product/variant projections; Guest is a derived presentation classification, not invented customer data |
| OO-03 | start eligibility, assigned staff, outlet/reservation validation | fulfilment state/version/assignment and reservation scope; audited actor/time |
| OO-04–05 | required, picked, packed quantities; assignee; line status; reservation line; location | fulfilment line quantities and audit fields; exact link `fulfillment_order_lines.inventory_reservation_line_id`; display location from `inventory_locations` |
| OO-06–07 | package number, staging location, packed time/by, package lines/packed quantity | `fulfillment_packages.package_number`, `.staging_inventory_location_id`, `.packed_at`, `.packed_by_tenant_user_id`; `fulfillment_package_lines.fulfillment_order_line_id`, `.packed_quantity` |
| OO-08 | ready status/time, collection window, amount/payment, package count | fulfilment/pickup/payment projections; counts derived server-side |
| OO-09–11/14 | pickup status/version/expiry/method, reason, verified by/time | pickup record status/version/expiry; `verification_method`, `verified_by_tenant_user_id`, `verified_at`; only `pickup_qr_token_hash` is persisted |
| OO-10/12 | collection validity, package retrieval, contents, checklist, collected state/time | pickup + fulfilment/package/line projections; collected actor/time and state transition audit |
| OO-15A–D | amount due/received/paid/change, method, paid time, transaction outcome | `sales_payments`, `sales_payment_transactions`, `sales_payment_events`; no online-order-specific payment storage |
| OO-13 | sale/order number, collection result, receipt/payment facts, collected/fulfilled/completed times | sales order, fulfilment, pickup and payment records returned after committed command |

## Location and QR constraints

- There are no canonical aisle/rack/shelf/zone tables. The UI may display the server-provided `inventory_locations` name/code only; it must not imply a richer schema.
- Raw QR/manual credential input is transient. Persist only the approved hash (`pickup_qr_token_hash`) and verification audit data; never show or log the hash as a customer credential.

## Derived presentation facts

The following are projections, not new columns: `Delayed`, ready/expiry countdowns, `Overdue`, `Within 15 min`, `Within 30 min`, picking/packing progress percentages, item/unit/package counts, and Guest classification. They must be computed from authoritative server timestamps and canonical records. Device time is not authoritative.

For OO-01, `displayStatus`, six summary counts, item/unit counts, remaining preview count and the visual priority star are not persisted attributes. `Delayed` must respect Ready, Collected, Cancelled and terminal lifecycle authority. Product previews use joined/batched list projections from existing product/variant/image relationships; the UI does not query tables or fetch each product separately.

## OO-01 schema decision

`New API = YES`; `New table = NO`; `New database column/attribute = NO`. Reuse verified canonical tables including sales orders/lines/history, fulfilment orders/lines/events, pickup orders/events, customers, products/variants/images, fulfilment-method outlet/slot/reservation records, sales channels, outlets and tenant users. Do not introduce `online_orders`, `delayed_orders`, `ready_orders`, persisted display/summary fields or priority columns.

## State and transaction integrity

- UI optimistic state never establishes a persisted transition.
- Payment success requires committed payment/transaction/event evidence before handover becomes available.
- Collection completion requires pickup collected + fulfilment fulfilled + sales order complete according to the canonical transaction boundary.
- A failed or unknown command preserves the last confirmed server state and exposes reconciliation/retry behavior defined by [[Online_Order_Prototype_Flow]].

## Schema implementation note

Package/pickup fields listed above are the canonical target contract. Where current migration/runtime tracking remains incomplete, the prototype must label them implementation pending and must not substitute local-only storage.

## Prototype boundary

Example IDs, values and timestamps are **DISPLAY-ONLY EXAMPLE**. The prototype never connects to the database and does not define persistence.
