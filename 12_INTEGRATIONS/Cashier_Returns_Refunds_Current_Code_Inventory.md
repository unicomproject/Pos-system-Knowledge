# Cashier Returns, Refunds and Exchanges — Current Code Inventory

Snapshot date: 2026-09-08. Scope: the local checked-out source code. This is a descriptive implementation inventory, not a proposed specification. No application code, database records or migrations were changed for this document. Tests and physical devices were not run for this documentation task; test files are evidence of coverage intent, not proof of a passing run. Deployed database state, live role assignments and provider connectivity are not certified here.

## Source roots

- Frontend (F): `Pos Frontend/Nytroz-POS-App`.
- Backend (B): `POS Backend/Unified-Commerce`.
- F feature root: `lib/features/returns_refunds/`.
- B service: `src/E_POS.Application/Modules/Tenant/POSOperations/Services/PosReturnService.cs`.
- B repository: `src/E_POS.Infrastructure/Modules/Shared/ReturnExchange/Repositories/PosReturnRepository.cs`.
- B API: `src/E_POS.Api/Controllers/V1/Tenant/PosReturnsController.cs`.
- B DTOs: `src/E_POS.Application/Modules/Tenant/POSOperations/Dtos/PosReturnSaleSearchDtos.cs`.

All descriptions below derive from these files, the frontend providers/screens/route guard, and the EF configurations listed below. Existing Second Brain prose was not used to establish implementation behavior.

## Screens and functional flow

Routes below have prefix `/pos/returns-refunds`. The router currently registers twelve screens. The workflow enum has ten milestones because branch screens share milestones and the older credit route also exists.

| Route suffix | Screen class | Current purpose |
|---|---|---|
| empty | PosReturnSearchSaleScreen | Search original sales by invoice, mobile, customer or recent; filters, selection, pagination |
| /summary | PosReturnSaleSummaryScreen | Selected original sale, customer/payment summary and sold items |
| /eligibility | PosReturnEligibilityScreen | Select original sale lines and return quantities |
| /check-eligibility | PosReturnCheckEligibilityScreen | Backend eligibility result, policy checks, eligible count and continuation |
| /return-reason | PosReturnReasonScreen | Common reason or per-line reasons, notes and validation |
| /inspect-items | PosReturnInspectItemsScreen | Per-line condition, notes, photo upload, inspection summary and validation |
| /choose-option | PosReturnChooseOptionScreen | Save Refund or Exchange resolution according to branch access |
| /refund-details | PosReturnRefundDetailsScreen | Backend refund calculation and available refund method selection |
| /create-credit | PosReturnCreateCreditScreen | Existing Refund Flow route / credit preview UI; its name does not establish store-credit issuance |
| /exchange | PosReturnExchangeFlowScreen | Search replacement products/variants, quantities, persisted replacement and difference preview |
| /settlement | PosReturnSettlementScreen | Review & Confirm; returned items, financial and settlement details; complete |
| /receipt | PosReturnReceiptScreen | Completion/success, receipt details and print handling |

Evidence: F `lib/features/pos_shell/pos_shell_router.dart`, feature `domain/entities/return_flow_steps.dart`, `presentation/screens/`, `presentation/navigation/returns_route_guard.dart`.

Sequence: search → summary → select items → check eligibility → reason → inspect → choose resolution → refund details OR exchange → review/confirm → receipt.

The state guards also require previous-step data; permission alone does not allow an arbitrary jump to an unfinished step.

## Functional and business rules

### Original sale and quantities

- Search supports invoice, mobile, customer and recent modes. Search API accepts date range, payment method and amount range.
- Backend page size defaults to 20 and is capped at 100. Preview line cap is 100.
- A device identifier and resolved till context are used to determine processing outlet.
- Selected lines must identify original sale lines, be unique, and have positive return quantities.
- Remaining quantity uses original sold/fulfilled quantities and existing returns. Recorded return lines exclude cancelled/rejected returns.
- Calculation uses the greater of the sale-line returned quantity and recorded return quantity, avoiding reliance on only one counter.
- Product-specific return policy is resolved when available; active default policy is the fallback in preview.
- Missing policy, expired return window or no sold quantity makes the preview line nonreturnable. Requests exceeding remaining quantity are rejected.
- Frontend continuation requires a successful backend eligibility result with eligible items.

### Reasons and inspection

- Reasons come from backend active configuration; each assigned reason must be valid.
- Reasons include applicability to return/exchange, required notes, inspection and manager approval flags.
- Return notes maximum: 1,000 characters.
- Conditions come from configuration and include resellability, refund impact, required notes/photo and approval.
- Inspection notes maximum: 200 characters. Up to 5 photos per line, each up to 5 MiB.
- Allowed upload MIME types: image/jpeg, image/jpg, image/png, image/webp.
- Required photo checks rely on uploaded media. Upload progress/failure prevents local completion of inspection.
- Drafts have version, expiry, validation status and persisted resolution/method. Validation checks server-side media ownership/context.
- Backend derives inspection/approval flags; it does not trust client-supplied approval booleans.
- Resellable conditions produce RESTOCK inspections; other conditions produce REJECT inspections.
- Required refund approval is enforced through the approval permission. This inventory does not assert a separate manager sign-in/PIN approval flow.

### Refund amount and method

For each selected line:

```text
soldQty = fulfilled quantity if positive, otherwise max(0, quantity - cancelled quantity)
returnedQty = max(sale-line returned quantity, recorded return quantity)
availableQty = max(0, soldQty - returnedQty)
ratio = requestedReturnQty / soldQty
itemValue = round(original line subtotal * ratio)
discount = round(original line discount * ratio)
tax = round(original line tax * ratio)
lineRefund = round(itemValue - discount + tax)
netRefund = round(sum(itemValue) - sum(discount) + sum(tax))
```

Rounding uses two decimal places, MidpointRounding.AwayFromZero. Refund must be positive and cannot exceed remaining refundable sale total.

- Saved resolution must be REFUND or EXCHANGE.
- Refund processing requires validated draft plus saved REFUND resolution.
- Refund method save accepts only ORIGINAL_PAYMENT or CASH.
- ORIGINAL_PAYMENT availability is determined from refundable original card payment rows and remaining card amount; response marks RequiresProvider=true.
- CASH availability requires an active POS CASH method supporting refunds and an open till.
- Method response has no automatic default (DefaultMethodCode=null in the inspected repository).
- Refund settlement accepts CASH_REFUND or CARD_REFUND.
- STORE_CREDIT is not an accepted refund method in this flow.
- The preview returns a PREVIEW-prefixed reference, validity days 0 and no expiry; do not interpret this as an issued customer-credit instrument.

