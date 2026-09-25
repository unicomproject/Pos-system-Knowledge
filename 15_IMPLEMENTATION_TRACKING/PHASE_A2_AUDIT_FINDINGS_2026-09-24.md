# VARIANT PRODUCT → QUANTITY TRACKING
## Backend Audit & Verification — Phase A.2
**Date:** 2026-09-24

---

## EXECUTIVE SUMMARY

**Status:** VARIANT Quantity Opening Stock backend is **SUBSTANTIALLY COMPLETE**.

### Existing Reusable Components

#### 1. Data Model (DTOs)
- ✅ **OpeningStockDraftDto** — Root container for draft
- ✅ **OpeningStockOwnerDraftDto** — Per-variant owner with:
  - `VariantId` (Guid?)
  - `OpeningQuantity` (decimal)
  - `Allocations` (list of OutletAllocationDraftDto)
- ✅ **OutletAllocationDraftDto** — Per-outlet allocation:
  - `OutletId` (Guid)
  - `Quantity` (decimal)

#### 2. Domain Model (Entities)
- ✅ **Product.QuantityDraftPayload** (string?) — JSON persistence field
- ✅ **Product.UpdateQuantityDraftPayload()** — Setter method
- ✅ **Product.TrackInventory** (bool) — Tracking flag
- ✅ **Product.InventoryMethod** (string?) — Tracking method ("QUANTITY")
- ✅ **ProductVariant** — Full entity with:
  - `Id` (Guid) — identity
  - `ProductId` — parent reference
  - `TenantId` — tenant isolation
  - `IsDefaultVariant` (bool) — for SIMPLE products
  - `IsSellable` (bool) — sellable filter
  - `Status` — lifecycle control

#### 3. Serialization/Deserialization
- ✅ **ProductSetupCompatibilityHelper.SerializeQuantityDraft()** — Draft → JSON
- ✅ **ProductSetupCompatibilityHelper.DeserializeQuantityDraft()** — JSON → Draft
- ✅ **ProductSetupCompatibilityHelper.MapPolicyToTrackingMethod()** — Tracking method resolution

#### 4. Validation
- ✅ **TenantAdminProductRequestValidator.ValidateProductTypeTrackingSaveDraft()** — Draft-save validation:
  - Negative quantity rejection
  - Zero quantity → no allocations allowed
  - Over-allocation rejection (during draft)
  - Under-allocation allowed (during draft)
  - Duplicate outlet rejection (same variant)
  - Allocation quantity > 0 enforcement
  - Validates both save AND continue scenarios

- ✅ **TenantAdminProductRequestValidator.ValidateQuantityTracking()** — Per-variant validation:
  - Exact per-variant reconciliation on continue
  - Detects incomplete variants

#### 5. Persistence & Rehydration
- ✅ **TenantAdminProductRepository.SaveProductDraftAsync()** — Persists QuantityDraft to JSON
- ✅ **TenantAdminProductRepository.GetSetupAsync()** — Returns ProductSetupWizardDto with:
  - `TrackingMethod` (string?) — "QUANTITY"
  - `QuantityDraft` (OpeningStockDraftDto?) — deserialized from JSON
  - Complete variant context
  - Pricing/tax context

#### 6. Publishing Orchestration
- ✅ **TenantAdminProductService.PublishAsync()** (lines 895–1108):
  - Permission check: `StockPermissions.OpeningStock` only if positive opening quantity
  - For each StockOwner with OpeningQuantity > 0:
    - Validates exact reconciliation: `SUM(allocations) == OpeningQuantity`
    - Validates zero variants have no allocations
    - Outlet authorization: `ValidateUserOutletSelectionAsync()`
    - For each allocation:
      - Generates idempotency key: `PUBLISH-OPENING-STOCK-{productId}-{variantId}-{outletId}`
      - Creates OpeningStockRequest with ProductId, VariantId, Quantity
      - Calls `IOpeningStockService.AddOpeningStockAsync()`
    - Transaction wraps entire publish (ExecuteInTransactionAsync)

#### 7. Inventory Integration
- ✅ **OpeningStockService.AddOpeningStockAsync()** (existing inventory service):
  - Accepts `OpeningStockLineRequest` with ProductId, VariantId, Quantity
  - Validates outlet exists
  - Checks 0-stock rule (no existing balance)
  - Verifies idempotency key (no duplicate processing)
  - Delegates to ICurrentStockRepository.AddOpeningStockAsync()
  - Logs audit event

