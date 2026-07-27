<!-- title: Authentication Email Flows -->
<!-- status: APPROVED -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- owner: Platform Architecture / Product (OneVerz) -->
<!-- last_updated: 2026-07-27 -->
<!-- applies_to: Platform and tenant authentication emails -->
<!-- related: Email_Architecture_And_Provider_Decisions, 17_Platform_User_Password_Reset_Flow -->

# Authentication Email Flows

## Purpose

Approved authentication-related emails for Platform and Tenant identities.

Architecture: [[../../12_INTEGRATIONS/Email_Architecture_And_Provider_Decisions]] · Catalog: [[../../12_INTEGRATIONS/Email_Event_And_Template_Catalog]]

## Universal rules

- Never email a plain or temporary password.
- Prefer single-use, time-limited links with hash-only storage.
- Do not log raw tokens, full reset URLs with tokens, connection strings, or access keys.
- Platform email mode: API returns `deliveryMode=email` and `resetUrl=null`.

---

## Platform Admin password reset (IMPLEMENTED)

| Item | Value |
|---|---|
| Event | `platform.password_reset_requested` |
| Journey | [[17_Platform_User_Password_Reset_Flow]] |
| Tracking | [[../../15_IMPLEMENTATION_TRACKING/Backend/Auth/SA-P1-06_Platform_Admin_User_Password_Reset_Implementation]] |
| Trigger | Platform Users → Send Password Reset |
| Delivery | ACS Email |
| Status | **COMPLETE**; real Azure E2E **PASSED** |
| Out of scope | Self-service Forgot Password; tenant resets |

Approved steps remain admin-initiated → ACS email → public `/reset-password` → sessions revoked → token single-use.

---

## Tenant Admin set-password (APPROVED, NOT IMPLEMENTED)

| Item | Value |
|---|---|
| Events | `tenant.password_setup_requested` with `tenant.*.activated` |
| Journey | [[18_Tenant_Onboarding_Email_Flows]] · [[../Tenant_Admin/02_First_Login_Flow]] |
| Trigger | After tenant reaches `ACTIVE` |
| Contents | Username/email, login URL, set-password link, expiry |
| Status | **NOT IMPLEMENTED** |

---

## Tenant user invitation (APPROVED intent, NOT IMPLEMENTED)

| Item | Value |
|---|---|
| Event | `tenant.user_invited` |
| Trigger | Invite tenant staff user |
| Status | **NOT IMPLEMENTED** (sequence after tenant-admin onboarding emails) |

---

## Tenant user password reset (DEFERRED)

| Item | Value |
|---|---|
| Event | `tenant.password_reset_requested` |
| Status | **DEFERRED** for current phase |

---

## Password changed alert (FUTURE)

| Item | Value |
|---|---|
| Event | `user.password_changed` |
| Status | **FUTURE** |

---

## Related

- [[17_Platform_User_Password_Reset_Flow]]
- [[18_Tenant_Onboarding_Email_Flows]]
- [[../../12_INTEGRATIONS/ACS_Email_Operations_And_Deployment_Runbook]]
