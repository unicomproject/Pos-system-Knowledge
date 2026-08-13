# Open Till / Close Till Orange Visual Direction

**Status:** Active — approved cashier visual target  
**Last updated:** 2026-08-14  
**System:** OneVerz POS MVP

## Purpose

Records the approved **orange-accent** visual direction for Cashier **Open Till** and **Close Till** screens (source screenshots provided 2026-08-14).

This is the Flutter presentation contract. Backend open/close APIs remain unchanged.

## Brand tokens (canonical)

Do **not** hard-code hex in feature widgets. Use:

| Usage | Token |
|---|---|
| Primary orange action / focus / outline | `TenantAdminColors.posHomeAccentOrange` (`#FF6A00`) |
| Content surface | `TenantAdminColors.surface` |
| Page / shell background | `TenantAdminColors.background` |
| Primary text | `TenantAdminColors.bodyText` |
| Secondary text | `TenantAdminColors.mutedText` |
| Success | `TenantAdminColors.success` |
| Error / clear | `TenantAdminColors.danger` |
| Soft orange surface (summary accents) | `TenantAdminColors.expectedCashSurface` |

General Design System rule: cashier primary action is OneVerz orange — see [[../07_UI_UX_KNOWLEDGE/Design_System]].

## Open Till — approved UI

### Structure

- Header: OneVerz branding + till status context
- Left: title **Open Till**, subtitle with till name, **Starting Cash Amount** field, optional note, Till Summary (Outlet)
- Right: **Quick Amounts** (100 / 500 / 1,000) + numeric keypad
- Bottom: full-width primary **Open Till** CTA (lock icon + helper line)

### Visual rules

- Starting cash field: orange border (enabled + focused)
- Quick amount chips: orange outline + orange label
- Primary CTA: solid orange fill, white label
- Valid amount: green success status (“Amount is valid”)
- Titles/values: dark body text (not purple admin primary)

### Behaviour (unchanged)

- `POST /api/v1/tills/open` with trusted device + non-negative opening float
- Journey: [[../03_USER_JOURNEYS/Cashier/03_Till_Open_Flow]]

## Close Till — approved UI

### Structure

- Back control + title **Close Till** + subtitle
- Info row: Till / Opened By / Opened Time / Expected Cash
- Left form: Counted Cash *, Expected Cash (read-only), difference badge, mismatch reason, notes
- Right: Till Close Summary (+ variance warning when needed)
- Footer: **Save Draft** (orange outline) + **Close Till** (solid orange)

### Visual rules

- Counted cash field: orange border
- Info icons: orange accent on soft orange surface
- Save Draft: orange outline button
- Close Till: solid orange primary button
- Balanced / short / over: existing semantic success/danger tokens

### Behaviour (unchanged)

- `POST /api/v1/tills/close` with counted cash; mismatch reason when variance ≠ 0
- Save Draft is **device-local form draft only** (not a new backend draft API)
- Journey: [[../03_USER_JOURNEYS/Cashier/11_Till_Close_Flow]]

## Implementation tracking

- Flutter Open Till layout history: [[../15_IMPLEMENTATION_TRACKING/Flutter/Till/Open_Till_Screen_Layout_Implementation_Status]]
- Flutter Close Till / End Shift: [[../15_IMPLEMENTATION_TRACKING/Flutter/Sales/End_Shift_And_Close_Till_Implementation_Status]]
- Backend APIs: [[../15_IMPLEMENTATION_TRACKING/Backend/OutletTillDevice/Till_Session_Open_Close_Implementation_Status]]
- Orange visual completion status: [[../15_IMPLEMENTATION_TRACKING/Flutter/Till/Open_Close_Till_Orange_Theme_Implementation_Status]]

## Out of scope

- Backend schema / new open-close endpoints
- Durable server-side Close Till draft persistence
- Changing Payment Method / Cash Payment screens (already orange)