#### 8. Authorization & Access Control
- ✅ **Outlet Authorization:** `ITenantAdminUserRepository.ValidateUserOutletSelectionAsync()`
  - Already integrated in PublishAsync (lines 1046–1050)
  - Returns ValidUserOutletSelectionResult with IsValid flag

- ✅ **Permission: StockPermissions.OpeningStock**
  - Already checked in PublishAsync (lines 1007–1013)
  - Only required if ANY variant has OpeningQuantity > 0
  - Zero-only publishes do NOT require permission

---

## AUDIT FINDINGS

### What's Already Working (Green Path)

#### A. Draft Persistence
```
SaveProductDraftRequest.QuantityDraft (OpeningStockDraftDto)
→ ProductSetupCompatibilityHelper.SerializeQuantityDraft(draft)
→ Product.UpdateQuantityDraftPayload(json)
→ Database: Product.QuantityDraftPayload (JSONB)
```

#### B. Draft Rehydration
```
Product.QuantityDraftPayload (JSONB from DB)
→ ProductSetupCompatibilityHelper.DeserializeQuantityDraft(json)
→ ProductSetupWizardDto.QuantityDraft (OpeningStockDraftDto)
→ Client GET /setup response
```

#### C. Validation Workflow
```
Save Draft:
  - Negative → REJECT
  - Over-allocation → REJECT
  - Under-allocation → ALLOW
  - Zero + allocations → REJECT
  - Duplicate outlet (same variant) → REJECT

Continue/Publish:
  - Per-variant reconciliation (Allocated == Opening OR Opening == 0)
  - Each variant independently validated
```

#### D. Publishing Workflow
```
For each positive Variant (OpeningQuantity > 0):
  - Verify allocations sum exactly equals opening quantity
  - For each outlet allocation:
    - Check user has outlet access
    - Create idempotent opening stock request
    - Call OpeningStockService
    - Committed atomically in transaction
    
For zero variants (OpeningQuantity == 0):
  - Skip OpeningStockService call
  - No stock ledger entry
  - Variant published normally
```

#### E. Idempotency
- Key format: `PUBLISH-OPENING-STOCK-{productId}-{variantId}-{outletId}`
- Checked in OpeningStockService before processing
- Unique per Product + Variant + Outlet combination
- Already prevents double-stock on retry

#### F. Atomicity
- Entire publish wrapped in `ExecuteInTransactionAsync()`
- All OpeningStockService calls within transaction
- Partial failure rolls back completely

---

## CRITICAL VERIFICATION POINTS

### 1. VariantId Mapping (During Publish)
**Status:** ⚠️ NEEDS VERIFICATION

**Current Implementation (lines 1036–1084):**
```csharp
foreach (var alloc in outletGroup)
{
    if (alloc.Quantity > 0)
    {
        var variantIdStr = alloc.VariantId?.ToString() ?? "default";
        var idempotencyKey = $"PUBLISH-OPENING-STOCK-{productId}-{variantIdStr}-{outletId}";
        
        var openingStockRequest = new OpeningStockRequest
        {
            ...
            Items = new List<OpeningStockLineRequest>
            {
                new()
                {
                    ProductId = productId,
                    VariantId = alloc.VariantId,  // ← FROM DRAFT
                    Quantity = alloc.Quantity,
                    ...
                }
            },
            IdempotencyKey = idempotencyKey
        };
```

**Question:**
- Is `alloc.VariantId` guaranteed to match persisted ProductVariant.Id?
- Or is it a draft-time identity (clientCombinationKey or temporary)?

**Required Check:**
- If using clientCombinationKey: need mapping to persisted ProductVariantId
- If using ProductVariantId directly: verify it comes from existing variant set

### 2. Variant Authorization
**Status:** ⚠️ NOT YET OBSERVED

**Missing:**
- No explicit check that Variant belongs to Product
- No explicit check that Variant belongs to Tenant
- No check that Variant is not archived/inactive

**Risk:**
- Cross-product variant reference (SHOULD BE REJECTED)
- Cross-tenant reference (SHOULD BE REJECTED)
- Draft could reference invalid variant

**Action Required:**
- Add variant validation loop before OpeningStockService calls
- Verify each draft StockOwner.VariantId against generated product variants

### 3. Outlet Validation Coverage
**Status:** ✅ PARTIALLY VERIFIED

