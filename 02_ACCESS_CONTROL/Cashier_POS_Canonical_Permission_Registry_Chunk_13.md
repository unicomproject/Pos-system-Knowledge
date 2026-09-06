<!-- title: Cashier POS Canonical Permission Registry — Chunk 13 -->
<!-- status: Active — Cash Drawer / Movements / Open Drawer / Till Visibility — FINAL PASS -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-05 -->

# Cashier POS Canonical Permission Registry — Chunk 13

## Result

| Field | Value |
| --- | --- |
| Result | **PASS** (final completion — Open Till per-key gap closed) |
| New canonical codes | **0** |
| Backend / DB / seed | **NONE** |
| Full route-guard overhaul | **NOT implemented** |
| Tenant Admin UI | **NOT modified** |
| Chunk 14 | **PASS** — see [[Cashier_POS_Canonical_Permission_Registry_Chunk_14]] |

## 1. Architecture

Chunk 5 → `AuthSession` → `EffectivePermissionSet` → `PosCashDrawerTillVisibility` / `PosPermissionAccess` exact membership → UI filter-before-build.

Denied = absent. Backend Chunk 6/7 remain final authorities.

## 2. Cash Drawer main screen

| Element | Canonical | Denied |
| --- | --- | --- |
| Screen | `pos.cash_drawer.position.view` (+ legacy `cash_drawer.view`) | Forbidden |
| Till / Status / Opening / Sales / Expected | `pos.cash_drawer.summary.*` | tile absent |
| Movements list | `pos.cash_drawer.movements.list` | section absent |
| Type / Date / Time / Cashier / Amount | matching movements children | column/cell absent |
| Open Drawer | `pos.cash_drawer.physical.manage` (+ legacy manage) | action absent |
| Cash In | `pos.cash_drawer.movements.cash_in` (+ legacy movement.create) | action absent |
| Cash Drop | `pos.cash_drawer.movements.cash_drop` (+ legacy) | action absent |
| Close Till | `pos.till.session.close` (+ legacy) | action absent |

**Cash Out dedicated screen:** **NO_UI_SURFACE** — production only has Cash Drop route; former "Cash Out / Drop" label renamed to Cash Drop and gated by cash_drop.

## 3. Open Drawer reasons

Independent exact codes under `pos.cash_drawer.open_reason.*`. Filtered by stable reason id (no static indexes). Continue requires `physical.manage`. Cancel remains STRUCTURAL_CONTROL. Manager PIN/password remains business state (does not bypass permission).

## 4. Cash In / Drop children

Exact `pos.cash_movements.cash_in.*` / `cash_drop.*` for till, expected, available, amount, reason, note, manager_pin, summary, resulting_balance, confirm.

Legacy `cash_drawer.movement.create` remains compatibility OR for action access only (full-access regression).

## 5. Open / Close Till

Open: `pos.till.session.open` (+ legacy `pos.till.open`) + opening children.  
Close: `pos.till.session.close` (+ legacy) + closing children.

**Blind count:** Difference / balance status / short-over summary require Expected Cash visibility (`canExposeCloseTillDifferenceUi`). Counted entry may remain without expected. Default counted-from-expected is skipped when expected denied.

## 6. Drawer finalize callback

Agent status callback auth-only (Chunk 6). No cashier Finalize UI. Classification: **SAFE_INTERNAL_CALLBACK / NO_UI_SURFACE**. Not a Chunk 13 security blocker.

## 7. Legacy test resolution

| Issue | Status |
| --- | --- |
| `cash_drawer_provider_test` nullability (`double? +`) | **PRE_EXISTING_BUT_NOW_IN_SCOPE_FIXED** |
| Screen tests expecting disabled actions | **OBSOLETE_TEST_FIXTURE_UPDATED** (absent, not disabled) |

## 8. Canonical freeze

Added 0 / Removed 0 / Renamed 0 / Invented **NO**

## 9. NO_CANONICAL_MAPPING / NO_UI_SURFACE / NO_ENDPOINT

- Dedicated Cash Out screen/workflow: **NO_UI_SURFACE**
- Drawer finalize cashier UI: **NO_UI_SURFACE** / SAFE_INTERNAL_CALLBACK

