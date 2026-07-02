<!-- title: Tenant Admin Till Management Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin Till Management Flow

## Purpose

Defines how Tenant Admin creates tills and prepares them for device binding.

## Actor

Tenant Admin

## Source

Derived from `Slide 5 - Till Management Flow` in `tenant-full-journey.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Tenant Admin opens till management.

## Preconditions

- Tenant Admin has till management permission.
- At least one outlet exists.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open till management | System opens till section. |
| 2 | Select outlet | Tenant Admin selects outlet. |
| 3 | View till list | System displays tills for outlet. |
| 4 | Click add till | System opens till form. |
| 5 | Enter till details | Tenant Admin enters till name/code. |
| 6 | Assign till code | System validates unique till code. |
| 7 | Set till status | Tenant Admin sets active/inactive. |
| 8 | Save till | System creates till. |
| 9 | Device binding pending | Till waits for POS device binding. |
| 10 | Assign POS device later | POS device can be bound in device setup. |
| 11 | Till ready/active | Till can be used for POS operations after binding/session setup. |

## Data Used Or Captured

- Till name
- Till code
- Outlet
- Till status
- Device binding status

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Till belongs to selected tenant/outlet.
- Device binding is separate from till creation.

## Validation And Error Cases

- Duplicate till code
- Invalid outlet
- Permission denied
- Invalid till status

## Outcome

Till is prepared for POS device setup.

## Related Modules

- 07_Outlet_Till_POS_Device_Foundation
- 08_Hardware_Till_Cash_Control

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/08_Outlet_Till_And_POS_Device_Foundation.md
