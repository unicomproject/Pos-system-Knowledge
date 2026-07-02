<!-- title: Hardware Operations, Till Session & Cash Control Technical Contract -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Hardware Operations, Till Session & Cash Control Technical Contract

## Purpose

Defines the implementation contract for `Hardware_Till_Cash_Control`. This contract is based on
new TM-EPOS MVP scope images and the uploaded Unified Commerce database design.

## API Contract

| Area | Contract |
|---|---|
| API groups | `/api/v1/hardware`, `/api/v1/tills/sessions`, `/api/v1/cash-movements`, `/api/v1/hardware-tests` |
| Request format | Typed request DTOs; no raw map payloads in application layer |
| Response format | Typed response DTOs with safe fields only |
| Error format | Standard API error response |
| Tenant context | Resolved server-side for tenant-owned records |
| Auth | Staff/customer/platform auth boundary must match module surface |

## API Groups

| API Group | Purpose |
|---|---|
| `/api/v1/hardware` | Module API group |
| `/api/v1/tills/sessions` | Module API group |
| `/api/v1/cash-movements` | Module API group |
| `/api/v1/hardware-tests` | Module API group |

## Database Contract

| Table | Contract |
|---|---|
| `hardware_devices` | Used by this module |
| `hardware_device_assignments` | Used by this module |
| `hardware_test_logs` | Used by this module |
| `till_sessions` | Used by this module |
| `cash_movement_types` | Used by this module |
| `cash_movements` | Used by this module |
| `cash_reconciliations` | Used by this module |
| `cash_count_denominations` | Used by this module |

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

- Full accounting ledger
- Bank deposit workflow
- Supplier payment handling
- Customer online checkout UI

## Related Files

- [[04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/02_Functional_Rules]]