## 10. Deferred

Chunk 14 final Phone/Tablet/Desktop full-suite regression.

---

## FINAL COMPLETION — Open Till numpad / per-key gap (2026-09-05)

### 1. Catalog verification

Independent Open Till numpad/key permissions exist: **YES** (Outcome A).

Sources checked:

- `02_ACCESS_CONTROL/Cashier_POS_Canonical_Permission_Registry_Chunk_2.md` (`pos.till.session.open` children)
- `lib/core/access/cashier_pos/cashier_pos_canonical_permission_codes.dart`

Exact frozen child codes under `pos.till.session.open`:

| Code | Control |
| --- | --- |
| `pos.till.opening.starting_cash_view` | Starting cash display / seeded default float |
| `pos.till.opening.starting_cash_entry` | Amount mutation authorization |
| `pos.till.opening.validation_message` | Valid/error status message |
| `pos.till.opening.note_view` / `note_entry` | Note field |
| `pos.till.opening.quick_amounts` | Quick amounts container |
| `pos.till.opening.quick_slot_1` / `_2` / `_3` | 100 / 500 / 1000 |
| `pos.till.opening.numpad` | Numpad container |
| `pos.till.opening.key_0` … `key_9` | Digit keys |
| `pos.till.opening.key_00` | Double-zero |
| `pos.till.opening.key_decimal` | Decimal |
| `pos.till.opening.backspace` | Backspace |
| `pos.till.opening.clear` | Clear |
| `pos.till.opening.confirm_message` | Confirm button subtitle |

Confirm/submit action remains `pos.till.session.open` (no separate confirm-execute child).

### 2. Per-key mapping (production Flutter)

`OpenTillForm` (`lib/features/till/presentation/widgets/open_till_form.dart`) + helpers in `PosCashDrawerTillVisibility`:

- Container denied → digit keys absent (no reserved blank slots)
- Partial keys → dynamic reflow (denied keys omitted)
- Quick slots independent under container
- Backspace / clear are independent siblings (may render without numpad container)
- Parent `pos.till.session.open` alone → **0** protected children auto-rendered

### 3. Numpad container behavior

`pos.till.opening.numpad` required for digit/`00`/`.` **authorize** path (`canAuthorizeOpenTillKeyInput`). Container does **not** auto-grant child keys.

### 4. Quick amount behavior

Container + `quick_slot_1..3` independently. Denied slots omit (no blank space). Keyboard/shortcut not present for quick amounts.

### 5. Physical keyboard behavior

Shared authorize path with keypad: `Focus.onKeyEvent` → `_authorizeDigit` / `_authorizeBackspace` / `_authorizeClear`. Denied keys handled (no mutation). Digits 0–9, numpad 0–9, period/numpadDecimal, backspace/delete, escape=clear, enter=submit (requires `session.open`).

### 6. TextField / direct-input semantics

**Decision (cash-payment parity, catalog evidence):**

- `starting_cash_entry` = mutation authorization
- Individual `key_*` = keypad chrome **and** physical keyboard digit operations
- Amount `TextFormField` is **`readOnly: true`** (`keyboardType: TextInputType.none`) — no unrestricted OS typing bypass
- Seeded `defaultOpeningFloatAmount` only when `starting_cash_view` granted (view ≠ entry)

### 7. Parent-only / partial / revoke tests

Covered in `test/features/till/open_till_numpad_permission_matrix_test.dart` (BLOCKING A–E + keyboard + refresh + multi-size).

### 8. Accessibility / focus

Denied keys are not built (no Semantics / Tooltip / Focus / Shortcuts for absent keys). Unauthorized accessibility exposure: **0**.

### 9. Phone / Tablet / Desktop

Same effective set + same helpers; layout responsive only. Widget test pumps phone/tablet/desktop sizes for partial-key parity.

### 10. Canonical freeze

Added 0 / Removed 0 / Renamed 0 / Invented **NO**

### 11. Final Chunk 13 status

**PASS** — Open Till per-key carry-forward closed.

### 12. Remaining Chunk 13 gaps

**NONE**

### 13. Chunk 14

Not started. Ready for Chunk 14 final system-wide validation when scheduled.