### Exchange branch

- Strict exchange permission and saved EXCHANGE resolution are required.
- Replacement items are persisted against the inspection draft with expected version.
- Backend checks replacement quantities, available outlet stock, current price and original-sale currency.
- Preview returns return value, replacement value, tax/discount adjustment, difference direction, due-from/due-to-customer and policy messages.
- Completion permits NO_SETTLEMENT, CASH_PAYMENT, CASH_REFUND or CARD_REFUND for exchange, subject to branch/difference checks.
- Customer-pays exchange currently requires in-till cash payment.
- Completion records replacement sale/order lines, exchange rows, stock changes and the applicable payment/refund.

## Logic and persistence lifecycle

1. Flutter Riverpod providers hold selected sale, selected lines, reasons, inspections, resolution, method, previews and completion state.
2. Selecting a new sale or changing selected return lines clears dependent flow data. The reset coordinator resets the return draft while keeping external auth/till/device context.
3. Remote datasource sends HTTP requests and maps response data into domain entities.
4. Controller requires TenantOnly authorization and creates tenant request context; successful JSON responses use a data envelope.
5. Service validates permissions, input, device/till context and delegates tenant/outlet-scoped work.
6. Repository computes eligibility/money and persists drafts; optimistic draft versions detect stale requests.
7. Completion requires ExpectedVersion and an IdempotencyKey (trimmed, nonempty, at most 120 characters). Consumed drafts can participate in replay of the same completed request.
8. Refund completion writes return/header/line/event, inspection/media, refund/line/allocation, stock/till movement and receipt records, and updates original sale/payment refund counters.
9. Relational completion paths use database transactions. Conflicting versions/quantities/idempotency produce explicit errors.
10. Frontend completion providers keep a retry idempotency key; success/print handling is a separate concern from financial completion.

### Card integration caveat visible in current code

The inspected return completion repository creates completed refund allocations and, for CARD_REFUND, a reference based on ORIGINAL- plus payment number. No card gateway RefundAsync call was found in the inspected PosReturnService/PosReturnRepository completion path. The option's RequiresProvider flag alone is not evidence that money was refunded externally. This is a code observation, not a live provider test.

## Permissions

Exact strings currently in B `ReturnsPermissions.cs`:

| Constant | Code |
|---|---|
| ViewReturns | returns.view |
| CreateReturn | returns.create |
| ViewRefunds | refunds.view |
| CreateRefund | refunds.create |
| ViewExchanges | exchanges.view |
| CreateExchange | exchanges.create |
| ApproveRefund | pos.refund.approve |

These are the strings found in this module; they have not been rewritten into a different naming convention.

| Operation | Required access represented in current guards/helpers |
|---|---|
| Search / shared return view / eligibility view | returns.view |
| Continue search / summary / reason / inspection / choose option | returns.view + returns.create |
| Refund resolution / refund processing | returns.view + returns.create + refunds.create |
| Exchange resolution / exchange processing | returns.view + returns.create + exchanges.create |
| Approval when required | pos.refund.approve |
| Immediate refund success | Strict refund processing permissions |
| Immediate exchange success | Strict exchange processing permissions |
| Historical completion reload | returns.view + receipts.view is also accepted by success helpers |

Frontend route guard additionally requires `PosPermissionAccess.canViewHome`. Receipt printing has shared receipt/printer checks in the success provider; completion access alone does not prove a device can print.

B `ReturnsAccess.cs` also contains broader legacy helpers (CanCreateRefund/CanCreateExchange accept returns.create), but strict branch helpers explicitly require the branch create permission. Do not substitute the broader helper for the processing rules above.

Seed file `DevelopmentPosReturnsExchangePermissionsSeedData.cs` distinguishes cashier-default permissions from manager approval. No user's live grants were queried for this document.

## API inventory

Base: `/api/v1/pos/returns`. Routes use GUID constraints for IDs. Requests use deviceId query context. Full typed attributes are in Appendix B.

| Method | Relative route | Contract/purpose |
|---|---|---|
| GET | sales/search | searchType, search, fromDate, toDate, paymentMethodCode, minAmount, maxAmount, page, pageSize |
| GET | sales/{saleId}/eligibility | Original sale eligibility |
| POST | sales/{saleId}/eligibility-check | Lines: SaleLineId, ReturnQty |
| GET | reasons | Reason options |
| POST | sales/{saleId}/reasons/validate | Items: SaleLineId, ReasonCode, Notes; ApplySameReasonToAll |
| GET | inspection/conditions | Condition options |
| PUT | sales/{saleId}/inspection/draft | Lines + Version |
| GET | sales/{saleId}/inspection/draft | Current draft |
| POST | sales/{saleId}/inspection/validate | Lines, ReasonRefs, Version |
| POST | sales/{saleId}/inspection/media | multipart file; saleLineId query |
| GET | inspection/media/{mediaId} | Authenticated file response |
| DELETE | inspection/media/{mediaId} | Delete staged media; 204 on success |
| PUT | sales/{saleId}/resolution | ResolutionType, ExpectedVersion |
| GET | sales/{saleId}/resolution | Saved branch and allowed options |
| POST | sales/{saleId}/credit-preview | ReasonCode, Lines |
| GET | sales/{saleId}/refund-methods | Backend method availability |
| PUT | sales/{saleId}/refund-method | MethodCode |
| GET | sales/{saleId}/exchange/products | Replacement search |
| PUT | sales/{saleId}/exchange/replacement | Items, ExpectedVersion |
| GET | sales/{saleId}/exchange/replacement | Saved replacement |
| POST | sales/{saleId}/exchange-preview | ReasonCode, Lines |
| POST | sales/{saleId}/complete | ReasonCode, SettlementMethodCode, Notes, Lines, ExpectedVersion, IdempotencyKey |
| GET | completions/{returnId} | Persisted completion receipt |

Controller maps typed errors to HTTP responses. Examples include permission_denied, invalid_device_id, quantity_exceeds_available, approval_required, concurrency_conflict and idempotency_conflict. Media also has size/type failure responses. Check controller ToErrorResult for exact status mapping; error names should not be assumed to imply an HTTP status.

Receipt print audit uses the shared receipt API through datasource recordReceiptPrint; it is outside this controller's 23 routes.

## Non-functional behavior present in source

