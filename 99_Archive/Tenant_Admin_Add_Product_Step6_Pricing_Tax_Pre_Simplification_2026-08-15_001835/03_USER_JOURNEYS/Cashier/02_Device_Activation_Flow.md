<!-- title: Device Activation Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-10 -->

# Device Activation Flow

## Purpose and Authority

This is the canonical functional, security, API, permission and data contract
for activating an existing POS device against an existing till. Implementation
must modify the existing `DeviceActivationScreen`; a duplicate activation
screen, API, permission, table or branding implementation is prohibited.

## Screen Decision

```text
DeviceActivationScreen
├── Shared POS Branding Panel
│   ├── Branding Background
│   ├── Tenant Logo
│   ├── Tenant / Brand Name
│   ├── System Name
│   ├── Description
│   └── Hero Image
└── Device Activation Form Panel
    ├── Activate Device heading
    ├── Activation subtitle
    ├── Device Activation Code field
    ├── Validation / error state
    └── Activate Device button
```

The left side reuses the same reusable branding presentation and fallback logic
as the POS Login screen. It renders `brandDisplayName`, `systemName`,
`description`, `logoUrl`, `heroImageUrl`, `backgroundMode`, `backgroundColor`
and `backgroundImageUrl`. `loginSubtitle` is Login-specific and is not rendered
inside the shared left panel. Login and Activation must not maintain separate
branding renderers.

If tenant branding is available, use it. During first-time or unprovisioned
activation, use packaged OneVerz fallback branding without adding a tenant-code
field. Successful activation persists `tenantSlug` in the existing trusted
device context for subsequent Login Branding resolution.

## Activation Form Visual Contract

| Element | Canonical value / treatment |
|---|---|
| Heading | `Activate Device`; `Activate` near-black, `Device` OneVerz orange, with the Login-style orange vertical accent |
| Subtitle | `Enter your device activation code to continue.`; same typography and muted colour as Login subtitle |
| Label | `Device Activation Code`; same label hierarchy as Login |
| Placeholder | `Enter device activation code`; same input typography as Login |
| Leading icon | Orange key icon |
| Primary action | `Activate Device`; existing orange action treatment and far-right arrow |

The primary target is tablet landscape. The layout must remain keyboard-safe,
touch-friendly and overflow-free on supported compact widths, including long
validation and server-error messages.

Feature widgets must not contain direct colour literals such as
`Color(0xFFFF...)`. Use canonical theme colour, typography, spacing and radius
tokens plus shared input/button styles. If a semantic token is missing, define
it once in the canonical theme/design-token file. Do not duplicate constants in
Activation widgets.

## Flutter Architecture

Use the existing feature-first Clean Architecture boundary:

```text
device_activation/
├── application/
├── data/
├── domain/
└── presentation/
    ├── providers/
    ├── screens/
    └── widgets/
```

`DeviceActivationScreen` composes focused widgets. HTTP requests, DTO parsing,
fingerprint/device persistence and activation business rules must not be placed
in presentation widgets or a monolithic screen. The shared branding panel is a
single reusable component consumed by both Login and Activation.

## Actors and Preconditions

| Actor | Responsibility |
|---|---|
| Cashier / authorized tenant user | Enters the supplied activation code once |
| Tenant Admin | Creates/manages the till, device assignment and activation code |
| Flutter POS | Resolves device metadata, prevents duplicate submit and persists only a successful trusted context |
| Backend | Authoritatively validates tenant, permission, code, till, assignment, device and fingerprint |

Preconditions:

- Till and outlet already exist and are usable/active under existing Till rules.
- The code belongs to that tenant/outlet/till context.
- An active POS device exists and has a valid active till assignment.
- Activation is online-only.

## Canonical Flow

```text
Resolve canonical device fingerprint
        ↓
Check current trusted device context where applicable
        ↓
No valid trusted device
        ↓
Show existing DeviceActivationScreen
        ↓
Enter and locally validate Activation Code
        ↓
POST /api/v1/devices/activate exactly once
        ↓
Backend validates tenant / permission / code / till / device /
assignment / fingerprint
        ↓
Pair and trust POS device; mark activation code USED atomically
        ↓
Return device / outlet / till context and tenantSlug
        ↓
Persist PosDeviceContext + tenantSlug
        ↓
Continue the canonical next POS route
```

## Functional Requirements

1. Activation Code is required.
2. Flutter resolves or generates one canonical device fingerprint and supplies
   `deviceFingerprint`, `deviceName`, `deviceType`, `platform` and `appVersion`.
3. The existing activation flow is used; no new endpoint is introduced.
4. Duplicate submit is prevented and a stable loading state is visible.
5. Successful activation persists the trusted context including `tenantSlug`
   and continues to the canonical next POS flow.
6. Failure or network loss shows a safe error and must not create trusted local
   state.
7. A currently valid trusted device avoids unnecessary duplicate activation by
   following the existing current-device/idempotency contract.
8. Malformed stored context is handled safely and cleared/recovered without
   faking activation success.

## Business and Security Rules

- Raw activation code is never stored or logged; only its canonical hash is
  persisted.
- Usable code is `ACTIVE`, unexpired and non-revoked. Canonical statuses are
  `ACTIVE`, `USED`, `EXPIRED` and `REVOKED`.
