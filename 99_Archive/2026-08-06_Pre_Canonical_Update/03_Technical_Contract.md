<!-- Archived: 2026-08-06 -->
<!-- Reason: Superseded by new canonical Outlet Management specification. -->

# ARCHIVED: Outlet, Till & POS Device Foundation Technical Contract

## Purpose

Defines the implementation contract for `Outlet_Till_POS_Device_Foundation`. This contract is based on
new OneVerz POS MVP scope images and the uploaded Unified Commerce database design.

## API Contract

| Area | Contract |
|---|---|
| API groups | `/api/v1/outlets`, `/api/v1/tills`, `/api/v1/devices`, `/api/v1/device-pairing` |
| Request format | Typed request DTOs; no raw map payloads in application layer |
| Response format | Typed response DTOs with safe fields only |
| Error format | Standard API error response |
| Tenant context | Resolved server-side for tenant-owned records |
| Auth | Staff/customer/platform auth boundary must match module surface |

## API Groups

| API Group | Purpose |
|---|---|
| `/api/v1/outlets` | Module API group |
| `/api/v1/tills` | Module API group |
| `/api/v1/devices` | Module API group |
| `/api/v1/device-pairing` | Module API group |

## Database Contract

| Table | Contract |
|---|---|
| `outlets` | Main entity. |
| `outlet_addresses` | Physical address. |
| `outlet_business_hours` | Operating hours. |
| `tills` | POS sessions start here. |
| `pos_devices` | Device registration. |
| `till_device_assignments` | Linking devices to tills. |
| `hardware_profiles` | Peripherals config. |

## Outlet Field Mapping & Gap Analysis

| UI Field | Domain Property | Database Column | API Field | Flutter Model Field | Current Status | Required Change |
|---|---|---|---|---|---|---|
| Outlet Code | `OutletCode` | `outlet_code` | `outletCode` | `code` | Implemented | None |
| Outlet Name | `OutletName` | `outlet_name` | `outletName` | `name` | Implemented | None |
| Type | `OutletType` | `outlet_type` | `outletType` | `outletType` | Implemented | None |
| Manager | `OutletUserRole.IsPrimaryManager` | `is_primary_manager` | `manager` | `manager` | Implemented | Mapped via `OutletUserRole.is_primary_manager` with unique partial index |
| City | `OutletAddress.City` | `city` | `address.city` | `city` | Implemented | None (Derived from address in UI model) |
| Tills | (Collection) | (Foreign Key) | `tillCount` | `tillCount` | Implemented | None |
| Status | `Status` | `status` | `status` | `status` | Implemented | None (Active/Inactive) |
| Attention | **N/A** | **N/A** | **N/A** | **N/A** | Mapped | UI derived state. Provided via derived operational health in Overview API. |

## Till Field Mapping & Gap Analysis

| UI Field | Domain Property | Database Column | API Field | Flutter Model Field | Current Status | Required Change |
|---|---|---|---|---|---|---|
| Till Name | `TillName` | `till_name` | `tillName` | `name` | Implemented | None |
| Till Code | `TillCode` | `till_code` | `tillCode` | `code` | Implemented | None (Manual entry, validated for uniqueness) |
| Outlet | `OutletId` | `outlet_id` | `outletId` | `outletId` | Implemented | None |
| Status | `Status` | `status` | `status` | `status` | Implemented | None |
| Opening Float | `DefaultOpeningFloatAmount` | `default_opening_float_amount` | `defaultOpeningFloatAmount` | `openingFloat` | Implemented | UI must pass value (accepts 0 or greater) |
| Default Cashier | **N/A** | **N/A** | **N/A** | **N/A** | **Missing** | Requires future DB migration/API update |
| Device Name | **N/A** (Legacy field exists) | **N/A** | **N/A** | **N/A** | **Legacy** | Target uses `posDeviceId` and assignment tables |
| Hardware Selectors | **N/A** (Legacy fields exist)| **N/A** | **N/A** | **N/A** | **Legacy** | Target uses `hardware_device_assignments` |

## Confirmed Outlet API Contracts

### `OutletsController` (Tenant Admin / Base CRUD)
- `GET /api/v1/outlets/create-options`: Returns lookup data for dropdowns (types, timezones).
- `GET /api/v1/outlets`: Paginated list of outlets. Supports `search`, `pageNumber`, `pageSize`. Returns `OutletListResponse`.
- `POST /api/v1/outlets`: Creates new outlet. Expects `OutletCreateRequest`.
- `GET /api/v1/outlets/{id}`: Gets single outlet detail.
- `PUT /api/v1/outlets/{id}`: Updates outlet. Expects `OutletUpdateRequest`.
- `DELETE /api/v1/outlets/{id}`: Soft deletes outlet.

