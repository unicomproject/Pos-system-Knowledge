<!-- title: Tenant Admin User Creation 5-Step Role-Based Access Second Brain Update -->
<!-- status: Superseded -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-25 -->

# Tenant Admin User Creation 5-Step Role-Based Access Second Brain Update

> Superseded by [[TENANT_ADMIN_USER_CREATION_5_STEP_FLOW_CORRECTION_SECOND_BRAIN_2026-08-25]] on 2026-08-26. Retained as implementation-history evidence, not as an active screen contract.

## Scope

Documentation-only reconciliation of Tenant Admin → Users → Add New User. No Flutter, backend, migration, schema, seed, API, database, or runtime source was modified.

## Source Audit

Audited current Flutter wizard/provider/DTOs, Tenant Admin user/role controllers, user service/repository, role setup catalog, effective permission model, tenant/outlet role entities, invite onboarding, outlet/till APIs, media upload behavior, active Second Brain journey/module/API/DB/UI/Flutter/QA documents, and archive conventions.

## Canonical Decision

The target user experience is five steps: Basic Information; Assign Role; Configure Permissions; Outlet, Till & Access Scope; Security & Review. It remains one atomic final save. The word “Till” in Step 4 is retained as the intended product section, but functional till controls must remain omitted/unavailable until a real user-to-till contract exists.

## Capability Classification

| Capability | Classification | Evidence/decision |
|---|---|---|
| Basic identity, employee ID, generated staff code | Supported | Current create DTO/service |
| Active delegable system/custom role selection | Supported | User create options |
| Role Setup templates `TENANT_ADMIN`/`CASHIER` only | Supported, different contract | Role setup options only |
| Backend-driven module/permission preview | Supported | Permission catalog and role detail |
| Direct per-user permission override | Supported | Additive grants; actor override permission required |
| Tenant-wide access | Supported | Empty outlet IDs → tenant role assignment |
| Selected outlets | Supported | Outlet role assignments |
| User-specific selected tills/default till | Implementation gap | No create DTO or canonical relation |
| Profile media attachment | Supported with different contract | Asset ID supported; dedicated user upload absent |
| Invitation/setup password | Supported | Token onboarding; no plaintext temporary password |
| Save Draft | Implementation gap | No API/persistence contract |
| Outlet-specific role override | Implementation gap | Storage can represent it; create DTO cannot |
| Access Start Date | Implementation gap | No API/persistence mapping |
| Notes | Supported with different contract | Entity field exists; create DTO omits it |
| Access Level Low/Medium/High | Not current scope | No canonical calculation |
| Temporary Password | Prohibited | Conflicts with setup-token security |
| Force Password Change | Different model/not exposed | No create toggle |
| Two-Factor Authentication | Implementation gap | No user-create contract |
| Store Supervisor hardcoded role | Not current scope | Show only if backend returns an active delegable role |

## Documents Added

- [[03_USER_JOURNEYS/Tenant_Admin/07_User_Management_Add_New_User_Flow]]
- [[07_UI_UX_KNOWLEDGE/Tenant_Admin_User_Creation_5_Step_Wizard]]
- [[08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_User_Creation_5_Step_Flutter_Contract]]
- [[10_TESTING_QA/Test_Case/05_Tenant_User_Permission_Access/Tenant_Admin_User_Creation_5_Step_Test_Cases]]
- [[15_IMPLEMENTATION_TRACKING/Flutter/Tenant_Admin/Tenant_Admin_User_Creation_5_Step_Documentation_Status_2026-08-25]]

## Documents Reconciled

Current source-of-truth, journey index, module overview/rules/technical contract, API endpoints, RBAC catalog/resolver, DB mappings, invitation security, Tenant Admin UI rules, Flutter rendering rules, and permission QA index were updated. Superseded user-flow and technical-contract baselines are archived with reason/date before replacement.

## Remaining Implementation Gaps

Flutter still implements three steps. Dedicated user photo upload, selected tills/default till, draft, access start date, notes DTO, outlet-specific role override, force-change toggle, and 2FA require separately approved implementation work. No claim is made that these are implemented or runtime-tested.

## Validation

Documentation links and active contradictions were checked against current source. Build/tests were not run because this task intentionally changes documentation only.

## Verdict

USER CREATION 5-STEP ROLE-BASED ACCESS SECOND BRAIN UPDATE COMPLETE