- A `USED` code cannot normally be reused. The same already-valid trusted device
  may resolve idempotently without mutating pairing state.
- A valid active assigned device and active till-device assignment are required.
- Fingerprint conflict with another active device is rejected.
- Cross-tenant activation is forbidden. Client-supplied tenant identity is not
  authoritative; authenticated backend tenant context is authoritative.
- Successful activation records trusted/pairing metadata, code use and audit
  timestamps atomically. Failure must not partially persist trusted state.
- Avoid repeated fingerprint generation, duplicate requests and unnecessary
  branding reloads.

## API Contract

**New API: NO.** Reuse:

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/v1/devices/current` | Resolve an already trusted device by fingerprint |
| `POST` | `/api/v1/devices/activate` | Validate code and pair/trust the assigned POS device |

Activation request fields are `activationCode`, `deviceFingerprint`,
`deviceName`, `deviceType`, `platform` and `appVersion`. The successful response
reuses the existing device/outlet/till context and includes `tenantSlug`.
Activation does not create a branding API; it consumes the approved Login
Branding state/infrastructure.

## Permission Contract

**New permission: NO.** Canonical backend permission is
`tenant.till.manage`; the existing Flutter capability/action is
`canActivatePosDevice`. Backend authorization is authoritative.

Current evidence: `DevicesController` has `TenantOnly` authorization but its
`ActivateDevice` action does not prove `tenant.till.manage` enforcement.
Therefore backend permission enforcement is **DRIFT / REQUIRES FIX BEFORE FINAL
RUNTIME SIGN-OFF**. Do not mark this requirement implemented from Flutter
visibility alone.

## Database Contract

**New table: NO. New physical column: NO.** Reuse:

- Activation/device: `till_activation_codes`, `pos_devices`,
  `till_device_assignments`, `tills`, `outlets`.
- Shared branding: `tenants`, `tenant_profiles`, `setting_definitions`,
  `tenant_settings`, `media_assets`.

No Activation-specific branding storage is permitted.

### Existing relevant attributes

| Table | Existing relevant attributes |
|---|---|
| `till_activation_codes` | `id`, `tenant_id`, `outlet_id`, `till_id`, `activation_code_hash`, `issued_by_tenant_user_id`, `status`, `expires_at`, `used_by_pos_device_id`, `used_at`, `created_at` |
| `pos_devices` | `id`, `tenant_id`, `outlet_id`, `device_code`, `device_name`, `device_type`, `platform`, `app_version`, `device_fingerprint_hash`, `is_trusted`, `paired_at`, `paired_by_tenant_user_id`, `last_seen_at`, `status` |
| `till_device_assignments` | `tenant_id`, `outlet_id`, `till_id`, `pos_device_id`, `assigned_at`, `assigned_by_tenant_user_id`, `released_at`, `released_by_tenant_user_id`, `release_reason` |

## Non-Functional Requirements

- **Architecture:** existing Clean Architecture, componentized screen and one
  shared branding renderer.
- **Security:** no raw code storage/logging, tenant isolation, server-authorized
  permission, and no pre-success trusted local state.
- **Reliability:** network failure cannot fake success; persist only server
  success; malformed local state recovers safely.
- **Responsive/accessibility:** tablet-first landscape, keyboard-safe, long
  errors supported, adequate contrast, semantic label/loading state and
  compliant touch targets.

## Evidence-Based Current State — 2026-08-10

| Check | Status | Evidence |
|---|---|---|
| `tenant.till.manage` enforced by activation endpoint | **IMPLEMENTED / VERIFIED** | Service permission gate and controller 403 mapping; Local Development 401/403/authorized runtime accepted on 2026-08-11 |
| `USED` code cannot re-pair a changed fingerprint | **IMPLEMENTED / VERIFIED** | Re-pair helper removed; same/changed fingerprint POST reuse both returned 409; current-device GET remains trusted/idempotent |
| Flutter persists `tenantSlug` in `PosDeviceContext` | **IMPLEMENTED** | DTO mapping plus `toJson`/`fromJson` and secure device-context storage include `tenantSlug` |
| Login branding renderer extracted | **IMPLEMENTED** | `PosLoginBrandingPanel` exists |
| Activation consumes the shared branding renderer | **PENDING** | Existing `DeviceActivationScreen` still owns `_ActivationBrandPanel` |

## Completion Criteria

- The existing screen matches the shared Login visual/component contract.
- Backend permission and USED-code drift are fixed and runtime-verified; Flutter
  implementation/runtime acceptance remains pending Chunk 2.
- Server success produces exactly one trusted context with `tenantSlug`; failure
  produces none.
- Tenant isolation, responsive UI, accessibility and canonical next-route
  behavior pass focused and authenticated runtime verification.

## Related Files

- [[01_Login_Flow]]
- [[../../04_MODULE_KNOWLEDGE/02_Tenant_Foundation/04_POS_Login_Branding_Functional_Rules]]
- [[../../04_MODULE_KNOWLEDGE/02_Tenant_Foundation/05_POS_Login_Branding_Technical_Contract]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Device_Activation_Screen_Implementation_Specification]]
- [[../../02_ACCESS_CONTROL/API_Authorization_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/08_Outlet_Till_And_POS_Device_Foundation_UPDATED]]
