<!-- title: POS Cash Drop Chunk 2 Production Acceptance 2026-08-16 -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-16 -->

# POS Cash Drop — Chunk 2 / Final Software Acceptance Evidence

**Verdict:** `PASS — CASH DROP SOFTWARE PRODUCTION ACCEPTANCE COMPLETE`

**Previous blocker closed:** Live authenticated Flutter↔API↔PostgreSQL E2E (API restored; Pixel Tablet runtime).

## Previous gaps closed

| Gap | Previous | Verification | Final | Code fix? |
|---|---|---|---|---|
| Live authenticated E2E | BLOCKED (API down) | Pixel Tablet Flutter UI → POST movements → DB | PASS | Migration apply only |
| Full Backend regression | Not run | `dotnet test E_POS.sln -c Release` + retry of env flakes | PASS* | No Cash Drop fix |
| Full Flutter regression | Focused only | `flutter analyze` + `flutter test` | PASS (1077) | No |
| Runtime responsive | Widget only | Pixel Tablet landscape + phone/portrait wm overrides + screenshots | PASS | No |

\* Full solution first/second pass hit AccessControl disposable-Postgres `Npgsql` read timeouts while the live Development API was also polling the same DB. The four failing tests are **not** HardwareCash/Cash Drop. Isolated re-run of those four tests: **4/4 PASS**. Focused `PosCashDrawer*` suites: **21+18+7 PASS**. Cash Drop concurrency PG test remains PASS.

## Runtime environment (safe)

- Backend: `http://localhost:5150` (Development)
- Database: `UnifiedCommerceDb` @ localhost:5432 (reachable)
- Flutter target: Pixel Tablet emulator `emulator-5554` (Android 15), landscape 2560×1600
- Tenant: `DEV-TENANT-001`
- Outlet: Development Main Store
- Cashier: Kavin (`CASHIER001@GMAIL.COM`)
- Device: Web POS · ACTIVE (trusted)
- Till: Front Till 01
- Till Session: OPEN `1c51b7c2-51bd-4e20-895f-423a403508e9`
- Currency: LKR (session authoritative)

## Live authenticated Cash Drop E2E

Preconditions: seeded OUT migration applied; Cash In Float Added **1500** to create available cash.

```text
Expected cash before: 1500.00 LKR
Available cash before: 1500.00 LKR
Movement type: Safe Drop (CASH_DROP / OUT)
Amount: 500.00
Request result: success (UI returned to Cash Drawer)
Movement ID: c7564819-e851-40d2-ad10-8a2e351fee85
Request ID: e076812f-5aa7-4ea6-85a3-e78a0f6fde48
Expected cash after: 1000.00 LKR (Cash Drawer UI + DB)
Available cash after: 1000.00 LKR
Flutter refresh: YES (no restart)
DB row verified: YES (cash_movements)
Legacy dual-write: NO (till_cash_movements count unchanged at 3)
```

OUT catalogue live from API (dropdown): Bank Deposit, Cash Correction, Cash Pickup, Other, Safe Drop, Security Transfer.

## Database verification

```text
Seed migration applied: 20260816034300_CanonicalizeCashDropMovementTypes
OUT types: 6 ACTIVE system types
cash_movements row: 1 new OUT CASH_DROP 500 LKR
request_id: e076812f-5aa7-4ea6-85a3-e78a0f6fde48
currency: LKR
direction: OUT
New Cash Drop table: NO
New attribute: NO
Legacy dual-write: NO
```

## Full Backend regression

```text
Release build: PASS (0 errors; 1 pre-existing CS8604 warning in CurrentStockController)
LocalPrintAgent.Tests: 48 passed
Flow4FixtureCli.Tests: 17 passed
UnitTests: 1095 passed
ApiTests: 469 passed
IntegrationTests (contended pass): 551–552 passed; AccessControl PG Dispose timeouts under live API
IntegrationTests (isolated retry of failures): 4 passed
Focused PosCashDrawer Integration/Unit/Api: 21 / 18 / 7 passed
```

Combined mandatory suites excluding contended flake window: **green**. Failures were environment contention, not Cash Drop regressions.

## Full Flutter regression

```text
flutter analyze: No issues found
flutter test: 1077 passed
Focused cash_drawer: 49 passed (earlier window)
```

## Responsive runtime

Artifacts under `_cashdrop_e2e_artifacts/` (local evidence folder):

| Target | Device/viewport | Layout | Scroll | Overflow | Actions | Screenshot |
|---|---|---|---|---|---|---|
| Tablet landscape | Pixel Tablet 2560×1600 | 2-col parent card | No full-page scroll | None observed | Cancel/Confirm visible | `06`/`08`/`12` |
| Tablet portrait | wm 1600×2560 | stacked usable | adaptive | None observed | Cancel/Confirm present | `13` |
| Phone | wm 1080×2400 | stacked | allowed | None observed | Cancel/Confirm present | `11` |
| Desktop/Web | not required this run | — | — | — | — | Widget coverage only |

## Printing

```text
Status: NOT IMPLEMENTED
Mandatory or optional: optional
Financial dependency: none
Production impact: does not block software production readiness
```

## Chunk 1 concurrency (retained)

Concurrent over-drop 7000+7000 on 10000 → one success, one `insufficient_expected_cash`, final 3000, one row — PASS.

## Final production verdict

```text
CASH DROP SOFTWARE FLOW IS PRODUCTION READY
```
