<!-- title: Flow 4 Create Tenant Wizard Permission Matrix -->
<!-- status: Canonical -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-04 -->

# Flow 4 — Create Tenant Wizard Permission Matrix

## Policy

Reuse the existing platform permission catalog. No new permission code is required for R1. Backend authorization is authoritative; route guards, hidden fields and disabled buttons are UX only. Draft ownership narrows existing permissions and is not a new role.

| Action/data | Permission | Role or assignment | API enforcement | UI enforcement | Audit required |
|---|---|---|---|---|---|
| Enter wizard/load options | `platform.tenants.create` | Any assigned platform role/user grant | Endpoint + service | Route guard | No business event |
| Create/edit/view/discard own draft | `platform.tenants.create` | Same; owner ID must match | Service ownership predicate | Save/resume/discard controls | Yes |
| List/view/edit/discard any draft | `platform.tenants.update` | Operational admin assignment | Service bypasses owner only with permission | All-drafts/filter controls | Yes |
| View tenant after creation | `platform.tenants.view` | Any assigned grant | Detail service | Route/action visibility | Read per audit policy |
| View active plan price/features inside create-options and own draft | `platform.tenants.create` | Wizard creator | Bounded create-options/draft projection only | Required Step 3 projection | No read business event |
| View general tenant subscription/payment records | `platform.tenant_subscriptions.view` and, for payment detail, `platform.billing.view` | Read/billing assignment | Existing subscription/billing APIs | Tenant detail/billing navigation | Read per policy |
| Select ordinary plan/add-ons/features | `platform.tenants.create` | Wizard creator | Finalize service/catalog validation | Option controls | Plan/feature change |
| Feature/capacity override | `platform.tenants.entitlements.update` | Explicit elevated assignment | Conditional finalization check | Override controls | Yes, reason/expiry |
| Configure ordinary billing inputs | `platform.tenants.create` | Wizard creator | DTO/domain policy | Billing controls | Billing configured |
| Waive/protected billing terms | `platform.billing.manage` | Billing manager or explicit grant | Conditional finalize/lifecycle check | Waiver controls | Yes, reason |
| View payment status | `platform.billing.view` | Billing/read assignment | Operation/billing projection | Status panel | Read per policy |
| Retry payment-link work | `platform.billing.manage` | Billing manager or explicit grant | Retry service state+permission | Retry control | Yes |
| Create admin membership/role and activation-eligible invitation request | `platform.tenants.create`; later paid activation also requires `platform.tenants.activate` | Wizard creator / activation actor | Membership in finalize; request only once active | Admin step and operation status | Yes |
| Resend admin setup invitation | `platform.tenants.update` | Tenant operations assignment | Resend service + rate limit | Resend control | Yes |
| Review/finalize ordinary draft | `platform.tenants.create` | Owner/creator | Recheck all conditional permissions | Review/create action | Yes |
| Activate paid tenant/retry activation | `platform.tenants.activate` | Activation assignment | Lifecycle service | Activate/retry controls | Yes |
| View onboarding audit | `platform.audit.view` | Audit assignment | Audit service/redaction | Audit tab | Read telemetry |

## UI states

- Missing `platform.tenants.create`: deny route and direct API calls.
- Missing subscription-view does not block the bounded plan projection needed to create or review the actor's own draft. It still hides general subscription records for existing tenants. Missing billing-view hides provider/payment-history detail but not the actor's own pending-payment outcome.
- Missing entitlement-update: render plan-derived entitlements read-only; remove override controls.
- Missing billing-manage: hide waiver/protected billing controls; ordinary plan billing remains available.
- A permission revoked after a draft was saved causes finalization to fail 403 without deleting the draft.
- A non-owner without update permission receives 404 for a draft to prevent existence disclosure.

## Backend enforcement points

Controller policy establishes platform authentication. Application service checks base and conditional permissions. Repository code never decides authorization. Finalization checks the saved selections, not client-provided `can*` flags. Outbox retry handlers authenticate the initiating API command and record both original and retry actors.

## Test obligations

For each matrix row test allowed, denied and direct-API bypass. Include revoked-mid-draft, owner/non-owner, hidden-data serialization, waiver without billing-manage, override without entitlement-update, activation without activate, audit without audit-view and invitation resend throttling.

## Related

[[../03_USER_JOURNEYS/Platform_Admin/FLOW_4_CREATE_TENANT_WIZARD_CANONICAL_SPEC]] · [[Permission_Code_List]] · [[API_Authorization_Rules]]
