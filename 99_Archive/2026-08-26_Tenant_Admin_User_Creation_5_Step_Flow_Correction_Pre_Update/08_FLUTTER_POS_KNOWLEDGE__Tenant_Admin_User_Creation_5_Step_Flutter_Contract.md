<!-- title: Tenant Admin User Creation 5-Step Flutter Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-25 -->

# Tenant Admin User Creation 5-Step Flutter Contract

## Current vs Target

Current Flutter source implements a three-step Add User wizard: Basic Information, Access Setup, and Security & Review. The canonical target is five steps. This document is an implementation contract only; no Flutter code was changed during the 2026-08-25 Second Brain update.

## State Model

Maintain one wizard state containing identity, selected role ID, role/catalog snapshot, additive direct permission IDs, outlet scope/IDs, profile media asset ID, invite/status choice, and validation errors. Derived permission/module summaries must be recalculated rather than stored as independent authority.

## API Sequence

1. Load `GET /api/v1/tenant-admin/users/create-options`.
2. Load selected role detail and backend permission catalog as needed for preview.
3. Stage one profile image and retain its media asset ID.
4. Submit one `POST /api/v1/tenant-admin/users` with `Idempotency-Key`.
5. Render server validation and refresh from the authoritative user projection.

## Guards

- Do not hardcode role authorization or role choices.
- Do not treat hidden controls as security.
- Do not send tenant ID or actor ID from client state.
- Do not send `ACTIVE`, plaintext temporary password, explicit denies, or unsupported till/default fields.
- Do not silently remove rejected permissions; present the server error and allow correction.
- Changing role invalidates incompatible direct grants and selected summaries.

## Known Implementation Gaps

- Three-step screen must be refactored into five steps.
- Dedicated user profile image upload/staging endpoint is absent; current reuse of outlet upload is a different permission contract.
- User-specific till selection/default till has no backend mapping.
- Save draft, access start date, notes, 2FA, and outlet-specific role override are not supported by the current create DTO.
