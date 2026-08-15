<!-- title: Selected Tenant Online Store QA Contract -->
<!-- status: LOCKED / APPROVED -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->

# Selected-Tenant Online Store Bootstrap — QA Contract

Companion cases for journey SA-ST-UJ-011 / SA-UJ-057. Merged into [[Selected_Tenant_Mode_Test_Contract]] by reference.

| ID | Scenario | Expected |
|---|---|---|
| ST-OS-001 | Happy path: entitled, DRAFT → ACTIVE | 200; settings updated; hub `CONFIGURED` |
| ST-OS-002 | Not entitled | Hub `NOT_ENTITLED`; PUT 403 |
| ST-OS-003 | Permission denied (no online_store.manage) | 403 |
| ST-OS-004 | Suspended tenant mutation | 409 |
| ST-OS-005 | No outlet exists | Online Store still configurable |
| ST-OS-006 | C&C / FMO missing | Save OK; dependency notice shown |
| ST-OS-007 | Cross-tenant outlet / tenantId mismatch | 403/404; no write |
| ST-OS-008 | Invalid storeStatus | 400 |
| ST-OS-009 | Idempotent PUT replay | Same result |
| ST-OS-010 | Refresh / deep-link ST-07 | Context + settings rehydrate |
| ST-OS-011 | Switch tenant / Exit | No stale tenant settings |
| ST-OS-012 | Hub after successful save | Online Store `CONFIGURED` |
| ST-OS-013 | Invalid fulfilment method (if ever posted) | Rejected — SA must not post FMO in this journey |

## Prototype review checklist

- [x] Hub shows Online Store without `DECISION_REQUIRED`
- [x] ST-07 default / validation / not entitled / dependency notice / success
- [x] No OS item in primary Platform sidebar
- [x] Persistent ST context band present
- [x] `storeStatus` vocabulary locked: `DRAFT` | `ACTIVE`
