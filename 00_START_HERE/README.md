<!-- title: SCS-TIX Second Brain Start Here -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# SCS-TIX Second Brain Start Here

## Purpose

This folder is the entry point for the SCS-TIX EPOS Release 1 Second Brain.
It tells every developer, designer, tester, and AI assistant what to read first.
It also defines which uploaded project documents are treated as the source of truth.

## Product Context

SCS-TIX EPOS is a multi-tenant SaaS POS platform for tenant-based retail and event merchandise operations.
Release 1 is POS-first and does not include the full future commerce platform.
The system supports Platform Admin, Tenant Admin, and Cashier operational flows.
Tenant-level behavior is controlled by feature entitlement, role permission, outlet access, device trust, and till session state.

## Release 1 Primary Applications

| Application        | Purpose                                                      | Release 1 Status |
| ------------------ | ------------------------------------------------------------ | ---------------- |
| Platform Admin Web | Tenant setup, subscription, entitlement, billing, activation | Included         |
| Flutter POS App    | Cashier POS and Tenant Admin operational layout              | Included         |
| Portable POS       | Queue-busting sale flow under POS scope                      | Included         |
| Reports            | Basic dashboard and operational reports                      | Included         |
| E-commerce Web     | Click & Collect online store                                 | Release 2        |

## What This Start Folder Contains

| File | Use |
|---|---|
| [[README]] | Entry point and reading order |
| [[Current_Source_Of_Truth]] | Which documents control the project decisions |
| [[Developer_Reading_Guide]] | Reading path by developer role |
| [[Project_Glossary]] | Shared vocabulary for SCS-TIX Release 1 |
| [[Markdown_Writing_Rules]] | Rules for writing future Second Brain files |

## First Reading Order

1. Read [[Current_Source_Of_Truth]].
2. Read [[Developer_Reading_Guide]].
3. Read [[Project_Glossary]].
4. Read [[Markdown_Writing_Rules]].
5. Then move to [[Release_1_Scope]].
6. Then move to [[Access_Control_Overview]].
7. Then read the relevant role journey or module file.

## Release 1 Scope Guard

Release 1 must stay focused on POS-first delivery.
Do not implement future features because they appear in an old screen, database reserve table, or image.
A feature is Release 1 only when it is confirmed by the current scope, backend architecture, and project decisions.
When a document conflicts with the latest scope, mark the item as deferred instead of silently including it.

## Main Included Areas

- Platform Admin tenant creation and activation.
- Subscription plan assignment and billing/payment link flow.
- Feature entitlement and permission assignment.
- Tenant Admin setup through the POS app layout.
- Outlet setup and till setup.
- User, role, and permission management.
- Product onboarding and basic catalog management.
- Inventory basics with expiry tracking and expiry discount support.
- Cashier sale, payment, discount, return, refund, exchange, and cash drawer flows.
- Till open and till close.
- Basic reports and report export support.
- POS hardware-ready validation and record keeping.

## Main Excluded or Deferred Areas

- E-commerce Click & Collect web.
- Offline POS sync and conflict resolution.
- Supplier management.
- Stock transfer between outlets.
- Delivery flow.
- Self-service kiosk.
- Coupons and promotions engine.
- AI onboarding.
- AI analytics.
- AI accounting.
- Full notification platform beyond basic required email/system records.

## Core Architecture Rule

A valid login token alone is not enough for protected POS actions.
Protected POS APIs must validate tenant status, feature entitlement, permission, outlet assignment, trusted device, assigned till, and open till session when required.
This rule must be reflected in backend services, Flutter UI access, API tests, and QA checklists.

## Core Database Rule

Tenant-owned data must include tenant context.
Frontend requests must not be trusted as the source of tenant ownership.
Tenant context must come from authenticated session, user assignment, device context, and server-side checks.

## Core UI Rule

The UI must be permission-based and feature-based.
Do not hardcode menus for Cashier, Manager, or Tenant Admin as fixed permanent layouts.
The same Flutter POS app may show different screens depending on tenant entitlements, role permissions, and user rights.

## Core Documentation Rule

Every future Markdown file must be specific to SCS-TIX EPOS Release 1.
Avoid generic SaaS, generic POS, or generic Clean Architecture text.
Use project terms exactly and link related files through wikilinks.

## When Unsure

Check [[Current_Source_Of_Truth]].
If the decision is still unclear, add the item to [[Open_Questions]] instead of inventing a rule.
If an item appears in a UI file but is marked excluded in scope, document it as deferred.

## Ownership of This Folder

This folder is owned by the technical documentation architecture process.
Any change here affects how all other Second Brain files are interpreted.
