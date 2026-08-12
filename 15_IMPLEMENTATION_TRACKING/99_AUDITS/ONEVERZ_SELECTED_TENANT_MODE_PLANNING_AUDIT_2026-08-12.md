<!-- title: Selected Tenant Mode Planning Audit -->
<!-- status: Active -->
<!-- date: 2026-08-12 -->
<!-- note: Global journey count superseded by 173 canonical register (SA-UJ-057 Online Store) — prior 172 note retained historically -->

# ONEVERZ Selected-Tenant Mode Planning Audit

## Purpose

Phase 1 planning audit before visual direction and static prototypes (mandatory sequence step 1).

## Locked product decisions applied

1. Selected-Tenant Mode **in scope** and **required** Super Admin capability
2. Purpose: **initial assisted / bootstrap** configuration
3. Tenant Admin owns **ongoing** operations
4. Individual bootstrap steps **conditional**, not mandatory per tenant
5. Operational setup does **not** block activation
6. Platform identity preserved; no impersonation
7. Selected tenant always explicit
8. E-commerce bootstrap **DECISION_REQUIRED** — excluded from prototype

## Documentation gaps closed in this phase

| Gap | Resolution |
|---|---|
| Mode contract missing | `Selected_Tenant_Mode_Contract.md` |
| Atomic journeys undefined | `Selected_Tenant_Atomic_Journey_Register.md` (9 accepted) |
| Operating model conflict | Updated canonical operating model |
| Flows 05–09 ambiguity | Reconciled as macro parents |
| Permissions missing | `platform.tenants.bootstrap.*` family |
| API contract missing | `Platform_Selected_Tenant_API_Contract.md` |
| Visual direction missing | `Selected_Tenant_Visual_Direction.md` |
| Prototypes missing | `prototypes/selected-tenant/` pack |

## Remaining decisions

- E-commerce selected-tenant bootstrap: **SUPERSEDED** — see below (APPROVED optional bootstrap)
- Durable setup hub status persistence: **PRODUCT DECISION**
- Collection point attribute mapping: **CONTRACT_GAP**
- Bootstrap product minimum field set: **CONTRACT_GAP**

## E-commerce bootstrap (GAP 5 — SUPERSEDED 2026-08-12)

> **SUPERSEDED** by product-owner approval 2026-08-12.  
> Authority: [[Selected_Tenant_Online_Store_Bootstrap_Contract]] · Audit: [[ONEVERZ_SELECTED_TENANT_ONLINE_STORE_SCOPE_REOPEN_2026-08-12]].  
> Canonical: SA-ST-UJ-011 → SA-UJ-057; total **173** / SA **57**; hub NOT_ENTITLED / NOT_STARTED / CONFIGURED.

### Historical locked text (retained)

**Platform Admin Selected-Tenant e-commerce bootstrap = OUT OF CURRENT APPROVED IMPLEMENTATION SCOPE.**

- Tenant Admin owns online-store configuration post-handoff.
- No Super Admin e-commerce bootstrap APIs or UI in Phase 1.
- Does not block Selected-Tenant Phase 1 implementation.

### Current decision

Optional SA Online Store readiness bootstrap (`storeStatus` DRAFT|ACTIVE; `taxDisplayMode` optional). Click & Collect / FMO remain Tenant Admin. No `is_collection_point`.

## Contract lock pack (Phase 2.5 + Online Store)

| Document | Status |
|---|---|
| [[Selected_Tenant_Collection_Point_Contract]] | LOCKED |
| [[Selected_Tenant_Product_Bootstrap_Contract]] | LOCKED |
| [[Selected_Tenant_Product_Import_Contract]] | LOCKED |
| [[Selected_Tenant_Setup_Hub_Status_Model]] | LOCKED |
| [[Selected_Tenant_Online_Store_Bootstrap_Contract]] | LOCKED / APPROVED |
| [[ST-UX-001_Selected_Tenant_Context_Requirement]] | LOCKED |
| [[Selected_Tenant_Journey_Readiness_Matrix]] | LOCKED |
| [[../../02_ACCESS_CONTROL/Selected_Tenant_Permission_Final_Matrix]] | LOCKED |
| [[../../05_BACKEND_ARCHITECTURE/Platform_Selected_Tenant_API_Contract]] | LOCKED |
