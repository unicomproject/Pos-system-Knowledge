<!-- title: Flutter Tax Management Implementation -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-14 -->

# Flutter Tax Management Implementation

## Feature Ownership

The Tax Management feature belongs to the `pricing_tax` bounded context.
Path: `lib/features/tenant_admin/pricing_tax/tax_management/`

## Architecture Layers

- **Data**: `tax_repository.dart`
- **Domain**: `tax_aggregate.dart` (models the aggregate Tax entity based on `TaxClassId`), `tax_type.dart` (enum).
- **Application**: `tax_providers.dart` (Riverpod providers for state management), `tax_management_controller.dart`.
- **Presentation**: `tax_management_page.dart` (UI layout with Form top, Table bottom).

## Navigation

The page is accessed via the Tenant Admin sidebar:
`Product -> Tax`

Despite being under the `Product` navigation visually, the code ownership remains in `pricing_tax` to match the backend module boundaries.

## State Management

- Use a `StateNotifier` or `AsyncNotifier` to manage the list of taxes and the current form state.
- Form state includes: Tax Name, Tax Code, Tax Type, Tax Percentage, Description, Status.
- Edit mode is toggled by setting an `editingTaxId`. When null, the form is in Create mode.

## API Integration

Endpoints:
- `GET /api/v1/tax` (List)
- `GET /api/v1/tax/{id}` (Details)
- `POST /api/v1/tax` (Create)
- `PUT /api/v1/tax/{id}` (Update)
- `DELETE /api/v1/tax/{id}` (Delete)

Errors (e.g., 409 Conflict, 400 Validation) should be handled natively using the standard error notification/toast component.
