<!-- title: Outlet, Till & POS Device Foundation Technical Contract -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-29 -->

# Outlet, Till & POS Device Foundation Technical Contract

## Purpose

Defines the implementation contract for `Outlet_Till_POS_Device_Foundation`. This contract is based on
new TM-EPOS MVP scope images and the uploaded Unified Commerce database design.

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
| Manager | **N/A** | **N/A** | **N/A** | **N/A** | **Missing** | Future Scope. Map via `OutletUserRole`. Pending product decision. |
| City | `OutletAddress.City` | `city` | `address.city` | `city` | Implemented | None (Derived from address in UI model) |
| Tills | (Collection) | (Foreign Key) | `tillCount` | `tillCount` | Implemented | None |
| Status | `Status` | `status` | `status` | `status` | Implemented | None (Active/Inactive) |
| Attention | **N/A** | **N/A** | **N/A** | **N/A** | **Missing** | UI derived state. Requires backend aggregation logic. |

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

### Known API Gaps
- **Outlet Summary Dashboard**: Missing dedicated `/api/v1/tenant-admin/outlets/overview` (or similar) returning total, active, attention, inactive.
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
8. Review against new TM-EPOS MVP module boundaries.

## Out Of Scope

- Hardware test execution/result persistence is owned by Module 08.
- Cash reconciliation
- Order fulfilment events
- Customer device/browser identity

## Related Files

- [[04_MODULE_KNOWLEDGE/07_Outlet_Till_POS_Device_Foundation/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/07_Outlet_Till_POS_Device_Foundation/02_Functional_Rules]]


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
