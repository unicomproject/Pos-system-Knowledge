<!-- title: Tenant Admin User Creation 5-Step Flow Correction Second Brain -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-26 -->

# Tenant Admin User Creation 5-Step Flow Correction Second Brain

## 1. Existing Flow Audited

Audited active and archived Add User journeys, role flow, permission catalog/resolver rules, user create API/service/repository, DB mappings, invitations, UI/Flutter contracts, QA, journey index, and implementation tracking. No runtime source was modified.

## 2. Issues Found

| Issue | Previous ambiguity | Corrected contract |
|---|---|---|
| Role ownership | Role could be read as identity-step state | Step 2 only |
| Permission editing | Could be mistaken for global role edit | Additive user-only direct grants |
| Outlet/till options | Unsupported options could appear required | Only All/Selected Outlets active; till/default omitted |
| Access Level | No formula | Removed |
| Review counts | Examples could drift | Derived from final state |
| Account review | Active/invited wording could conflict | Mode-driven `INVITED`/`INACTIVE` review |
| Save Draft | Partial mockup behavior | Removed; implementation gap |

## 3. Step 1 Role Duplication Fix

Step 1 now owns Full Name, Email, Phone, optional Employee ID, generated Staff Code, Profile Photo, and account/invitation mode. It contains no Role selector. Phone is a corrected UX requirement; current nullable backend validation is recorded as a gap.

## 4. Step 3 User Permission Override Clarification

`BR-UCR-PERM-001` prohibits Base Role mutation from Add New User. Step 3 displays inherited role grants, additive user overrides, and locked/not-assignable permissions. Explicit removal of inherited grants is not supported.

## 5. Outlet/Till Dependency Fix

Current active modes are All Outlets (empty IDs = tenant-wide) and Selected Outlets (one or more IDs). `No Outlet Access` is removed because it cannot be represented. User-specific till/default-till/per-user-default-outlet controls are omitted and tracked as gaps. Future support must reconcile invalid dependent selections when outlets change.

## 6. Access Level Decision

No deterministic Low/Medium/High formula exists. Access Level is removed. Factual module, effective permission, and outlet values are used; till values remain unavailable until supported.

## 7. Count Consistency Fix

Module Count and Effective Permission Count derive from the final effective permission set. Outlet Count derives from final scope. Step 5 uses the same state selectors as Steps 3 and 4; no static sample counts are authoritative.

## 8. Account Status / Invitation Fix

Create supports `INVITED` and `INACTIVE`, not direct `ACTIVE`. Invited review shows email/setup-token behavior. Inactive review shows login disabled and never displays `Will be invited`.

## 9. Save Draft Decision

`USER CREATION SAVE DRAFT — IMPLEMENTATION GAP / OUT OF CURRENT SCOPE`. No active step displays Save Draft and no partial persistence/resume behavior is claimed.

## 10. Updated Business Rules

Role Step 2 only; user-only additive grants; role-change reconciliation; current outlet semantics; unsupported till/default controls omitted; Access Level prohibited; review derived; account mode authoritative; server validation final.

## 11. Updated Validation Rules

Validate identity, Base Role, effective grants, outlet scope, account mode, tenant ownership, actor authority, delegation ceiling, entitlements, active catalog state, and idempotency. Till/default validation remains inactive until a real contract exists.

## 12. Updated QA

TC-UCR-001 through TC-UCR-014 cover role ownership, no role mutation, role-change recalculation, unsupported scope/till controls, count equality, invited/inactive review, Access Level removal, and unsupported security features.

## 13. Files Updated

Canonical journey, module overview/rules/technical contract, role cross-reference, resolver/UI/Flutter rules, API/DB/invitation mappings, QA, journey index, source-of-truth, and implementation tracking.

## 14. Files Archived

Pre-correction copies of the journey, UI contract, Flutter contract, technical contract, QA matrix, functional rules, API mapping, DB mapping, invitation contract, resolver, and implementation status are stored under the dated archive folder with reason metadata.

## 15. Backend Implementation Gaps

Phone-required validation, dedicated user-photo upload, no-outlet semantics if later desired, per-user default outlet, user-to-till/default-till, draft, access start date, notes create field, outlet-specific role override, force-change create option, and 2FA.

## 16. Flutter Implementation Gaps

Three-to-five-step refactor, role selection moved to Step 2, permission-state labels and user-only messaging, deterministic summary selectors, unsupported control removal, and account-mode-driven review.

## 17. Remaining Blockers

No documentation blocker remains. The listed full-stack gaps block claiming those controls as implemented, but they are explicitly excluded from the active canonical flow.

## 18. Final Verdict

USER CREATION 5-STEP FLOW CORRECTION SECOND BRAIN COMPLETE
