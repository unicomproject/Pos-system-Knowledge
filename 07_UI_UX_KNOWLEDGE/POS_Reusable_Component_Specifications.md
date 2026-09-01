<!-- title: POS Reusable Component Specifications -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-01 -->

# POS Reusable Component Specifications

## Purpose and Authority

This is the canonical registry of reusable Flutter POS component specifications
that are provable from the current application source. It records implemented
ownership, dimensions, variants, theme dependencies and responsive composition.
It does not promote prototype pixels or feature-local literals into design
tokens.

Use this file with [[Design_System]],
[[../08_FLUTTER_POS_KNOWLEDGE/Frontend_Reusable_Component_Governance]] and the
relevant screen specification. Current source remains final evidence when this
registry is being updated.

## Interpretation Rules

- `FIXED` means the implementation declares the value directly or through a
  named token.
- `RESPONSIVE` means the implementation selects a declared value or composition
  from available width/state.
- `INHERITED` means Material `ThemeData` or an ambient `TextTheme` supplies the
  value; do not invent a number in screen code.
- `GAP` means no single shared owner/token exists or current implementations
  contradict each other. A gap is not permission to choose an arbitrary value.
- A screenshot/prototype controls hierarchy, arrangement and visual intent.
  This registry controls reusable dimensions, padding, radius, typography and
  colour authority. Do not copy screenshot pixels into each screen.

## Canonical Component Specification Table