**What's Implemented:**
- Line 1046: `ValidateUserOutletSelectionAsync()` called for each outlet group
- Returns failure if outlet unauthorized

**What's Missing:**
- No explicit check: "outlet belongs to same tenant as product"
- Assumes ValidateUserOutletSelectionAsync() handles it (likely true)
- No check for outlet status (active/inactive)

**Action Required:**
- Verify ValidateUserOutletSelectionAsync() enforces tenant isolation
- Add explicit outlet-exists check if not guaranteed

### 4. Zero Variant Behavior
**Status:** ✅ VERIFIED

**Implementation (lines 1018–1019, 1062):**
```csharp
if (owner.OpeningQuantity > 0)
{
    // Only process positive variants
    if (alloc.Quantity > 0)
    {
        // Only create OpeningStockRequest if quantity > 0
```

**Result:**
- Zero variants skip OpeningStockService entirely
- No stock ledger entry created
- Product published normally
- ✅ CORRECT

### 5. Draft Rehydration (Zero Variants)
**Status:** ✅ VERIFIED

**Test:** TenantAdminProductQuantityDraftServiceTests.cs
```csharp
[Fact]
public void SerializeQuantityDraft_ZeroQuantity_RoundTripsCorrectly()
{
    var draft = new OpeningStockDraftDto
    {
        StockOwners = new List<OpeningStockOwnerDraftDto>
        {
            new OpeningStockOwnerDraftDto
            {
                OpeningQuantity = 0,
                Allocations = new List<OutletAllocationDraftDto>()
            }
        }
    };
    
    var json = ProductSetupCompatibilityHelper.SerializeQuantityDraft(draft);
    var restored = ProductSetupCompatibilityHelper.DeserializeQuantityDraft(json);
    
    Assert.NotNull(restored);
    Assert.Single(restored!.StockOwners);
    Assert.Equal(0, restored.StockOwners[0].OpeningQuantity);
    Assert.Empty(restored.StockOwners[0].Allocations!);
}
```

**Result:** ✅ PASSING

---

## EXISTING TEST COVERAGE

### Unit Tests
- ✅ TenantAdminProductQuantityValidatorTests.cs:
  - Negative quantity rejection
  - Exact allocation (positive)
  - Under-allocation (draft OK, continue fails)
  - Over-allocation rejection
  - Duplicate outlet rejection

- ✅ TenantAdminProductQuantityDraftServiceTests.cs:
  - Serialization round-trip
  - Zero quantity round-trip

- ✅ ProductSetupCompatibilityHelperTests.cs (from Phase A.1):
  - Legacy step mapping (7→6)
  - JSONB serialization
  - hasScanContextRow discriminator

### Integration Tests
- ⚠️ TenantAdminProductServicePhaseDTests.cs — Publish scenarios
  - Some publish tests exist
  - May not cover per-variant specifics

---

## REMAINING GAPS (TO VERIFY/IMPLEMENT)

### Gap 1: Variant Authorization Validation
**Requirement 50:** Variant must belong to Product + Tenant

**Current State:** NOT IMPLEMENTED

**Action:**
```csharp
// In PublishAsync before OpeningStockService loop:
foreach (var owner in existing.QuantityDraft.StockOwners)
{
    if (owner.VariantId.HasValue)
    {
        var variant = await _productRepository.GetVariantAsync(
            context.TenantId,
            existing.ProductId,
            owner.VariantId.Value,
            cancellationToken);
        
        if (variant == null || variant.ProductId != existing.ProductId)
        {
            return ApplicationResult<ProductDraftResponse>.Failure(
                new ApplicationError("variant_not_found", "..."));
        }
    }
}
```

### Gap 2: Outlet Existence Validation
**Requirement 23:** Every outlet must exist in tenant

**Current State:** PARTIALLY COVERED

**Action:**
- Verify ValidateUserOutletSelectionAsync() covers all necessary checks
- Or add explicit outlet-exists check

### Gap 3: Per-Variant Reconciliation Tests (VARIANT Product)
**Current Tests:** Cover SIMPLE scenario (single owner in StockOwners)

**Missing:**
- Multiple variants with mixed zero/positive
- Independent allocation per variant
- Cross-variant allocation mismatch detection

### Gap 4: ProductVariant Count Preservation
**Requirement 40:** No phantom variants created

**Current State:** NOT CHECKED IN TEST

**Action:**
- Add test verifying variant count before/after publish

