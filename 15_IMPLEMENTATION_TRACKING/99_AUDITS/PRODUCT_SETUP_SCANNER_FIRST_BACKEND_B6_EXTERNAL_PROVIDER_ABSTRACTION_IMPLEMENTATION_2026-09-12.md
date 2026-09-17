<!-- title: Product Setup Scanner-First Backend B6 External Provider Abstraction Implementation -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-12 -->
<!-- type: Implementation evidence — Backend B6 only; no Flutter; no B7 public endpoint -->

# PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B6_EXTERNAL_PROVIDER_ABSTRACTION_IMPLEMENTATION_2026-09-12

## Verdict

**BACKEND B6 EXTERNAL PROVIDER ABSTRACTION COMPLETE — READY FOR B7 EXTERNAL LOOKUP ENDPOINT**

Flutter: **NOT TOUCHED**.  
Public `POST .../barcodes/external-lookup`: **NOT IMPLEMENTED** (B7).  
No production external product-data provider invented. Zero-provider runtime → **NO_MATCH**.  
No migration. No Git/GitHub operations.

## Prerequisite gate

| Item | Status |
|---|---|
| B1–B5 | IMPLEMENTED (Second Brain + source) |
| `ProductBarcodeFormatValidator.Classify` | Present |
| B4 resolve / B5 SKU candidate | Present |
| `ProductWizardAccessPolicy` + `product_catalog` | Present |

## Provider inventory

| Search | Result |
|---|---|
| External barcode / GTIN / product metadata providers in `src/` | **None** for Product Setup |
| Existing Integrations | Google identity; Azure email only |
| HttpClient / Polly factory for CatalogProduct | **None** (no shared product-lookup client) |
| API keys / secrets for product lookup | **None configured** |

**Configured production provider(s):** **NO CONFIGURED PRODUCT LOOKUP PROVIDER**

## Abstractions

| Type | Name |
|---|---|
| Provider interface | `IExternalProductLookupProvider` |
| Coordinator interface | `IExternalProductLookupCoordinator` |
| Coordinator | `ExternalProductLookupCoordinator` |
| Options | `ExternalProductLookupOptions` / `ExternalProductLookupProviderOptions` |
| Suggestion model | `ExternalProductSuggestion` |
| Normalizer | `ExternalProductSuggestionNormalizer` |
| Infrastructure marker | `Integrations/ProductLookup/ProductLookupIntegrationMarker` (no adapter) |

## Outcomes

`FOUND` | `NO_MATCH` | `TEMPORARY_FAILURE`

### Ordering / mixed rules

1. Enabled providers only (options `Enabled=true` + registered implementation + `CanHandle`)
2. Order by `Priority` ascending, then `Name` ordinal
3. First normalized `FOUND` → return `FOUND` (`RetryAllowed=false`)
4. All completed `NO_MATCH` → `NO_MATCH`
5. Any `TEMPORARY_FAILURE` / timeout / contained exception without `FOUND` → `TEMPORARY_FAILURE` (`RetryAllowed=true`) — **conservative mixed rule**
6. Zero enabled providers → `NO_MATCH` (not throw, not TEMPORARY_FAILURE)

## Zero-provider evidence

Unit: `LookupAsync_ZeroConfiguredProviders_ReturnsNoMatch`  
Config: `ExternalProductLookup:Providers: []` in `appsettings.json`  
DI registers coordinator; `IEnumerable<IExternalProductLookupProvider>` empty by default.

## Normalized suggestion fields

`productName`, `shortName`, `brandText`, `categoryText`, `unitText`, `countryCode`, `shortDescription`, `longDescription`, `imageCandidate`, `primaryGtin`, `identifierStandard`  
+ coordinator `sourceReference`, `retryAllowed`

## Master-data / side effects

No Brand/Category/UOM/Product/Variant/Draft/ScanContext/Media writes.  
Suggestion texts only — no master IDs on model.  
Image URL candidate only (http/https); no download/stage/blob.

## Identifier handling

Request `Identifier` is `string` (leading zeros preserved).  
GTIN14 stays `identifierStandard`; symbology remains separate.  
Mismatched provider `primaryGtin` → reject FOUND (treated as NO_MATCH for that provider).

## Timeout / resilience

Per-provider `CancelAfter(TimeoutSeconds)` linked to caller token.  
Timeout / exception → contained `TEMPORARY_FAILURE`.  
Caller cancellation → `OperationCanceledException` propagated (not mapped to TEMPORARY_FAILURE).  
No Polly / no invented production `HttpClient` adapter (none required with zero providers).

## Security

No secrets in options model / appsettings / responses / Second Brain.  
Structured logs: provider name, outcome, timeout, identifier standard — not API keys/headers/payloads.

## Public API

**NO B7 PUBLIC EXTERNAL-LOOKUP ENDPOINT IMPLEMENTED**  
`TenantAdminProductsController` unchanged for external-lookup.

## Tests

| Suite | Result |
|---|---|
| B6 unit (coordinator + normalizer + options) | **27 passed** |
| Focused B6+B4+B5+policy+format | **102 passed** |
| CatalogProduct unit | **358 passed** |
| Full `E_POS.UnitTests` | **1738 passed, 0 failed** |
| CatalogProduct API | **94 passed** |
| Full `E_POS.ApiTests` | **546 passed, 0 failed** |
| CatalogProduct integration | **82 passed** |

## Database

**NO NEW MIGRATION / NO NEW TABLE**

## Source files

- `.../Contracts/IExternalProductLookupProvider.cs`
- `.../Contracts/IExternalProductLookupCoordinator.cs`
- `.../Dtos/ExternalLookup/ExternalProductLookupModels.cs`
- `.../Options/ExternalProductLookupOptions.cs`
- `.../Services/ExternalProductLookupCoordinator.cs`
- `.../Services/ExternalProductSuggestionNormalizer.cs`
- `Application/DependencyInjection.cs`
- `Infrastructure/DependencyInjection.cs`
- `Infrastructure/Integrations/ProductLookup/ProductLookupIntegrationMarker.cs`
- `Api/appsettings.json` (`ExternalProductLookup` empty providers)
- Unit tests under `tests/E_POS.UnitTests/CatalogProduct/ExternalProductLookup*`

## Second Brain updated

SOT, checklist, gap matrix, Architecture, API_ENDPOINTS (route still TARGET), Feature Status Index, this audit.

## Remaining

B7 public external-lookup endpoint onward.

## Git / GitHub

**NO GIT / GITHUB / BRANCH / COMMIT / PUSH / PR OPERATION PERFORMED**