| Component | Flutter path | Variant | Size | Padding / gap | Radius / border | Typography | Colour / token | Responsive rule | Classification |
|---|---|---|---|---|---|---|---|---|---|
| `OnlineOrderSummaryCard` | `lib/features/fulfilment_pickup/presentation/widgets/online_order_ui.dart` | count | Width from parent; no min/max width; natural height | H12, V14; icon→content 10 | Radius 12; 1 px `#E1E7F0` literal | Title inherited; count 21, w800 | Required `OnlineOrderSummarySemantic`; background at 5.5% alpha; icon circle at 12% alpha | OO-01: 6/3/2 columns at widths `>=1000`/`>=600`/below; card gaps 10 | SHARED within fulfilment feature; REUSE |
| `OnlineOrderSummaryCard` | same | rich content | Width from parent; OO-02 min height 84 compact, 92 standard | H12, V14; icon→content 10; title→content owned by supplied content | Same as count variant | OO-02 primary `bodyMedium` w800; secondary `bodyMedium`; emphasized amount `titleMedium` w800 | Collection/payment/items use named `OnlineOrderSummarySemantic` values | OO-02: row with 16 gap at `>=760`; stacked with 12 vertical gap below | EXTEND implemented; Collection/Payment/Items REUSE |
| `PosPrimaryActionButton` | `lib/shared/widgets/pos_action_buttons.dart` | standard / approved rich label | Height 56 by default; width intrinsic or full-width; caller may provide verified minimum height | H20, V14 by default; configurable icon gap | Radius `TenantAdminRadius.md` = 12 by default; caller may provide verified radius | Label w800 by default; supports verified text style, alignment and line count | Active gradient tokens by default; optional theme-derived background; white foreground; disabled border/muted tokens | Same component; optional full width | SHARED / EXTEND; consumers REUSE |
| `PosPrimaryActionButton` | same | compact | Height 48; otherwise standard contract | H20, V14; icon→text 8 | Radius 12 | Same | Same | `compact: true` | SHARED / REUSE |
| `PosBottomOutlinedButton` | same | standard secondary | Min height 56; intrinsic width | H20, V14 | Radius 12; Material outlined border/theme | Material button label (no component-local override) | Theme inherited | No explicit responsive variant | SHARED / REUSE |
| `OnlineOrderStatusChip` | `lib/features/fulfilment_pickup/presentation/widgets/online_order_ui.dart` | order status | Natural size; no declared min height | H9, V5 | Pill radius 99 | 12, w700, one line ellipsis | Implemented mapping: ready/ready-for-collection/completed green; preparing/picking/picked/packed blue; cancelled red; fallback orange | Content-sized; parent must provide wrapping | SHARED within fulfilment feature / REUSE |
| `PaymentStatusChip` | same | payment status | Natural size; no declared min height | H8, V4 | Radius 8 | 11, w700 | Exact normalized mapping: paid, pending, refunded, failed, unknown | Content-sized | SHARED within fulfilment feature / REUSE |
| `OnlineOrderScreenState` | same | empty/error/retry | Parent constrained; content padding 24 | Icon→message 10; message→retry 8 | None | Ambient body/button typography | Blue-grey icon; theme button | Centered in available space | SHARED within fulfilment feature / REUSE |
| `AppCachedNetworkImage` | `lib/shared/widgets/app_cached_network_image.dart` | generic network image | Caller owns width/height/aspect and memory cache dimensions | None | Caller owns clipping/radius | N/A | N/A | Caller supplies responsive size | SHARED / REUSE |
| OO-02 product thumbnail wrapper | `lib/features/fulfilment_pickup/presentation/widgets/online_order_detail_widgets.dart` | standard / compact | 100×100 standard; 60×60 compact | Row image→description 18 | Radius 10 | N/A | `surfaceContainerHighest`; image fallback icon inherited | `<600`: image plus stacked detail/quantity; otherwise row | FEATURE-LOCAL composition using shared image |
| `OrderItemsSection` | same | standard / compact | Width from parent; height from content/parent | Header H24 V22 standard; H14 V8 compact; row H24 V16 standard, H14 V6 compact | Card radius 14; 1 px `outlineVariant`; elevation 0 | Header `titleLarge` w800; product `titleMedium` w800; quantity `titleLarge` w800 | `surfaceContainerLowest` | Compact selected by OO-02 fixed landscape; row stacks quantity below detail under 600 | FEATURE-LOCAL reusable OO composition |
| `StartFulfilmentDialog` | `lib/features/fulfilment_pickup/presentation/widgets/start_fulfilment_dialog.dart` | dialog / bottom sheet | Dialog max width 420; mobile sheet width from viewport; fixed content height | Dialog 20; sheet 16 plus viewInsets; summary H12/V8 with row V4; actions gap 8 | Dialog radius 16; summary radius 12; button radii owned by shared controls | Title `titleLarge` w800; description/rows `bodySmall`; values w700 | Runtime `ColorScheme`; urgency uses primary/error semantic token | `<768` fixed non-scrollable sheet; otherwise fixed constrained dialog; long values bounded to two visual lines with full semantics | FEATURE-LOCAL content through shared modal helpers; shared action buttons reused |
| `PosCashierBottomNavigation` | `lib/features/pos/presentation/widgets/new_sale/navigation/pos_cashier_bottom_navigation.dart` | fixed footer | Height 68 inside bottom `SafeArea`; five equal-width destinations | Destination H4, V6; icon→label 7 | Selected indicator top radius 3, height 5, horizontal inset 28 | Label 14; w900 selected, w700 otherwise | Dark background; selected orange, enabled white, disabled offline token | Equal-width row; fitted icon+label prevents overflow | SHARED POS shell / REUSE |
| OO-01 search field (`Oo01Header`) | `lib/features/fulfilment_pickup/presentation/widgets/oo01_online_orders_widgets.dart` | local search | Wide width 42% of header; stacked below 760; exact height not declared | `InputDecoration.isDense`; heading→search 12 stacked; row gap 20 | `OutlineInputBorder`, radius/border INHERITED | Hint/input INHERITED | Theme inherited | Stack below 760 | FEATURE-LOCAL; shared input GAP |
| OO-01 order card | same | wide / compact | Width from parent; natural height | All 14; internal gaps 10 | Radius 12; 1 px `#E1E7F0`; Material elevation 0 | Mixed ambient plus explicit w800 identity | White surface | Compact content below 720; wide flex columns otherwise | FEATURE-LOCAL |
| OO-01 screen state/list | same | loading/error/empty/results | Parent owns height | Result card gap 9 | Uses order-card contract | Uses screen-state/order-card styles | Theme plus feature literals | List scrolls; state centered | FEATURE-LOCAL composition |

