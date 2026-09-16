<!-- title: Product Setup Step 1 Scan Barcode Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-11 -->

# Product Setup — Step 1 Scan Barcode Test Cases

Authority: [[../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Setup_Scan_Barcode_Specification]],  
[[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11]],  
[[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]].

Status: **DOCUMENTATION TARGET** — not claimed executed.

| ID | Scenario | Expected |
|---|---|---|
| PS1-001 | USB/HID valid GTIN scan | One resolve request; preserve string; enter S1-B then `VALID_LOCAL_MATCH` or `VALID_NO_LOCAL_MATCH` |
| PS1-002 | Leading-zero barcode | Leading zeros preserved end-to-end |
| PS1-003 | GTIN-8 validation | Accept valid 8-digit checksum; reject bad checksum without catalogue call |
| PS1-004 | GTIN-12 validation | Accept valid 12-digit; `identifierStandard=GTIN12` |
| PS1-005 | GTIN-13 validation | Accept valid 13-digit; often `barcodeType=EAN13` when symbology known |
| PS1-006 | GTIN-14 validation | Accept valid 14-digit; `identifierStandard=GTIN14`; `barcodeType=UNKNOWN` when symbology not reported (never `GTIN14`, never a fake `EAN13`) |
| PS1-007 | Invalid length | S1-R2; no catalogue; no external |
| PS1-008 | Invalid checksum | S1-R2; no catalogue; no external |
| PS1-009 | Manual entry | Same resolve pipeline as HID |
| PS1-010 | Backspace/clear | Clears input; no API until Validate |
| PS1-011 | Rapid scanner framing | One completed frame → one request; no per-digit calls |
| PS1-012 | Local existing Product match | S1-C safe projection; tenant-isolated |
| PS1-013 | Local Variant-level identifier match | Shows variant label/SKU of matched identity, not parent mislabeled SKU |
| PS1-014 | Safe existing Product projection | Available under create without requiring catalogue.view |
| PS1-015 | View permission denied | View Product hidden/403; conflict still visible if create allowed |
| PS1-016 | Edit permission denied | Edit Existing hidden/403 |
| PS1-017 | No local match | S1-D; retain validated barcode |
| PS1-018 | External lookup found | S1-F normalized suggestion; editable |
| PS1-019 | External lookup partial data | Prefill only available fields |
| PS1-020 | External lookup no match | S1-G with four recovery actions only |
| PS1-021 | Provider timeout | TEMPORARY_FAILURE; manual continue retained |
| PS1-022 | Provider unavailable | Same as timeout; no dead-end; no secret leakage |
| PS1-023 | External Brand does not exist | No auto brandId; suggestion text only |
| PS1-024 | External Category does not exist | No auto categoryId; no auto-create |
| PS1-025 | Use This Product prefill | DRAFT + Step 2; prefill editable; GTIN retained |
| PS1-026 | Create Manually retains GTIN | Step 2; ignore external fields; keep GTIN |
| PS1-027 | Scan Another Barcode | Return S1-A; clear prior candidate |
| PS1-028 | Create Without Barcode | S1-R3 cards OWN_MADE / SERVICE_FEE / UNLABELLED |
| PS1-029 | Own-made | Persists no-barcode reason; not product_structure |
| PS1-030 | Service/Fee | Same |
| PS1-031 | Unlabelled | Same |
| PS1-032 | Auto-generate SKU candidate | Candidate shown; unique request |
| PS1-033 | Generated SKU conflict | Server rejects/regenerates; no overwrite of user edit |
| PS1-034 | Variant final SKU uniqueness | Step 5 requires unique per included variant |
| PS1-035 | Scanned GTIN assignment to correct Variant | Explicit assign; no silent fan-out |
| PS1-036 | Duplicate GTIN blocked | Never publish two tenant records with same barcode |
| PS1-037 | Duplicate product clone clears identifiers | New draft; SKU/GTIN cleared; not alias of Edit |
| PS1-038 | Back navigation | State machine back rules; no orphan drafts from scans |
| PS1-039 | Cancel | Exit without draft unless already created |
| PS1-040 | Double-click prevention | No double draft / double resolve storm |
| PS1-041 | Draft creation on transition to Basic Details | `current_setup_step=2` + scan context |
| PS1-042 | Legacy draft resume/mapping | D11 remapping at read time; `acquisition_mode = LEGACY` |
| PS1-043 | Row-version concurrency | 409 on stale expectedRowVersion after draft exists |
| PS1-044 | Tenant isolation | Cross-tenant barcode never matches |
| PS1-045 | 403 permission | Missing create/entitlement → 403 |
| PS1-046 | External data cannot silently create master data | Brand/Category/UOM not auto-created |
| PS1-047 | 1024×768 responsive | No overflow; shared shell intact |
| PS1-048 | Keyboard/accessibility | Focus, labels, errors not colour-only |
| PS1-049 | Step 7 publish revalidation | Final identifier uniqueness rechecked |
| PS1-050 | Do not call POS by-barcode | Tenant Admin uses resolve API only |

## Chunk 2 — Technical Contract Scenarios (DOCUMENTATION TARGET)

Added 2026-09-12. Authority: [[../../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]]. **Not claimed executed; no test code written in production repositories.**

