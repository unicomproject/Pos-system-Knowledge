<!-- title: Discount & Expiry Discount Management Technical Contract -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Discount & Expiry Discount Management Technical Contract

## Purpose

Defines the implementation contract for `Discount_Expiry_Discount_Management`. This contract is based on
new TM-EPOS MVP scope images and the uploaded Unified Commerce database design.

## API Contract

| Area | Contract |
|---|---|
| API groups | `/api/v1/discounts`, `/api/v1/discount-policies`, `/api/v1/expiry-discounts`, `/api/v1/pos/discounts` |
| Request format | Typed request DTOs; no raw map payloads in application layer |
| Response format | Typed response DTOs with safe fields only |
| Error format | Standard API error response |
| Tenant context | Resolved server-side for tenant-owned records |
| Auth | Staff/customer/platform auth boundary must match module surface |

## API Groups

| API Group | Purpose |
|---|---|
| `/api/v1/discounts` | Module API group |
| `/api/v1/discount-policies` | Module API group |
| `/api/v1/expiry-discounts` | Module API group |
| `/api/v1/pos/discounts` | Module API group |

## Database Contract

| Table | Contract |
|---|---|
| `discount_types` | Used by this module |
| `discount_policies` | Used by this module |
| `discount_policy_outlets` | Used by this module |
| `discount_policy_channels` | Used by this module |
| `discount_policy_targets` | Used by this module |
| `discount_policy_conditions` | Used by this module |
| `expiry_discount_rules` | Used by this module |
| `expiry_discount_rule_tiers` | Used by this module |
| `expiry_discount_applications` | Used by this module |

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

- Gift cards
- Advanced promotions stacking
- Accounting journal posting
- Delivery fee discounts

## Related Files

- [[04_MODULE_KNOWLEDGE/15_Discount_Expiry_Discount_Management/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/15_Discount_Expiry_Discount_Management/02_Functional_Rules]]
