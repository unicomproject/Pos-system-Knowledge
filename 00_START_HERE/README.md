<!-- title: TM-EPOS Second Brain Start Here -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# TM-EPOS Second Brain Start Here

## Purpose

This folder is the entry point for the TM-EPOS MVP Second Brain.
It tells every developer, designer, tester, reviewer, and AI assistant what to
read first before making implementation decisions.
It also defines how the updated MVP scope replaces older POS-first assumptions.

## Current Product Context

TM-EPOS is a low-cost, multi-tenant EPOS platform for events, stalls, temporary
retail locations, food and beverage counters, merchandise sellers, and small
businesses.

The MVP is no longer only a POS-first release.
The MVP now includes mobile and desktop EPOS, online store, click and collect,
offline operation, order management, reporting, permissions, and device/peripheral
integration.

Older files may still contain SCS-TIX EPOS or POS-first wording.
When that old wording conflicts with this Start Here folder and the updated MVP
scope images, this Start Here folder controls the interpretation.

## Primary MVP Goal

Start selling in minutes using a phone, tablet, laptop, or desktop PC.

The system must remain simple, affordable, and suitable for temporary or
challenging selling environments.

## Primary Applications

| Application Area | Purpose | MVP Status |
|---|---|---|
| Mobile POS | Fast selling, barcode scan, basket, cash/card/receipt | Included |
| Desktop EPOS | Responsive selling and admin use on laptop/desktop | Included |
| Online Store | Customer website for product browsing and ordering | Included |
| Click & Collect | Online order pickup workflow | Included |
| Admin Operations | Product, stock, users, permissions, reports | Included |
| Offline Operation | Limited offline selling and pending sync | Included |
| Platform Admin | Tenant, plan, entitlement, billing, setup | Included |

## Target Customers

TM-EPOS initially targets:

- Event merchandise shops.
- Stadiums and arenas.
- Festivals and concerts.
- Pop-up and temporary shops.
- Souvenir and gift shops.
- Museums and attractions.
- Food stalls and burger shops.
- Bars and beverage counters.
- Market traders.
- Small businesses needing simple EPOS.

## MVP Core Modules

| No. | Module | MVP Meaning |
|---:|---|---|
| 1 | Mobile POS | Product search, barcode scan, basket, payment, receipt |
| 2 | Product & Variant Management | Products, categories, variants, attributes, images, barcodes |
| 3 | Inventory Management | Stock in, stock adjustment, variant stock, alerts, movement history |
| 4 | Online Store | Responsive customer website and product catalogue |
| 5 | Click & Collect | Online ordering, collection time, pickup tracking |
| 6 | Offline Operation | Local cache, offline cash sale, outbox, pending sync |
| 7 | Order Management | In-store orders, online orders, click and collect orders |
| 8 | Reporting & Analytics | Sales, product, inventory, order reports, dashboard |
| 9 | Users & Permissions | Role-based and permission-based access |
| 10 | Device & Peripheral Integration | Printers, scanners, drawers, card payment machines |

## Critical Offline Boundary

Offline operation is included, but it is not unlimited offline commerce.

The app may support cached lookup, basket restore, offline cash sale, receipt
print, held sale, current till session, pending inventory movement, and sync
outbox.

Backend final validation is still required for final inventory quantity,
card/QR payment, refund, exchange, loyalty/store credit, till final close, and
final sale total.

## What This Folder Contains

| File | Use |
|---|---|
| [[README]] | Entry point and current MVP summary |
| [[Current_Source_Of_Truth]] | Source priority and conflict resolution |
| [[Developer_Reading_Guide]] | Reading path by role |
| [[Project_Glossary]] | Shared terminology |
| [[Markdown_Writing_Rules]] | Rules for writing/updating Markdown files |

## First Reading Order

1. Read [[Current_Source_Of_Truth]].
2. Read [[Developer_Reading_Guide]].
3. Read [[Project_Glossary]].
4. Read [[Markdown_Writing_Rules]].
5. Then read [[../01_RELEASE_SCOPE/Release_1_Scope]].
6. Then read [[../02_ACCESS_CONTROL/Access_Control_Overview]].
7. Then read the relevant journey, module, database, UI, or architecture file.

## Immediate Update Rule

Replace old statements that say online store, click and collect, or offline sync
are excluded from MVP.

## Related Files

- [[Current_Source_Of_Truth]]
- [[Developer_Reading_Guide]]
