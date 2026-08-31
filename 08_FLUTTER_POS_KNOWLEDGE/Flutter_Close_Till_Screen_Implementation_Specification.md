<!-- title: Flutter Close Till Screen Implementation Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->

# Flutter Close Till Screen Implementation Specification

## Scope

Modify the existing Cashier Close Till screen. Do not create a parallel route,
new visual shell, local-authority close, new permission or duplicate API client.
Canonical business contract:
[[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/05_Close_Till_Feature]].

## Current Code Baseline

| Concern | Existing source |
|---|---|
| Screen | `features/cash_drawer/presentation/screens/pos_close_till_screen.dart` |
| State | `features/cash_drawer/presentation/providers/close_till_provider.dart` |
| Summary/API bridge | `features/cash_drawer/presentation/providers/cash_drawer_provider.dart` |
| Close datasource | `features/till/data/datasources/till_remote_datasource.dart` |
| Route | `/pos/cash-drawer/close-till` |
| End Shift | same route with `endShift=true` |

Current UI is componentized and must be extended in place.

## Screen Composition

```text
POS shell / reused Dashboard Top Bar
└── white Close Till parent surface
    ├── CloseTillPageHeader
    ├── CloseTillTillInfoBar
    ├── responsive content
    │   ├── CloseTillFormCard
    │   │   ├── counted cash
    │   │   ├── expected cash (read-only)
    │   │   ├── CloseTillDifferenceBadge
    │   │   ├── variance reason
    │   │   └── closing notes
    │   ├── CloseTillMismatchWarningCard
    │   └── CloseTillSummaryCard
    └── CloseTillBottomActions
```

## Visual Tokens

- Primary close action: existing OneVerz orange token.
- Headings/values: existing navy/ink tokens.
- Background/cards/borders: existing cashier white, surface and outline tokens.
- Balanced: semantic success green.
- Short/Over: semantic warning/error plus text/icon; never colour alone.
- Do not import Tenant Admin theme solely to colour cashier components.
- Do not use legacy purple gradient buttons.

## Data Model Requirements

The UI read model needs session ID, device/till/outlet IDs, display till name,
opened-by display name, opened timestamp, currency, opening float and
backend-authoritative expected cash. Extend the existing current-session/summary
mapping rather than synthesize names or money values in widgets.

Close input contains device ID, till ID, counted cash, optional approved mismatch
reason and optional closing note. Do not send a UI-computed Expected Cash as
authority after the backend contract is corrected.

## State Contract

Required states:

- initial/loading close summary;
- ready balanced;
- ready short;
- ready over;
- validation error;
- submitting (single-flight);
- success;
- no open session;
- permission/auth failure;
- network/server failure preserving input.

The summary status is `Balanced` at zero, `Short` below zero and `Over` above
zero. Before a reason is selected, also show `Variance reason required`. Current
code continues to label all non-zero states `Variance Reason Required` even after
selection; correct this during production implementation.

## Validation Contract

- Counted cash is required, numeric, currency-precision and >= 0.
- Difference = counted minus server expected; it is display preview only.
- Non-zero difference requires an approved reason.
- Closing note is optional, trimmed and <= 500 characters.
- Button tap must revalidate even if visual enablement is stale.
- Backend validation remains final authority.

## Save Draft Behaviour

The current Save Draft snapshot is memory-only inside an auto-disposed provider.
It must be described as same-controller-lifetime convenience, not persisted draft
recovery. Do not add local storage unless separately approved.

## Submission And Navigation

1. Prevent a second tap while submitting.
2. Submit once to `POST /api/v1/tills/close`.
3. On failure, remain on screen with open session and inputs intact.
4. Normal close success: reset local form, force POS bootstrap, then navigate to
   the resolved post-login destination.
5. End Shift success: clear tenant auth/session then navigate to `/tenant-login`.
6. If close succeeded but logout/navigation fails, never resubmit Close Till.

## Error Mapping

Map the existing backend categories without exposing raw exceptions:

- unauthenticated/tenant context;
- `permission_denied`;
- device missing/untrusted, inactive till or assignment/till mismatch;
- no open session (`not_open`);
- invalid counted/expected transition payload;
- `mismatch_reason_required`;
- network/server failure.

After backend modification, map canonical invalid mismatch-reason and note-length
errors as inline form errors.

## Responsive Behaviour

| Width | Layout |
|---|---|
| Desktop | form/warning left, summary right, stable bottom actions |
| Tablet landscape | two columns when readable; otherwise compact stack |
| Tablet portrait/phone | single column; actions full width and reachable |

Content may scroll only when the actual viewport/text scale needs it. Never clip
the bottom actions, generate a yellow overflow bar or nest competing full-page
scroll views.

## Accessibility

- Logical traversal follows count → reason → note → actions.
- Inputs/buttons have semantic labels and 44px minimum targets.
- Difference sign and status text accompany semantic colour.
- Loading disables actions and announces progress.
- Errors are associated with their fields and remain readable at text scale.

## Testing Contract

Focused Flutter coverage must include:

- balanced, short and over display;
- variance reason requirement and post-selection Short/Over label;
- invalid/negative counted cash and 500-character notes;
- single-flight submission;
- error preserves form/auth/open-session state;
- normal close bootstrap navigation;
- End Shift logout only after close success;
- no-open-session state;
- compact and wide layouts without overflow;
- Save Draft lifetime stated/verified honestly.

Runtime acceptance requires a real authenticated backend transaction after the
backend-authority and reconciliation blockers are fixed. Analyze/widget tests
alone are not runtime proof.

## Non-Goals

- denomination counting;
- offline final close;
- manager approval UI;
- till-close report printing;
- durable draft persistence;
- accounting day close.

## Related Files

- [[Flutter_App_Architecture]]
- [[Flutter_Folder_Structure]]
- [[Flutter_Cashier_POS_Implementation_Map]]
- [[Flutter_Open_Till_Screen_Implementation_Specification]]
- [[../03_USER_JOURNEYS/Cashier/11_Till_Close_Flow]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Sales/End_Shift_And_Close_Till_Implementation_Status]]
