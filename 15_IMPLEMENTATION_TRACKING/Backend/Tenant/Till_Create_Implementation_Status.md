# Till Create — Backend Implementation Status

## Implementation Status

| Item | Value |
|---|---|
| Feature | Till Create |
| Module | Tenant |
| Platform | Backend |
| Status | Completed |
| Name | Developer Name |
| Completed Date | 2026-06-17 |
| Tests | Passed (build verified; permission seed tests passed) |
| PR / Commit | - |

## API

- `POST /api/v1/tenant-admin/tills`
- `GET /api/v1/tenant-admin/context` (existing; exposes `till.create` and `till_management` via permissions/features lists)
- Permission: `till.create` (alias: `tills.create`)
- Feature entitlement: `till_management`
- Tenant context resolved from JWT only

## Related Second Brain

- [[../../../03_USER_JOURNEYS/Tenant_Admin/]]
- [[../../../04_MODULE_KNOWLEDGE/Till/]]
- [[../../../06_DATABASE_KNOWLEDGE/Tables/]]

## Notes

- Creates row in existing `tills` table
- Writes `audit_logs` action `TILL_CREATED` in same transaction as till insert
- Duplicate tenant + outlet + code returns 409 conflict (code normalized to uppercase)
- Invalid or cross-tenant outlet returns 404
- Cashier `POST /api/v1/tills/open` unchanged
- **GAP:** `DefaultCashier` is required by the new single-page Add Till UI but the backend does not yet support a `default_cashier_id`.
- **Hardware Orchestration (Strategy B):** Add Till single-page UI orchestrates Till Create first, then makes sequential calls to assign hardware using the hardware modules.
