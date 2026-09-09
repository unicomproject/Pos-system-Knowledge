<!-- title: Tenant Admin Online Store 9-Step UI UX Contract -->
<!-- status: Canonical Desired UI -->
<!-- last_updated: 2026-08-31 -->

# Tenant Admin Online Store 9-Step UI UX Contract

Reference: `EC-TA-UJ-02` / `TA-UJ-063`. Preserve exactly nine steps and show Store Live inside Step 9 after publish.

## Tablet-First Rules

- Primary validation viewport: `1024 × 768` landscape; no unintended horizontal overflow.
- Use the connected Tenant Admin shell, OneVerz orange `#FF6A00`, black `#000000`, 44px minimum touch targets and one page scroll owner.
- Keep the stepper visible and readable; compact labels rather than clipping.
- Each step must render loading, empty, denied, entitlement-disabled, validation, retry, saved and backend-blocked states.
- Do not calculate publish readiness from local form completion. Render backend `PASS/BLOCKED` and reasons.

## Persistence And Buttons

`Save Changes` persists and stays. `Save & Continue` persists and advances only after success. `Continue Setup` navigates to the first backend-blocked step. `Run Final Validation` reloads readiness. `Save & Publish` is enabled only when backend returns `canPublish=true` and uses one idempotency key per logical publish command.

## Step 9 Result

Show published time, hosted URL, optional primary domain, View Storefront, Copy URL, Manage Store and Go to Orders. Returning to overview enters Live Management Mode; it does not create Step 10.

## Known UI Contract Blockers

- Policy presentation has four rows while backend requires five.
- Address/hours required markers exceed backend readiness.
- NOT_STARTED/IN_PROGRESS/COMPLETE cannot be claimed as backend persisted states.
- Weekend and blackout readiness rules need product/backend reconciliation.

Journey and gap register: [[../03_USER_JOURNEYS/Tenant_Admin/22_Online_Store_Setup_And_Publish_Flow]].

## Step 4 Implemented Contract — 2026-08-31

- Header: `STOREFRONT URL & DOMAIN`, `4/9`, and `STEP 4 OF 9` using the shared progress component.
- Tablet layout: responsive Storefront URL and Domain Verification cards, with stacked fallback at narrower widths and the shared fixed/scrolling footer behavior.
- Storefront URL: backend slug, backend hosted URL, copy action, mirrored client validation, backend field errors, and save-before-continue behavior.
- Domain management: add, select, verify, rotate token, check status, provision SSL, set primary, and remove through backend lifecycle APIs with duplicate-action prevention and confirmations for destructive/token-invalidating operations.
- Status presentation: DNS verification, one-time TXT token when returned, SSL certificate state/expiry, and primary state are mapped from backend values. Unsupported DNS host metadata and hidden historical tokens are omitted rather than fabricated.
- Custom domains remain optional for Step 4 navigation; publish readiness remains backend-owned.

## Step 5 Implemented Contract — 2026-08-31

- Header: `BRANDING & APPEARANCE`, `5/9`, and `STEP 5 OF 9` using the shared progress component.
- Responsive layout: Brand Assets and Brand Appearance cards use two columns when space permits and stack without overflow at narrower tablet widths; Storefront Preview follows below.
- Brand Assets: real backend logo/favicon URLs are rendered, upload/replace uses the exact media purposes, and removal requires confirmation. Supported client validation mirrors JPEG, PNG, WebP, SVG or ICO with a 5 MB maximum.
- Brand Appearance: only backend-persisted primary and secondary `#RRGGBB` colours are editable. Unsupported typography and style controls are omitted.
- Save state: colour changes participate in shared dirty/error/saving footer state; Continue persists before navigation. Upload attaches media through `PUT /branding`; removal detaches before media deletion; duplicate media actions are blocked.
- Preview: uses current backend assets and colour draft with neutral fallback content. It does not invent merchant identity, readiness, banner state or backend defaults.
