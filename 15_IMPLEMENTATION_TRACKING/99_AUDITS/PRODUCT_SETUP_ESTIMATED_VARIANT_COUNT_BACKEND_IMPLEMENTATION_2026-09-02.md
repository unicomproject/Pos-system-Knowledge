<!-- title: Product Setup Estimated Variant Count Backend Implementation -->

<!-- status: Active -->

<!-- system: OneVerz POS MVP Unified Commerce Scope -->

<!-- last_updated: 2026-09-02 -->



# Product Setup — Estimated Variant Count Backend Implementation (2026-09-02)



## Scope



Backend-only implementation aligned to Second Brain Section 3.4. No Flutter changes. No database migration.



## Phase 1 (Initial)



Core count validation, max-100 enforcement, and authoritative Cartesian generation on Step 4 draft save.



## Phase 2 — Final Backend P1 Closure (2026-09-02)



Closed remaining gaps:



1. **GET /setup variant rehydration** — `ProjectVariantConfigurationAsync` loads options, values, variants, mappings, excluded tombstones into `VariantConfigurationDto` for VARIANT products only.

2. **Catalog validation** — `ValidateVariantConfigurationCatalogAsync` bulk-loads templates/values and tenant-scoped product option IDs; rejects unknown, inactive, cross-product, and value-not-owned-by-attribute references.

3. **Hash canonicalization** — Persisted identity uses SHA-256 `opt:{id}|val:{id}` via `ProductVariantCombinationHashHelper.GenerateCanonicalHash`. Legacy MD5 preview hashes retained for reconciliation compatibility only. Pre-save generation uses `clientCombinationKey` + legacy MD5 matching; no new MD5 persistence.

4. **Full backend regression** — entire `E_POS.sln` test suite executed.



## Backend Files Changed



| File | Change |

|---|---|

| `Unified-Commerce/src/E_POS.Domain/Modules/Tenant/CatalogProduct/Constants/ProductConstants.cs` | Canonical alias `MaxVariantCombinationsPerProduct = MaxVariants` |

| `Unified-Commerce/src/E_POS.Domain/Modules/Tenant/CatalogProduct/Services/VariantCombinationCalculator.cs` | Authoritative fail-fast Cartesian count |

| `Unified-Commerce/src/E_POS.Domain/Modules/Tenant/CatalogProduct/Services/ProductVariantCombinationHashHelper.cs` | SHA-256 canonical hash + legacy MD5 compatibility helpers |

| `Unified-Commerce/src/E_POS.Domain/Modules/Tenant/CatalogProduct/Services/ProductVariantClientKeyHelper.cs` | Name-based client key helper for wizard SKU lookup |

| `Unified-Commerce/src/E_POS.Application/Modules/Tenant/CatalogProduct/Services/VariantConfigurationCombinationGenerator.cs` | Server-side generation; no MD5 persistence |

| `Unified-Commerce/src/E_POS.Application/Modules/Tenant/CatalogProduct/Services/VariantConfigurationValidationHelper.cs` | Shared limit + structural value-ownership validation |

| `Unified-Commerce/src/E_POS.Application/Modules/Tenant/CatalogProduct/Services/ProductVariantGenerationService.cs` | Rewired to canonical generator |

| `Unified-Commerce/src/E_POS.Application/Modules/Tenant/CatalogProduct/Services/TenantAdminProductService.cs` | Catalog validation + generation on Step 4; wizard-create catalog validation |

| `Unified-Commerce/src/E_POS.Application/Modules/Tenant/CatalogProduct/Validators/TenantAdminProductRequestValidator.cs` | Shared calculator for continue/draft limits |

| `Unified-Commerce/src/E_POS.Application/Modules/Tenant/CatalogProduct/Contracts/ITenantAdminProductRepository.cs` | `ValidateVariantConfigurationCatalogAsync` |

| `Unified-Commerce/src/E_POS.Infrastructure/Modules/Tenant/CatalogProduct/Repositories/TenantAdminProductRepository.Wizard.cs` | `ProjectVariantConfigurationAsync`, catalog validation, hash reconciliation in `SaveVariantsAsync` |

| `Unified-Commerce/src/E_POS.Infrastructure/Modules/Tenant/CatalogProduct/Repositories/TenantAdminProductRepository.WizardCreate.cs` | Variant lookup keys for wizard SKU assignment after canonical hash persistence |

| `Unified-Commerce/tests/E_POS.UnitTests/CatalogProduct/VariantCombinationCalculatorTests.cs` | Count, generation, validator tests |

| `Unified-Commerce/tests/E_POS.UnitTests/CatalogProduct/VariantConfigurationSetupClosureTests.cs` | **NEW** — round-trip, edit/reopen, catalog, hash, reconciliation tests |

| `Unified-Commerce/tests/E_POS.IntegrationTests/CatalogProduct/WizardProductCreatePostgreSqlTests.cs` | Assert canonical SHA-256 persisted hash + SKU mapping |



## Behaviour Implemented



- Server derives combination count from submitted `variantConfiguration.options[].values[]`.

- `GenerateAndReconcile` produces full Cartesian matrix on Step 4 draft save (VARIANT).

- `MaxVariantCombinationsPerProduct = 100` enforced server-side.

- `GET /setup` rehydrates variant configuration for VARIANT draft reopen (Colour/Capacity value counts reconstructable for Flutter Cartesian estimate).

- Catalog master + tenant-scoped product option/value validation on Step 4 save and wizard create.

- Persisted `option_combination_hash` is SHA-256 over sorted `opt:{productOptionId}|val:{productOptionValueId}` pairs.

- Same matrix save twice does not duplicate variants (reconciliation by variant ID, canonical hash, legacy MD5, client key).

- No `estimatedVariantCount` DTO field. No dedicated estimate API. SIMPLE unchanged.



## Test Results (Final Closure 2026-09-02)



| Suite | Result |

|---|---|

| Focused variant unit tests | 29/29 PASS |

| CatalogProduct unit tests | 243/243 PASS |

| API / Wizard tests (CatalogProduct filter) | 100/100 PASS |

| PostgreSQL / Catalog integration tests | 71/71 PASS |

| Full backend regression (`E_POS.sln`) | 2393/2393 PASS |



## Database Migration



**NO**



## Final Verdict



**BACKEND PRODUCT VARIANT ESTIMATED COUNT CONTRACT COMPLETE**

