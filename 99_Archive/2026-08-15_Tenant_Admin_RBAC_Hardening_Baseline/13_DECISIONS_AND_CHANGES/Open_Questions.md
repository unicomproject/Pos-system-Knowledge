<!-- title: Open Questions -->
<!-- status: Draft -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-29 -->

# Open Questions

## Purpose

Track decisions that must be confirmed without inventing production behavior.
Normative documentation keeps safe defaults until an owner records a decision.

## Hardware Decisions

| ID | Question | Why required | Current safe position | Owner/status |
|---|---|---|---|---|
| HW-01 | Which Card provider and terminal model are approved? | Card execution/certification | Provider unavailable; Card blocked | Product/Security — Open |
| HW-02 | How is production Local Agent HTTPS certificate issued/rotated/trusted? | Release Android blocks clear-text | Private debug HTTP only; production not ready | Security/Operations — Open |
| HW-03 | Are direct Android USB and Bluetooth printers required for MVP? | Adapter/platform scope | Unsupported/unverified | Product/Hardware — Open |
| HW-04 | Is direct TCP printer support a committed production transport? | Security/acceptance | Separate adapter; no Agent fallback | Product/Hardware — Open |
| HW-05 | What Tamil/Unicode strategy is approved? | Single-byte generators degrade text | Unsupported glyphs may be `?`; not ready | Product/UX/Hardware — Open |
| HW-06 | What is the customer/merchant copy policy and configuration owner? | Multi-copy orchestration/paper use | One customer, zero merchant snapshot | Product/Finance — Open |
| HW-07 | Is a distinct merchant-copy or sensitive-reprint permission required? | Access/audit | Existing print/reprint permissions only | Security/Product — Open |
| HW-08 | Which drawer pin and pulse on/off timing apply per printer/drawer? | Safe `ESC p` execution | No pulse implemented | Hardware — Open |
| HW-09 | When may Cash payment, Split Cash, Cash refund and no-sale open pulse drawer? | Financial control | No automatic/manual pulse implemented | Finance/Product — Open |
| HW-10 | Does manual drawer open require manager approval and which reason policy? | Fraud/audit control | Permission/reason/approval TBD | Finance/Security — Open |
| HW-11 | How long are hardware-test evidence and Local Agent operations retained? | Support/compliance | Agent operations default 30 days; evidence TBD | Operations/Compliance — Open |
| HW-12 | What numeric stability/performance targets apply? | Timeouts, scan rate, receipt size | Use bounded configurable behavior; SLA TBD | Product/QA — Open |
| HW-13 | Which barcode symbologies are officially supported? | Scanner/printer acceptance | Exact string lookup; physical formats unapproved | Product/Hardware — Open |
| HW-14 | May assigned printer/drawer/terminal change during an active shift? | Reconciliation/audit | Silent change prohibited | Finance/Operations — Open |
| HW-15 | What digital-only/no-print policy applies per tenant/outlet/document? | Receipt compliance/operations | No persisted policy found | Product/Legal — Open |
| HW-16 | Which return/refund/exchange/till reports require physical copies? | Contract/acceptance | Not production-complete | Finance/Product — Open |
| HW-17 | What offline receipt/drawer behavior is approved? | Network-loss safety | Card/refund/final close blocked; hardware E2E incomplete | Architecture/Product — Open |
| HW-18 | Should the two manual ESC/POS generators be consolidated? | Drift risk | Each owns separate transport | Architecture — Open |

## Decision Recording Rule

Each resolved question must record decision date, approver, affected module,
security/business consequences, migration/configuration impact, rollout,
automated/physical acceptance, and related ADR when architectural.

Do not resolve a question from implementation accident, mock/test code, package
presence or assumed printer/provider capability.

## Confirmed Architecture Reference

Physical Android POS → private LAN → Windows Local Print Agent → Windows RAW
spooler → laptop USB printer is already documented as the current receipt path.
This file does not reopen that implementation fact; production HTTPS/deployment
and wider transport policy remain open.

## Related Files

- [[../12_INTEGRATIONS/POS_Hardware_Integration]]
- [[../12_INTEGRATIONS/Receipt_Printer_Integration]]
- [[../12_INTEGRATIONS/Cash_Drawer_Integration]]
- [[../12_INTEGRATIONS/Card_Reader_Integration]]
- [[../10_TESTING_QA/POS_Hardware_Production_Acceptance_Matrix]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Production_Readiness_Implementation_Status]]
