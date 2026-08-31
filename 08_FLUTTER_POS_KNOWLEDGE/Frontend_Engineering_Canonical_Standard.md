<!-- title: Frontend Engineering Canonical Standard -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-19 -->

# Frontend Engineering Canonical Standard

## Purpose and Authority

This is the mandatory frontend engineering concern map for OneVerz POS. It does
not replace detailed architecture, design, module, journey, API, permission, or
test documents. It tells developers which concerns must be considered and where
their canonical detail lives.

No frontend implementation starts until the workflow in
[[Frontend_Screen_Development_Second_Brain_Workflow]] and the reuse rules in
[[Frontend_Reusable_Component_Governance]] have been considered.

## Existing Architecture Is the Constraint

Use the existing feature-first Flutter architecture, Riverpod, GoRouter, Dio,
repository abstractions, local cache/outbox, and secure storage described in:

- [[Flutter_App_Architecture]]
- [[Flutter_Folder_Structure]]
- [[Flutter_State_Management_Riverpod]]
- [[Flutter_API_Integration]] and [[Flutter_API_Network]]
- [[Flutter_DTO_And_Mapping_Rules]]
- [[Flutter_Local_Storage_Cache]], [[Flutter_Offline_Operation_Sync]], and
  [[Flutter_Virtual_Caching_Strategy]]

Do not introduce a parallel architecture or package merely because this map
names a concern.

## Concern Map

| Concern group               | Mandatory considerations                                                                                                                                                          | Canonical detail / evidence                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Screens and composition     | UI/screens, components/widgets, layouts, dialogs, popups, bottom sheets, page headers, cards, tables/grids, bulk actions, wizard/multi-step flows                                 | [[../07_UI_UX_KNOWLEDGE/Design_System]], [[Frontend_Reusable_Component_Governance]], relevant screen specification           |
| Navigation                  | Navigation/routing, route guards, entry/exit paths, deep linking, unsaved changes, draft/autosave, back behaviour                                                                 | [[Flutter_Routing_Guards]], relevant journey                                                                                 |
| State and lifecycle         | State management, providers/controllers/view models, app lifecycle, concurrency, duplicate submission prevention, optimistic updates, retry/timeout/cancellation, undo/recovery   | [[Flutter_State_Management_Riverpod]], relevant feature contract                                                             |
| Forms and input             | Form handling/validation, keyboard/numpad, focus management, touch/mouse/keyboard behaviour, clipboard, device permissions                                                        | [[../07_UI_UX_KNOWLEDGE/Design_System]], screen specification                                                                |
| Data integration            | API integration, request/response models, DTO mapping, repository/data layer, local storage/cache, cache invalidation, local data migration, file upload/download, media handling | [[Flutter_API_Integration]], [[Flutter_DTO_And_Mapping_Rules]], [[Flutter_Local_Storage_Cache]]                              |
| Identity and access         | Authentication, authorization/permission UI, session management, feature flags/entitlements, secure storage                                                                       | [[Flutter_Permission_Based_UI_Rendering]], [[Flutter_Security_Guardrails]], [[../02_ACCESS_CONTROL/Access_Control_Overview]] |
| User-visible states         | Loading, empty, success, error, permission denied, feedback, global error boundary, network status, offline handling, connectivity recovery                                       | [[../07_UI_UX_KNOWLEDGE/Empty_Error_Loading_States]], [[Flutter_Error_Handling]], [[Flutter_Offline_Operation_Sync]]         |
| Discovery and data sets     | Search, filter, sort, pagination/infinite scroll, table/grid standards, realtime UI updates, realtime connection management                                                       | Relevant module/API contract and screen specification                                                                        |
| Responsive and visual       | Responsive design, adaptive/platform UI, device matrix, theme/colors/typography, design tokens, icons/images/assets, animations/transitions, performance budgets                  | [[../07_UI_UX_KNOWLEDGE/Design_System]], [[Flutter_Device_Platform_Support]], relevant UI/UX contract                        |
| International use           | Localization/multi-language, RTL, timezone, currency/number/date formatting                                                                                                       | Current source of truth, API contract, screen specification; backend remains authority for protected financial values        |
| Accessibility               | Semantics, contrast, accessible names, focus order, keyboard operation, touch targets, accessibility tests                                                                        | Design system, component registry, focused tests                                                                             |
| POS hardware                | Barcode/scanner UI, printer/cash drawer/hardware UI, hardware states and recovery                                                                                                 | [[Flutter_Hardware_Payment_Receipt]], [[../12_INTEGRATIONS/POS_Hardware_Integration]]                                        |
| Offline correctness         | Offline handling, conflict resolution, outbox, cache invalidation, connectivity recovery, idempotency client behaviour                                                            | [[Flutter_Offline_Operation_Sync]], [[Flutter_Virtual_Caching_Strategy]]                                                     |
| Observability and privacy   | Logging, analytics/tracking, notifications, crash reporting, observability, privacy, redaction                                                                                    | [[Flutter_Security_Guardrails]], operational/integration contract                                                            |
| Utilities and configuration | Reusable utilities/helpers, constants/config, environment/build configuration, secrets/config, dependency/package governance, version compatibility                               | [[Flutter_Folder_Structure]], repository configuration; never hardcode secrets                                               |
| Quality and resources       | Code quality, naming conventions, folder/module architecture, performance optimization, memory/resource management, CI/quality gates                                              | [[Flutter_Testing]], repository analysis/test configuration                                                                  |
| Test coverage               | Frontend/unit tests, widget tests, integration tests, golden/visual regression, accessibility tests, responsive device matrix tests                                               | [[Flutter_Testing]], [[../10_TESTING_QA/Testing_Strategy]], feature test cases                                               |
| Documentation               | Design system, design tokens, reusable component governance, component catalogue, screen specification, implementation evidence                                                   | This standard, [[Frontend_Reusable_Component_Governance]], relevant catalogue/tracker                                        |

## Mandatory Engineering Rules

1. Read Second Brain before source implementation.
2. Search the reusable catalogue and current Flutter source before creating UI.
3. Reuse one canonical implementation; configure it through parameters,
   callbacks, state, and content.
4. Widgets do not call APIs directly. DTOs remain in the data layer and map to
   domain/view state.
5. Backend remains final authority for protected business decisions.
6. Permission-based visibility never replaces backend authorization.
7. Loading, empty, error, offline, permission, validation, duplicate-submit,
   responsive, and accessibility behaviour are part of the feature—not polish.
8. Use approved tokens; do not introduce screen-local copies of shared visual
   constants.
9. Do not expose tokens, credentials, PINs, payment data, or PII in logs.
10. Update Second Brain when implementation introduces new reusable knowledge.

## When to Update Second Brain

Update the relevant canonical document or registry for a new reusable UI
component, design token, state/workflow, API contract, permission, integration
contract, architecture decision, or operational rule. When existing knowledge is
only reused, link to it; do not copy it into another feature document.

## Required Companion Documents

- [[Frontend_Reusable_Component_Governance]]
- [[Frontend_Screen_Development_Second_Brain_Workflow]]
- [[Frontend_Screen_Implementation_Specification_Template]]
- [[../00_START_HERE/Current_Source_Of_Truth]]
- [[../00_START_HERE/Developer_Reading_Guide]]
