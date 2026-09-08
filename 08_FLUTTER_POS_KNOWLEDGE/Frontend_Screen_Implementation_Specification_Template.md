<!-- title: Frontend Screen Implementation Specification Template -->
<!-- status: Active Template -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-01 -->

# Frontend Screen Implementation Specification Template

> Copy this template into the relevant feature documentation location. Replace
> placeholders and link existing authorities rather than copying them.

## Identity and Scope

- Feature Name:
- Screen Name:
- Purpose:
- Actor / Role:
- Entry Point:
- Exit / Navigation:
- User Journey Reference:
- Module Reference:
- Permission Reference:

## Permissions and Entitlements

- Screen access permission:
- Tenant feature entitlement:
- Action → required permission mapping:
- Route/deep-link permission:
- Notification feature/domain and required permission:
- Outlet/resource scope:
- Frontend UX gating:
- Backend authoritative enforcement:

## UI Contract

- Layout:
- Responsive Behaviour:
- Design Tokens:
- Theme-driven components / backend token mapping:
- Semantic status token mapping:
- Typography token / `TextTheme` mapping:
- Hardcoded tenant branding colours: NO
- Reusable Components:
- New Components Required:
- Canonical Component Specification Reference:

### Reuse Matrix

| Need | Existing documentation | Existing Flutter source | REUSE / EXTEND / SHARED/NEW / FEATURE-LOCAL | Reason |
|---|---|---|---|---|

### Component Specification Matrix

| Component need | Existing path | Classification | Variant | Canonical dimensions | Colour authority | Typography token | Spacing token/rule |
|---|---|---|---|---|---|---|---|

- Screenshot/prototype hierarchy and arrangement reference:
- Screenshot pixels copied as component dimensions: NO
- Unresolved component/token GAPs:

### Permission-Aware Responsive Reflow

- Zero visible actions:
- One visible action:
- Multiple visible actions:
- Hidden items consume no layout space:
- Phone:
- Tablet portrait:
- Tablet landscape:
- Desktop:

## Fields and Forms

- Fields:
- Forms:
- Validation:

## State and Data Flow

- State Management:
- Providers:
- Controllers / ViewModels:
- Data flow:
- Duplicate-submission / concurrency behaviour:
- Unsaved changes / draft / recovery:

## API and Mapping

- API:
- Request DTO:
- Response DTO:
- Repository:
- Datasource:
- Mapping:
- Retry / timeout / cancellation:
- Cache / invalidation / offline boundary:

## UI States

- Loading:
- Empty:
- Success:
- Error:
- Offline:
- Permission Denied:
- Notification hidden/non-actionable when feature permission is absent:

## Collection Behaviour

- Search:
- Filter:
- Sort:
- Pagination / Infinite Scroll:

## Interaction and Presentation

- Keyboard / Focus:
- Accessibility:
- Localization / RTL:
- Currency / Date / Time:
- Responsive device matrix:

## Integrations and Security

- Hardware Integration:
- Security Considerations:
- Privacy / logging / observability:

## Verification

- Test Cases:
- Acceptance Criteria:
- `flutter analyze`:
- Focused tests:
- `flutter test`:
- Runtime / visual evidence:

## Second Brain Update Required?

- YES / NO:
- Reason:
- Canonical file or component registry entry updated:

## Required Governance

- [[Frontend_Engineering_Canonical_Standard]]
- [[Frontend_Reusable_Component_Governance]]
- [[Frontend_Screen_Development_Second_Brain_Workflow]]
- [[../07_UI_UX_KNOWLEDGE/POS_Reusable_Component_Specifications]]