## Online Order Summary Card Detail

`OnlineOrderSummaryCard` is the implemented reusable owner for OO-01 New,
Preparing, Ready, Delayed, Collected and Cancelled, and for OO-02 Collection,
Payment and Items. Do not recreate its container, icon circle, padding, border or
radius in another online-order screen. Extend its typed content slot only when a
new reusable content structure is required.

### Size and structure

- Width: parent-controlled; there is no component min/max width.
- OO-01 count cards: natural height; no declared height constraint.
- OO-02 rich cards: min height 84 in fixed-landscape compact composition and 92
  in standard composition.
- Padding: 12 horizontal, 14 vertical.
- Radius: 12.
- Border: 1 px literal `#E1E7F0`. This literal has no named canonical token and
  is recorded as a GAP.
- Elevation/shadow: none; component is a decorated `Container`.
- Icon container: Material `CircleAvatar` default radius 20 (40 diameter).
- Icon: 21.
- Icon-to-content gap: 10.
- Background: caller semantic colour at 5.5% alpha.
- Icon background: caller semantic colour at 12% alpha.

### Usage and responsive composition

| Consumer | Composition rule | Card gap |
|---|---|---|
| OO-01 | 6 columns at width >=1000; 3 at >=600; 2 below 600 | 10 horizontal and vertical |
| OO-02 | 3 cards in one row at width >=760; one column below 760 | 16 row; 12 stacked |

## Colour and Semantic Ownership

| Purpose | Token / authority actually used | Used by | Theme configurable? | Notes |
|---|---|---|---|---|
| Authenticated POS primary brand | `ThemeData.colorScheme.primary`, resolved by `PosThemeConfig` | Theme-driven primary controls and Items summary card | YES | Backend setting; fallback `#FF6A00` |
| Authenticated POS secondary brand | `ThemeData.colorScheme.secondary`, resolved by `PosThemeConfig` | Payment summary card accent currently | YES | Backend setting; fallback `#000000`; this is not automatically a payment semantic token |
| Success | `TenantAdminColors.success` or Material green in current feature code | Success/status UI | NO | Must remain semantic when tenant primary changes |
| Warning | `TenantAdminColors.warning` or Material orange in current feature code | Warning/fallback status | NO | Semantic, not tenant primary |
| Error | `TenantAdminColors.danger` or Material red in current feature code | Error/cancelled/delayed UI | NO | Semantic, not tenant primary |
| Info | `TenantAdminColors.info` or Material blue in current feature code | Informational/preparing UI | NO | Semantic, not tenant primary |
| Neutral | `TenantAdminColors.offline`, muted/border theme tokens or Material blue-grey | Disabled/cancelled-neutral surfaces | NO | Exact owner differs; GAP |
| New summary | `OnlineOrderSummarySemantic.newOrder` → blue | OO-01 | NO | Named fulfilment semantic owner |
| Preparing summary | `OnlineOrderSummarySemantic.preparing` → orange | OO-01 | NO | Named fulfilment semantic owner |
| Ready summary | `OnlineOrderSummarySemantic.ready` → green | OO-01 | NO | Named fulfilment semantic owner |
| Delayed summary | `OnlineOrderSummarySemantic.delayed` → red | OO-01 | NO | Named fulfilment semantic owner |
| Collected summary | `OnlineOrderSummarySemantic.collected` → purple | OO-01 | NO | Named fulfilment semantic owner |
| Cancelled summary | `OnlineOrderSummarySemantic.cancelled` → blue-grey | OO-01 | NO | Named fulfilment semantic owner |
| Collection summary | `OnlineOrderSummarySemantic.collection` → green | OO-02 | NO | Named fulfilment semantic owner |
| Payment summary | Derived from `OnlineOrderPaymentStatusStyle.summarySemantic` | OO-02 | NO | Exact backend-status mapping; not a brand colour |
| Items summary | `OnlineOrderSummarySemantic.items` → blue | OO-02 | NO | Named fulfilment semantic owner |

