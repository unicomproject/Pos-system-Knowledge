<!-- title: Receipt Template Resolution and Snapshot Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-05 -->

# Receipt Template Resolution and Snapshot Contract

## 1. Current Backend State
The backend possesses the database schema foundation for receipt templates and versions, but the runtime template resolution, `receipt_template_version_id` population, and `receipt_data_json` generation are only partially implemented. The current checkout success and receipt detail DTOs do not yet expose a typed resolved receipt snapshot.

## 2. Required Resolution Service Responsibilities
A resolution service must:
- Resolve the appropriate active receipt template based on assignment scope (Device > Till > Outlet > Tenant Base > System Fallback).
- Retrieve tenant and outlet branding at the time of creation.
- Construct the `receipt_data_json` snapshot by merging transaction facts and template data.

## 3. Receipt Creation Sequence
1. Resolve active receipt template.
2. Resolve tenant/outlet branding.
3. Merge template configuration with completed transaction facts.
4. Validate resolved receipt document against schema.
5. Save `receipt_template_version_id`.
6. Save immutable `receipt_data_json`.
7. Return receipt identity and renderable receipt snapshot.

## 4. Versioned Snapshot Schema
The logical receipt snapshot stored in `receipts.receipt_data_json` must follow this versioned, typed contract:

- `contractVersion`: Schema version.
- `templateVersionId`, `templateCode`, `paperSize`: Template metadata.
- `branding`: `merchantName`, `tradingName`, `logoUrl`, `outletName`, `addressLines`, `phone`, `email`, `taxRegistration`.
- `receiptIdentity`: `receiptId`, `receiptNumber`, `saleId`, `saleNumber`, `receiptType`, `issuedAt`, `businessDate`.
- `operator`: `cashierId`, `cashierName`, `tillId`, `tillName`, `posDeviceId`.
- `items`: Collection of `{ productName, variantName, sku, quantity, unitPrice, discount, tax, lineTotal }`.
- `totals`: `subtotal`, `discount`, `tax`, `charges`, `rounding`, `total`, `paid`, `cashReceived`, `changeDue`.
- `tenders`: Collection of `{ paymentMethod, amount, safeReference }`. (No secrets or raw card data).
- `presentation`: `labels`, `sectionVisibility`, `alignment`, `emphasis`, `barcodeVisibility`, `qrVisibility`, `footerMessage`, `thankYouMessage`.
- `copyPolicy`: Copy configuration.

## 5. API Response Exposure & Exact Decision
## 5. Implemented Code Paths & exact status
The backend capability is currently **Partially Implemented**. 

### Implemented Now
- **Interface Path**: `src/E_POS.Application/Modules/Tenant/POSOperations/Contracts/IReceiptTemplateResolutionService.cs`
- **Implementation Path**: `src/E_POS.Infrastructure/Modules/Tenant/POSOperations/Services/ReceiptTemplateResolutionService.cs`
- **DI Registration Path**: `src/E_POS.Infrastructure/DependencyInjection.cs`
- **Resolution Service Method**: `ResolveTemplateAsync`
- **Exact DTO Properties Added**: 
  - `PosCheckoutStartPaymentResponseDto.ReceiptDataJson`
  - `PosReceiptDetailDto.ReceiptDataJson`
  - `ResolvedReceiptTemplateDto`
- **Actual resolution priority**: PosDevice -> Till -> Outlet -> Tenant Default
- **Actual fallback behavior**: Returns static JSON string: `{"type":"system_fallback","components":[]}` if no assignment found.
- **Checkout Response**: `PosCheckoutStartPaymentResponseDto` exposes `ReceiptDataJson`.
- **Idempotent Replay Response**: `PosCheckoutStartPaymentResponseDto` exposes `ReceiptDataJson`.
- **Receipt Detail**: `PosReceiptDetailDto` exposes `ReceiptDataJson`.
- **Build Status**: `dotnet build --no-restore` Passed (0 Errors).
- **Test Status**: `dotnet test` Passed (25 tests total passed, 0 failed).

### Still Pending
- **Checkout Integration Gap**: `PosCheckoutRepository` injects `IReceiptTemplateResolutionService` but does not actually call it. It currently still builds a static anonymous JSON object instead of merging with the resolved template.
- **Persistence Gap**: `receipt_template_version_id` is NOT persisted during checkout because the service is not called.
- **Management APIs**: Tenant Admin CRUD controllers for templates do not exist.
- **Database Runtime Validation**: Not Run.
- **Runtime API Validation**: Not Run.

## 6. DTO Mapping
The resolved snapshot must be accurately mapped to the `PosCheckoutStartPaymentResponseDto` and `PosReceiptDetailDto` to ensure the Flutter frontend relies on the backend output. Currently, the DTO fields exist and carry the legacy/static snapshot.

## 7. Error Handling & Observability
- All template resolution attempts (and fallbacks) must be logged for observability. (Pending)

## 8. Caching and Print Consistency
- Resolved snapshots are strictly immutable; they are cached/stored long-term for accurate historical reprints. (Implemented for legacy structure, pending for true template structure).

## 9. Implementation Status
Backend Implementation: **Partial** (Foundation & Services exist, but core wiring in Checkout is pending).
Flutter Implementation: **Not Started**.
