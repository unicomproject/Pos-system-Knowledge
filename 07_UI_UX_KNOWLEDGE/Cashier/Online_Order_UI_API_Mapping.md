# Online Order UI ↔ API Mapping

Status: **OO-01 ACCEPTED; OO-02/OO-03 IMPLEMENTED / RUNTIME ACCEPTANCE OPEN** · Journey: `POS-UJ-036` · Updated: 2026-09-01

## Authorities and status language

Canonical endpoints and permissions come from [[../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]], [[../../04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/03_Technical_Contract]], and [[../../02_ACCESS_CONTROL/Permission_Code_List]]. Screen sequencing comes from [[Online_Order_Prototype_Flow]].

- Canonical staff family: `/api/v1/tenant/ecommerce/click-collect/...`
- OO-01 completion follows its accepted tracker. OO-02 detail and OO-03 Start are implemented on the canonical Flutter/backend owners; authenticated runtime acceptance remains separately tracked.
- Public storefront fulfilment reads: **IMPLEMENTED/TESTING, SEPARATE SURFACE**; they are not cashier command endpoints.
- A generic status `PATCH`, where present, is **LEGACY / NON-PRIMARY** and must not drive the prototype.

## Mapping

| UI | Request / command | Canonical route family | Response facts consumed | Permission | Status / failure handling |
|---|---|---|---|---|---|
| OO-01 | Search/list queue; internal bounded query | `GET .../orders` | card items, six authoritative aggregates, paging metadata, server time | `commerce.online_order.orders.access`, `commerce.online_order.orders.view` | Implemented; loading/refresh/empty/empty-search/error/denied/not-entitled separated |
| OO-02 | Read order detail | `GET .../orders/{orderId}?outletId=...` | order/display status, customer, collection window, payment/currency/totals, line/unit counts, lines and `fulfillmentVersion` | `commerce.online_order.orders.access`, `commerce.online_order.orders.view` | Implemented; GET is side-effect free |
| OO-02 → OO-03 | Open confirmation | No request | already-loaded authoritative detail summary | `.fulfilment.start` gates visible action | No mutation; missing permission removes the action region |
| OO-03 | Confirm start / assign | `POST .../orders/{orderId}/fulfilment/start?outletId=...` with `{expectedVersion}` | order/fulfilment IDs, resulting status, assignee, startedAt, updated version | `commerce.online_order.fulfilment.start` | Implemented; one in-flight request; 409 refetches detail and blocks OO-04 |
| OO-04 | Read picking workspace | `GET .../orders/{orderId}/picking` | progress, lines, locations, version | `.picking.view` | Pending; server values authoritative |
| OO-05 | Confirm scan/manual pick | `POST .../orders/{orderId}/picking/lines/{lineId}/pick` | accepted line/qty, progress, completion eligibility | `commerce.online_order.picking.pick` + `commerce.online_order.picking.scan` or `commerce.online_order.picking.manual_entry` | Pending; invalid barcode no increment |
| OO-05 | Report item issue | `POST .../orders/{orderId}/picking/lines/{lineId}/issues` | issue result and current state | `commerce.online_order.picking.report_issue` | Pending; no implied substitution/cancel |
| OO-06 | Save package | `POST .../orders/{orderId}/pack` | package number, lines, staging, packed audit | `commerce.online_order.packing.view`, `commerce.online_order.packing.pack` | Pending; validation/conflict retains form |
| OO-07 | Mark ready and optionally notify | `POST .../orders/{orderId}/ready` | ready status/time, notification result, pickup expiry/version | `commerce.online_order.collection.mark_ready`; notification requires `commerce.online_order.collection.notify_customer` | Pending; notification result is explicit and cannot falsify committed ready state |
| OO-08 | List ready orders | `GET .../collection/ready` | ready rows, collection windows, package/payment summaries | `commerce.online_order.collection.view_ready` | Pending |
| OO-09 | Validate QR | `POST .../collection/qr/validate` | valid flag, reason code, order/package/payment facts | `commerce.online_order.collection.scan_qr`, `commerce.online_order.collection.validate_qr` | Pending; OO-10 or OO-11 |
| OO-14 | Manual lookup | `GET .../collection/lookup` then QR-equivalent server validation | candidates then authoritative validation result | `commerce.online_order.collection.manual_lookup`, `commerce.online_order.collection.validate_qr` | Pending; local lookup alone never authorizes |
| OO-10/12 | Refresh verification/handover facts | `GET .../orders/{orderId}` | contents, packages, payment, pickup version | `commerce.online_order.collection.verify_items` | Pending; refresh on conflict |
| OO-15A–D | Accept cash / explicit retry | `POST .../orders/{orderId}/collection/payment/cash` | payment IDs/status, due, paid, received, change, paidAt | `commerce.online_order.payment.accept_cash`; retry also `commerce.online_order.payment.retry` | Pending; unknown/failure never permits handover |
| OO-12 | Confirm handover/collect | `POST .../orders/{orderId}/collection/handover` | pickup collected, fulfilment fulfilled, sales order complete | `commerce.online_order.collection.handover`, `commerce.online_order.collection.collect` | Pending; idempotent/conflict-aware |
| OO-13 | Present completion response | No new command required | final server identifiers and timestamps | contextual read | Never fabricate success locally |

## Cross-cutting request rules

- Effective authorization: authenticated + `click_collect` entitlement + canonical permission + tenant + outlet + resource scope.
- Cash request additionally requires trusted device, terminal, till and open till session.
- Commands carry the repository-approved concurrency/idempotency context; the UI locks duplicate submission but does not replace server enforcement.
- Raw QR/token input is transmitted only to the validation command over the approved secure channel and is never logged or persisted by Flutter.
- API error codes map to bounded UI messages; raw exceptions, secrets and stack traces are not displayed.

## Canonical OO-01 query and response contract

- Query capability follows conventions for `outletId`, `search`, `status`, `sortBy`, `sortDirection`, `page`, and `pageSize`. The approved UI exposes only debounced search; the remaining fields support bounded/internal reads.
- Response concepts are `items`, `summary`, `page`, `pageSize`, `totalCount`, and `serverTime`. Summary contains New, Preparing, Ready, Delayed, Collected and Cancelled aggregates for the full active scope, never just the page.
- Each item provides equivalent established DTO fields for order identity, pickup/collection reference, customer name/phone, collection start/end/timezone, display/payment status, item/unit counts, product previews and remaining preview count.
- `DELAYED` is a derived server projection using lifecycle, promised window and server time; Ready, Collected, Cancelled and terminal orders are not incorrectly reclassified.
- Product previews are part of the list projection and must not trigger N+1 API calls. Client filtering of only the current page is prohibited.
- The card chevron reads `GET .../orders/{orderId}` and never sends a mutation.

## Prototype boundary

The prototype may mock response shapes for visual review only, clearly labelled **DISPLAY-ONLY EXAMPLE**. It must not be used as API or runtime evidence. Route-specific completion claims follow the implementation audit.

## OO-02 no-fan-out rule

The detail response is one bounded aggregate read. Flutter must not call separate customer, product-image, payment, pickup or line APIs per rendered row. Optional media/options/classification remain absent when the aggregate cannot authoritatively provide them. The start response is followed by controlled detail/list invalidation, not speculative local lifecycle mutation.
