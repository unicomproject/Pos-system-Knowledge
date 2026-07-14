<!-- title: Discount & Expiry Discount Management Technical Contract -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-07-13 -->

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

### POS Runtime Discount Contract

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/api/v1/pos/discounts?deviceId=` | `sales.discount.apply` | Available policy envelopes plus current user's percentage/fixed authority limits |
| POST | `/api/v1/pos/discounts/validate` | `sales.discount.apply` | Authoritative price calculation and direct/approval/reject outcome without persistence |
| POST | `/api/v1/pos/discounts/apply` | `sales.discount.apply` | Idempotently create an approved-direct or pending-approval application |
| POST | `/api/v1/pos/discounts/{applicationId}/approve` | `sales.discount.approve` | Approve or reject a pending application using a typed decision body |
| POST | `/api/v1/pos/discounts/{applicationId}/cancel` | `sales.discount.apply` | Idempotently cancel an unfinalized direct/pending/approved application and write an audit event |

Apply commands require an idempotency key. Approval IDs identify a POS discount
application, never a discount policy. The requester cannot self-approve.

`GET /api/v1/pos/discounts` accepts optional context query parameters:
`scope`, `variantId`, repeated `variantIds`, `customerId`, `quantity`,
`cartSubtotal`, and `currencyCode`. `LINE` policy filtering requires the selected
variant context. `ORDER` policy filtering may use the cart variant set to derive
product/category/brand/collection eligibility server-side.

`POST /api/v1/pos/discounts/validate` and `POST /api/v1/pos/discounts/apply`
use the same authoritative resolution rules:

- `discountSource = MANUAL` omits `discountId`; backend resolves the internal
  manual policy by `calculationMethod` and requested `scope`.
- `discountSource = POLICY` requires `discountId`; backend reloads scope, method,
  predefined value, targets, conditions, limits, approval, and stacking rules.
- `scope = LINE` requires `targetVariantId`, and that variant must be present in
  the cart lines.
- Scope/source mismatches are controlled business failures, not 500 responses.

Controlled POS runtime failures include `pos_discounts.scope_mismatch`,
`pos_discounts.manual_configuration_not_found`,
`pos_discounts.policy_not_applicable`, `pos_discounts.target_required`, and
`pos_discounts.target_not_in_cart`.

### Tenant Admin Policy Contract

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/api/v1/discount-policies` | `discount.policy.view` | List tenant policies |
| GET | `/api/v1/discount-policies/{policyId}` | `discount.policy.view` | View tenant policy details |
| POST | `/api/v1/discount-policies` | `discount.policy.create` | Create inactive tenant policy with outlets/channels/targets/conditions |
| PUT | `/api/v1/discount-policies/{policyId}` | `discount.policy.update` | Update tenant policy and replace active child configuration |
| POST | `/api/v1/discount-policies/{policyId}/activate` | `discount.policy.activate` | Activate a policy |
| POST | `/api/v1/discount-policies/{policyId}/deactivate` | `discount.policy.activate` | Deactivate a policy |
| DELETE | `/api/v1/discount-policies/{policyId}` | `discount.policy.delete` | Soft-delete a policy and child configuration |

Tenant id is resolved from authentication context. Create/update validates
tenant ownership for outlets, sales channels, products, variants, categories,
brands, and collections.

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
| `pos_discount_authority_limits` | User-specific cashier percentage/fixed authority |
| `pos_discount_applications` | Persistent direct/pending/approved/applied POS discount lifecycle and snapshots |
| `pos_discount_application_events` | Append-only request/approval/rejection/application audit |

POS checkout summary and start-payment accept `discountApplicationId`. Checkout
must reject missing, pending, expired, used, cross-user/device/session, inactive-policy,
or cart-hash-mismatched applications. Payment completion writes
`sales_order_discounts` and marks the application `APPLIED` in the same save unit.

No schema migration was required for the 2026-07-13 POS discount hardening pass.
Existing tables cover policy targets, conditions, authority limits, applications,
events, and policy administration.

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
