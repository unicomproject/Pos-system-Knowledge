# Hardware Overview API and UI mapping — 2026-09-15

## Implemented in this update
- Dashboard GET /api/v1/tenant-admin/hardware-devices/dashboard now returns manufacturer, model, assignedTillName, assignedPosDeviceName and notAssignedCount.
- The Flutter DTO, mapper, domain entity and dashboard provider consume these fields. Device rows display real assigned Till/POS names. Not Assigned counts active-assignment absence independently of readiness/configuration.
- Name joins include tenant and outlet constraints. Counts use the same scoped/filtered rows before pagination. No new database tables or columns are needed.
- Wide overview layouts put the heading and actions on one row; smaller widths wrap. Device images currently use type icons, not manufacturer product photos.

## Existing table attributes used
- hardware_devices: id, tenant_id, outlet_id, hardware_device_code, hardware_device_name, hardware_device_type, connection_type, manufacturer, model, config_json, configuration_version, status, last_seen_at, created_by_tenant_user_id.
- hardware_device_assignments: hardware_device_id, tenant_id, outlet_id, till_id, pos_device_id, assigned_at, released_at.
- tills: id, tenant_id, outlet_id, till_name.
- pos_devices: id, tenant_id, outlet_id, device_name.
- hardware_test_logs and till_device_assignments: version-matched test evidence, current POS assignment and readiness.

## API and access
- Existing routes: create-options; hardware-devices list/create; dashboard; device detail/update; test-history; activity; till/POS assignment/release.
- TenantOnly authorization, HardwareEntitlementFilter and HardwareScopeFilter remain in place. Dashboard requires tenant.hardware.view or tenant.hardware.manage. Mutation permissions remain enforced by existing services.
- New fields do not grant access. Configured restricted accounts still receive only their allowed till assignments and owned unassigned hardware.
- GET refresh does not perform a physical device operation. Test on assigned POS remains a guided action; remote Test All is not implemented.

## Folder structure
- API controller: Unified-Commerce/src/E_POS.Api/Controllers/V1/Tenant/HardwareCash/
- API scope/entitlement filters: Unified-Commerce/src/E_POS.Api/Common/
- Contracts and services: Unified-Commerce/src/E_POS.Application/Modules/Tenant/HardwareCash/
- SQL query/repositories/EF configuration: Unified-Commerce/src/E_POS.Infrastructure/Modules/Tenant/HardwareCash/
- Flutter: lib/features/tenant_admin/hardware/data/{models,mappers}, domain/entities, presentation/{providers,screens,widgets}.

## Evidence and limits
- Local database rollback check passed: scoped rows/counts/pagination, notAssignedCount, returned model attributes, actual assigned till name, foreign tenant/outlet/till exclusions. No fixture records retained.
- Zero devices is valid when no registry records exist for the selected scope. OS printer installation does not create an app hardware registry record.
- Actual printer receipt confirmation, scanner/cart, drawer, remote commands and complete screenshot/photo parity are not certified by this update.
