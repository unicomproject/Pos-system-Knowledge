<!-- title: Unified Commerce Backend — Known Limitations -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-10 -->


# Unified Commerce Backend — Known Limitations

## Purpose

Track gaps between the **active Unified Commerce backend** (`E_POS.Api`) and the
**Flutter POS frontend** / Second Brain API contracts.

## Active Backend

| Item | Value |
|---|---|
| Path | `POS Backend/Unified-Commerce` |
| Branch | `Sale_Screen` / `POS_UI` (verify current) |
| Dev URL | `http://localhost:5150` (see `launchSettings.json`) |
| Swagger | `/swagger` in Development |

## Resolved (2026-07-10)

| Item | Previous doc state | Current verified state |
|---|---|---|
| Tenant POS login | Missing `auth/tenant-login` | **Implemented** at `POST /api/v1/tenant-auth/login` |
| POS home API | Missing | **Implemented** `GET /api/v1/pos/home` |
| Till session APIs | Missing | **Implemented** current-session / open / close |
| Device bootstrap | Missing | **Implemented** devices/current + activate |
| POS products list | Missing | **Implemented** on `Sale_Screen` branch |

## Active Limitation 1 — POS checkout APIs missing

| | |
|---|---|
| **Flutter calls** | `POST /api/v1/pos/checkout/summary`, `start-payment`, receipt routes |
| **Unified Commerce exposes** | No matching `E_POS.Api` controllers (verified 2026-07-10) |
| **Blocks** | Cash payment completion, receipt fetch, backend-validated totals |

## Active Limitation 2 — POS catalog detail routes missing

| | |
|---|---|
| **Flutter calls** | `GET /api/v1/pos/products/{id}`, `GET /api/v1/pos/catalog/categories` |
| **Unified Commerce exposes** | List endpoint only (`GET /api/v1/pos/products`) |
| **Blocks** | Variant sheet detail from API, dynamic category chips |

## Active Limitation 3 — Real product data required

No POS catalog mock/seed is used. New Sale shows only tenant-created products with
active status, sellable flag, and default price list pricing.

## Active Limitation 4 — Dev port alignment

Flutter `api_config.dart` defaults to port **5150**. Confirm with
`launchSettings.json` before testing on emulator or device.

Physical devices need `--dart-define=API_BASE_URL` or `PC_LAN_IP`.

## What works today (cashier bootstrap)

| Check | Expected |
|---|---|
| `POST /api/v1/tenant-auth/login` | JWT + permissions |
| `GET /api/v1/devices/current` | Device context |
| `GET /api/v1/tills/current-session` | Open session or not found |
| `POST /api/v1/tills/open` / `close` | Session lifecycle |
| `GET /api/v1/pos/home` | Dashboard payload |
| `GET /api/v1/pos/products` | Product list (branch dependent) |

## Related Files

- [[Backend_Local_Development_Setup]]
- [[Environment_Variables]]
- [[../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cashier_POS_Implementation_Map]]
- [[../15_IMPLEMENTATION_TRACKING/Backend/Sales/Create_Sale_Implementation_Status]]
