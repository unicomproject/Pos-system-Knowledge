<!-- title: Payment & Refund Technical Contract -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-29 -->

# Payment & Refund Technical Contract

## Purpose

Defines the implementation contract for `Payment_Refund`. This contract is based on
new TM-EPOS MVP scope images and the uploaded Unified Commerce database design.

## POS Safe Card Metadata Contract (2026-07-17)

| Concern | Contract |
|---|---|
| Provider transaction id | `sales_payments.external_reference` + `sales_payment_transactions.external_transaction_reference` |
| Card brand / last4 | Sanitized JSON only in `sales_payment_transactions.provider_response_json` |
| UI mask | Backend builds `maskedCard` as `•••• {last4}`; Flutter must not invent masks |
| Schema change | None — reuse existing columns |
| Card boundary | `ICardPaymentGateway`; unavailable-by-default in production |
| Non-card methods | QR/Split fail explicitly; no cash fallback |
| Domain write helper | `PosCompletedPaymentPersistence` (+ `SafePaymentDisplay`) |

## API Contract

| Area | Contract |
|---|---|
| API groups | `/api/v1/payments`, `/api/v1/payment-transactions`, `/api/v1/refunds`, `/api/v1/pos/payments`, `/api/v1/storefront/payments` |
| Request format | Typed request DTOs; no raw map payloads in application layer |
| Response format | Typed response DTOs with safe fields only |
| Error format | Standard API error response |
| Tenant context | Resolved server-side for tenant-owned records |
| Auth | Staff/customer/platform auth boundary must match module surface |

## API Groups

| API Group | Purpose |
|---|---|
| `/api/v1/payments` | Module API group |
| `/api/v1/payment-transactions` | Module API group |
| `/api/v1/refunds` | Module API group |
| `/api/v1/pos/payments` | Module API group |
| `/api/v1/storefront/payments` | Module API group |

## Database Contract

| Table | Contract |
|---|---|
| `payment_methods` | Used by this module |
| `sales_payments` | Used by this module |
| `sales_payment_transactions` | Used by this module |
| `sales_payment_events` | Used by this module |
| `sales_refunds` | Used by this module |
| `sales_refund_payment_allocations` | Used by this module |
| `sales_refund_lines` | Used by this module |

Entity mappings must preserve exact table names, column names, tenant foreign keys,
unique constraints, CHECK constraints, hash-only token rules, and append-only
history/ledger behavior where applicable.

## Frontend Contract

- Use feature-owned folders and typed services/providers.
- Widgets/components must not call HTTP APIs directly.
- Use DTOs in data layer, domain/view models in UI layer.
- Flutter must not synthesize provider success or authoritative tender allocation.
- Permission and entitlement checks are UX helpers only; backend remains final authority.
- Browser online store and Flutter business app must share backend rules but keep separate user/auth surfaces.

## Backend Contract

- Controllers stay thin.
- Application services own use cases.
- Domain entities/value objects hold stable business invariants.
- Repository interfaces stay in application layer; EF implementations stay in infrastructure layer.
- Audit/event rows are written for sensitive state changes.
- Idempotency keys are required for retryable commands that can create duplicates.
- Provider capture must complete before the database sale transaction. Unknown
  provider state must not be converted into a paid sale.
- Split completion must be one atomic transaction across all
  `sales_payments`; current typed tender DTO alone does not meet this contract.

## Permission And Entitlement Contract

- Permission codes must be database-seeded and module-scoped.
- Do not create one giant global enum as the source of truth.
- Tenant feature entitlement must be checked before tenant staff permission where the feature is plan-controlled.
- Customer-facing actions use customer account/session rules, not tenant staff role permissions.

## Test Contract

Test coverage must include:

- Happy path for each primary API group.
- Missing authentication.
- Permission denied or customer access denied.
- Feature disabled / entitlement missing.
- Tenant isolation failure.
- Validation failure.
- Duplicate/conflict behavior.
- Safe error display.
- Audit/event/history creation where required.
- Offline/cache behavior where this module touches POS, checkout, order, inventory, payment, or sync.

## Implementation Sequence

1. Confirm scope and table coverage from this module file.
2. Create DTOs, validators, and application service methods.
3. Create repository interface and EF repository/mapping if missing.
4. Add entitlement, permission, tenant, outlet, till, device, customer, or offline checks as relevant.
5. Build frontend route/screen/component/provider/service.
6. Add loading, empty, error, denied, feature-disabled, offline, and conflict states.
7. Add unit/integration/API/widget tests.
8. Review against new TM-EPOS MVP module boundaries.

## Out Of Scope

- Subscription invoice payment links
- Accounting settlement ledger
- Chargeback management
- PCI vault storage

## Hardware Chunk 2C refund receipt contract (2026-07-29)

Historical refund printing uses the issued `REFUND` receipt and its
`receipt_data_json`; it does not call a payment provider or recalculate refund
value. The existing receipt reprint permission/reason endpoint authorizes one
controlled operation. Device policy then creates independently idempotent
customer/merchant copies and immutable audits. Only safe persisted references
may cross the Agent contract; PAN, CVV, PIN, credentials and arbitrary provider
payloads remain excluded.

## Related Files

- [[04_MODULE_KNOWLEDGE/24_Payment_Refund/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/24_Payment_Refund/02_Functional_Rules]]
