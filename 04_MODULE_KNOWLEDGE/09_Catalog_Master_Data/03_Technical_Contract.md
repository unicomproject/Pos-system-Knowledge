<!-- title: Catalog Master Data Technical Contract -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-07-03 -->

# Catalog Master Data Technical Contract

## Purpose

Defines the implementation contract for `Catalog_Master_Data`. This contract is based on
new TM-EPOS MVP scope images and the uploaded Unified Commerce database design.

## API Contract

| Area | Contract |
|---|---|
| API groups | `/api/v1/catalog/departments`, `/api/v1/categories`, `/api/v1/brands`, `/api/v1/collections`, `/api/v1/unit-of-measures`, `/api/v1/return-policies`, `/api/v1/platform/return-policy-templates` |
| Request format | Typed request DTOs; no raw map payloads in application layer |
| Response format | Typed response DTOs with safe fields only |
| Error format | Standard API error response |
| Tenant context | Resolved server-side for tenant-owned records |
| Auth | Staff/customer/platform auth boundary must match module surface |

## API Groups

| API Group | Purpose |
|---|---|
| `/api/v1/catalog/departments` | Department setup API group |
| `/api/v1/categories` | Category setup API group |
| `/api/v1/brands` | Brand setup API group |
| `/api/v1/collections` | Collection setup API group |
| `/api/v1/unit-of-measures` | Unit-of-measure reference list API group |
| `/api/v1/platform/return-policy-templates` | Platform-owned return policy template API group |
| `/api/v1/return-policies` | Tenant-owned return policy API group |

## Database Contract

| Table | Contract |
|---|---|
| `business_types` | Used by this module |
| `departments` | Used by this module |
| `categories` | Used by this module |
| `brands` | Used by this module |
| `collections` | Used by this module |
| `unit_of_measures` | Used by this module |
| `return_policy_templates` | Platform/system reusable return policy templates |
| `return_policies` | Tenant-owned return policies |

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

- Product variant stock
- Checkout totals
- Payment capture
- Offline sync conflicts

## Related Files

- [[04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/02_Functional_Rules]]
