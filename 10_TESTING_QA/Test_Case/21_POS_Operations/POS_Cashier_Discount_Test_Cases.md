<!-- title: POS Cashier Discount Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-09 -->

# POS Cashier Discount Test Cases

## Purpose

Acceptance matrix for the approved current-release manual cashier Discount.
These are target expectations, not a claim that automation/runtime passed.

## Online

| ID | Case | Expected |
|---|---|---|
| D-ON-01 | Order percentage within limit | Succeeds |
| D-ON-02 | Order percentage above limit | Rejected; no approval |
| D-ON-03 | Order fixed within limit | Succeeds |
| D-ON-04 | Order fixed above limit | Rejected |
| D-ON-05 | Item percentage with cart variant | Succeeds |
| D-ON-06 | Item percentage without target | Rejected |
| D-ON-07 | Item target absent from cart | Rejected |
| D-ON-08 | Item fixed | Not offered/rejected |
| D-ON-09 | Second active cashier discount | Rejected |
| D-ON-10 | Reason omitted | Allowed |
| D-ON-11 | Permission missing | Denied |
| D-ON-12 | Untrusted device/invalid till | Denied |
| D-ON-13 | Duplicate Apply tap | Idempotent; one discount |

## Offline And Sync

| ID | Case | Expected |
|---|---|---|
| D-OFF-14 | Order percentage within cached authority | Local pending intent |
| D-OFF-15 | Order fixed within cached authority | Local pending intent |
| D-OFF-16 | Item percentage with cached target | Local pending intent |
| D-OFF-17 | Item fixed | Blocked locally |
| D-OFF-18 | Above cached authority | Blocked locally |
| D-OFF-19 | Restart | Pending Discount survives |
| D-OFF-20 | Pending view | Pending-sync state visible |
| D-OFF-21 | Reconnect | Operation submitted |
| D-OFF-22 | Backend accepts | Pending resolves |
| D-OFF-23 | Authority changed | Visible rejection/conflict |
| D-OFF-24 | Cart/target mismatch | Visible conflict |
| D-OFF-25 | Duplicate sync retry | Idempotent |
| D-OFF-26 | Stale permission snapshot | Backend outcome controls |
| D-OFF-27 | Any conflict | No silent overwrite |

## Responsive And Accessibility

| ID | Case | Expected |
|---|---|---|
| D-UI-28 | Tablet landscape | Preferred two-column layout |
| D-UI-29 | Smaller tablet | Adaptive readable layout |
| D-UI-30 | Supported 800x600 class | Actions/content reachable |
| D-UI-31 | Narrow/phone | Stacked/sheet layout |
| D-UI-32 | Software keyboard | Input and actions visible |
| D-UI-33 | Increased text scale | No critical truncation |
| D-UI-34 | Long product list | Bounded accessible scrolling |
| D-UI-35 | Long error | Fully accessible message |
| D-UI-36 | All supported sizes | No overflow/clipping |
| D-UI-37 | Apply/Cancel | Always reachable |

## Related Files

- [[../../../13_DECISIONS_AND_CHANGES/POS_CASHIER_DISCOUNT_CURRENT_RELEASE_DECISION_2026-08-09]]
- [[../../../03_USER_JOURNEYS/Cashier/05_Discount_Flow]]
