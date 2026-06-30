<!-- title: Audit Log Standards -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Audit Log Standards

## Purpose

This file defines audit logging standards for SCS-TIX EPOS Release 1.

Audit logs protect platform, tenant, POS, payment, refund, and permission
operations.

## Audit Table

Use `audit_logs` for immutable audit records.

Audit records must be append-only.

Application users must not update or delete audit rows.

## Audit Fields

Audit logs may include:

- Tenant ID.
- Platform actor ID.
- Tenant user actor ID.
- Device actor ID.
- Actor type.
- Entity type.
- Entity ID.
- Action.
- Old values.
- New values.
- IP address.
- User agent.
- Created time.

## Actor Types

| Actor Type | Meaning |
|---|---|
| `platform_user` | Platform admin action |
| `tenant_user` | Tenant user action |
| `system` | Automated system action |
| `device` | Device-originated action |
| `api` | API/system integration action |

## Required Audit Events

Audit these Release 1 actions:

- Tenant creation.
- Tenant activation.
- Tenant suspension or status change.
- Subscription payment status change.
- Feature entitlement change.
- Role or permission change.
- User invite and activation.
- Device activation or trust change.
- Till open.
- Till close.
- Cash in/out.
- Discount approval.
- Refund approval.
- Exchange completion.
- Report export where required.

## POS Audit Context

POS audit logs should include where available:

- Tenant ID.
- Outlet ID.
- Till session ID.
- POS device ID.
- Acting user ID.
- Sale, payment, return, refund, or exchange ID.
- Business action.
- Timestamp.

## Security Rule

Do not store secrets in audit logs.

Do not store:

- Passwords.
- POS PINs.
- Raw tokens.
- Raw activation codes.
- Card data.
- Provider secret values.

## Old and New Values

Use old and new values only for safe configuration changes.

Avoid storing unnecessary personal or payment-sensitive data.

## Audit and Error Logs

Audit logs are business records.

Application logs are technical records.

Do not replace audit logs with normal application logs.

## Related Files

- [[API_Standards]]
- [[Error_Response_Standards]]
- [[Authorization_And_Permissions]]
- [[Multi_Tenant_Handling]]
