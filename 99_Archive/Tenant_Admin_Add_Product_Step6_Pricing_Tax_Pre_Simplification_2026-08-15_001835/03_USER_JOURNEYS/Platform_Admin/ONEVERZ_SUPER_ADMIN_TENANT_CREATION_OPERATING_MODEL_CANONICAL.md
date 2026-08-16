<!-- title: OneVerz Super Admin Tenant Creation Operating Model -->
<!-- status: Canonical -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->

# OneVerz Super Admin Tenant Creation Operating Model

## Authority

This document is the canonical operating-model companion to:

- [[FLOW_4_CREATE_TENANT_WIZARD_CANONICAL_SPEC]]
- [[../../00_START_HERE/Current_Source_Of_Truth]]
- [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/ONEVERZ_SUPER_ADMIN_TENANT_CREATION_FOUNDATION_AUDIT_2026-08-06]]
- [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/ONEVERZ_BUSINESS_SUBSCRIPTION_TENANT_ALIGNMENT_AUDIT_2026-08-06]]

When a supporting document conflicts with this operating model and Flow 4 canonical spec, this document and Flow 4 canonical spec win for Release 1 implementation.

## Release 1 Approved Operating Model

```text
Client requirement discussion
→ Relevant module demonstration
→ Subscription plan selection
→ Optional approved tenant override
→ Super Admin creates tenant draft
→ Super Admin completes seven-step wizard
→ System finalizes and provisions tenant
→ Manual payment confirmation
→ Tenant becomes pending activation
→ Super Admin activates tenant
→ Tenant Admin invitation is sent
→ Tenant Admin configures business operations
→ Pilot validation
→ Go-live
```

### Manual activities allowed in Release 1

- Lead management
- Requirement discovery meetings
- Product demonstrations
- Quotation and commercial negotiation
- Contract approval
- Payment verification
- Final go-live approval

These manual activities are valid Release 1 business operations and are not technical blockers by themselves.

## Configuration Model (Three Levels)

### Level 1 — Platform System Defaults (pre-tenant)

Must exist before any tenant creation:

- Module catalog and canonical feature keys
- Permission catalog
- Subscription and tenant lifecycle status definitions
- Default tenant settings schema and setting definitions
- Module dependency rules
- Billing cycle definitions
- Supported countries/currencies/timezones/locales
- Invitation and notification template definitions
- Audit event definitions
- Password and session baseline policy

### Level 2 — Subscription Plan Configuration (commercial contract)

Defines what the tenant purchases:

- Enabled and disabled capabilities
- Limits (outlets/tills/users and future agreed limits)
- Price, currency, billing interval, trial period
- Plan status and effective dates
- Support level
- Upgrade and downgrade policy

### Level 3 — Tenant-Specific Configuration (business operations)

Configures one tenant’s business:

- Business identity and contact details
- Address, country, currency, timezone, locale
- Tax, receipt, and operational settings
- Outlets, tills, payment methods, product categories, branding, stock rules

Normal tenant-specific business configuration is not custom development.

## Three Operating Modes

Super Admin work is split into three explicit modes. See [[Selected_Tenant_Mode_Contract]] for the full contract.

### Platform Mode

Platform-level commercial and lifecycle operations using Platform Admin identity:

- Platform login, dashboard, tenant list/detail
- Create tenant wizard, draft resume, onboarding operation status
- Subscription plan assignment and entitlement editing
- Billing review, payment confirmation, activation, suspension
- Tenant Admin invitation and resend
- Platform users, platform roles, platform settings, platform audit

Routes are under `/admin/dashboard`, `/admin/tenants`, `/admin/billing`, etc.

### Selected-Tenant Mode

**Required Super Admin capability** for **initial assisted / bootstrap tenant configuration**.

- Platform Admin identity is preserved — **no Tenant Admin impersonation**
- Selected tenant is always explicit and visible
- Entry: Tenant Detail → **Configure Tenant** → Selected-Tenant Setup Hub
- Optional bootstrap modules: outlet, till, additional role, additional user, initial products
- Individual bootstrap steps are **conditional** on plan, entitlements, and operational need
- Operational bootstrap **does not block** tenant activation
- Bootstrap mutations are permission-controlled, tenant-scoped, and audit-attributed
- Routes are under `/admin/tenants/:tenantId/configure/*` and **must not** appear in primary platform sidebar

### Tenant Admin Mode

Post-handoff **ongoing tenant operational management** owned by Tenant Admin:

- Outlet/till/device ongoing CRUD and monitoring
- User/role ongoing management
- Full product lifecycle, inventory, reports, storefront where entitled
- Day-to-day business operations

## Super Admin Responsibility Boundary

Super Admin (Platform Admin) is responsible for:

**Platform Mode**

- Plan selection and approved override decisions
- Draft finalization
- Payment review and activation actions
- Invitation resend and onboarding exception handling

**Selected-Tenant Mode (bootstrap assistance)**

- Optional assisted initial outlet, till, role, user, and product setup when operational need and entitlements require platform help before or after activation
- Setup hub guidance and bootstrap create flows only — not ongoing tenant operations

Tenant Admin is responsible for:

- **Ongoing** business setup and operations after handoff (outlets, tills, devices, product and stock operations, storefront details where entitled)

## Seven-Step Wizard Mapping

Canonical step names are fixed in Flow 4 specification. Current UI implementation and internal keys are:

| Sequence | Approved canonical step | Current UI/implementation notes |
|---|---|---|
| 1 | Tenant Basic Details | Implemented |
| 2 | Business & Contact Information | Implemented |
| 3 | Subscription Plan | Implemented |
| 4 | Billing / Payment Setup | Implemented |
| 5 | Feature Entitlements | Implemented |
| 6 | Tenant Admin User | Implemented; invitation delivery messaging needs alignment with backend reality |
| 7 | Review, Create & Activation | Implemented |

Any historical alternate step ordering is superseded.

## What Is Automatically Provisioned vs Manual

### Must be automated by system finalization path

- Tenant foundation records
- Tenant subscription and history
- Tenant entitlements
- Effective plan-limit persistence
- Initial tenant admin foundation (membership, role, role assignment)
- Provisioning/audit operation record
- Payment state setup (paid mode)

### Must remain guarded/manual in Release 1

- Payment confirmation decision
- Paid-tenant activation decision
- Commercial override approval decision

### Not mandatory in tenant finalization or activation

- Creating operational business records like outlets/tills/products

Those may be performed optionally in **Selected-Tenant Mode** by Platform Admin for bootstrap assistance, or by **Tenant Admin** for ongoing ownership after handoff.

Neither commercial finalization nor tenant activation requires operational bootstrap completion.

## Current Implementation Truth vs Target Corrections

### Confirmed available foundation

- 7-step wizard with durable draft
- Transactional finalize path
- Manual payment review path
- `pending_activation` lifecycle guard
- Activation + invitation foundation

### Confirmed gaps (not implemented yet)

- Runtime plan-limit enforcement
- Canonical outlet key mismatch (`outlet_management` vs `tenant_admin.outlets`)
- Fail-open behavior risk when entitlement is missing/unknown
- Bootstrap permissions not fully entitlement-scoped
- Default tenant settings not fully provisioned
- Production ACS + HTTPS invitation closure not verified complete

These gaps are documented as target-state requirements in linked canonical policy/contract documents and must not be treated as complete.

## Frontend Target Behavior (Platform Admin)

Required behavior is to use existing screens and extend where needed:

- Module and plan catalog visibility from backend sources
- Wizard step validations and draft save/resume flow
- Included module and limit summary
- Optional override capture (authorized only)
- Manual payment confirmation actions
- Activation controls with guard feedback
- Invitation status and resend action
- Provisioning failure state and retry guidance
- Tenant-level usage and limit visibility (currently incomplete)
- Audit visibility for create/payment/activation/invitation events

## Related Canonical Pack

- [[Selected_Tenant_Mode_Contract]]
- [[Selected_Tenant_Atomic_Journey_Register]]
- [[../../05_BACKEND_ARCHITECTURE/FLOW_4_SUBSCRIPTION_ENTITLEMENT_LIMIT_POLICY_CANONICAL]]
- [[../../05_BACKEND_ARCHITECTURE/FLOW_4_TENANT_PROVISIONING_TECHNICAL_CONTRACT_CANONICAL]]
- [[../../05_BACKEND_ARCHITECTURE/FLOW_4_PAYMENT_ACTIVATION_INVITATION_LIFECYCLE_CANONICAL]]
- [[../../05_BACKEND_ARCHITECTURE/Platform_Selected_Tenant_API_Contract]]
- [[../../07_UI_UX_KNOWLEDGE/Platform_Admin/Selected_Tenant_Visual_Direction]]
- [[../../15_IMPLEMENTATION_TRACKING/FLOW_4_SUPER_ADMIN_IMPLEMENTATION_TRACEABILITY_AND_ROADMAP_2026-08-06]]