| Concern | Implemented evidence / limit |
|---|---|
| Authorization | TenantOnly controller, tenant context, service permissions, frontend route/context guards |
| Isolation | Tenant/outlet filtering and media ownership checks |
| Consistency | Transactional completion, draft versions, idempotency replay/conflict handling |
| Input/resource limits | Page cap 100, preview lines cap 100, note/photo limits above |
| Money precision | Backend decimal and explicit two-place rounding |
| Responsiveness | Provider loading states; replacement search has 300 ms debounce |
| Auditability | Return/exchange events, user/timestamp columns, refund allocations, receipt print state |
| Media lifecycle | Staging, expiry/consume/delete metadata; local storage and cleanup service |
| Hardware | Completion can return drawer operation/settings; frontend drawer controller dispatches; receipt print orchestrator handles printing |
| Print recovery | Success provider retains pending print audits and has audit-only retry |
| Testability | Unit, API, integration and Flutter feature test sources exist |
| Runtime acceptance | No throughput/latency benchmark, physical printer/drawer run or deployment verification performed for this inventory |

Do not infer offline return completion, production SLA, external card settlement success or physical hardware acceptance from the presence of these classes.

## Tables and attributes

The following is the complete column-name inventory extracted from EF configurations in the ReturnExchange and Refund folders. These are source mappings, not confirmation that every migration has run in a deployed database. GUID relationships are represented by *_id columns; exact FK/index/type/nullability definitions remain in the named configurations.

### return_exchange_replacement_draft_lines

`id`, `created_at`, `tenant_id`, `return_inspection_draft_id`, `returned_sale_line_id`, `replacement_product_id`, `replacement_variant_id`, `quantity`, `selected_by_tenant_user_id`, `selected_at`.

### return_inspection_conditions

`id`, `created_at`, `updated_at`, `tenant_id`, `condition_code`, `display_name`, `description`, `status_category`, `is_resellable`, `refund_impact`, `requires_notes`, `requires_photo`, `requires_approval`, `is_active`, `sort_order`.

### return_inspections

`id`, `created_at`, `tenant_id`, `sales_return_line_id`, `inspected_by_tenant_user_id`, `inventory_location_id`, `inspection_status`, `condition_code`, `restock_decision`, `restock_quantity`, `reject_quantity`, `inspection_notes`, `inspected_at`.

### return_inspection_drafts

`id`, `created_at`, `tenant_id`, `outlet_id`, `sale_id`, `status`, `version`, `expires_at`, `validated_at`, `validated_by_tenant_user_id`, `requires_inspection`, `requires_manager_approval`, `created_by_tenant_user_id`, `resolution_type`, `resolution_selected_at`, `resolution_selected_by_tenant_user_id`, `refund_method_code`, `refund_method_selected_at`, `refund_method_selected_by_tenant_user_id`.

### return_inspection_draft_lines

`id`, `created_at`, `tenant_id`, `return_inspection_draft_id`, `sale_line_id`, `condition_id`, `condition_code_snapshot`, `inspection_notes`, `inspection_status`, `inspected_by_tenant_user_id`, `inspected_at`.

### return_inspection_media

`id`, `created_at`, `tenant_id`, `return_inspection_id`, `storage_key`, `file_name`, `content_type`, `size_bytes`, `uploaded_by_tenant_user_id`.

### return_inspection_media_staging

`id`, `created_at`, `tenant_id`, `outlet_id`, `sale_id`, `sale_line_id`, `inspection_draft_id`, `inspection_draft_line_id`, `status`, `expires_at`, `consumed_at`, `deleted_at`, `storage_key`, `file_name`, `content_type`, `size_bytes`, `uploaded_by_tenant_user_id`.

### return_reasons

`id`, `created_at`, `updated_at`, `tenant_id`, `reason_code`, `reason_name`, `description`, `applies_to`, `requires_note`, `requires_inspection`, `requires_manager_approval`, `is_active`, `sort_order`.

### sales_exchanges

`id`, `created_at`, `updated_at`, `tenant_id`, `document_number_sequence_id`, `sales_return_id`, `replacement_sales_order_id`, `exchange_number`, `exchange_status`, `exchange_mode`, `price_difference_amount`, `additional_payment_amount`, `refund_back_amount`, `completed_at`, `cancelled_at`, `notes`, `idempotency_key`, `created_by_tenant_user_id`, `updated_by_tenant_user_id`.

### sales_exchange_events

`id`, `created_at`, `tenant_id`, `sales_exchange_id`, `event_type`, `old_status`, `new_status`, `event_notes`, `created_by_tenant_user_id`.

### sales_exchange_lines

`id`, `created_at`, `updated_at`, `tenant_id`, `sales_exchange_id`, `sales_return_line_id`, `replacement_product_id`, `replacement_product_variant_id`, `replacement_sales_order_line_id`, `quantity`, `original_line_amount`, `replacement_line_amount`, `net_difference_amount`, `exchange_action_type`.

### sales_returns

`id`, `created_at`, `updated_at`, `tenant_id`, `document_number_sequence_id`, `sales_order_id`, `customer_id`, `outlet_id`, `processing_outlet_code_snapshot`, `processing_outlet_name_snapshot`, `return_reason_id`, `return_reason_code_snapshot`, `return_reason_name_snapshot`, `return_number`, `return_channel`, `return_status`, `requested_at`, `approved_at`, `received_at`, `completed_at`, `cancelled_at`, `total_requested_qty`, `total_received_qty`, `total_approved_qty`, `total_refund_amount`, `total_exchange_amount`, `notes`, `idempotency_key`, `created_by_tenant_user_id`, `updated_by_tenant_user_id`.

### sales_return_events

`id`, `created_at`, `tenant_id`, `sales_return_id`, `event_type`, `old_status`, `new_status`, `event_notes`, `created_by_tenant_user_id`.

### sales_return_lines

`id`, `created_at`, `updated_at`, `tenant_id`, `sales_return_id`, `sales_order_line_id`, `return_reason_id`, `return_reason_code_snapshot`, `return_reason_name_snapshot`, `quantity_requested`, `quantity_received`, `quantity_approved`, `unit_price_snapshot`, `unit_tax_amount_snapshot`, `line_subtotal_amount`, `line_tax_amount`, `disposition_status`, `notes`.

### sales_refunds

`id`, `created_at`, `updated_at`, `tenant_id`, `document_number_sequence_id`, `sales_order_id`, `sales_return_id`, `refund_number`, `refund_mode`, `refund_status`, `currency_code`, `requested_amount`, `approved_amount`, `refunded_amount`, `refund_reason`, `requested_at`, `approved_at`, `completed_at`, `cancelled_at`, `cancellation_reason`, `approved_by_tenant_user_id`, `created_by_tenant_user_id`, `updated_by_tenant_user_id`.

### sales_refund_lines

