<!-- title: Flutter API Network -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Flutter API Network

## Purpose

This file defines Flutter API networking rules for TM-EPOS MVP.

Network code must support online operation, safe retries, offline fallback, and
sync upload without duplicating sensitive actions.

## Network Stack

Use Dio with configured base URL, interceptors, timeout, auth header handling,
refresh handling, request tracing, safe error mapping, and connectivity checks.

## Request Rule

Widgets must not create Dio requests.

Use repositories and API datasource classes.

## Retry Rule

Only safe reads and explicitly idempotent commands may be retried.

Do not blindly retry:

- Payment.
- Refund.
- Exchange.
- Checkout completion.
- Sale completion.
- Cash movement.
- Till open/close.
- Sync batch apply.

## Idempotency Rule

Commands that can create duplicates must include idempotency keys.

Examples:

- Checkout completion.
- Payment transaction.
- Refund.
- Exchange.
- Offline sync batch upload.
- Cash movement where retry risk exists.

## Offline Fallback Rule

When network fails, repositories may return cached data only for safe reference
data such as products, categories, barcode lookup, price/tax reference, receipt
template, and permissions.

## Error Mapping

Map backend error codes to app-safe messages.

Examples:

- Feature disabled.
- Permission denied.
- Device not trusted.
- Till not open.
- Checkout validation failed.
- Sync conflict.
- Payment duplicate.

## Security Rule

Never log raw tokens, authorization headers, payment credentials, card data, or
PIN values.

## Related Files

- [[Flutter_API_Integration]]
- [[Flutter_Error_Handling]]
- [[Flutter_Offline_Operation_Sync]]

## Exact POS barcode lookup (2026-07-22)

Flutter calls the dedicated exact endpoint through `PosBarcodeRemoteDatasource`:
`GET /api/v1/pos/products/by-barcode/{encodedBarcode}?deviceId={deviceId}`.
Barcodes remain strings and path segments are encoded. The response maps through
`PosBarcodeLookupResult` into `PosResolvedSaleItem`; it is not routed through the
debounced general catalog search.
