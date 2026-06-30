<!-- title: Tenant Admin First Login Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin First Login Flow

## Purpose

Defines first login after payment success or trial/demo setup email.

## Actor

Tenant Admin

## Source

Derived from `Slide 2 - Tenant Admin First Login Flow` in `tenant-full-journey.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Tenant Admin receives setup email.

## Preconditions

- Tenant exists.
- Setup link is valid.
- Tenant status allows setup.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Setup email received | Tenant Admin receives setup email. |
| 2 | Open setup link | System validates setup token. |
| 3 | Set password | Tenant Admin creates password. |
| 4 | Confirm password | System validates password confirmation and policy. |
| 5 | Password setup successful | System saves password securely. |
| 6 | Open login screen | Tenant Admin opens login. |
| 7 | Enter email and password | System accepts credentials. |
| 8 | Validate credentials | System checks credentials, tenant status, and user status. |
| 9 | Load tenant access | System loads enabled modules and permissions. |
| 10 | Open dashboard | System opens Tenant Admin dashboard. |
| 11 | Show setup checklist | System shows tenant setup checklist and overview. |
| 12 | Ready to continue setup | Tenant Admin can continue setup. |

## Data Used Or Captured

- Setup token
- Password
- Tenant admin email
- Tenant access context
- Enabled modules
- Permission context

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- After first login, show only modules/features enabled for that tenant and user.
- Do not expose raw setup token or password hash.

## Validation And Error Cases

- Invalid/expired setup link
- Password policy failure
- Invalid login
- Tenant inactive/suspended
- User inactive

## Outcome

Tenant Admin reaches dashboard with correct enabled modules and permissions.

## Related Modules

- 06_Auth_Tokens_Security_Audit
- 05_Tenant_User_Permission_Access
- 02_Tenant_Foundation

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/07_Invitations_Authentication_Tokens_And_Security_Audit.md
