<!-- title: Selected Tenant Contradiction Cleanup Report -->
<!-- status: Active -->
<!-- date: 2026-08-12 -->

# Selected-Tenant Contradiction Cleanup Report

## Method

Searched active Second Brain for conflicting statements. Applied locked product decisions from Phase 2.5.

| # | Source | Old claim | Canonical claim | Action |
|---|---|---|---|---|
| 1 | Flows 05–09 (2026-06-30) | Platform Admin owns all outlet/till setup as primary path | Selected-Tenant = optional bootstrap; TA owns ongoing ops | **UPDATED** — reconciliation banners added 2026-08-12 |
| 2 | Operating model (pre-2026-08-12) | Outlets/tills "TA only after activation" | SA may assist bootstrap optionally; not mandatory | **UPDATED** — three-mode model |
| 3 | SA-P1-02 | Outlets/tills OUT_OF_SCOPE for platform **sidebar** | Bootstrap via Tenant Detail → Configure, not sidebar | **NO_CONFLICT** — sidebar vs bootstrap entry |
| 4 | `Routing_And_Guards` legacy `/admin/tenant/:id/*` | Old tenant-context routes | `/admin/tenants/:id/configure/*` | **SUPERSEDED** — legacy marked deprecated |
| 5 | Historical "selected-tenant mandatory YES" (external) | All ops mandatory | Capability required; individual steps conditional | **NO_CONFLICT in SB** — never in active docs |
| 6 | Dashboard §13 | Outlet/till optional for activation | Unchanged — ops don't block activation | **NO_CONFLICT** |
| 7 | Flow 05 collection point step | SA marks collection at outlet create | Collection via `fulfillment_method_outlets`; **deferred from SA bootstrap** | **UPDATED** — [[Selected_Tenant_Collection_Point_Contract]] |
| 8 | SA-J12–17 deck IDs | Active journey IDs | Macro flows 05–09; no SA-J12 IDs in register | **ARCHIVED_REFERENCE** — deck labels only |
| 9 | `platform.tenants.update` "tenant setup" | Generic permission | Granular `platform.tenants.bootstrap.*` | **UPDATED** — Permission_Code_List |
| 10 | Impersonation (none explicit) | — | Platform identity only; no TA impersonation | **NO_CONFLICT** — affirmed in contract |
| 11 | E-commerce SA bootstrap | Deck implied online store setup | **OUT OF SCOPE** Phase 1 | **UPDATED** — contract + hub card removed |

> Row 11 **SUPERSEDED 2026-08-12**: Optional SA Online Store bootstrap APPROVED ([[Selected_Tenant_Online_Store_Bootstrap_Contract]]; SA-UJ-057). Historical OUT OF SCOPE retained above for traceability. Click & Collect / FMO still Tenant Admin.
| 12 | `catalog.products.import` deferred for TA UI | No TA import UI | Platform bootstrap import under separate permission | **NO_CONFLICT** — different actor/surface |
| 13 | Included_Features "setup support" | Ambiguous mandatory | Required capability, conditional steps | **UPDATED** — operating model |
| 14 | Hub IN_PROGRESS state | Implied in prototypes | **Removed** — derived model only | **UPDATED** — Setup Hub Status Model |

## Remaining active authorities (ordered)

1. [[Selected_Tenant_Mode_Contract]]
2. [[ONEVERZ_SUPER_ADMIN_TENANT_CREATION_OPERATING_MODEL_CANONICAL]]
3. Gap closure contracts (collection, product bootstrap, import, hub status)
4. Macro flows 05–09 (child references only)
5. Implementation tracking (evidence, not scope override)

## Verdict

**No unresolved contradictory active authorities** for Selected-Tenant Phase 1 implementation scope.
