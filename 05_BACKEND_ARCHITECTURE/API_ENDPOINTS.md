<!-- title: API Endpoints -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# API Endpoints

## Purpose

This file defines API route group guidance for TM-EPOS MVP.

This is not the final full endpoint catalogue.
Exact endpoint tables must be created module-by-module after module contracts are
finalized.

## Endpoint Rule

Do not invent exact endpoint contracts before module use cases and request/response
DTOs are confirmed.

Use this file to keep route group naming consistent.

## Base Route

```text
/api/v1
```

## MVP Route Groups

| Route Group | Purpose |
|---|---|
| `/platform/...` | Platform admin, tenants, plans, entitlements, billing |
| `/tenant-admin/...` | Tenant business admin context and setup |
| `/auth/...` | Platform, tenant, customer authentication where applicable |
| `/pos/...` | POS sale, basket, till, receipt, cash, device operations |
| `/online-store/...` | Customer storefront catalogue and customer order entry |
| `/cart-checkout/...` | Cart and checkout session operations |
| `/orders/...` | Unified sales order management |
| `/fulfilment-pickup/...` | Fulfilment method, pickup slot, pickup order flows |
| `/payments-refunds/...` | Sales payments, transactions, refunds, allocations |
| `/returns-exchanges/...` | Return, inspection, exchange workflows |
| `/offline-sync/...` | Offline clients, number blocks, sync batches, conflicts |
| `/notifications/...` | Notification events, templates, messages, delivery |
| `/integrations/...` | Providers, credentials, webhooks, request logs |
| `/reports/...` | Operational reports and exports |

## POS Route Boundary

POS routes must validate tenant user, outlet, till, device, permission, and open
till session where required.

## Online Store Route Boundary

Online store routes must resolve tenant/storefront context safely through domain,
sales channel, or verified tenant route.

## Offline Sync Route Boundary

Offline sync routes require approved offline client/device, tenant context,
idempotency, payload validation, and backend revalidation.

## Endpoint Documentation Rule

When a module is implemented, create or update module-level endpoint tables with:

- HTTP method.
- Route.
- Purpose.
- Request DTO.
- Response DTO.
- Required permission.
- Feature entitlement.
- Idempotency requirement.
- Audit requirement.

## Related Files

- [[API_Standards]]
- [[Authorization_And_Permissions]]
- [[Offline_Operation_Architecture]]
