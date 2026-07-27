<!-- title: Tenant Admin First Login Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-07-27 -->

# Tenant Admin First Login Flow

## Purpose

Defines first login after the Tenant Admin receives the **activation / set-password** email.

Canonical onboarding emails: [[../Platform_Admin/18_Tenant_Onboarding_Email_Flows]] · Auth emails: [[../Platform_Admin/19_Authentication_Email_Flows]]

## Actor

Tenant Admin

## Trigger

Tenant Admin opens the single-use set-password link from the **activation** email (`tenant.*_activated` / `tenant.password_setup_requested`).

Created emails (`tenant.paid_created`, `tenant.trial_created`, `tenant.demo_created`) do **not** contain the set-password link.

## Preconditions

- Tenant lifecycle status is `ACTIVE`.
- Setup token is valid, not expired, not used, not revoked.
- Tenant Admin user exists (email = username unless separate username is introduced later).

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Activation email received | Contains username/email, login URL, set-password link, expiry |
| 2 | Open setup link | Validates setup token (hash compare) |
| 3 | Set password | Policy validation; never emailed as plaintext |
| 4 | Confirm password | Saves password hash; consumes token |
| 5 | Open login | Tenant login URL |
| 6 | Sign in | Email + new password |
| 7 | Dashboard | Tenant Admin dashboard / setup checklist |

## Security

- Raw token never stored or logged.
- Token single-use and time-limited.
- Prior sessions revoked if product requires parity with platform reset (implementation decision on tenant side).

## Implementation status

**NOT IMPLEMENTED** end-to-end for tenant-admin set-password email and public setup page wiring as approved. Invite rows may exist without email delivery.

## Decision history — superseded

> ~~First login after “setup email” sent at create for trial/demo only~~ — set-password is always the **activation** email; trial/demo also receive a prior **created** email without the link.

## Related

- [[../Platform_Admin/18_Tenant_Onboarding_Email_Flows]]
- [[../Platform_Admin/11_Tenant_Activation_Flow]]
- [[01_Pre_Login_Payment_Trial_Demo_Flow]]
