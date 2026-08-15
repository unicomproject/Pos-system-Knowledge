<!-- title: Open Till Feature -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-11 -->

# Open Till Feature

## Purpose

Authoritative contract for Cashier **Open Till** before POS sale operations.
Backend APIs, schema and permission already exist. This document freezes
requirements, business rules, API/DB reuse and known gaps before Flutter UI
alignment work.

Flutter presentation authority:
[[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Open_Till_Screen_Implementation_Specification]].
Journey: [[../../03_USER_JOURNEYS/Cashier/03_Till_Open_Flow]].

## Implementation Readiness

| Layer | Status |
|---|---|
| Requirements / Second Brain | **DOCUMENTED** |
| Backend contract | **EXISTING / REUSE** |
| New API / table / DB attribute / permission / migration | **NOT REQUIRED** |
| Frontend presentation vs approved UI contract | **COMPLETED** |
| Production runtime / E2E acceptance | **PASSED (2026-08-11)** |
| Feature Completed | **Yes — production-ready (Open Till UI + existing APIs)** |

## Entry Conditions

- Cashier authenticated in tenant context.
- POS device context resolved (`GET /api/v1/devices/current`).
- Device ACTIVE + trusted.
- Active Till assignment (`released_at IS NULL`).
- Assigned Till ACTIVE.
- No OPEN till session for that Till, or UI routes away after current-session restore.
- Caller has `pos.till.open` (backend mandatory; Flutter gate is UX only).

## Functional Requirements

| ID | Requirement |
|---|---|
| F1 | Authenticated cashier can access Open Till when POS context requires a till open |
| F2 | Current POS device context must be resolved |
| F3 | Device must resolve to its active Till assignment |
| F4 | Relevant Till and Outlet context must be displayed |
| F5 | Cashier can enter Starting Cash / Opening Float |
| F6 | Opening Float = 0 is valid |
| F7 | Negative Opening Float is invalid |
| F8 | Quick Amount controls populate/change the opening amount |
| F9 | Numeric keypad enters the amount |
| F10 | Clear/backspace behaviour continues working |
| F11 | Optional Opening/Till Note |
| F12 | Till Summary shows resolved Till/Outlet context |
| F13 | Open Till CTA submits the Open Till request |
| F14 | On backend success, a Till Session is created/opened |
| F15 | After success, cashier continues into the POS flow |
| F16 | Already-open Till must not create a duplicate open session |
| F17 | Validation/API failures shown honestly |
| F18 | Repeated submit while in progress prevented |
| F19 | UI never claims OPEN until backend confirms success |

## Business Rules

| ID | Rule |
|---|---|
| BR-01 | One active OPEN Till Session per Till. DB: `UNIQUE(till_id) WHERE closed_at IS NULL`. Conflict: `till_session.already_open` |
| BR-02 | Opening Float >= 0; `0.00` valid; negative invalid (`till_session.invalid_opening_float`) |
| BR-03 | Device must be ACTIVE and trusted |
| BR-04 | Device must have an active Till assignment (not released) |
| BR-05 | Requested Till must match assigned Till (`till_session.till_mismatch`) |
| BR-06 | Assigned Till must be ACTIVE (`till_session.till_inactive`) |
| BR-07 | Device, assignment, Till, Outlet, session stay in authenticated tenant |
| BR-08 | Permission `pos.till.open` required to open |
| BR-09 | Backend is final authority for OPEN success |
| BR-10 | Open Till is **not** offline-authoritative — no fake OPEN, no local-only success, no queue that lets the cashier operate as if opened |
| BR-11 | Operations requiring an open session continue only after a valid current Till Session exists |

## Canonical Logic Flow

```text
Authenticated Cashier
  → Resolve Current POS Device
  → Validate Device Exists
  → Validate Device ACTIVE + TRUSTED
  → Resolve Active Device → Till Assignment
  → Resolve Assigned Till
  → Validate Till ACTIVE
  → Validate Tenant Context
  → Validate pos.till.open
  → Load Open Till Screen Context
  → Enter Opening Float (+ optional Opening Note)
  → Validate Opening Float >= 0
  → POST /api/v1/tills/open
  → Backend validates Device/Till/Permission/Tenant
  → Backend rejects if OPEN session exists
  → Backend generates session_number
  → Backend creates OPEN till_sessions row
  → Backend returns canonical Till Session
  → Flutter updates authenticated POS state
  → Cashier continues into POS
```

