<!-- title: Selected Tenant Online Store Hub Status Derivation -->
<!-- status: LOCKED / APPROVED -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->

# Selected-Tenant Online Store — Hub Status Derivation

Companion to [[Selected_Tenant_Setup_Hub_Status_Model]] and [[Selected_Tenant_Online_Store_Bootstrap_Contract]].

## Card: Online Store

| Derived status | Condition (domain truth) |
|---|---|
| `NOT_ENTITLED` | Effective feature entitlement `online_store` = false |
| `NOT_STARTED` | Entitled AND `online_store.defaults.storeStatus` is missing or `DRAFT` |
| `CONFIGURED` | Entitled AND `storeStatus` = `ACTIVE` |
| `NOT_REQUIRED` | Optional for POS-only tenants — prefer showing `NOT_ENTITLED` rather than hiding, for operator clarity |

### Explicitly excluded

| Status | Why |
|---|---|
| `DECISION_REQUIRED` | **Retired** (was GAP 5 placeholder) |
| `IN_PROGRESS` | No draft workflow persistence for Online Store bootstrap |
| `BLOCKED` | Online Store bootstrap does not hard-block on outlets/FMO |

## Informational dependency (not a status)

When `click_collect` entitled but FMO/pickup not configured:

- Show dependency **notice** on ST-07 and optional hub summary line
- Do **not** set Online Store card to `BLOCKED`
- Click & Collect remains Tenant Admin

## Derivation source

| Signal | Source |
|---|---|
| Entitlement | Effective `online_store` |
| Store status | `tenant_settings` key `online_store.defaults` → `storeStatus` |
| Hub evaluator | Extend `GET .../bootstrap/summary` with onlineStore module |

No parallel checklist / setup-status table.
