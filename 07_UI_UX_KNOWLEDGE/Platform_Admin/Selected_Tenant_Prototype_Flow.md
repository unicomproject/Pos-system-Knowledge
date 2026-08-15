# Selected-Tenant Prototype Flow Map

**Date:** 2026-08-12  
**Status:** APPROVED prototype navigation contract  

## Mermaid — primary flow

```mermaid
flowchart TD
    A[Tenant List ST-PLATFORM] --> B[Tenant Detail ST-PLATFORM]
    B -->|Configure Tenant| C[Setup Hub ST-01]
    C -->|Outlet Configure| D[Create Outlet ST-02]
    C -->|Till Configure| E[Create Till ST-03]
    C -->|Roles Configure| F[Create Role ST-04]
    C -->|Users Add User| G[Add User ST-05]
    C -->|Products Add| H[Manual Product ST-06A]
    C -->|Products Import CSV| I[CSV Import ST-06B]
    C -->|Online Store Configure| J[Online Store ST-07]
    D --> C
    E --> C
    F --> C
    G --> C
    H --> C
    I --> C
    J --> C
    C -->|Exit Tenant Context| B
    C -->|Switch Tenant| B2[Another Tenant Detail]
    B2 --> C2[Setup Hub other tenant]
```

## Conditional branches

```mermaid
flowchart LR
    C[Setup Hub] --> E1{Outlet entitled?}
    E1 -->|No| NE1[NOT ENTITLED card]
    E1 -->|Yes| O[Outlet path]
    C --> E2{Till entitled?}
    E2 -->|No outlet| DEP[Requires Outlet notice]
    E2 -->|Yes + outlet exists| T[Till path]
    C --> E3{Products entitled?}
    E3 -->|No| NE3[NOT ENTITLED]
    E3 -->|Yes| P[Product paths]
    C --> E4{Online Store entitled?}
    E4 -->|No| NE4[NOT ENTITLED]
    E4 -->|Yes + DRAFT| OS1[NOT STARTED → ST-07]
    E4 -->|Yes + ACTIVE| OS2[CONFIGURED]
    C --> S{Tenant SUSPENDED?}
    S -->|Yes| RO[Read-only hub]
```

## Shell state prototypes

| ID | Purpose |
|---|---|
| ST-SHELL-01 | Entered selected-tenant context |
| ST-SHELL-02 | Switch tenant dialog |
| ST-SHELL-03 | Exit confirmation (dirty form) |
| ST-SHELL-04 | Suspended tenant |
| ST-SHELL-05 | Feature not entitled |
| ST-SHELL-06 | Permission denied |

Prototype file: `prototypes/selected-tenant/shell-states.html`

## Journey mapping

| Screen | Journey |
|---|---|
| ST-01 | SA-ST-UJ-001 (+ hub read) |
| ST-02 | SA-ST-UJ-005 |
| ST-03 | SA-ST-UJ-006 |
| ST-04 | SA-ST-UJ-007 |
| ST-05 | SA-ST-UJ-008 |
| ST-06A | SA-ST-UJ-009 |
| ST-06B | SA-ST-UJ-010 |
| ST-07 | SA-ST-UJ-011 → SA-UJ-057 |
| ST-SHELL-* | SA-ST-UJ-001/002/003 + error contracts |

## Online Store (ST-07) — APPROVED

| Screen | Journey | Notes |
|---|---|---|
| ST-07 | SA-ST-UJ-011 → SA-UJ-057 | Optional bootstrap; entitlement `online_store` |
| Hub Online Store card | Derived NOT_STARTED / CONFIGURED / NOT_ENTITLED | `DECISION_REQUIRED` retired |

Entry remains: Tenant Detail → Configure Tenant → Setup Hub → Online Store.  
No permanent Platform sidebar item.

`storeStatus`: `DRAFT` | `ACTIVE`. `taxDisplayMode`: optional `MATCH_TENANT`.

See [[../../03_USER_JOURNEYS/Platform_Admin/Selected_Tenant_Online_Store_Bootstrap_Contract]].
