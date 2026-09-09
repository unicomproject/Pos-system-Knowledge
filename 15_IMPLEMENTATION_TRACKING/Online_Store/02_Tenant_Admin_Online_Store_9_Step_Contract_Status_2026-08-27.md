<!-- title: Tenant Admin Online Store 9-Step Contract Status -->
<!-- status: Active / Reconciliation Blocked -->
<!-- last_updated: 2026-08-27 -->

# Tenant Admin Online Store 9-Step Contract Status

| Layer | Status | Evidence / blocker |
|---|---|---|
| Second Brain journey | LOCKED | `EC-TA-UJ-02` → `TA-UJ-063`, exactly nine steps |
| Backend API surface | IMPLEMENTED / SOURCE-AUDITED | Controller exposes all documented API groups |
| Backend readiness | PARTIAL CONTRACT ALIGNMENT | PASS/BLOCKED only; policy/support/eligibility mismatches remain |
| Database | IMPLEMENTED / SOURCE-AUDITED | settings, channels, domains, media, banners, policies, channel visibility and fulfilment mappings exist |
| Permissions | IMPLEMENTED / SOURCE-AUDITED | nine `tenant.online_store.*` codes seeded |
| Flutter | IMPLEMENTED SURFACE / NOT ACCEPTED HERE | Nine routes and API client exist; this task did not modify or execute Flutter |
| Automated tests | NOT EXECUTED FOR THIS DOC TASK | Controller surface test exists; no new runtime evidence claimed |
| Authenticated E2E | NOT EXECUTED | Required before production acceptance |

## Open Reconciliation

1. Four approved policy rows versus five backend-required policy types.
2. Support address/hours required markers versus email/phone readiness.
3. Desired four-state progress versus backend PASS/BLOCKED.
4. Extended Click & Collect weekend/blackout requirements versus current readiness.

## Verdict

`TENANT ADMIN ONLINE STORE SECOND BRAIN CONTRACT — BLOCKED BY RECONCILIATION`

Documentation is updated; implementation completion is not claimed.

## Step 4 Flutter Integration Evidence — 2026-08-31

- `Storefront URL & Domain` remains canonical Step `4/9` and uses the existing Tenant Admin shell and wizard footer.
- Flutter loads the URL summary and canonical domain list from the current backend contracts; no DNS, SSL, primary-domain, or hosted URL values are fabricated client-side.
- Store slug edits use explicit dirty/saving/error state and persist through `PUT /api/v1/tenant-admin/online-store/url` before Continue advances.
- Custom-domain add, verify, token rotation, status refresh, SSL provisioning, primary selection, and removal are wired to the current lifecycle endpoints.
- Create/rotate verification tokens are preserved as typed one-time responses and exposed with copy controls; existing tokens are not invented when the backend does not return them.
- Verified evidence: Flutter analyze PASS; Online Store tests `38/38` PASS; full Flutter suite `1305` PASS with `1` intentional physical-device skip; backend controller surface tests `56/56` PASS.
- This closes the Step 4 Flutter integration only. Existing cross-step reconciliation and authenticated E2E blockers above remain unchanged.
