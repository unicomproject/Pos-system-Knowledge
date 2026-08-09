# Tenant Admin Add Till UI Specification

## Overview
This defines the canonical source of truth for the Tenant Admin Add Till UI, reflecting the Single Page Form approach implemented in `Nytroz-POS-App`.

## Target Layout
*   **Wrapper**: Uses `TenantAdminPageScaffold` for responsive rendering across 16:9 desktops, laptops, and tablets.
*   **Form Structure**: A single vertical scrollable page (not a step-by-step wizard).
*   **Theme Integration**: Designed with the "Black/Orange Shell" aesthetic (TenantAdminTheme).

## Architectural Constraints (CRITICAL)
*   **Strict API Source**: The Add Till screen MUST ONLY rely on the `GET /api/v1/tenant-admin/tills/create-options` endpoint (via `tillCreateOptionsProvider`). 
*   **No Legacy Endpoints**: The Add Till screen MUST NOT watch or fetch from global paginated endpoints such as `GET /api/v1/tenant-admin/users` (e.g. `userListProvider`) or `GET /api/v1/tenant-admin/hardware` (e.g. `hardwareListProvider`). Doing so causes 409 Conflict or 404 Not Found errors as well as unintended Dropdown assertions when outlet selections change.

## Key UI Sections (`AddTillSinglePageForm`)

### 1. Till Details Section
*   **Till Name**: Maximum length validation of 120 chars (Backend limitation).
*   **Till Code**: Maximum length validation of 40 chars (Backend limitation). Must be unique per tenant (excluding `DELETED`).
*   **Outlet Selection**: Dropdown sourced from `TillCreateOptionsDto.outlets`.
*   **Default Cashier**: Dropdown sourced from `TillCreateOptionsDto.cashiers`. Must dynamically update when the Outlet selection changes.
*   **Status**: Dropdown for `Active`, `Inactive`, `Maintenance`.

### 2. Hardware Setup Section
*   **Pos Device Selection**: Sourced purely from `options.posDevices`.
*   **Peripheral Selections** (Receipt Printer, Barcode Scanner, Cash Drawer, Card Reader): Sourced from `options.hardwareDevices` where `type` matches the expected peripheral category.
*   **Dual-Mode Inputs**: Peripheral dropdowns allow the user to either SELECT an existing device (by ID) or TYPE a custom name to dynamically register a new hardware device inline during Till creation. The text entered is bound to the `AddTillFormData` fields (e.g., `scannerName`, `printerName`) and forwarded to the backend.
*   **Filter Logic Requirement**: Peripheral dropdowns must only show devices that belong to the *currently selected Outlet*.

### 3. Quick Pair & Status Panel
*   **Purpose**: To provide real-time connection telemetry for selected hardware prior to submission.
*   **Current State**: Static UI stub. Requires real telemetry integration via SignalR or periodic polling. Only selected hardware IDs are rendered; typed inline hardware names (which do not yet have an ID) will not appear in Quick Pair until the Till is successfully created.

## Data Contracts (Target state)
To properly render the Add Till UI, the API (`GET /api/v1/tenant-admin/tills/create-options`) must supply:
*   `outlets`, `cashiers`, `posDevices`, and `hardwareDevices`.
*   `outletId` for all hardware and pos devices (for filtering).
*   `isAssigned`, `status`, and `isTrusted` (for Quick Pair statuses).