Tenant brand and semantic colours are distinct. A tenant primary change from
orange to pink changes theme-primary CTAs/highlights and current primary-owned
components. It must not recolour success, warning or error meaning. Feature code
must not introduce a separate hardcoded brand colour.

## Button Specifications

| Button variant | Path | Height | Padding | Radius | Icon size / gap | Text style | Colour authority | Usage |
|---|---|---|---|---|---|---|---|---|
| Primary standard | `lib/shared/widgets/pos_action_buttons.dart` | 56 | H20 V14 | 12 | 18 / 8 | w800, single line | `PosPrimaryActionTokens` | Main forward/confirm action |
| Primary compact | same | 48 | H20 V14 | 12 | 18 / 8 | same | same | Space-constrained approved composition |
| Secondary outlined | same, `PosBottomOutlinedButton` | min 56 | H20 V14 | 12 | 18; constructor path uses Material icon gap | Material inherited | Material outlined theme | Back/Cancel/neutral secondary |
| Back/text | Material `TextButton`; no POS shared owner | INHERITED | INHERITED | INHERITED | INHERITED | INHERITED | Theme | GAP: repeated shared specification absent |
| Icon action | Material `IconButton`; no POS shared owner | INHERITED | INHERITED | INHERITED | INHERITED | INHERITED | Theme | GAP: shared standard absent |
| Destructive | No single reusable POS owner | varies | varies | varies | varies | varies | Semantic danger expected | GAP |

### Primary action states

- Normal: configured background or canonical gradient, white foreground.
- Hover: opacity 0.94.
- Pressed: opacity 0.86.
- Focus: 2 px white border.
- Disabled: neutral border background and muted foreground.
- Loading: stable dimensions, disabled repeat press, 20 square progress
  indicator with stroke 2.
- Width: intrinsic or `double.infinity` when `fullWidth` is true.

### OO-02 Start Fulfilment CTA

OO-02 reuses `PosPrimaryActionButton` from `lib/shared/widgets/pos_action_buttons.dart`.
The shared owner was safely extended with optional icon size/gap, label line
count/alignment and text style so the approved multiline target can be expressed
without a second CTA implementation.

| Property | Standard | Fixed-landscape compact |
|---|---:|---:|
| Minimum size | 220 × 92 | 220 × 64 |
| Padding | H26 V18 | H22 V10 |
| Radius | 14 | 14 |
| Icon | 34 | 26 |
| Label | 18, w800 | 15, w800 |
| Helper gap | 10 | 5 |

The helper uses `bodyMedium` with `onSurfaceVariant`. The CTA supplies the
authenticated theme primary as its background, preserves loading/disabled
behaviour in the shared owner and does not introduce a hardcoded brand colour.

## Input Specifications

There is no single implemented reusable POS search/input/select/date-time
component with canonical dimensions.

| Input | Current verified owner | Verified contract | Status |
|---|---|---|---|
| Active OO-01 search | `Oo01Header` in `oo01_online_orders_widgets.dart` | `TextField`, prefix search icon, `OutlineInputBorder`, `isDense: true`; wide width 42%, stacked below 760 | FEATURE-LOCAL / shared input GAP |
| General text field | Material `TextField`/`TextFormField` usages | Theme inherited; no app-wide explicit `InputDecorationTheme` | GAP |
| Dropdown/select | Multiple Material dropdown/popup usages | No single POS owner | GAP |
| Date/time input | Feature-specific usages | No single POS owner verified | GAP |

Do not infer an exact height, radius, focus border or error border where source
does not declare one. A future shared input must be introduced through
`SHARED/NEW` or `EXTEND` governance with tests and this registry updated.

## Status Chip Specifications

