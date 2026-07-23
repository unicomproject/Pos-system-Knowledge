<!-- title: Payment & Refund Functional Rules -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-07-17 -->

# Payment & Refund Functional Rules

## Purpose

Defines business and UX rules for `Payment_Refund` in the new TM-EPOS MVP scope.
These rules must be applied before creating backend APIs, Flutter screens,
responsive online store screens, Angular/admin screens, tests, or database changes.

## Business Rules

- Cash, card, QR, and split payments are supported by configured payment methods.
- Sensitive card data must never be stored.
- Payment event history records provider and device outcomes safely.
- Refund amount cannot exceed allowed refundable amount.
- Offline mode cannot finalize card/QR payment or refund approval.

## POS checkout payment persistence (safe card tips)

Verified Unified-Commerce rules (2026-07-17):

- Cash completions use `PosCompletedPaymentPersistence.CreateCash`. Do not fabricate
  `cardBrand`, `cardLast4`, or masked references for cash.
- Successful provider/terminal captures use
  `PosCompletedPaymentPersistence.CreateProviderCapture` only after authorization
  succeeds. Do not mark payment `PAID` when provider authorization failed.
- Field separation:
  - `sales_payments.external_reference` → provider/terminal transaction id (not for UI display)
  - `sales_payment_transactions.external_transaction_reference` → same provider transaction id
  - `sales_payment_transactions.provider_response_json` → **sanitized only**
    `{"cardBrand":"...","cardLast4":"####"}` (exactly four numeric digits for last4)
- No migration / no new columns: existing attributes are reused.
- Prohibited persistence: full PAN, CVV/PIN, track/EMV raw payloads, provider secrets,
  access tokens, raw unfiltered provider responses in application logs or
  `provider_response_json`.
- Production checkout currently blocks non-cash with `pos_checkout.payment_provider_required`
  until a real provider adapter is integrated. Persistence mapping is ready for real
  successful provider outcomes; tests use domain factories/fakes only.

## Return Step 1 / Step 2 masked payment display

- Search and eligibility both project via the same `LoadPaymentDisplaysAsync` rule.
- Card mask format: `•••• {last4}` when a verified last4 exists.
- Payment method label prefers normalized brand (Visa/Mastercard/Amex) when present.
- Never truncate a long provider token to invent last4.
- Cash / non-card: `maskedCard` is empty; show method name only.
- Split payments: deterministic `paymentMethod = Multiple`, `maskedCard` empty.
- Only `PAID` / `PARTIALLY_REFUNDED` payments are considered; order by `PaidAt`, then `Id`.
- Flutter renders backend `paymentMethod` + `maskedCard` only; never build masks from raw references.

## User Rules

| User Type | Rule |
|---|---|
| Platform Admin | May manage platform-owned setup only when platform permission exists |
| Tenant Admin | May manage tenant-owned configuration only when entitlement and permission pass |
| Cashier / Stall Operator | May perform POS actions only with outlet, trusted device, and till context |
| Customer | May access online store/customer actions only through customer-facing APIs |
| Backend Worker | May process derived records, sync, notifications, or reports using service identity and audit |

## UI Rules

- Show this module only when the tenant plan, feature entitlement, and user permission allow it.
- Use loading, empty, error, permission-denied, feature-disabled, offline, and conflict states where relevant.
- Do not hardcode role names such as cashier, manager, or administrator as authorization logic.
- Do not show fake data, fake counts, fake success states, or hardcoded module rows.
- Mobile, tablet, iPad, laptop, and desktop layouts must keep the same business rules.

## Backend Rules

- Resolve tenant context server-side for every tenant-owned mutation.
- Validate foreign-key ownership within the same tenant before saving.
- Use typed request/response DTOs and map them to domain models/entities.
- Return standard 400, 401, 403, 404, 409, and 500 responses.
- Never expose passwords, POS PINs, token hashes, payment secrets, card data, or cross-tenant records.

## Offline And Cache Rules

- Cache can speed up safe reference data only.
- Backend database remains final truth for sale totals, stock, payments, refunds, exchanges, permissions, and sync acceptance.
- Offline operations must be marked pending until accepted by backend sync.
- Conflicts must be visible; do not silently overwrite backend truth.

## Error Rules

| Case | Expected Behavior |
|---|---|
| Missing login | Return 401 and send user to login/session recovery |
| Permission denied | Return 403 and show access denied state |
| Feature disabled | Return 403 and show feature not enabled state |
| Invalid business data | Return 400 with safe field/form errors |
| Duplicate or conflict | Return 409 with safe conflict message |
| Offline blocked action | Explain that online backend validation is required |

## Out Of Scope

- Subscription invoice payment links
- Accounting settlement ledger
- Chargeback management
- PCI vault storage

## Related Files

- [[04_MODULE_KNOWLEDGE/24_Payment_Refund/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/24_Payment_Refund/03_Technical_Contract]]
