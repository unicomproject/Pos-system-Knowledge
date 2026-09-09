<!-- title: Tenant Admin Online Store 9-Step Test Cases -->
<!-- status: Canonical Test Contract / Not Execution Evidence -->
<!-- last_updated: 2026-08-27 -->

# Tenant Admin Online Store 9-Step Test Cases

| ID range | Coverage |
|---|---|
| OS-AUTH-001–008 | unauthenticated, inactive tenant, missing `online_store`, missing `click_collect`, each permission denied, tenant isolation, media ownership, outlet ownership |
| OS-OV-001–006 | overview/readiness projection, PASS/BLOCKED reasons, progress stability, setup resume, live mode, no Flutter-owned readiness |
| OS-ACT-001–004 | enable/disable setup, no implicit publish, no implicit channel activation, audit |
| OS-ID-001–008 | required names, normalization, email/phone/length validation, tenant ownership, update and audit |
| OS-DOM-001–014 | slug validation, add domain, duplicate/cross-tenant, invalid token, verify, rotate, SSL precondition/failure/retry, primary uniqueness, remove, hosted-only readiness |
| OS-BRD-001–014 | logo/favicon/banner upload, invalid MIME/size/dimensions, ownership, retry/replace/remove, CRUD/status/order, active-banner readiness |
| OS-SUP-001–008 | email/phone validation, address/hours persistence, WhatsApp/help URL, Contact Us state, backend mandatory-set mismatch |
| OS-CC-001–012 | enable, tenant outlet list, inactive/deleted/cross-tenant outlet, hours, lead/cut-off/window, bulk apply, weekend/blackout mismatch, readiness |
| OS-CAT-001–010 | summary/list pagination, product/variant visibility, bulk update, tenant/channel isolation, no Product Master duplication |
| OS-POL-001–012 | four-vs-five mismatch, draft, edit, publish, unique published version, history, archive, invalid type, cross-tenant |
| OS-PUB-001–010 | blocked publish, successful publish, missing key, same-key replay, conflicting retry, audit, timestamp, hosted/primary URL, Step 9 result, live overview |
| OS-UI-001–010 | 1024×768, portrait reflow, no overflow, loading/empty/error/denied states, permission controls, button semantics, progress labels, accessibility |

## Acceptance Gate

This file is a test contract, not PASS evidence. Contract acceptance requires automated backend/API/PostgreSQL/Flutter tests plus authenticated E2E evidence. GAP-OS-01, 03, 04 and 05 must be intentionally resolved before final publish-flow acceptance.

Canonical journey: [[../../../03_USER_JOURNEYS/Tenant_Admin/22_Online_Store_Setup_And_Publish_Flow]].