Opening Note: optional; whitespace trimmed; blank/whitespace-only becomes `null`
(matches `PosTillSessionService`). Session number is backend-generated — no UI
entry field.

## Permission

| Action | Permission |
|---|---|
| Open Till | `pos.till.open` |
| Current session resolve | any of `pos.till.open`, `pos.till.close`, `till.session.view` |

Frontend permission checks are not security boundaries.

## API Contract (reuse only)

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/v1/devices/current` | Device/outlet/till bootstrap (ids, names, trusted, default float, currency) |
| GET | `/api/v1/tills/current-session?deviceId={deviceId}` | Detect/restore open session |
| POST | `/api/v1/tills/open` | Open Till |

### POST `/api/v1/tills/open` request

`deviceId`, `tillId`, `openingFloat`, `openingNote` (nullable).

### Success response (`CurrentTillSessionDto`)

`id`, `outletId`, `tillId`, `openedDeviceId`, `openingFloat`, `status` (`open`),
`openedAt`, `openingNote`.

New API required: **NO**.

## Error Contract (verified)

| HTTP | Code |
|---|---|
| 400 | `till_session.invalid_device_id`, `till_session.invalid_till_id`, `till_session.invalid_opening_float` |
| 401 | `till_session.invalid_tenant_context` |
| 403 | `till_session.permission_denied`, `till_session.device_not_trusted`, `till_session.till_mismatch`, `till_session.till_inactive` |
| 404 | `till_session.device_not_found`, `till_session.till_not_assigned`, `till_session.till_not_found`, `till_session.not_found` |
| 409 | `till_session.already_open` |

## Database Contract

Primary: `till_sessions`. Supporting: `pos_devices`, `till_device_assignments`,
`tills`, `outlets`, `tenant_users`, `currencies`. Audit table:
`till_session_events` (schema allows `OPENED`).

New table / attribute / migration: **NO**.

Relevant `till_sessions` attributes: `id`, `tenant_id`, `outlet_id`, `till_id`,
`session_number`, `business_date`, `opened_by_tenant_user_id`,
`closed_by_tenant_user_id`, `opened_from_pos_device_id`,
`closed_from_pos_device_id`, `opening_float_amount`, `currency_code`, `status`,
`opened_at`, `closed_at`, `opening_note`, `closing_note`, `created_at`,
`updated_at`.

## Opening Note 100-character UI point

Flutter currently uses `maxLength: 100` (`0/100` counter). Backend
`opening_note` is `text` with trim/null only — **no approved 100-char backend
rule**. Treat 100 as UI constraint only. Do not add DB/API for this in Open Till
implementation unless separately approved.

## Audit / Event Gap (do not implement in docs-only work)

| Operation | Writes `till_session_events`? |
|---|---|
| Open Till | **NO** — creates `till_sessions` only; no `OPENED` event factory/write |
| Close Till | **YES** — `TillSessionEvent.RecordClosed` → `CLOSED` |

Schema CHECK allows `OPENED`. Missing Open Till `OPENED` event is an
**implementation gap** for a future task — not a reason for new API/table now.

## Online / Offline / State

- Open Till requires online backend confirmation.
- Cached “current till session” may restore an already-confirmed OPEN session;
  it must not invent OPEN.
- Local state follows backend-confirmed session only.
- Loading must block duplicate submit.

## Non-Functional

Security (backend auth + tenant isolation), data integrity (server duplicate
prevention), Phone + Tablet + Desktop responsive, touch-friendly tablet targets,
readable desktop without stretched controls, phone reflow (not shrunk desktop),
honest errors, repository/provider boundaries, no giant single widget.

## Related Files

- [[03_Technical_Contract]]
- [[02_Functional_Rules]]
- [[../../15_IMPLEMENTATION_TRACKING/Backend/OutletTillDevice/Till_Session_Open_Close_Implementation_Status]]
- [[../../15_IMPLEMENTATION_TRACKING/Flutter/Till/Open_Till_Screen_Layout_Implementation_Status]]
