<!-- title: Backend Coding Principles -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->


# Backend Coding Principles

## Purpose

This file defines backend coding rules for TM-EPOS MVP.

The rules prevent duplicated logic, tenant leaks, unsafe offline behavior, and
unreviewable code.

## General Principles

- Keep controllers thin.
- Keep business logic outside controllers.
- Use Application services for feature workflows.
- Keep Domain free from infrastructure concerns.
- Use repositories through contracts.
- Keep DTOs separate from entities.
- Use explicit transactions for critical workflows.
- Use idempotency for duplicate-sensitive commands.
- Keep permissions backend-driven.
- Do not hardcode role names.

## Scope Principle

Do not implement excluded MVP areas such as kiosk, delivery management, supplier
management, stock transfer, advanced coupons, AI modules, or full accounting.

Online store, cart/checkout, click and collect, and offline operation are active
MVP areas.

## Naming Principles

| Item | Rule |
|---|---|
| Entities | Business names such as SalesOrder, CheckoutSession |
| DTOs | Request/Response suffix |
| Application services | Module/business service names such as CheckoutService; feature actions are service methods such as CompleteCheckoutAsync |
| Repositories | Interface in Domain, implementation in Infrastructure |
| Permissions | Stable dot-separated permission codes |
| Routes | Versioned and module grouped |

## Transaction Safety

Critical workflows must be transaction-safe:

- Checkout completion.
- POS sale completion.
- Payment transaction recording.
- Refund allocation.
- Return/exchange posting.
- Offline sync batch processing.
- Till close.
- Inventory movement posting.

## Idempotency Rule

Use idempotency keys for payment, checkout, offline sync batch upload, refund,
exchange, and any retryable command that may create duplicate records.

## Cache Rule

Cache is allowed only for safe reference/config/read data.

Do not use cache as final authority for payment, inventory, refund, exchange,
till close, loyalty/store credit, or final sale total.

## Security Rule

Never log or expose passwords, raw tokens, card data, POS PINs, provider secrets,
payment credentials, or raw activation/setup tokens.

## Review Rule

Every backend change must be reviewed against scope, tenant isolation,
authorization, audit, idempotency, error handling, and database constraints.

## Related Files

- [[Virtual_Caching_Architecture]]
- [[Offline_Operation_Architecture]]
- [[Authorization_And_Permissions]]
