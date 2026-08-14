<!-- title: Tenant Admin Tax Management UI/UX -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-14 -->

# Tenant Admin Tax Management UI/UX

## Layout

The page uses a single-page split layout:
- **Top Section**: Tax Create/Edit Form
- **Bottom Section**: Data Table of existing Taxes

## Form Layout

```text
Breadcrumb: Product / Tax
Heading: Tax Management

[ Tax Name (text) ]      [ Tax Code (text) ]
[ Tax Type (select) ]    [ Tax Percentage (number) ]
[ Description (text) ]   [ Status (select) ]

Buttons: [ Cancel / Reset ] [ Create Tax / Save Changes ]
```

## Table Layout

Columns:
- Tax Name
- Tax Code
- Tax Type
- Tax %
- Status
- Actions (View, Edit, Delete)

## Interactions

- **Initial State**: Form is empty and in "Create" mode. Status defaults to `ACTIVE`.
- **Edit**: Clicking Edit populates the top form with the backend record. The button becomes `Save Changes`.
- **Cancel**: Resets the form to empty "Create" mode.
- **View**: Clicking View opens a right-side drawer or dialog with read-only details of the tax.
- **Delete**: Opens a standard confirmation modal. Warning is shown if the tax is in use.

## Validation

- Tax Name: Required
- Tax Code: Required, must be unique
- Tax Type: Required
- Tax Percentage: Required, 0 to 100
- Status: Required