`id`, `created_at`, `tenant_id`, `sales_refund_id`, `sales_return_line_id`, `refund_line_type`, `description_snapshot`, `quantity`, `amount`, `tax_amount`.

### sales_refund_payment_allocations

`id`, `created_at`, `updated_at`, `tenant_id`, `sales_refund_id`, `original_sales_payment_id`, `refund_payment_method_id`, `refund_transaction_id`, `allocated_amount`, `allocation_status`, `external_reference`.


### Related persistence used by completion

Repository also reads/writes original SalesOrders/SalesOrderLines, SalesPayments/SalesPaymentTransactions, PaymentMethods, ReturnPolicies, product/variant/price and image data, InventoryBalances, StockMovements/StockMovementReferences, TillCashMovements and Receipts. Exchange additionally creates SalesPaymentEvents. These are shared modules, not new tables owned by the Returns UI. Their complete shared schemas are outside the dedicated table inventory above.

## Backend folder structure

```text
src/
  E_POS.Api/Controllers/V1/Tenant/PosReturnsController.cs
  E_POS.Application/Modules/Tenant/POSOperations/
    Access/ReturnsAccess.cs
    Contracts/IPosReturnService.cs
    Contracts/IPosReturnRepository.cs
    Dtos/PosReturnSaleSearchDtos.cs
    Services/PosReturnService.cs
  E_POS.Domain/Modules/Tenant/POSOperations/Constants/ReturnsPermissions.cs
  E_POS.Domain/Modules/Shared/
    ReturnExchange/Entities/   (return, inspection, draft, reason, exchange entities)
    ReturnExchange/Constants/SalesExchangeConstants.cs
    Refund/Entities/          (refund, refund line, payment allocation)
  E_POS.Infrastructure/Modules/Shared/
    ReturnExchange/
      Repositories/PosReturnRepository.cs
      Configurations/         (one EF mapping per dedicated entity)
      Services/LocalReturnInspectionMediaStorage.cs
      Services/ReturnInspectionMediaStagingCleanupService.cs
    Refund/Configurations/
  E_POS.Infrastructure/Persistence/
    Seed/DevelopmentReturnReasonsSeedData.cs
    Seed/DevelopmentPosReturnsExchangePermissionsSeedData.cs
    Seed/DevelopmentPosReturnPolicySeedData.cs
    Migrations/
tests/
  E_POS.UnitTests/POSOperations/PosReturnServiceTests.cs
  E_POS.ApiTests/POSOperations/PosReturnsControllerTests.cs
  E_POS.IntegrationTests/POSOperations/PosReturnRepositoryTests.cs
```

## Frontend architecture and test inventory

Feature currently uses data/datasources, domain/entities and domain/config, presentation/providers, navigation, screens and widgets. Shared shell/access, product catalogue and hardware/receipt components live outside the feature.

Provider responsibilities follow the flow: search, eligibility, reason, inspection, resolution, refund details, exchange replacement/flow, review, receipt and success. `return_flow_provider.dart` holds shared workflow state and `return_flow_reset_coordinator.dart` coordinates reset.

Feature test files cover permissions, sale search/summary, selection/eligibility, reasons, inspection, resolution choice, refund details, exchange, review, receipt success and Step 10 printing. Backend tests include refund persistence/replay and strict permission cases. No tests were executed for this documentation-only task.

## Appendix A — complete frontend feature file list

Paths relative to F:

```text
lib/features/returns_refunds\presentation\widgets\return_policy_checks_card.dart
lib/features/returns_refunds\presentation\widgets\return_recent_search_chips.dart
lib/features/returns_refunds\presentation\widgets\return_select_items_toolbar.dart
lib/features/returns_refunds\presentation\widgets\return_original_sale_summary_cards.dart
lib/features/returns_refunds\presentation\widgets\return_eligibility_summary_card.dart
lib/features/returns_refunds\presentation\widgets\return_credit_items_summary_card.dart
lib/features/returns_refunds\presentation\widgets\return_credit_sale_summary_panel.dart
lib/features/returns_refunds\presentation\widgets\return_credit_confirmation_checkbox.dart
lib/features/returns_refunds\presentation\widgets\return_credit_reason_card.dart
lib/features/returns_refunds\presentation\widgets\return_receipt_summary_panel.dart
lib/features/returns_refunds\presentation\widgets\return_credit_calculation_card.dart
lib/features/returns_refunds\presentation\widgets\return_credit_preview_card.dart
lib/features/returns_refunds\presentation\widgets\return_continue_footer.dart
lib/features/returns_refunds\presentation\widgets\return_receipt_preview_card.dart
lib/features/returns_refunds\presentation\widgets\return_completed_success_banner.dart
lib/features/returns_refunds\presentation\widgets\return_select_items_table.dart
lib/features/returns_refunds\presentation\widgets\return_receipt_audit_card.dart
lib/features/returns_refunds\presentation\widgets\returns_exchange_action_footer.dart
lib/features/returns_refunds\presentation\widgets\return_select_items_summary_cards.dart
lib/features/returns_refunds\presentation\widgets\return_receipt_actions_card.dart
lib/features/returns_refunds\presentation\widgets\return_selected_item_card.dart
lib/features/returns_refunds\presentation\widgets\return_reason_validation_message.dart
lib/features/returns_refunds\presentation\widgets\return_selected_items_section.dart
lib/features/returns_refunds\presentation\widgets\return_reason_option_tile.dart
lib/features/returns_refunds\presentation\widgets\return_search_pagination.dart
lib/features/returns_refunds\presentation\widgets\return_reason_options_section.dart
lib/features/returns_refunds\presentation\widgets\return_search_page_header.dart
lib/features/returns_refunds\presentation\widgets\return_reason_notes_field.dart
lib/features/returns_refunds\presentation\widgets\return_search_filter_tabs.dart
lib/features/returns_refunds\presentation\widgets\return_search_filters_panel.dart
lib/features/returns_refunds\presentation\widgets\return_search_bar.dart
lib/features/returns_refunds\presentation\widgets\return_sale_summary_card.dart
lib/features/returns_refunds\presentation\widgets\return_sale_result_card.dart
lib/features/returns_refunds\presentation\widgets\return_sale_context_bar.dart
lib/features/returns_refunds\presentation\widgets\return_sold_item_row.dart
lib/features/returns_refunds\presentation\widgets\return_sold_items_section.dart
lib/features/returns_refunds\presentation\widgets\return_settlement_validation_message.dart
lib/features/returns_refunds\presentation\widgets\return_settlement_summary_panel.dart
lib/features/returns_refunds\presentation\widgets\return_settlement_preview_card.dart
lib/features/returns_refunds\presentation\widgets\return_settlement_method_tile.dart
lib/features/returns_refunds\presentation\widgets\return_settlement_methods_section.dart
lib/features/returns_refunds\presentation\widgets\review_confirm\refund_settlement_details_card.dart
lib/features/returns_refunds\presentation\widgets\review_confirm\exchange_settlement_details_card.dart
lib/features/returns_refunds\presentation\widgets\return_stepper.dart
lib/features/returns_refunds\presentation\widgets\review_confirm\return_exchange_review_header.dart
lib/features/returns_refunds\presentation\widgets\review_confirm\return_exchange_review_action_footer.dart
lib/features/returns_refunds\presentation\widgets\review_confirm\return_financial_summary_card.dart
lib/features/returns_refunds\presentation\widgets\review_confirm\settlement_information_banner.dart
lib/features/returns_refunds\presentation\widgets\review_confirm\return_review_item_row.dart
lib/features/returns_refunds\presentation\widgets\review_confirm\return_review_items_section.dart
lib/features/returns_refunds\presentation\widgets\review_confirm\return_reference_details_card.dart
lib/features/returns_refunds\presentation\navigation\returns_route_guard.dart
lib/features/returns_refunds\presentation\widgets\refund_details\refund_summary_card.dart
lib/features/returns_refunds\presentation\widgets\refund_details\refund_method_section.dart
lib/features/returns_refunds\presentation\widgets\refund_details\refund_method_option_tile.dart
lib/features/returns_refunds\presentation\widgets\refund_details\refund_details_header.dart
lib/features/returns_refunds\presentation\widgets\refund_details\refund_amount_section.dart
lib/features/returns_refunds\presentation\widgets\exchange_replacement\replacement_product_stock_status.dart
lib/features/returns_refunds\presentation\widgets\exchange_replacement\replacement_product_row.dart
lib/features/returns_refunds\presentation\widgets\exchange_replacement\replacement_products_section.dart
lib/features/returns_refunds\presentation\widgets\exchange_replacement\replacement_items_search_toolbar.dart
lib/features/returns_refunds\presentation\widgets\exchange_replacement\replacement_items_header.dart
lib/features/returns_refunds\presentation\widgets\exchange_replacement\exchange_variant_picker_sheet.dart
lib/features/returns_refunds\presentation\widgets\exchange_replacement\exchange_summary_card.dart
lib/features/returns_refunds\presentation\widgets\exchange_replacement\exchange_difference_result_card.dart
lib/features/returns_refunds\presentation\widgets\eligibility_check\eligibility_summary_card.dart
lib/features/returns_refunds\presentation\widgets\eligibility_check\eligibility_result_banner.dart
lib/features/returns_refunds\presentation\widgets\eligibility_check\eligibility_policy_note_card.dart
lib/features/returns_refunds\presentation\widgets\eligibility_check\eligibility_check_item.dart
lib/features/returns_refunds\presentation\widgets\eligibility_check\eligibility_check_header.dart
lib/features/returns_refunds\presentation\widgets\eligibility_check\eligibility_checklist_card.dart
lib/features/returns_refunds\presentation\screens\pos_return_settlement_screen.dart
lib/features/returns_refunds\presentation\screens\pos_return_search_sale_screen.dart
lib/features/returns_refunds\presentation\screens\pos_return_sale_summary_screen.dart
lib/features/returns_refunds\presentation\screens\pos_return_refund_details_screen.dart
lib/features/returns_refunds\presentation\screens\pos_return_receipt_screen.dart
lib/features/returns_refunds\presentation\screens\pos_return_reason_screen.dart
lib/features/returns_refunds\presentation\screens\pos_return_inspect_items_screen.dart
lib/features/returns_refunds\presentation\screens\pos_return_exchange_flow_screen.dart
lib/features/returns_refunds\presentation\screens\pos_return_eligibility_screen.dart
lib/features/returns_refunds\presentation\screens\pos_return_create_credit_screen.dart
lib/features/returns_refunds\presentation\screens\pos_return_choose_option_screen.dart
lib/features/returns_refunds\presentation\widgets\return_reason\selected_return_item_tile.dart
lib/features/returns_refunds\presentation\screens\pos_return_check_eligibility_screen.dart
lib/features/returns_refunds\presentation\widgets\return_reason\selected_return_items_card.dart
lib/features/returns_refunds\presentation\widgets\return_reason\return_reason_options_list.dart
lib/features/returns_refunds\presentation\widgets\return_reason\return_reason_notes_field.dart
lib/features/returns_refunds\presentation\widgets\return_reason\return_reason_header.dart
lib/features/returns_refunds\presentation\widgets\return_reason\return_policy_information_banner.dart
lib/features/returns_refunds\presentation\widgets\return_reason\return_exchange_reason_card.dart
lib/features/returns_refunds\presentation\widgets\return_reason\per_line_return_reason_list.dart
lib/features/returns_refunds\presentation\widgets\return_reason\apply_same_reason_control.dart
lib/features/returns_refunds\presentation\widgets\return_qty_stepper.dart
lib/features/returns_refunds\presentation\widgets\return_purchased_items_section.dart
lib/features/returns_refunds\presentation\providers\exchange_replacement_provider.dart
lib/features/returns_refunds\presentation\providers\return_eligibility_provider.dart
lib/features/returns_refunds\presentation\providers\return_exchange_flow_provider.dart
lib/features/returns_refunds\presentation\widgets\inspect_items\inspection_condition_breakdown_card.dart
lib/features/returns_refunds\presentation\widgets\inspect_items\add_inspection_photo_button.dart
lib/features/returns_refunds\presentation\widgets\inspect_items\inspection_condition_selector.dart
lib/features/returns_refunds\presentation\widgets\inspect_items\inspection_item_card.dart
lib/features/returns_refunds\domain\config\return_refund_method_config.dart
lib/features/returns_refunds\domain\entities\exchange_difference_result.dart
lib/features/returns_refunds\data\datasources\returns_refund_remote_datasource.dart
lib/features/returns_refunds\presentation\providers\return_create_credit_provider.dart
lib/features/returns_refunds\domain\entities\refund_method_type.dart
lib/features/returns_refunds\domain\entities\exchange_replacement_selection.dart
lib/features/returns_refunds\domain\entities\return_credit_preview.dart
lib/features/returns_refunds\presentation\widgets\receipt_success\completed_items_summary_card.dart
lib/features/returns_refunds\presentation\widgets\receipt_success\completed_item_row.dart
lib/features/returns_refunds\presentation\widgets\choose_option\choose_option_header.dart
lib/features/returns_refunds\presentation\widgets\inspect_items\inspect_items_header.dart
lib/features/returns_refunds\presentation\widgets\inspect_items\inspection_summary_card.dart
lib/features/returns_refunds\presentation\widgets\inspect_items\inspection_policy_warning_card.dart
lib/features/returns_refunds\presentation\widgets\inspect_items\inspection_photo_thumbnail.dart
lib/features/returns_refunds\presentation\widgets\inspect_items\inspection_photos_section.dart
lib/features/returns_refunds\presentation\widgets\inspect_items\inspection_notes_field.dart
lib/features/returns_refunds\presentation\providers\return_flow_reset_coordinator.dart
lib/features/returns_refunds\presentation\providers\return_flow_provider.dart
lib/features/returns_refunds\presentation\providers\return_inspection_provider.dart
lib/features/returns_refunds\presentation\providers\return_resolution_provider.dart
lib/features/returns_refunds\presentation\providers\return_refund_details_provider.dart
lib/features/returns_refunds\presentation\providers\return_receipt_provider.dart
lib/features/returns_refunds\presentation\providers\return_search_provider.dart
lib/features/returns_refunds\presentation\providers\return_review_provider.dart
lib/features/returns_refunds\presentation\providers\return_settlement_provider.dart
lib/features/returns_refunds\presentation\providers\return_success_display.dart
lib/features/returns_refunds\presentation\providers\return_success_provider.dart
lib/features/returns_refunds\presentation\providers\return_reason_provider.dart
lib/features/returns_refunds\presentation\widgets\receipt_success\success_page_actions.dart
lib/features/returns_refunds\presentation\widgets\receipt_success\return_exchange_success_hero.dart
lib/features/returns_refunds\presentation\widgets\receipt_success\invalid_completion_state.dart
lib/features/returns_refunds\presentation\widgets\receipt_success\completion_information_banner.dart
lib/features/returns_refunds\presentation\widgets\receipt_success\completion_detail_tile.dart
lib/features/returns_refunds\presentation\widgets\receipt_success\completion_details_card.dart
lib/features/returns_refunds\domain\entities\return_flow_steps.dart
lib/features/returns_refunds\domain\entities\return_exchange.dart
lib/features/returns_refunds\domain\entities\return_inspection.dart
lib/features/returns_refunds\domain\entities\return_reason_option.dart
lib/features/returns_refunds\domain\entities\return_settlement_method.dart
lib/features/returns_refunds\domain\entities\return_sale_summary.dart
lib/features/returns_refunds\domain\entities\return_sale_eligibility.dart
lib/features/returns_refunds\domain\entities\return_resolution_type.dart
lib/features/returns_refunds\domain\entities\return_resolution.dart
lib/features/returns_refunds\domain\entities\return_refund_method.dart
lib/features/returns_refunds\domain\entities\return_receipt.dart
lib/features/returns_refunds\presentation\widgets\choose_option\return_resolution_option_card.dart
lib/features/returns_refunds\presentation\widgets\choose_option\return_resolution_options.dart
lib/features/returns_refunds\presentation\widgets\choose_option\choose_option_information_message.dart
```