### `TenantAdminOutletsController` (Tenant Admin Specific)
- `GET /api/v1/tenant-admin/outlets/options`: Tenant-specific outlet options.
- `GET /api/v1/tenant-admin/outlets/{id}`: Specific tenant admin detail view.
- `GET /api/v1/tenant-admin/outlets/{id}/revenue-summary`: Revenue KPI data.
- `GET /api/v1/tenant-admin/outlets/{id}/users`: Assigned users list.
- `GET /api/v1/tenant-admin/outlets/{id}/tills`: Assigned tills list.
- `GET /api/v1/tenant-admin/outlets/{id}/overview`: Outlet Overview aggregate (Outlet info, Manager, Tills summary, Sales summary, Inventory stock value, Open orders, Derived operational health, Health alerts, Section access).
- `PUT /api/v1/tenant-admin/outlets/{id}/manager`: Assigns or replaces primary outlet manager (`{ "tenantUserId": "uuid" }`).
- `DELETE /api/v1/tenant-admin/outlets/{id}/manager`: Revokes primary manager status for the outlet.
- `PUT /api/v1/tenant-admin/outlets/{id}/image`: Assigns or replaces outlet profile image (`{ "mediaAssetId": "uuid" }`).
- `DELETE /api/v1/tenant-admin/outlets/{id}/image`: Removes outlet image association.

### Known API Gaps
- **Top Performing Outlet**: No global endpoint aggregating the top performing outlet over a period. Currently pending.
- **Till Monitoring Data**:
  - Current Till list (`GET /api/v1/tenant-admin/tills`) does not return `currentCashierName`, `currentSessionId`, `currentSessionStatus`, `lastDeviceSeenAt`, `operationalStatus`, `needsAttention`, `attentionReasonCount`.
  - Current search does not support searching by cashier name.
  - Current Till detail response (`GET /api/v1/tenant-admin/tills/{id}`) lacks normalized hardware connection rows (`hardwareConnections[]`), `alertCount`, `attentionReasons[]`, `currentCashier`, and `currentSession`.
  - Current implementation relies on flat hardware name fields (`deviceName`, `printerName`, etc.) which do not prove connection readiness.

### Proposed Till Monitoring API Contracts

**Proposed Planned Till List Item (To support Desktop Master-Detail panel):**
Requires extending the existing list item response to include:
- `currentCashierId`, `currentCashierName`, `currentSessionId`, `currentSessionStatus`, `lastDeviceSeenAt`, `operationalStatus`, `needsAttention`, `attentionReasonCount`.

**Proposed Planned Till Detail Item (To support Selected Till panel):**
Requires extending the existing detail response to include:
- `currentCashier`, `currentSession`, `assignedPosDevice`, `hardwareConnections[]` (normalized array of hardware statuses), `alertCount`, `attentionReasons[]`.

**Note:** Any hardware alert or hardware readiness field not currently implemented is marked as *Proposed / Not Implemented*. Do not treat flat fields (e.g. `printerName`) as proof of connection.

Hardware assignment records must identify tenant, outlet, POS device, hardware
device/type, active range, configuration version and change actor/time. Existing
schema gaps remain implementation work; do not invent a second configuration table.

Entity mappings must preserve exact table names, column names, tenant foreign keys,
unique constraints, CHECK constraints, hash-only token rules, and append-only
history/ledger behavior where applicable.

## Frontend Contract

- Use feature-owned folders and typed services/providers.
- Widgets/components must not call HTTP APIs directly.
- Use DTOs in data layer, domain/view models in UI layer.
- Permission and entitlement checks are UX helpers only; backend remains final authority.
- Secure device-local secrets are references to activated-device configuration;
  revocation must invalidate hardware access.
- Browser online store and Flutter business app must share backend rules but keep separate user/auth surfaces.

## Backend Contract

- Controllers stay thin.
- Application services own use cases.
- Domain entities/value objects hold stable business invariants.
- Repository interfaces stay in application layer; EF implementations stay in infrastructure layer.
- Audit/event rows are written for sensitive state changes.
- Idempotency keys are required for retryable commands that can create duplicates.

## Permission And Entitlement Contract

- Permission codes must be database-seeded and module-scoped.
- Do not create one giant global enum as the source of truth.
- Tenant feature entitlement must be checked before tenant staff permission where the feature is plan-controlled.
- Customer-facing actions use customer account/session rules, not tenant staff role permissions.

