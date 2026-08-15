# ONEVERZ Selected-Tenant Final Independent Runtime E2E Closure

**Date:** 2026-08-13  
**Surface:** Platform Admin Selected-Tenant Mode (SA-UJ-048…057 + ST-UX-001)  
**Verdict:** SELECTED-TENANT END-TO-END IMPLEMENTATION CLOSED = **YES**

## Canonical SHAs (post-merge)

| Repo | `origin/main` SHA |
|---|---|
| Second Brain (pre-this-doc merge) | `c9abdf225a3629fbfe24df14bd9c5d5812cce6be` |
| Backend | `024505342206d47fc70b7ddf675aeebe8e83c798` |
| Angular Platform Admin | `8587e042f90d41e97c9b6cfdb2dbc2b15b7ebf0a` |

## Runtime environment

| Layer | Evidence |
|---|---|
| PostgreSQL | Local disposable `UnifiedCommerceDb` @ `localhost:5432` |
| Backend | `http://localhost:5150` (Development) |
| Angular | `http://localhost:4200` (200) |
| Auth | Platform login `posunique001@gmail.com` → success + Bearer token |
| Tenant A | `BWDEM36609` / `3a64a80e-25bc-4204-a5d9-9b1f6a83ec35` (ACTIVE, entitled) |
| Tenant B | `BWDEM94319` / `1938b08f-aa31-4e7c-8ec6-9133eb924eff` (switch / isolation) |
| Tenant C | `DEV-TENANT-001` / `55555555-0000-4000-8000-000000000001` (`online_store` NOT_ENTITLED) |
| Suspended | `BWDEM07730` summary readable under AuthorizeRead |

## Fixes merged in this closure

1. **Authoritative bootstrap options** (P1 → blocker resolved):  
   `GET .../bootstrap/options/outlets|roles|permissions` + Angular till/user/product loaders prefer API over session memory.
2. **Schema repairs migration** `20260813014500_SelectedTenantBootstrapRuntimeSchemaRepairs`:  
   custom role `source_role_template_version_id` nullable; `change_type` varchar(80); global **EA** UOM seed.
3. **Product bootstrap**: platform actor not written to tenant-user FKs; ensure default price list + sellable inventory location for opening stock.
4. **PriceList EF** `HasDefaultValue` removed (was causing NULL inserts).
5. **Dev invite delivery secret** configured under `TenantUserInvitationDeliverySecret` (Development).

## Tests after fixes

| Suite | Result |
|---|---|
| Backend Unit (Selected-Tenant filter) | 22 passed |
| Backend ApiTests (bootstrap) | 26 passed |
| Backend IntegrationTests (bootstrap) | 15 passed |
| Angular `npm test --watch=false` | 75 files / **580** passed |

## Journey evidence (live API + DB)

| Journey | Key evidence | Status |
|---|---|---|
| SA-UJ-048 | `GET /bootstrap/summary` 200; modules entitled; tenant identity | **COMPLETE** |
| SA-UJ-049 | Tenant B summary distinct; cross-tenant till → 409 dependency_missing | **COMPLETE** |
| SA-UJ-050 | Exit is client clear of ST context; unit coverage; re-enter uses backend summary/options (no session-only picker) | **COMPLETE** |
| SA-UJ-051 | `POST /bootstrap/outlets` 201; hub outlets=CONFIGURED; no collection-point relation | **COMPLETE** |
| SA-UJ-052 | `POST /bootstrap/tills` 201; hub tills=CONFIGURED; B outlet on A rejected | **COMPLETE** |
| SA-UJ-053 | `POST /bootstrap/roles` 201; options roles includes new custom role after refresh | **COMPLETE** |
| SA-UJ-054 | `POST /bootstrap/users` 201; INVITED + PENDING invite; encrypted delivery secret; staff code; hub users=CONFIGURED | **COMPLETE** |
| SA-UJ-055 | `POST /bootstrap/products` 201; DB: EA, stock_qty=10, STOCK_IN / OPENING_STOCK / PRODUCT_OPENING_STOCK | **COMPLETE** |
| SA-UJ-056 | Template 200; validate 201 (2 valid / 2 invalid); commit 200 committed=2 skipped=2; retry stable; errors.csv 200 | **COMPLETE** |
| SA-UJ-057 | GET/PUT online-store 200 ACTIVE/MATCH_TENANT; hub online_store=CONFIGURED; Tenant C GET/PUT **403 not_entitled**; fulfillment_method_outlets count=0 | **COMPLETE** |
| ST-UX-001 | Context contract implemented; options deep-link outlets=1 roles=2 without session memory | **PASS** (not counted) |

## Known non-ST issue

**Historical clean-PG July migration defect** (`20260710143000_SeedDevelopmentVariableProductCatalog` / `Migrations_ApplyToCleanPostgreSqlDatabase`) = **PRESENT**.  
**Selected-Tenant regression = NO.**

## Global arithmetic after status flip

| Metric | Before | After |
|---|---:|---:|
| Total | 173 | 173 |
| Complete | 104 | **114** |
| Partial | 36 | **26** |
| Not Started | 31 | 31 |
| Blocked | 2 | 2 |

114 + 26 + 31 + 2 = 173

Super Admin surface: 45C/11P/1NS → **55C/1P/1NS**.