## Appendix B — exact API DTO attributes and types

Source: B `src/E_POS.Application/Modules/Tenant/POSOperations/Dtos/PosReturnSaleSearchDtos.cs`. Included verbatim to preserve nullable fields, defaults, nested attributes and monetary types. These C# property names describe the source contract; the application serializer controls JSON casing.

```csharp
using E_POS.Application.Modules.Tenant.HardwareCash.Dtos;

namespace E_POS.Application.Modules.Tenant.POSOperations.Dtos;

public sealed record PosReturnSaleSummaryDto(
    Guid SaleId,
    string InvoiceNo,
    Guid? CustomerId,
    string CustomerName,
    string Phone,
    string PaymentMethod,
    string MaskedCard,
    DateTimeOffset? SaleDate,
    decimal Total,
    int ItemCount,
    string Currency);

public sealed record PosReturnSaleSearchFilterDto(
    DateOnly? FromDate,
    DateOnly? ToDate,
    string? PaymentMethodCode,
    decimal? MinAmount,
    decimal? MaxAmount);

public sealed record PosReturnPaymentMethodFilterOptionDto(
    string Code,
    string Label);

public sealed record PosReturnSaleSearchPageDto(
    IReadOnlyList<PosReturnSaleSummaryDto> Items,
    int Page,
    int PageSize,
    int TotalCount,
    IReadOnlyList<PosReturnPaymentMethodFilterOptionDto>? PaymentMethods = null);

public sealed record PosReturnPolicyCheckDto(
    string Label,
    string Value,
    bool Passed,
    string Code = "",
    string Description = "",
    string Status = "",
    string? Severity = null,
    string? Reason = null,
    bool RequiresReview = false);

public sealed record PosReturnSaleLineEligibilityDto(
    Guid SaleLineId,
    Guid? VariantId,
    string Name,
    string Sku,
    string? ImageStorageKey,
    decimal SoldQty,
    decimal ReturnedQty,
    decimal AvailableReturnQty,
    decimal UnitPrice,
    decimal LineTotal,
    bool IsReturnable,
    string EligibilityStatus,
    string? IneligibilityReason,
    decimal? RequestedReturnQty = null,
    decimal? EligibleReturnQty = null,
    string? Barcode = null);

public sealed record PosReturnSaleEligibilityDto(
    Guid SaleId,
    string InvoiceNo,
    Guid? CustomerId,
    string CustomerName,
    DateTimeOffset? SaleDate,
    string PaymentMethod,
    string MaskedCard,
    string Currency,
    IReadOnlyList<PosReturnSaleLineEligibilityDto> Items,
    IReadOnlyList<PosReturnPolicyCheckDto> PolicyChecks,
    string OverallStatus = "",
    bool CanContinue = false,
    int EligibleItemCount = 0,
    int SelectedItemCount = 0,
    string OverallMessage = "",
    string? PolicyNote = null,
    bool RequiresInspection = false,
    bool RequiresManagerApproval = false);

public sealed record PosReturnEligibilityCheckRequestDto(
    IReadOnlyList<PosReturnCreditPreviewLineRequestDto> Lines);

public sealed record PosReturnReasonsValidateRequestDto(
    IReadOnlyList<PosReturnReasonAssignmentRequestDto> Items,
    bool ApplySameReasonToAll = false);

public sealed record PosReturnReasonAssignmentRequestDto(
    Guid SaleLineId,
    string ReasonCode,
    string? Notes);

public sealed record PosReturnReasonsValidateResponseDto(
    Guid SaleId,
    bool ApplySameReasonToAll,
    int NotesMaxLength,
    IReadOnlyList<PosReturnReasonAssignmentResultDto> Items);

public sealed record PosReturnReasonAssignmentResultDto(
    Guid SaleLineId,
    Guid ReasonId,
    string ReasonCode,
    string ReasonDisplayName,
    string? Notes,
    bool RequiresNotes,
    bool RequiresInspection,
    bool RequiresManagerApproval = false);

public sealed record PosReturnReasonOptionDto(
    Guid Id,
    string Code,
    string DisplayName,
    string? Description,
    int SortOrder,
    bool AppliesToReturn,
    bool AppliesToExchange,
    bool RequiresNotes,
    bool RequiresInspection,
    bool RequiresManagerApproval);

public sealed record PosReturnCreditPreviewLineRequestDto(
    Guid SaleLineId,
    decimal ReturnQty);

public sealed record PosReturnCreditPreviewRequestDto(
    string ReasonCode,
    IReadOnlyList<PosReturnCreditPreviewLineRequestDto> Lines);

public sealed record PosReturnCreditPreviewItemDto(
    Guid SaleLineId,
    string Name,
    string Sku,
    string VariantLabel,
    string? ImageStorageKey,
    decimal ReturnQty,
    decimal UnitPrice,
    decimal LineAmount);

public sealed record PosReturnCreditCalculationDto(
    decimal ItemValue,
    string DiscountLabel,
    decimal DiscountAdjustment,
    string TaxLabel,
    decimal TaxAdjustment,
    decimal NetCreditAmount);

public sealed record PosReturnCreditPreviewDto(
    Guid SaleId,
    string InvoiceNo,
    Guid? CustomerId,
    string CustomerName,
    string CustomerDisplayId,
    DateTimeOffset? SaleDate,
    string PaymentMethod,
    string MaskedCard,
    string Currency,
    decimal SaleTotal,
    int SaleItemCount,
    string ReasonCode,
    string ReasonLabel,
    IReadOnlyList<PosReturnCreditPreviewItemDto> Items,
    PosReturnCreditCalculationDto Calculation,
    string CreditReference,
    int ValidityDays,
    DateTimeOffset? ExpiresAt,
    int SelectedItemCount,
    bool CanProceed = true,
    bool RequiresApproval = false,
    string? PolicyMessage = null,
    int? DraftVersion = null);

public sealed record PosReturnRefundMethodOptionDto(
    string Code,
    string DisplayName,
    bool Enabled,
    string? DisabledReason,
    string? OriginalPaymentMethod,
    string? MaskedReference,
    bool RequiresOpenTill,
    bool RequiresProvider,
    bool RequiresApproval);

public sealed record PosReturnRefundMethodsResponseDto(
    IReadOnlyList<PosReturnRefundMethodOptionDto> Items,
    string? DefaultMethodCode,
    string? SelectedMethodCode,
    DateTimeOffset? SelectedAt);

public sealed record PosReturnRefundMethodSaveRequestDto(string MethodCode);

public sealed record PosReturnRefundMethodSaveResponseDto(
    Guid SaleId,
    string MethodCode,
    DateTimeOffset SelectedAt);

public sealed record PosReturnCompleteRequestDto(
    string ReasonCode,
    string SettlementMethodCode,
    string? Notes,
    IReadOnlyList<PosReturnCreditPreviewLineRequestDto> Lines,
    int ExpectedVersion,
    string IdempotencyKey);

public sealed record PosReturnReceiptDto(
    Guid ReturnId,
    string ReceiptNumber,
    string OriginalInvoiceNo,
    int ReturnedItemCount,
    string SettlementMethodCode,
    string SettlementMethodLabel,
    string SettlementDisplay,
    string SettlementResult,
    string Currency,
    decimal RefundAmount,
    decimal CustomerCreditAmount,
    DateTimeOffset CompletedAt,
    string ReturnStatus,
    string CustomerName,
    string CashierName,
    string TillName,
    string ApprovalStatus,
    string CustomerAcknowledgement,
    Guid? ReceiptId = null,
    Guid? OriginalSaleId = null,
    string Resolution = "REFUND",
    bool CanPrint = true,
    string? ReturnNumber = null,
    string? ExchangeNumber = null,
    Guid? SalesExchangeId = null,
    string? ReplacementOrderNumber = null,
    string? PolicyMessage = null,
    IReadOnlyList<PosReturnCompletionItemDto>? ReturnedItems = null,
    IReadOnlyList<PosReturnCompletionItemDto>? ReplacementItems = null,
    decimal? ReturnItemValue = null,
    decimal? ReplacementItemValue = null,
    decimal? DifferenceAmount = null,
    string? DifferenceDirection = null,
    Guid? OutletId = null,
    string? OutletName = null,
    Guid? TillId = null,
    Guid? DeviceId = null,
    string? DeviceName = null,
    Guid? CustomerId = null,
    string? CustomerDisplayName = null,
    Guid? ProcessedByUserId = null,
    string? ProcessedByName = null,
    string? ReceiptType = null,
    string? OriginalSaleNumber = null,
    string? CardBrand = null,
    string? MaskedCard = null,
    string? ProviderTransactionReference = null,
    string? PaymentRefundStatus = null,
    decimal? AmountPaidByCustomer = null,
    decimal? AmountRefundedToCustomer = null,
    decimal? AmountDueFromCustomer = null,
    decimal? AmountDueToCustomer = null,
    decimal? ReturnSubtotal = null,
    decimal? ReturnDiscount = null,
    decimal? ReturnTax = null,
    decimal? ReturnTotal = null,
    decimal? ReplacementSubtotal = null,
    decimal? ReplacementDiscount = null,
    decimal? ReplacementTax = null,
    decimal? ReplacementTotal = null,
    int PrintCount = 0,
    bool HasBeenPrinted = false,
    Guid? DrawerOperationId = null,
    CashDrawerSettingsDto? CashDrawerSettings = null);

public sealed record PosReturnCompletionItemDto(
    Guid? SaleLineId,
    string Name,
    string VariantLabel,
    decimal Quantity,
    decimal UnitPrice,
    decimal LineAmount,
    string? ImageStorageKey,
    bool IsReplacement = false,
    Guid? SalesReturnLineId = null,
    Guid? ReplacementOrderLineId = null,
    Guid? ProductId = null,
    Guid? VariantId = null,
    string? Sku = null,
    decimal? Subtotal = null,
    decimal? Discount = null,
    decimal? Tax = null,
    decimal? Total = null,
    string? ReasonCode = null,
    string? ReasonDisplay = null,
    string? ConditionCode = null,
    string? ConditionDisplay = null,
    string? Disposition = null,
    string? Currency = null);

public sealed record PosReturnInspectionConditionDto(
    Guid Id,
    string Code,
    string DisplayName,
    string? Description,
    string StatusCategory,
    int SortOrder,
    bool IsResellable,
    string RefundImpact,
    bool RequiresNotes,
    bool RequiresPhoto,
    bool RequiresApproval);

public sealed record PosReturnInspectionMediaDto(
    Guid MediaId,
    Guid SaleLineId,
    string FileName,
    string ContentType,
    long SizeBytes,
    string MediaUrl);

public sealed record PosReturnInspectionLineRequestDto(
    Guid SaleLineId,
    string ConditionCode,
    string? Notes,
    IReadOnlyList<Guid> MediaIds);

public sealed record PosReturnInspectionValidateRequestDto(
    IReadOnlyList<PosReturnInspectionLineRequestDto> Lines,
    IReadOnlyList<PosReturnInspectionReasonRefDto>? ReasonRefs = null,
    int? Version = null);

public sealed record PosReturnInspectionReasonRefDto(
    Guid SaleLineId,
    string ReasonCode);

public sealed record PosReturnInspectionDraftSaveRequestDto(
    IReadOnlyList<PosReturnInspectionDraftLineDto> Lines,
    int? Version = null);

public sealed record PosReturnInspectionDraftLineDto(
    Guid SaleLineId,
    string ConditionCode,
    string? Notes,
    IReadOnlyList<Guid>? MediaIds = null);

public sealed record PosReturnInspectionDraftResponseDto(
    Guid DraftId,
    string Status,
    IReadOnlyList<PosReturnInspectionDraftLineDto> Lines,
    int Version = 1,
    DateTimeOffset? ExpiresAt = null);

public sealed record PosReturnResolutionSaveRequestDto(
    string ResolutionType,
    int ExpectedVersion);

public sealed record PosReturnResolutionOptionDto(
    string ResolutionType,
    bool Allowed,
    string? UnavailableReasonCode);

public sealed record PosReturnResolutionResponseDto(
    Guid SaleId,
    Guid DraftId,
    string? ResolutionType,
    DateTimeOffset? ResolutionSelectedAt,
    Guid? ResolutionSelectedByTenantUserId,
    int Version,
    string DraftStatus,
    DateTimeOffset ExpiresAt,
    IReadOnlyList<PosReturnResolutionOptionDto> AvailableOptions,
    bool RefundAllowed,
    bool ExchangeAllowed,
    bool RequiresManagerApproval,
    bool RequiresInspection,
    bool CanChange,
    string NextStep);

public sealed record PosReturnInspectionPolicyMessageDto(
    string Severity,
    string Title,
    string Message,
    IReadOnlyList<Guid> AffectedSaleLineIds,
    bool RequiresApproval,
    string RefundImpact);

public sealed record PosReturnInspectionValidateResponseDto(
    bool CanContinue,
    int SelectedItemCount,
    int InspectedItemCount,
    int PendingItemCount,
    IReadOnlyDictionary<string, int> ConditionBreakdown,
    IReadOnlyList<PosReturnInspectionPolicyMessageDto> PolicyMessages,
    bool RequiresReview,
    int NotesMaxLength,
    int MaxPhotosPerLine,
    long MaxPhotoSizeBytes,
    Guid? DraftId = null,
    string? Status = null,
    int? Version = null,
    DateTimeOffset? ExpiresAt = null,
    bool RequiresInspection = false,
    bool RequiresManagerApproval = false);
public sealed record PosReturnInspectionMediaContentDto(
    Stream Content,
    string ContentType,
    string FileName);

public sealed record PosExchangeProductDto(
    Guid ProductId,
    Guid? VariantId,
    string Name,
    string Sku,
    string? Barcode,
    string? VariantDisplayName,
    string? ImageStorageKey,
    string StockStatus,
    decimal? AvailableQuantity,
    decimal SellingPrice,
    string CurrencyCode,
    bool HasVariants,
    bool Enabled,
    string? DisabledReason);

public sealed record PosExchangeProductsResponseDto(
    IReadOnlyList<PosExchangeProductDto> Items,
    int Page,
    int PageSize,
    int TotalCount,
    string CurrencyCode);

public sealed record PosExchangeReplacementItemRequestDto(
    Guid ReturnedSaleLineId,
    Guid ReplacementProductId,
    Guid ReplacementVariantId,
    decimal Quantity);

public sealed record PosExchangeReplacementSaveRequestDto(
    IReadOnlyList<PosExchangeReplacementItemRequestDto> Items,
    int ExpectedVersion);

public sealed record PosExchangeReplacementItemDto(
    Guid ReturnedSaleLineId,
    Guid ReplacementProductId,
    Guid ReplacementVariantId,
    string ProductName,
    string Sku,
    string? VariantDisplayName,
    string? ImageStorageKey,
    decimal Quantity,
    decimal UnitPrice,
    decimal LineTotal,
    string CurrencyCode,
    string StockStatus,
    decimal? AvailableQuantity,
    DateTimeOffset SelectedAt,
    decimal LineSubtotal = 0m,
    decimal LineDiscount = 0m,
    decimal LineTax = 0m,
    Guid? PriceListItemId = null);

public sealed record PosExchangeReplacementSaveResponseDto(
    Guid SaleId,
    IReadOnlyList<PosExchangeReplacementItemDto> Items,
    DateTimeOffset SelectedAt,
    int Version,
    DateTimeOffset? ExpiresAt = null);

public sealed record PosExchangePreviewRequestDto(
    string ReasonCode,
    IReadOnlyList<PosReturnCreditPreviewLineRequestDto> Lines);

public sealed record PosExchangePreviewDto(
    Guid SaleId,
    string CurrencyCode,
    int ReturnedItemCount,
    decimal ReturnItemValue,
    decimal ReplacementItemValue,
    decimal TaxAdjustment,
    decimal DiscountAdjustment,
    decimal DifferenceAmount,
    string DifferenceDirection,
    bool CanProceed,
    bool RequiresApproval,
    IReadOnlyList<string> PolicyMessages,
    IReadOnlyList<PosExchangeReplacementItemDto> ReplacementItems,
    decimal ReplacementSubtotal = 0m,
    decimal ReplacementDiscount = 0m,
    decimal ReplacementTax = 0m,
    decimal AmountDueFromCustomer = 0m,
    decimal AmountDueToCustomer = 0m,
    int? DraftVersion = null);
```

