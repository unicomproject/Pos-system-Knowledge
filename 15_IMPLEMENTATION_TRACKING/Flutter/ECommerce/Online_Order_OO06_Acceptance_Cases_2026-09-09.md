<!-- title: OO-06 Ready for Collection — Acceptance Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-09 -->

# OO-06 Ready for Collection — Acceptance Cases

Parent: [[Online_Order_OO06_Canonicalization_Status_2026-09-09]]. All cases are specifications; none were executed in documentation-only Chunk 1. PASS in canonicalization means coverage, not runtime success.

| ID | Given / When / Then | Execution |
|---|---|---|
| TC-01 | Given order READY When OO-06 opens Then Ready screen displays. | Pending implementation/runtime |
| TC-02 | Given order PICKING When deep-linked to OO-06 Then no fake Ready state. | Pending implementation/runtime |
| TC-03 | Given order PACKED When OO-06 opens Then no fake Ready state. | Pending implementation/runtime |
| TC-04 | Given Ready order When screen loads Then Fulfillment READY shown. | Pending implementation/runtime |
| TC-05 | Given Ready order When evaluated Then Pickup READY shown. | Pending implementation/runtime |
| TC-06 | Given Ready order When evaluated Then CollectedAt remains NULL. | Pending implementation/runtime |
| TC-07 | Given Ready order When customer tracking loads Then Ready for Collection shown without needing Notify. | Pending implementation/runtime |
| TC-08 | Given notify permission When Notify tapped Then real notification capability invoked. | Pending implementation/runtime |
| TC-09 | Given notification succeeds When evaluated Then order remains READY. | Pending implementation/runtime |
| TC-10 | Given notification fails When evaluated Then order remains READY. | Pending implementation/runtime |
| TC-11 | Given notification request in progress When tapped again Then duplicate client request blocked. | Pending implementation/runtime |
| TC-12 | Given customer already notified When screen loads Then canonical already-notified state shown. | Pending implementation/runtime |
| TC-13 | Given no valid contact destination When evaluated Then Ready remains valid and Notify safely unavailable/error. | Pending implementation/runtime |
| TC-14 | Given no `collection.notify_customer` When evaluated Then button hidden/unavailable with reflow. | Pending implementation/runtime |
| TC-15 | Given no `collection.view_ready` When evaluated Then access denied. | Pending implementation/runtime |
| TC-16 | Given Manager and Cashier with same permissions When evaluated Then same authority for these actions. | Pending implementation/runtime |
| TC-17 | Given role name but no permission When evaluated Then action denied. | Pending implementation/runtime |
| TC-18 | Given wrong tenant When evaluated Then no data/action. | Pending implementation/runtime |
| TC-19 | Given wrong outlet When evaluated Then no data/action. | Pending implementation/runtime |
| TC-20 | Given another cashier collects order When current screen refreshes Then Ready actions no longer active. | Pending implementation/runtime |
| TC-21 | Given order cancelled externally When evaluated Then no Ready notification mutation. | Pending implementation/runtime |
| TC-22 | Given device clock wrong When evaluated Then countdown still uses serverTime. | Pending implementation/runtime |
| TC-23 | Given collection deadline passed When evaluated Then overdue shown without auto-Collected. | Pending implementation/runtime |
| TC-24 | Given long order number When evaluated Then no overflow. | Pending implementation/runtime |
| TC-25 | Given long customer When evaluated Then no overflow. | Pending implementation/runtime |
| TC-26 | Given long outlet When evaluated Then no overflow. | Pending implementation/runtime |
| TC-27 | Given missing optional customer display When evaluated Then screen remains stable. | Pending implementation/runtime |
| TC-28 | Given loading When evaluated Then no stale previous order. | Pending implementation/runtime |
| TC-29 | Given route A then B When evaluated Then old response A cannot overwrite B. | Pending implementation/runtime |
| TC-30 | Given 401 When evaluated Then canonical auth handling. | Pending implementation/runtime |
| TC-31 | Given 403 When evaluated Then permission handling. | Pending implementation/runtime |
| TC-32 | Given 404 When evaluated Then safe not-found. | Pending implementation/runtime |
| TC-33 | Given conflict/state changed When evaluated Then refetch authoritative state. | Pending implementation/runtime |
| TC-34 | Given 5xx When evaluated Then safe retry. | Pending implementation/runtime |
| TC-35 | Given Notify timeout When evaluated Then no lifecycle rollback. | Pending implementation/runtime |
| TC-36 | Given Back to Review & Pack When evaluated Then Ready state not reversed. | Pending implementation/runtime |
| TC-37 | Given View Order Details When evaluated Then existing detail screen opens. | Pending implementation/runtime |
| TC-38 | Given the OO-06 target screen When rendered and inspected Then Print Collection Slip absent. | Pending implementation/runtime |
| TC-39 | Given the OO-06 target screen When rendered and inspected Then Share Collection Info absent. | Pending implementation/runtime |
| TC-40 | Given the OO-06 target screen When rendered and inspected Then Header reused unchanged. | Pending implementation/runtime |
| TC-41 | Given the OO-06 target screen When rendered and inspected Then Footer reused unchanged. | Pending implementation/runtime |
| TC-42 | Given the OO-06 target screen When rendered and inspected Then 1280×800 no scroll. | Pending implementation/runtime |
| TC-43 | Given the OO-06 target screen When rendered and inspected Then 1280×800 no overflow. | Pending implementation/runtime |
| TC-44 | Given the OO-06 target screen When rendered and inspected Then 1180×820 PASS. | Pending implementation/runtime |
| TC-45 | Given the OO-06 target screen When rendered and inspected Then 1100×700 PASS. | Pending implementation/runtime |
| TC-46 | Given the OO-06 target screen When rendered and inspected Then Orange-like tenant theme PASS. | Pending implementation/runtime |
| TC-47 | Given the OO-06 target screen When rendered and inspected Then Pink-like tenant theme PASS. | Pending implementation/runtime |
| TC-48 | Given the OO-06 target screen When rendered and inspected Then Ready success semantic styling PASS. | Pending implementation/runtime |
| TC-49 | Given the OO-06 target screen When rendered and inspected Then Primary CTA tenant-theme styling PASS. | Pending implementation/runtime |
| TC-50 | Given the OO-06 target screen When rendered and inspected Then Accessibility PASS. | Pending implementation/runtime |
| TC-51 | Given cancelled quantities When metrics render Then effective totals exclude cancelled units without changing existing picking semantics. | Pending implementation/runtime |
| TC-52 | Given two concurrent Notify requests When persistence races Then one logical event exists and duplicate handling returns a safe result. | Pending implementation/runtime |
| TC-53 | Given a persisted notification event When Notify times out and retries Then reuse the event key without resending accidentally. | Pending implementation/runtime |
| TC-54 | Given READY without ReadyAt or with non-null CollectedAt When loaded Then reject inconsistent entry and refetch. | Pending implementation/runtime |
| TC-55 | Given no customer email or phone but valid CustomerId When IN_APP is selected Then absence of external contact alone does not block notification. | Pending implementation/runtime |
| TC-56 | Given notification success When customer tracking is fetched Then status is unchanged and no lifecycle event is appended. | Pending implementation/runtime |
| TC-57 | Given a READY deep link When the extended picking GET runs Then pickup status, ReadyAt and CollectedAt are authoritatively projected. | Pending implementation/runtime |
| TC-58 | Given notification data When logs and DTOs are inspected Then secrets and unnecessary PII are absent. | Pending implementation/runtime |

