<!-- title: OO-06 UI and State Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-09 -->

# OO-06 UI and State Contract

Parent: [[Online_Order_OO06_Canonicalization_Status_2026-09-09]]. This is a future implementation contract, not runtime evidence.

## Centre content

Reuse shell header/footer unchanged. Top-left: Back to Review & Pack, Ready for Collection, 3 of 3, subtitle “Finalize the order and confirm it is ready for customer collection.” The wording does not authorize another Ready command. Top-right: Items, Picked, Remaining/Overdue time, Units.

Left: semantic-success hero, icon plus “All items picked and packed!” and “This order is ready for customer collection.” What's Next is informational: Customer Collection (notify optionally); Verify Collection (confirm identity when customer arrives); Complete Order (later authorized collection stage). None is a lifecycle button. Primary CTA: Notify Customer Order is Ready.

Right: order number, authoritative READY/Ready for Collection badge, customer, outlet, collection date/time, remaining/overdue, progress ring and Picked/Pending/Issues legend, semantic Ready banner, View Order Details. No Print Collection Slip, Share Collection Info, or placeholders. Do not promise notification later from Orders list: source support is not established.

Back never reverses Ready or re-enables Pack/Ready: return to read-only review if supported, otherwise existing detail/queue recovery. View Order Details reuses /pos/online-orders/:orderId. Normal Ready surface is currently hosted by /pos/online-orders/:orderId/picking.

## Component matrix (31)

Classification describes reuse direction, not newly implemented variants. Private OO05 components need extraction within the current feature before reuse; no copied shared component is planned.

| Element | Class | Owner / direction |
|---|---|---|
| POS header | REUSE | Existing POS shell; unchanged |
| POS footer | REUSE | Existing POS shell; unchanged |
| Back action | REUSE | Existing review back pattern; navigation only |
| Title | REUSE | Existing typography |
| Subtitle | REUSE | Existing typography |
| Step badge | EXTEND | OO05 header variant: 3 of 3 |
| PickingProgressMetrics | EXTEND | Existing component; explicit effective-unit variant |
| Items metric | REUSE | Authoritative line count |
| Picked metric | EXTEND | Do not confuse current pickedLines with effective units |
| Remaining/Overdue metric | REUSE | pickingUrgency(collectionAt,serverTime) |
| Units metric | EXTEND | Cancel-aware effective units |
| Order summary | EXTEND | ReadyOrderSummary / OO05 private summary extraction in same feature |
| Status badge | REUSE | Canonical READY mapping, never NEW |
| Customer row | REUSE | Existing summary pattern |
| Collection row | REUSE | Existing summary pattern |
| Progress card | EXTEND | OO05 private progress owner; completed variant |
| Progress ring | REUSE | Existing progress visual and semantics |
| Progress legend | REUSE | Existing picked/pending/issues pattern |
| Success banner | EXTEND | Semantic READY variant |
| Primary action | REUSE | PosPrimaryActionButton |
| Secondary action | REUSE | Existing outlined button pattern |
| Loading | REUSE | Existing provider loading pattern |
| Error | REUSE | Existing provider error/retry pattern |
| Permission wrapper | EXTEND | Existing permission utilities; verified canonical ready codes need runtime wiring |
| Responsive layout | EXTEND | Existing Ready screen has narrow ListView; fixed viewport target needs adaptation |
| Ready hero | EXTEND | Existing ReadyForCollectionHero; no duplicate hero owner |
| What's Next | FEATURE-LOCAL | Informational three-step composition |
| Notify workflow | FEATURE-LOCAL | Controller action using existing notification subsystem |
| View Order Details | REUSE | Existing /pos/online-orders/:orderId surface |
| Print Collection Slip | EXCLUDED | No widget or reserved space |
| Share Collection Info | EXCLUDED | No widget or reserved space |

Counts: REUSE 17; EXTEND 10; SHARED/NEW 0; FEATURE-LOCAL 2; EXCLUDED 2.

## UI states (21)

| State | Required behaviour |
|---|---|
| Default READY | Render only verified FO READY + Pickup READY + ReadyAt present + CollectedAt null. |
| Initial loading | Existing loader; no fake values or prior-order flash. |
| GET error | Safe retry; never manufacture Ready. |
| Permission denied | Hide screen/actions; canonical access-denied handling. |
| Notify disabled | Explain unavailable destination/policy/state; absent permission hides with reflow. |
| Notify sending | One in-flight operation; disable repeated submission. |
| Notify success | Show backend-confirmed result; Ready unchanged. |
| Notify failure | Safe error and policy-safe retry; Ready unchanged. |
| Already notified | Only from server event/message projection; never local guess. |
| Re-notify | Not supported by current deterministic dedupe; no resend CTA until policy exists. |
| Missing destination | IN_APP needs CustomerId; email/phone absence alone is not failure. |
| Overdue | Server-based deadline display; never auto-collect. |
| Collected externally | Refetch; disable Ready actions and navigate existing detail/queue. |
| Completed externally | Refetch; terminal detail, no notification. |
| Cancelled externally | Refetch; no Ready mutation. |
| Wrong outlet | Non-sensitive denial; no cross-outlet data. |
| Not found | Not-found state, not empty Ready list. |
| Stale response | Order/outlet/request-generation match required before applying result. |
| Missing customer display | Safe fallback; do not expose invented PII. |
| Long text | Bound text with accessible full semantics; no overflow. |
| Offline/network loss | No offline Notify queue or fake success; authoritative refresh after reconnect. |

## Responsive, theme and accessibility acceptance

Primary Pixel Tablet: logical 1280×800 / physical 2560×1600 landscape. Header and footer remain visible. Whole-page scroll NONE, internal target scroll NONE. Also validate 1180×820 and 1100×700; no RenderFlex, clipping, hidden CTA, right-panel or hero overflow. These are pending tests, not measured passes. Existing small-screen ListView is not evidence of target acceptance.

Tenant backend theme is authority through ThemeData/design tokens. Primary CTA uses tenant primary style, supporting orange-like and pink-like themes. Success uses semantic success (may be green), not tenant primary; status uses canonical semantic mapping. No hardcoded reference-image gradient.

Expose Ready title and 3-of-3 semantics, icon plus text success, readable ordered guidance, progress value, Notify and View Order Details labels, disabled reason, keyboard activation/logical focus, canonical touch targets, text scaling and announced errors. Do not rely on colour alone.