### Gap 5: Idempotency Cross-Variant Independence
**Requirement 34:** Variant A + Outlet and Variant B + Outlet are independent

**Current State:** Key format supports it: `PUBLISH-OPENING-STOCK-{productId}-{variantId}-{outletId}`

**Missing:**
- Test verification that retry of Variant A doesn't affect Variant B

---

## SIMPLE REGRESSION VERIFICATION

**Requirement 6:** SIMPLE behavior must NOT regress

### SIMPLE Product Case
- ProductStructure = "SIMPLE"
- Single ProductVariant with IsDefaultVariant = true
- QuantityDraft.StockOwners has single entry with VariantId = null (or default variant id)

### Current Fallback (Line 1064)
```csharp
var variantIdStr = alloc.VariantId?.ToString() ?? "default";
```

**Risk:** 
- What if SIMPLE draft stores VariantId as null?
- Does idempotency key become `PUBLISH-OPENING-STOCK-{productId}-default-{outletId}`?
- Will retry match if persisted ProductVariant has non-null VariantId?

**Action Required:**
- Verify SIMPLE product behavior doesn't cause idempotency mismatch

---

## SUMMARY TABLE

| Component | Status | Details |
|-----------|--------|---------|
| OpeningStockDraftDto | ✅ | Per-variant model complete |
| Domain model persistence | ✅ | QuantityDraftPayload field exists |
| Serialization | ✅ | Round-trip verified by tests |
| Save-draft validation | ✅ | Negative/over-allocation/duplicates covered |
| Continue validation | ✅ | Per-variant reconciliation enforced |
| Outlet authorization | ✅ | ValidateUserOutletSelectionAsync integrated |
| Permission check | ✅ | Only if OpeningQuantity > 0 |
| Publishing orchestration | ✅ | Idempotency + transaction |
| Zero variant handling | ✅ | No OpeningStockService call |
| Draft rehydration | ✅ | JSON → DTO round-trip |
| Variant authorization | ⚠️ | **NOT IMPLEMENTED** |
| Outlet existence check | ⚠️ | **PARTIAL** (depends on user repo) |
| Per-variant tests (VARIANT) | ⚠️ | **MINIMAL** (mostly SIMPLE scenarios) |
| ProductVariant count test | ❌ | **MISSING** |
| Idempotency cross-variant test | ❌ | **MISSING** |
| SIMPLE regression test | ❌ | **MISSING** explicit check |

---

## REQUIRED NEXT STEPS

**Phase B (Implementation & Verification):**

1. **Variant Authorization Check** — ADD to PublishAsync
2. **Outlet Existence Validation** — VERIFY OR ADD
3. **Per-Variant Tests** — CREATE (multiple variants scenario)
4. **Idempotency Tests** — CREATE (cross-variant independence)
5. **ProductVariant Count Test** — CREATE
6. **SIMPLE Regression Test** — CREATE or VERIFY
7. **Actual Inventory Balance Verification** — INTEGRATION TEST
8. **Build & Test** — dotnet build + test suite

**No database migration expected** — QuantityDraftPayload already exists from Phase A.1

---

## Files Identified

### Production (C#)
- `src/E_POS.Application/Modules/Tenant/CatalogProduct/Services/TenantAdminProductService.cs`
- `src/E_POS.Application/Modules/Tenant/CatalogProduct/Services/ProductSetupCompatibilityHelper.cs`
- `src/E_POS.Application/Modules/Tenant/CatalogProduct/Validators/TenantAdminProductRequestValidator.cs`
- `src/E_POS.Domain/Modules/Tenant/CatalogProduct/Entities/Product.cs`
- `src/E_POS.Domain/Modules/Tenant/CatalogProduct/Entities/ProductVariant.cs`
- `src/E_POS.Application/Modules/Tenant/Inventory/OpeningStock/Services/OpeningStockService.cs`

### Test (C#)
- `tests/E_POS.UnitTests/CatalogProduct/TenantAdminProductQuantityValidatorTests.cs`
- `tests/E_POS.UnitTests/CatalogProduct/TenantAdminProductQuantityDraftServiceTests.cs`
- `tests/E_POS.UnitTests/CatalogProduct/ProductSetupCompatibilityHelperTests.cs` (Phase A.1)
- `tests/E_POS.UnitTests/CatalogProduct/TenantAdminProductServiceTests.cs` (needs extension)

---

**STATUS:** Ready for Phase B implementation and verification.
