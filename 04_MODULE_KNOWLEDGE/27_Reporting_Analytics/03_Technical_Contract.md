<!-- title: Reporting & Analytics Technical Contract -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Reporting & Analytics Technical Contract

## Purpose

Defines the implementation contract for `Reporting_Analytics`. This contract is based on
new TM-EPOS MVP scope images and the uploaded Unified Commerce database design.

## API Contract

| Area | Contract |
|---|---|
| API groups | `/api/v1/reports/sales`, `/api/v1/reports/products`, `/api/v1/reports/inventory`, `/api/v1/reports/orders`, `/api/v1/reports/exports`, `/api/v1/analytics/dashboard` |
| Request format | Typed request DTOs; no raw map payloads in application layer |
| Response format | Typed response DTOs with safe fields only |
| Error format | Standard API error response |
| Tenant context | Resolved server-side for tenant-owned records |
| Auth | Staff/customer/platform auth boundary must match module surface |

## API Groups

| API Group | Purpose |
|---|---|
| `/api/v1/reports/sales` | Module API group |
| `/api/v1/reports/products` | Module API group |
| `/api/v1/reports/inventory` | Module API group |
| `/api/v1/reports/orders` | Module API group |
| `/api/v1/reports/exports` | Module API group |
| `/api/v1/analytics/dashboard` | Module API group |

## Database Contract

| Table | Contract |
|---|---|
| `daily_sales_summaries` | Used by this module |
| `daily_payment_summaries` | Used by this module |
| `daily_inventory_summaries` | Used by this module |
| `daily_discount_return_summaries` | Used by this module |
| `report_export_jobs` | Used by this module |
| `sales_orders` | Used by this module |
| `sales_payments` | Used by this module |
| `inventory_balances` | Used by this module |

Entity mappings must preserve exact table names, column names, tenant foreign keys,
unique constraints, CHECK constraints, hash-only token rules, and append-only
history/ledger behavior where applicable.

## Frontend Contract

- Use feature-owned folders and typed services/providers.
- Widgets/components must not call HTTP APIs directly.
- Use DTOs in data layer, domain/view models in UI layer.
- Permission and entitlement checks are UX helpers only; backend remains final authority.
- Browser online store and Flutter business app must share backend rules but keep separate user/auth surfaces.

## Backend Contract

- Controllers stay thin.
- Application services own use cases.
- Domain entities/value objects hold stable business invariants.
- Repository interfaces stay in application layer; EF implementations stay in infrastructure layer.
- Audit/event rows are written for sensitive state changes.
- Idempotency keys are required for retryable commands that can create duplicates.

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

- Full accounting reports
- Predictive AI analytics
- General ledger
- Cross-tenant data visibility

## Related Files

- [[04_MODULE_KNOWLEDGE/27_Reporting_Analytics/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/27_Reporting_Analytics/02_Functional_Rules]]
