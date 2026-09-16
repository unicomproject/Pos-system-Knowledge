<!-- title: Product Setup Scanner-First Backend B11 Publish Revalidation Implementation -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-13 -->
<!-- type: Implementation evidence — Backend B11 only; no Flutter; no Git -->

# PRODUCT SETUP SCANNER-FIRST — BACKEND B11 PUBLISH REVALIDATION (2026-09-13)

**BACKEND B11 PUBLISH REVALIDATION COMPLETE**

Flutter: **NOT TOUCHED**. No Git operations.

## 1. Scope

`POST /api/v1/tenant-admin/products/{id}/publish` — scanner-era final revalidation before lifecycle transition.

## 2. Implemented

| Concern | Behavior |
|---|---|
| Reload DRAFT | `GetSetupAsync` rebuilds publish request (unchanged) |
| Already published | Non-DRAFT → `product.already_published` (409) |
| Masters | Category required + ACTIVE/existing-mapping; Brand tenant-scoped; name required |
| Final SKU | Required per sellable variant; intra-request dup; `FindSkuConflictsAsync` |
| Final barcode | Optional; `ProductBarcodeFormatValidator.Classify`; ownership via `FindBarcodeConflictsAsync` |
| No B5/B6/B7 | Confirmed — publish does not call generators/providers |
| expectedRowVersion | Enforced on ReviewCreate repository branch |
| Pricing/tax | Existing `ValidatePublishPricingAsync` |
| Tracking identity | Existing `PublishInitialTrackingIdentityAsync` |
| Atomicity | Existing TX + SaveChanges; failure leaves DRAFT |

## 3. Tests

| Suite | Result |
|---|---|
| Publish unit (PublishAsync_*) | **5 passed** |
| Publish integration (stale rowVersion) | **1 passed** |
| CatalogProduct Unit | **440 passed** |
| CatalogProduct API | **110 passed** |
| CatalogProduct Integration | **105 passed** |
| Full UnitTests | **1820 passed** |
| Full ApiTests | **562 passed** |

## 4. Database

**NO NEW MIGRATION** · **NO NEW TABLE**

## 5. Status

B11 IMPLEMENTED · B12 closure follows