## Test Contract

Test coverage must include:

- Happy path for each primary API group.
- Missing authentication.
- Permission denied or customer access denied.
- Feature disabled / entitlement missing.
- Tenant isolation failure.
- Validation failure.
- Duplicate/conflict behavior.
- Safe error display.
- Audit/event/history creation where required.
- Offline/cache behavior where this module touches POS, checkout, order, inventory, payment, or sync.

## Implementation Sequence

1. Confirm scope and table coverage from this module file.
2. Create DTOs, validators, and application service methods.
3. Create repository interface and EF repository/mapping if missing.
4. Add entitlement, permission, tenant, outlet, till, device, customer, or offline checks as relevant.
5. Build frontend route/screen/component/provider/service.
6. Add loading, empty, error, denied, feature-disabled, offline, and conflict states.
7. Add unit/integration/API/widget tests.
8. Review against new OneVerz POS MVP module boundaries.

## Out Of Scope

- Hardware test execution/result persistence is owned by Module 08.
- Cash reconciliation
- Order fulfilment events
- Customer device/browser identity

## Related Files

- [[04_MODULE_KNOWLEDGE/07_Outlet_Till_POS_Device_Foundation/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/07_Outlet_Till_POS_Device_Foundation/02_Functional_Rules]]

## Tenant Admin Outlet List Contract (Implemented 2026-08-04)

- Canonical screen list: `GET /api/v1/tenant-admin/outlets`. The generic `GET /api/v1/outlets` remains backward compatible.
- Query parameters: `pageNumber`, `pageSize`, `search`, `outletType`, `status`, `operationalHealth`, `sortBy`, and `sortDirection`.
- Search is applied before total count and pagination across outlet name, code, primary manager display name, physical address line, and city. Type, lifecycle status, and operational health filters combine server-side.
- Response uses `{ data: { items, pageNumber, pageSize, totalCount } }`. List items contain safe outlet identity, nullable image and manager preview, nullable till counts (`totalCount`, `activeCount`, `onlineCount`), nullable operational-health preview (`status`, `activeAlertCount`), nullable location preview, and `access.canViewTillsAndHealth`. Manager email and phone are never present.
- Health values are `HEALTHY`, `NEEDS_ATTENTION`, `CRITICAL`, and `UNKNOWN`. Online means an active assigned POS device with a heartbeat inside `TillMonitoring:HeartbeatTimeoutSeconds`; this is the same classification used by the selected-outlet overview.
- List access requires one of `tenant.outlets.view`, `tenant.outlets.details.view`, or `tenant.outlets.manage`. Till and health previews require `tenant.outlets.tills.view`, `tenant.tills.view`, or `tenant.outlets.manage`; otherwise both sections are null and the access flag is false. The query executes one page projection plus one total-count query; it does not call overview or issue per-row HTTP/database requests.

## Tenant Admin Outlet Lifecycle Contract (Implemented 2026-08-04)

- Canonical mutation: `PUT /api/v1/tenant-admin/outlets/{outletId}/status` with `{ "status": "ACTIVE" }` or `{ "status": "INACTIVE" }`.
- Requires `tenant.outlets.manage` or `tenant.outlets.update`; successful changes are audit logged.
- Disable never deletes an outlet. It is rejected for the default outlet or where open till sessions, active tills, open orders, or reserved inventory remain. Tenant predicates are applied to all checks and mutation queries.

## Till Monitoring Contract Correction (2026-08-01)

### Supersedes outdated "Known API Gaps" for monitoring fields

The following fields **are present** on `TenantAdminTillListItemResponse` / detail in Unified-Commerce (verify in `TenantAdminTillDtos.cs`):

- `currentCashierName`
- `lastDeviceSeenAt`
- `operationalStatus`
- `displayStatus`
- `needsAttention`
- `hasActiveAssignment`

Still missing / incomplete relative to approved panel:

- Normalized `hardwareConnections[]` on detail (available via related `GET .../hardware-readiness` instead)
- `alertCount` / `attentionReasons[]` on detail/readiness responses
- POS-device-merged hardware assignments
- Hardware inventory and assignment mutation APIs

Flat `printerName` / `scannerName` / `cashDrawerName` / `cardReaderName` remain legacy display fields and **do not** prove connection readiness.

### Final desktop UI

Approved split-view — see [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Till_Monitoring_UI]]. List-only desktop is not the final design.

### Entitlement

Till management feature code: `till_management`.