| ID | Scenario | Expected |
|---|---|---|
| PS1-T01 | Valid GTIN, no local match | `outcome = VALID_NO_LOCAL_MATCH`; no `localMatch`; no rows created |
| PS1-T02 | Valid GTIN, local match at PRODUCT level | `VALID_LOCAL_MATCH`, `matchedAt = PRODUCT`; safe projection only |
| PS1-T03 | Valid GTIN, local match at VARIANT level | `matchedAt = VARIANT`; SKU/label are the **matched variant's**, never the parent |
| PS1-T04 | Invalid checksum | `outcome = INVALID`, `invalidReason = CHECKSUM_FAILED`; **no** catalogue lookup performed |
| PS1-T05 | Unsupported length | `INVALID`, `LENGTH_NOT_SUPPORTED`; HTTP 200, not 4xx |
| PS1-T06 | Empty / whitespace barcode | `INVALID`, `EMPTY`; no lookup |
| PS1-T07 | `inputMode = SCAN` vs `MANUAL` | Identical validation strictness and identical outcome for the same value |
| PS1-T08 | Resolve is side-effect free | No `products`, `product_barcodes`, or `product_setup_scan_context` row created |
| PS1-T09 | Resolve never calls external provider | Provider adapter not invoked during resolve |
| PS1-T10 | External lookup never checks tenant duplicates | No catalogue duplicate query issued from external-lookup |
| PS1-T11 | Leading-zero preservation | `00012345670` style values never numeric-parsed or truncated end-to-end |
| PS1-T12 | GTIN-13 with reported symbology | `identifierStandard = GTIN13`, `barcodeType = EAN13` |
| PS1-T13 | GTIN-14 without reported symbology | `identifierStandard = GTIN14`, `barcodeType = UNKNOWN`; `GTIN14` rejected as a `barcode_type` value |
| PS1-T14 | Non-GTIN CODE128 value | `identifierStandard = OTHER`, `barcodeType = CODE128` |
| PS1-T15 | Legacy barcode row with NULL `identifier_standard` | Reads succeed; NULL tolerated; no crash and no forced backfill |
| PS1-T16 | Zero external providers configured | Public status **`NO_MATCH` only**; no fourth Flutter status; no crash, no endless spinner |
| PS1-T46 | Pre-draft SKU candidate API | `POST .../sku-candidates/generate` returns `reserved: false`; no Product/variant/scan-context/reservation row created |
| PS1-T47 | Wizard draft create route | Creation-path uses `POST .../products/draft` (not `POST .../products`) and lands at `current_setup_step = 2` |
| PS1-T17 | One provider returns a match | `FOUND` with normalized provider-neutral suggestion only |
| PS1-T18 | Multiple providers configured | Coordinator resolves deterministically; no duplicate suggestion merge conflicts |
| PS1-T19 | Provider timeout | `TEMPORARY_FAILURE`, `retryAllowed = true`; manual continuation available |
| PS1-T20 | Provider error payload | No raw provider DTO, secret, token, header, or stack trace in the response |
| PS1-T21 | External image candidate accepted | Server-side fetch → validated → `media_assets` STAGED → linked on save |
| PS1-T22 | External image wrong MIME / oversize | Rejected non-fatally; Product Setup continues without the image |
| PS1-T23 | External brand/category text ambiguous | No auto-resolve to tenant ID; user selection required; nothing auto-created |
| PS1-T24 | Draft bootstrap — scan path | DRAFT + scan context `acquisition_mode = SCAN`; `current_setup_step = 2` |
| PS1-T25 | Draft bootstrap — external-confirmed path | Same pipeline; confirmed normalized prefill persisted; raw payload not stored |
| PS1-T26 | Draft bootstrap — no-barcode path | `acquisition_mode = NO_BARCODE` + `no_barcode_reason`; `product_structure` untouched |
| PS1-T27 | Resume draft with scan context | Scan context hydrated; step restored after remapping |
| PS1-T28 | Resume legacy draft with no scan context | Valid; represented as `acquisition_mode = LEGACY`; resume not blocked |
| PS1-T29 | Legacy old-step-5 identifiers | Hydrate into Step 5 identifier section with **no** identifier loss |
| PS1-T30 | No-barcode SKU candidate is not reserved | No reservation row/sequence burn; abandoning the wizard reserves nothing |
| PS1-T31 | User-edited SKU never overwritten | Regeneration does not replace a user-entered SKU |
| PS1-T32 | Two admins, same new GTIN | Both get `VALID_NO_LOCAL_MATCH`; second save/publish → 409; never a duplicate row |
| PS1-T33 | Stale `expectedRowVersion` | 409 with draft preserved |
| PS1-T34 | Publish revalidation | SKU + barcode uniqueness, config, pricing/tax, permission, entitlement, row version all re-checked |
| PS1-T35 | Step 1 result not trusted at publish | Publish re-queries; a stale `VALID_NO_LOCAL_MATCH` cannot bypass uniqueness |
| PS1-T36 | Permission — legacy grant only | `tenant.products.create` alone satisfies the canonical check via one-way alias |
| PS1-T37 | Permission — canonical grant only | `catalog.products.create` alone satisfies the check |
| PS1-T38 | Permission — neither grant | 403; resolve/external-lookup both denied |
| PS1-T39 | Reverse alias forbidden | A `catalog.*` grant is never translated into `tenant.products.*` authority |
| PS1-T40 | Missing `product_catalog` entitlement | 403 with entitlement code, not disguised as 404 |
| PS1-T41 | Cross-tenant product id | 404; existence never disclosed via 403 |
| PS1-T42 | Duplicate projection scope | Conflict details tenant-scoped only; no cross-tenant leakage |
| PS1-T43 | Unauthenticated call | 401 with no resource hint |
| PS1-T44 | Malformed payload | 422 field-level errors; no SQL/stack trace/internal resolver state |
| PS1-T45 | Duplicate Product action | New DRAFT; barcodes/SKUs/stock/audit not cloned; cannot publish until unique identifiers exist |
