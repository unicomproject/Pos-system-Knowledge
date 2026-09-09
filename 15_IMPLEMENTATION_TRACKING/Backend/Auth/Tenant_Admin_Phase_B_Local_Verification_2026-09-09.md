<!-- title: Tenant Admin Phase B Local Verification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-09 -->

# Tenant Admin Phase B Local Verification

## Scope and authority

This is implementation evidence from the September 7-9 workspace session.
It supplements the canonical Flow 4 journey; it does not replace that journey.
Phase A tenant creation and invitation delivery remain separate from Phase B.
Production release approval is not granted by this note.

## Approved account setup sequence

1. Tenant Admin receives the invitation email.
2. Open the invitation and verify its token with the backend.
3. Enter New Password and Confirm Password.
4. Activate the invited account.
5. Log in with the invited email and new password.
6. Apply existing workspace access/navigation rules.

Email alone must not authorize password setup.
An invalid invitation must be rejected.
Existing multi-workspace chooser behavior remains applicable.

## Local implementation and evidence

- The setup response now includes an optional rejection Code.
- UserInvite creation was corrected to bind the invited tenant-user ID.
- The English invitation template includes organization, login email and role.
- It provides activation steps, an action link and expiry information.
- Authorized test-email runs recorded ACS success and sent invitation/outbox state.
- These were controlled development tests, not production delivery certification.
- User-performed password setup produced ACTIVE / ACCEPTED evidence.
- Duplicate same-email probe fixtures initially caused login selection failures.
- Only obsolete isolated test fixtures were archived; the active account was preserved.
- A subsequent login recorded SUCCESS.
- The probe now refuses to create another fixture for an existing recipient.
- That fixture had no role assignments; full dashboard authorization was not closed.

## Configuration boundary

ACS configuration comes from User Secrets/environment configuration.
UserSecretsId: epos-api-development-secrets.
Do not place credentials, invitation tokens, passwords or setup URLs containing tokens here.
Local test mail/setup hosting does not establish a deployed production hostname.
Previously proposed production hostnames are not deployment evidence.

## Source references

- Unified-Commerce/src/E_POS.Application/Modules/Tenant/TenantAuth/TenantAdminInvitationEmailComposer.cs
- Unified-Commerce/src/E_POS.Infrastructure/Modules/Shared/Integration/Services/TenantOnboardingOutboxWorker.cs
- Unified-Commerce/tools/PhaseBEmailProbe/
- Unified-Commerce/src/E_POS.Application/Modules/Tenant/TenantAuth/Services/TenantAdminInvitationAcceptanceService.cs

These include uncommitted local work; do not assume all are in the merged CI fix.
Evidence is from the recorded session, not a fresh September 9 end-to-end rerun.

## Remaining work

- Production installation/open handoff and approved hosting.
- Role-authorized invitation-to-dashboard end-to-end acceptance.
- Real-device verification for intended deployment targets.
- Password-policy changes require an explicit agreed decision.

## Related evidence

[[15_IMPLEMENTATION_TRACKING/Flutter/Tenant_Admin/Phase_B_Android_Handoff_2026-09-09]]
[[15_IMPLEMENTATION_TRACKING/Backend/Backend_CI_And_Local_Database_Fixes_2026-09-09]]
