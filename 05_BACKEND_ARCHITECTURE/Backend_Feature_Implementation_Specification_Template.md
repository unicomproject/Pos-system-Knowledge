<!-- title: Backend Feature Implementation Specification Template -->
<!-- status: Active Template -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-19 -->

# Backend Feature Implementation Specification Template

> Copy into the relevant feature documentation location. Link existing
> authorities and owners rather than reproducing them.

## Identity and Scope

- Feature Name:
- Purpose:
- Actors:
- Release Scope:
- User Journey Reference:
- Module Reference:
- Permission Reference:
- Database Reference:

## Existing Backend Components

- Existing services/contracts:
- Existing repositories:
- Existing validators/policies/helpers:
- Existing integration clients:

### Reuse Matrix

| Responsibility | Existing documentation | Existing source owner/path | Reuse / Extend / New | Reason |
|---|---|---|---|---|

## API Contract

- Endpoint:
- HTTP Method:
- Route:
- Request DTO:
- Response DTO:
- HTTP Status Codes:
- Error Contract:
- Compatibility / versioning:

## Layer Ownership

- Controller:
- Application Service:
- Domain Rules:
- Repository:
- Infrastructure:
- Mapping:

## Security and Context

- Tenant Context:
- Permission:
- Authentication:
- Authorization:
- Audit:
- PII / secrets / redaction:

## Correctness and Persistence

- Validation:
- Database Constraints:
- Transaction Boundary:
- Concurrency Strategy:
- Idempotency Strategy:
- Sequence / money / currency / timezone rules:
- Migration / backward-compatibility strategy:

## Asynchronous and External Concerns

- Events:
- Background Jobs:
- External Integrations:
- Payment / Hardware concerns:
- Retry / timeout / circuit-breaker / failure handling:

## Observability

- Logging:
- Correlation:
- Metrics:
- Alerts / operational dashboard:

## Verification

- Unit Tests:
- Integration Tests:
- API Tests:
- Tenant Isolation Tests:
- Permission Tests:
- Validation Tests:
- Duplicate Tests:
- Concurrency Tests:
- Failure / rollback Tests:
- Contract / migration / resilience Tests:
- Build / Migration Validation:
- Acceptance Criteria:

## Second Brain Update Required?

- YES / NO:
- Reason:
- Canonical owner/module/API/database/permission document updated:

## Required Governance

- [[Backend_Engineering_Canonical_Standard]]
- [[Backend_Reusable_Service_Logic_Governance]]
- [[Backend_Feature_Development_Second_Brain_Workflow]]
