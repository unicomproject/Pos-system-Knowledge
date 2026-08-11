<!-- title: Flutter Device Activation Screen Implementation Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-10 -->

# Flutter Device Activation Screen Implementation Specification

## Decision Summary

| Decision | Canonical result |
|---|---|
| Existing `DeviceActivationScreen` | **MODIFY** |
| Duplicate activation screen | **NOT ALLOWED** |
| Shared Login/Activation branding panel | **REQUIRED** |
| Component-wise implementation | **REQUIRED** |
| Feature-level hardcoded colour literals | **NOT ALLOWED** |
| New API / permission / table / physical column | **NO** |

This specification controls the Flutter presentation implementation. Functional,
security, API, permission and database authority remains
[[../03_USER_JOURNEYS/Cashier/02_Device_Activation_Flow]].

## Component Composition

```text
DeviceActivationScreen
├── PosLoginBrandingPanel (shared reusable presentation)
└── DeviceActivationForm
    ├── ActivationHeading
    ├── ActivationSubtitle
    ├── ActivationCodeField
    ├── ActivationErrorState
    └── SharedPrimaryAction
```

The shared panel receives existing Login Branding state and renders background,
logo, brand name, system name, description and hero. It must use the exact
Login fallback/image/error semantics. `loginSubtitle` remains outside the panel
and is not shown on Activation.

When no tenant branding can be resolved before first activation, pass packaged
OneVerz fallback branding to the same component. Do not add a Tenant Code field
or create an Activation-specific branding datasource/cache/API.

## Form Visual Contract

- Heading: `Activate Device`; Login-sized orange vertical accent,
  near-black `Activate`, orange `Device`.
- Subtitle: `Enter your device activation code to continue.` using the Login
  subtitle typography and muted foreground.
- Label/placeholder: `Device Activation Code` / `Enter device activation code`
  using the shared Login form hierarchy.
- Input: shared radius/border/padding conventions and orange key icon.
- Action: `Activate Device` using the approved orange primary action and
  far-right arrow; loading preserves size and blocks duplicate submission.
- Error: safe, readable, wrap-capable and reachable with the software keyboard.

Use canonical theme typography, colour, spacing and radius tokens plus shared
button/input components. Do not write direct `Color(0xFFFF...)` values inside
Activation feature widgets. Add a missing semantic token once to the canonical
theme file, then reuse it.

## Architecture Responsibilities

| Layer | Responsibility |
|---|---|
| `presentation/screens` | Responsive composition and canonical navigation only |
| `presentation/widgets` | Focused shared/presentational components only |
| `presentation/providers` | Loading, duplicate-submit guard, safe errors and use-case orchestration |
| `application` | Activate/current-device use cases |
| `domain` | Device context/entities and repository contracts |
| `data` | API DTO mapping, repository implementation, fingerprint and secure persistence |

Widgets must not perform HTTP, parse DTOs, generate/persist fingerprints or
implement activation business rules. Preserve the existing feature-first
`device_activation/{application,data,domain,presentation}` structure.

## Responsive and Accessibility Acceptance

- Primary acceptance viewport: tablet landscape.
- Compact supported widths stack safely without overflow.
- Form remains reachable above keyboard/view insets.
- Long field/server errors wrap without clipping or layout jumps.
- Input has a programmatic label; action exposes button/loading semantics.
- Contrast and touch targets follow the canonical Design System.

## Existing Implementation Assessment — 2026-08-10

| Area | Status | Current evidence / required change |
|---|---|---|
| Existing screen and feature-first layers | **IMPLEMENTED** | Screen, form, provider, use case, datasource, repository and storage exist |
| Required field, loading and duplicate guard | **IMPLEMENTED** | Form validator and `isSubmitting` guard exist |
| Successful secure context + `tenantSlug` persistence | **IMPLEMENTED** | `PosDeviceContext`, mapping and storage include `tenantSlug` |
| Shared Login branding component exists | **IMPLEMENTED** | `PosLoginBrandingPanel` exists under Auth presentation |
| Activation shared-panel reuse | **PENDING** | Activation still contains private hardcoded `_ActivationBrandPanel` |
| Target heading/form typography and orange treatment | **PENDING** | Current form does not yet match the approved Login treatment |
| No feature-level direct colour codes | **PENDING** | Current screen/form contain direct colour literals that must move to/reuse tokens |
| Backend `tenant.till.manage` enforcement | **DRIFT / BLOCKS SIGN-OFF** | Current activation controller proves `TenantOnly` only |
| Canonical `USED` code behavior | **BACKEND COMPLETE** | Backend rejects same/changed fingerprint USED-code reuse; trusted lookup remains on `GET /devices/current`. Flutter Chunk 2 remains pending. |

## Implementation Acceptance

Implementation is ready to begin only within the existing screen. Final
completion requires focused widget/provider tests, permission/backend security
tests, same-device idempotency tests, changed-fingerprint USED-code rejection,
tablet/compact visual checks and one authenticated controlled activation flow.

## Related Files

- [[Flutter_App_Architecture]]
- [[Flutter_Folder_Structure]]
- [[../07_UI_UX_KNOWLEDGE/Design_System]]
- [[../04_MODULE_KNOWLEDGE/02_Tenant_Foundation/05_POS_Login_Branding_Technical_Contract]]
- [[../15_IMPLEMENTATION_TRACKING/Backend/OutletTillDevice/Device_Context_Implementation_Status]]
