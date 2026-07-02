<!-- title: Create Tenant Wizard Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-02 -->

# Create Tenant Wizard Flow

## Purpose

Defines the implemented 7-step Platform Admin tenant create wizard aligned to the uploaded Super Admin UI and Unified-Commerce backend.

## Actor

Platform Admin

## Preconditions

- Platform Admin has `platform.tenants.create`.
- Active subscription plans exist in `subscription_plans`.
- Create-options endpoint returns catalog, addons, and lookup values.

## Implemented 7-Step Flow

| Step | UI label | Backend persistence |
|---:|---|---|
| 1 | Business Information | `tenants`, `tenant_profiles`, `tenant_addresses` |
| 2 | Plan Selection | `tenant_subscriptions.subscription_plan_id` |
| 3 | Limits & Add-ons | `tenant_subscriptions.max_*_override`, `tenant_subscription_addons` |
| 4 | Feature Entitlements | `tenant_feature_entitlements` (auto-seeded from plan when none selected) |
| 5 | Tenant Admin | `tenant_users` (`INVITED` or `ACTIVE`), `tenant_roles`, `tenant_role_permissions`, `tenant_user_roles`, `user_invites` |
| 6 | Billing & Subscription | `tenants.billing_status`, `tenant_subscriptions` billing fields, optional `subscription_invoices` draft |
| 7 | Review & Create | Single transactional `POST /api/v1/platform-admin/tenants` |

## API Flow

1. `GET /api/v1/platform-admin/tenants/create-options`
2. Wizard collects step data client-side only from returned options.
3. `POST /api/v1/platform-admin/tenants` with full wizard payload.
4. Navigate to tenant detail; activate separately via `POST .../activate` when `canActivate` is true.

## Rules

- No mock create-options in Angular.
- Tenant admin invite stores `PENDING_INVITE:UNSET` password hash and `user_invites.invite_status = PENDING`. No email is sent until notification infrastructure exists.
- Payment gateway and payment links are not invoked in this slice; draft invoices may be created when billing mode requires it.
- Feature entitlements must belong to the selected plan; empty selection auto-copies plan included features.
- Optional post-create setup (outlets, tills, products) remains on tenant detail follow-up flows.

## Related Files

- [[../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../../04_MODULE_KNOWLEDGE/01_Platform_Administration/03_Technical_Contract]]
- [[../../04_MODULE_KNOWLEDGE/02_Tenant_Foundation/03_Technical_Contract]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/02_Tenant_Foundation]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/05_Subscription_Billing_Payments_And_Usage]]
- [[16_Platform_Tenant_Create_Wizard_Alignment]]
