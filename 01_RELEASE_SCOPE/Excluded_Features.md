<!-- title: Excluded Features -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Excluded Features

## Purpose

This file lists what must not be implemented as active TM-EPOS MVP scope.

It prevents scope creep from old documents, unused database references, future
roadmap ideas, and unsupported assumptions.

## Exclusion Rule

If a feature is listed here, do not build it for the MVP unless an official scope
change is recorded in [[../13_DECISIONS_AND_CHANGES/Scope_Change_Log]].

Database presence does not automatically override this file.

## Important Scope Correction

Online Store, Click & Collect, and Offline Operation are no longer excluded.
They are part of the current TM-EPOS MVP.

Old files that say e-commerce, click and collect, or offline sync are excluded
must be treated as outdated until updated.

## Excluded / Deferred Summary

| Feature Area | MVP Decision |
|---|---|
| Self-service kiosk | Excluded |
| Own delivery management | Deferred |
| Driver assignment and delivery tracking | Deferred |
| Franchise and chain management | Deferred |
| Full CRM inside TM-EPOS | Deferred / external boundary |
| Supplier management | Excluded unless separately approved |
| Purchase order and supplier invoice module | Excluded unless approved |
| Stock transfer between outlets | Excluded unless approved |
| Advanced promotion/coupon engine | Excluded |
| AI onboarding, AI analytics, AI accounting | Excluded |
| Full accounting/general ledger | Excluded |
| Unlimited offline commerce | Excluded |
| Offline card/QR payment finalization | Excluded |
| Offline refund/exchange finalization | Excluded |
| Redis/caching dependency | Excluded unless approved |
| CQRS/MediatR | Excluded unless approved |

## Offline Exclusion Boundary

Offline support does not mean every business action is final offline.

Do not implement offline final authority for:

- Final inventory quantity.
- Card payment.
- QR payment.
- Refund.
- Exchange.
- Loyalty/store credit.
- Till final close.
- Final sale total.

These require backend validation.

## Delivery And Franchise Exclusion

Do not implement own delivery management, driver assignment, delivery routing,
delivery tracking, delivery fees, franchise hierarchy, chain management, or
regional management as MVP scope.

## Supplier And Stock Transfer Exclusion

Do not implement supplier master, supplier contacts, purchase orders, supplier
invoices, supplier payments, transfer requests, transfer approvals, transfer
dispatch, transfer receive, in-transit stock, or transfer reports unless approved.

Inventory stock in, stock adjustment, low stock alerts, and movement history are
included.

## Coupon, AI, And Accounting Exclusion

Do not implement coupon code management, campaign builder, promotion stacking,
advanced offer rules, AI bulk extraction, AI analytics, AI accounting, general
ledger, journal posting, trial balance, profit and loss, or balance sheet.

POS payments, refunds, till sessions, and cash movements are operational records.
They are not a full accounting module.

## Customer App And Kiosk Exclusion

Do not implement a separate customer mobile app or self-service kiosk.
The customer surface for MVP is the responsive online store.

## Architecture Exclusions

Do not introduce CQRS, MediatR, API Gateway, Redis dependency, or separate cache
platform unless approved by architecture decision.

Use the confirmed layered/clean architecture style and repository/service
patterns already documented.

## Developer Stop Rules

Stop and ask for scope confirmation when a task touches delivery, kiosk,
supplier, stock transfer, full CRM, full accounting, AI, advanced coupons, or
offline finalization of protected business actions.

## Related Files

- [[Release_1_Scope]]
- [[Included_Features]]
- [[../00_START_HERE/Current_Source_Of_Truth]]