`OnlineOrderStatusChip` and `PaymentStatusChip` are the reusable fulfilment
owners. Parents use `Wrap` where labels may grow; chips do not reserve a fixed
width. Neither declares a min height or icon.

Payment status text is always backend/domain data. Normalize with trim and
uppercase, then use exact equality through `OnlineOrderPaymentStatusStyle`:
`PAID` → paid; `UNPAID` and `PARTIALLY_PAID` → pending;
`REFUNDED` and `PARTIALLY_REFUNDED` → refunded; `FAILED` → failed; every unknown
value → unknown. Substring checks such as `contains('PAID')` are forbidden
because they incorrectly classify `UNPAID`.

## Typography Mapping

Application typography is configured in `lib/app/app.dart`:

- Body/label theme: Google Fonts Inter.
- Display, headline and title theme slots: Google Fonts Poppins.
- Line heights are not explicitly declared by the application theme and remain
  inherited from the generated Google Fonts/Material styles.

| Role | Verified token/style | Size / weight |
|---|---|---|
| Page title, online orders | `OnlineOrderUi.title` | 22 / w800; feature ink literal |
| Page subtitle/metadata | `OnlineOrderUi.subtitle` | 13 / inherited weight; feature muted literal |
| General page heading | `TextTheme.headline*` | Poppins; size/weight inherited unless consumer overrides |
| Section title | `TextTheme.titleLarge` in OO-02 | Poppins; OO-02 uses w800 |
| Card title, shared online-order summary | Ambient body style | inherited |
| Card count | Component literal | 21 / w800 |
| Rich card primary | `bodyMedium` | Inter / w800 |
| Rich card secondary | `bodyMedium` | Inter / inherited |
| Amount | `titleMedium` | Poppins / w800 |
| Order identifier | `headlineMedium`/`headlineLarge` in OO-02; local w800 | responsive token plus w800 |
| Button label, canonical primary | Component-local | inherited size / w800 |
| Badge label | Component-local | order 12/w700; payment 11/w700 |

The coexistence of `OnlineOrderUi` literal text styles and theme tokens is a
typography-token consolidation GAP. Do not invent missing numeric line heights.

## Spacing Tokens

The implemented named spacing scale is in
`lib/features/tenant_admin/presentation/theme/tenant_admin_theme.dart`:

| Token | Value |
|---|---:|
| `xs` | 4 |
| `sm` | 8 |
| `md` | 12 |
| `lg` | 16 |
| `xlg` | 20 |
| `xl` | 24 |
| `xxl` | 32 |
| `xxxl` | 40 |
| `huge` | 48 |

Verified page insets from `TenantAdminInsets.pageForWidth`: 16 below 900, 20
from 900 to below 1280, and desktop L/T/R 24 with bottom 20. These tokens are
named Tenant Admin but are also consumed by shared POS controls. POS-wide token
ownership is therefore a naming/ownership GAP.

Preferred reuse: icon→text uses `sm` (8) in canonical primary actions; common
component/card and section gaps must use the owning component contract above.
Do not replace a verified component-local 10 or 14 with another number merely
to make it fit a named scale.

## Radius Tokens

The implemented named radius scale is:

| Token | Value |
|---|---:|
| `TenantAdminRadius.sm` | 8 |
| `TenantAdminRadius.md` | 12 |
| `TenantAdminRadius.lg` | 16 |
| `TenantAdminRadius.xl` | 24 |

Verified component use: primary/secondary shared buttons and online-order
summary cards use 12; online-order status pill uses 99; payment badge 8;
OO-02 item section and CTA use local 14; product image uses 10. Values 10, 14
and 99 do not have named radius tokens and remain component-owned literals/GAPs.
Dialog radius is inherited.

## Icon and Image System

There is no complete app-wide named icon-size scale. Verified reusable sizes:

| Role | Size |
|---|---:|
| Primary action icon | 18 |
| Summary card icon | 21 |
| Summary icon container | 40 diameter |
| Cashier bottom-navigation icon | 24 |
| OO-02 CTA icon | 26 compact / 34 standard |
| Shared image loading indicator | 24 square, stroke 2 |
| OO-02 product thumbnail | 60 compact / 100 standard |

`AppCachedNetworkImage` owns URL trimming, disk/memory-backed cached rendering,
loading and error delegation. It deliberately does not own aspect ratio, size,
radius or fallback artwork. Those belong to the consuming reusable image/row.
OO-02 uses `BoxFit.contain`, radius 10, a `surfaceContainerHighest` backdrop and
`image_not_supported_outlined` fallback.

## Dialog and Modal Rules

`showAppDialog` and `showAppModalBottomSheet` in
`lib/shared/presentation/app_modal.dart` own a background blur sigma of 12 and
delegate width, padding, radius and content styling to their callers/theme.
They are shared route/presentation helpers, not a complete confirmation-dialog
visual component.

OO-03 `StartFulfilmentDialog` uses `showAppDialog` and
`showAppModalBottomSheet`, preserving the shared background blur contract. Its
fixed, non-scrollable feature-specific composition owns the centered icon and
header, bordered five-row authority summary and vertical action stack recorded
in the component table. It uses `PosBottomOutlinedButton` for Cancel and
`PosPrimaryActionButton` for the confirming action. The mobile sheet adapts to
viewport width and keyboard view insets without adding an internal scrollable.

## Fixed-Screen and Responsive Rule

For an intentionally non-scrollable target POS/tablet composition, use this
order:

1. Reduce page/section gaps through an existing responsive rule.
2. Select an implemented compact component variant.
3. Select its canonical compact padding.
4. Select a responsive `TextTheme` role.
5. Select the component's responsive image/icon size.

Do not add unrelated per-screen magic values. If no reusable compact variant
exists, record a GAP and extend the canonical owner before duplicating styling.

Implemented variants currently proven by source:

- `PosPrimaryActionButton`: standard and compact.
- `OnlineOrderSummaryCard`: count and rich-content structures; OO-02 rich
  composition uses compact/standard min heights.
- `OrderItemsSection`/product row: standard and compact.
- `StartFulfilmentDialog`: fixed non-scrollable desktop/tablet dialog and
  width-adaptive fixed mobile sheet.
- OO-01 order card: wide and compact composition.

## Reuse Decision for Future Screens

```text
Need a card/button/widget
→ search this registry and current Flutter source
→ use the existing path, dimensions and tokens
→ REUSE
→ if the verified requirement cannot be expressed, EXTEND the owner safely
→ if no owner exists and reuse is genuine, SHARED/NEW
→ FEATURE-LOCAL only when the behaviour is truly feature-specific
```

Every screen specification must record component, existing path,
classification, variant, this canonical dimension reference, colour authority,
typography token and spacing token. Developers and AI assistants must not
re-decide these values for each screen.

## Contradiction and Gap Register

1. `OnlineOrderSummaryCard` border `#E1E7F0` has no named design token.
2. No shared POS input/search/select/date-time component specification exists.
3. No single shared POS text, icon-only or destructive button owner exists.
4. `OnlineOrderUi` literal typography/colours coexist with app `TextTheme` and
   backend-driven theme ownership.
5. Named spacing/radius tokens are owned by a Tenant Admin theme file although
   shared POS controls consume them.

Resolved on 2026-09-01: online-order summary/payment semantic ownership is
named; payment matching is exact; OO-02 reuses the shared primary CTA; OO-03
uses shared modal/action owners; and the unreferenced alternate
`online_orders_queue_widgets.dart` implementation was removed. Active OO-01
ownership is solely `oo01_online_orders_widgets.dart`.

The former `Design_System.md` violet gradient-end statement was reconciled in
this canonicalization to the verified current source:
`PosPrimaryActionTokens.gradientEnd` → `TenantAdminColors.primary`
(`#FF6A00`). This is a resolved documentation contradiction, not a new token.
