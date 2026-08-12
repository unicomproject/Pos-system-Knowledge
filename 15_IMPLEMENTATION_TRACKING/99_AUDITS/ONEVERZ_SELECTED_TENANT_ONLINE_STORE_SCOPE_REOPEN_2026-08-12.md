<!-- title: ONEVERZ Selected Tenant Online Store Scope Reopen Audit -->
<!-- status: APPROVED / LOCKED -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->
<!-- approved: 2026-08-12 product-owner explicit approval -->

# ONEVERZ Selected-Tenant Online Store Scope Reopen — 2026-08-12

## Purpose

Contradiction scan + supersession list for reopening GAP 5 (Selected-Tenant Online Store / e-commerce bootstrap OUT OF SCOPE).

**Do not silently overwrite history.** Prior OUT OF SCOPE statements are marked **SUPERSEDED** with link to [[../03_USER_JOURNEYS/Platform_Admin/Selected_Tenant_Online_Store_Bootstrap_Contract]].

## Prior locked baseline (historical — SUPERSEDED)

| Artifact | Statement |
|---|---|
| Selected_Tenant_Mode_Contract | GAP 5 — Online Store / e-commerce bootstrap OUT OF SCOPE |
| Selected_Tenant_Setup_Hub_Status_Model | Online Store card not rendered / DECISION_REQUIRED / out of scope |
| Selected_Tenant_Atomic_Journey_Register | No SA Online Store bootstrap journey |
| Global register | Total **172** / SA **56** |
| Collection Point Contract | SA does not configure FMO / pickup (**still canonical**) |

## Approved decision (LOCKED)

| Field | Value |
|---|---|
| In scope? | YES — optional bootstrap |
| Scope type | IN_SCOPE_OPTIONAL_BOOTSTRAP_CAPABILITY |
| Atomic journeys | 1 (Configure Initial Online Store) |
| Canonical IDs | SA-ST-UJ-011 → SA-UJ-057 |
| Locked total | **173** (SA **57**) |
| Doc-lock status | SA-UJ-057 = **NOT_STARTED** until backend evidence |
| Status | **APPROVED / LOCKED** |

## Docs superseded / updated under this lock

| Path | Prior conflict | Action taken |
|---|---|---|
| `Selected_Tenant_Mode_Contract.md` | GAP 5 OUT OF SCOPE | GAP 5 marked **SUPERSEDED**; link new contract |
| `Selected_Tenant_Setup_Hub_Status_Model.md` | DECISION_REQUIRED / not rendered | Derived NOT_ENTITLED / NOT_STARTED / CONFIGURED |
| `Selected_Tenant_Atomic_Journey_Register.md` | No SA-ST-UJ-011 | Added SA-ST-UJ-011 → SA-UJ-057 |
| `Selected_Tenant_Journey_Readiness_Matrix.md` | OS excluded | Readiness row for OS bootstrap |
| `00_Global_User_Journey_Register.md` | 172 / SA 56 | **173** / SA **57**; SA-UJ-057 NOT_STARTED |
| `CANONICAL_USER_JOURNEY_INDEX.md` | SA ends at 056 | Added SA-UJ-057 |
| `Permission_Code_List.md` | No OS bootstrap permission | Added `platform.tenants.bootstrap.online_store.manage` |
| `Selected_Tenant_Permission_Final_Matrix.md` | OS N/A | OS row added |
| `API_Authorization_Rules.md` | No OS bootstrap routes | GET/PUT bootstrap/online-store |
| `Platform_Selected_Tenant_API_Contract.md` | No OS endpoints | online-store section |
| UI/API/DB mappings + prototype pack | OS pending | ST-07 APPROVED |
| Historical audits saying ST e-commerce excluded | OUT OF SCOPE | Annotated SUPERSEDED |

## Explicitly NOT superseded

| Topic | Remains |
|---|---|
| Collection points via FMO only | Canonical — SA still does not create FMO |
| No `is_collection_point` on outlets | Canonical |
| Product channel visibility matrix | Tenant Admin |
| Full branding / SEO / merchandising | Tenant Admin |

## Prototype review package (APPROVED)

| File | Role |
|---|---|
| `prototypes/selected-tenant/setup-hub.html` | Hub card |
| `prototypes/selected-tenant/online-store.html` | ST-07 bootstrap form |
| `prototypes/selected-tenant/index.html` | Prototype index |

## Safety gates (post-approval)

| Gate | Value |
|---|---|
| SAFE TO UPDATE GLOBAL JOURNEY REGISTER | **YES** (done at this lock) |
| SAFE TO MERGE AS CANONICAL | **YES** |
| SAFE TO START ANGULAR | After backend contracts implemented (parent sequencing) |
| SAFE TO START BACKEND FOR THIS JOURNEY | **YES** (design locked; parent implements) |
