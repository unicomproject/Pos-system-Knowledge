# Online Order Visual Direction

Status: **APPROVED OO-01 TARGET; IMPLEMENTATION PENDING** · Journey: `POS-UJ-036` · Updated: 2026-08-27

## Authorities

Read [[Online_Order_Prototype_Flow]], [[../../07_UI_UX_KNOWLEDGE/Design_System]], [[../../07_UI_UX_KNOWLEDGE/POS_App_UI_Rules]], [[../../07_UI_UX_KNOWLEDGE/Empty_Error_Loading_States]], [[../../07_UI_UX_KNOWLEDGE/Permission_Based_UI_Rules]], and [[../../08_FLUTTER_POS_KNOWLEDGE/Frontend_Reusable_Component_Governance]]. Business behavior remains governed by [[../../03_USER_JOURNEYS/Cashier/POS-UJ-036_Online_Order_Fulfilment_Collection]].

## Product character and shell

- Use the established cashier POS shell, header and bottom navigation. Do not create a second shell for online orders.
- Primary brand action color is OneVerz orange `#FF6A00`; black anchors shell chrome and high-contrast text.
- Orange identifies the primary safe action, never an unverified success state. Destructive actions use semantic danger styling.
- Preserve a calm operational hierarchy: context/header, progress/status, task workspace, supporting facts, then action rail.

## Hierarchy, type and spacing

- Screen title and order number establish context; status and collection promise are the next visual tier.
- Use the canonical typography scale and weights. Avoid shrinking operational values below accessible POS readability to force fit.
- Use the spacing, radius, border and elevation tokens from the design system; avoid one-off pixel values in the prototype.
- Dense queue rows may compress secondary metadata, but item identity, quantity, deadline, payment and primary action remain legible.

## Status language

- Every status combines text + icon/shape + semantic color; color alone is forbidden.
- Preparation: neutral/in-progress; picked/packed progress: informational; ready/validated/paid/collected: success; delayed/expiring: warning; cancelled/invalid/payment failed: danger.
- Countdown chips state the basis, e.g. “Ready in 18 min” or “Overdue 7 min”. Server time is authoritative.

## Screen-family direction

| Family | IDs | Direction |
|---|---|---|
| Queue and detail | OO-01–OO-03 | OO-01 uses search, six summary cards and responsive order cards; detail uses summary, collection/payment and item cards with downstream actions. |
| Picking | OO-04–OO-05 | Large progress indicator, next-item emphasis, location/SKU/barcode facts, scanner focus and immediate match feedback. Invalid scan must not look accepted. |
| Pack and ready | OO-06–OO-08 | Reconciliation first, package/staging facts second, ready/notify/print actions last. Ready list emphasizes collection window. |
| Collection validation | OO-09–OO-11, OO-14 | Scanner-first workspace with visible manual alternative; success and failure panels never rely on toast-only feedback. |
| Payment | OO-15A–OO-15D | Reuse canonical cash tender language, numeric input, quick amounts and change due. Failure preserves safe context without implying payment completion. |
| Handover and completion | OO-12–OO-13 | Package retrieval and contents checklist precede handover. Completion shows order, collector, payment and timestamp facts. |

## CTA rules

- One dominant primary CTA per state: Start, Confirm Pick, Save Package, Mark Ready, Validate, Confirm Cash, Handover.
- Secondary actions are outlined or text actions. “Can’t Find Item” is an issue action, not a substitute completion action.
- Disabled CTAs include a visible explanation when permission, entitlement, till, validation or readiness blocks progress.
- Pending command states lock repeat submission and show in-button progress.

## Loading, empty, error and denied states

- Loading uses stable skeleton geometry; do not replace the full shell.
- Empty states distinguish no orders, no filter results and no ready collections.
- Errors retain context and offer bounded retry; never expose raw exceptions.
- Permission denied and feature-not-entitled are distinct from empty or network failure.
- Unknown payment outcome prevents handover and offers reconciliation guidance, not automatic retry.

## Responsive behavior

- Phone: single-column task flow, sticky primary action, compact metadata disclosure.
- Tablet: preferred POS layout; queue/detail or work/summary may use balanced two columns without horizontal scrolling.
- Desktop: wider split panes with constrained readable widths; do not stretch cards indefinitely.
- Scanner and numeric input must remain reachable with touch, keyboard and hardware scanner input.

### Approved OO-01 queue contract

- The cashier shell owns the top bar and bottom navigation; the queue does not create a second shell or sidebar.
- The header combines `Online Orders` / `Click & Collect orders from your online store` with one wide order/customer/phone/pickup-reference search. Search is server-side and debounced.
- KPI cards project New, Preparing, Ready, Delayed, Collected and Cancelled summary values supplied by the staff list response.
- Every order is an individual rounded horizontal card showing identity, customer, collection window, item count, payment/display badge, thumbnail previews, remaining preview count and a simple detail chevron.
- Phone uses a stacked version of the same card; tablet/desktop preserve the horizontal card. No horizontal overflow or clipping is permitted.
- Filters, status tabs, queue subheading, sorting, table headers, Open/Start actions and visible pagination are intentionally absent. The API can still perform bounded paging/filtering/sorting internally.
- The chevron is an accessible detail-navigation affordance only; no list mutation occurs.
- Loading keeps shell geometry stable; refresh preserves valid loaded content where safe; empty and empty-search have distinct copy; error, denied and not-entitled remain distinct.
- The orange priority star is visual-only pending business authority. It must not be interpreted as a stored priority or functional action.

## Accessibility

- Minimum touch target and contrast follow the canonical design system.
- Maintain logical focus order, visible focus indicators, semantic labels and announced validation results.
- Status, progress, scan result and payment outcome require readable text equivalents.
- Motion is subtle and non-essential; respect reduced-motion preferences.

## Prototype boundary

HTML prototype data is display-only. Production screens use real provider/API fields and effective authorization. Automated viewport evidence does not replace authenticated runtime screenshot comparison; see the implementation audit for the remaining acceptance gate.
