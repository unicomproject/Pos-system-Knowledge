<!-- title: Subscription Tables -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-22 -->

# Subscription Tables

## subscription_plans

Release 1 Create Plan UI uses these columns only:

| Column | UI source |
|---|---|
| `name` | Plan Name |
| `plan_code` | Plan Code |
| `description` | Description |
| `billing_cycle` | Billing Cycle |
| `base_currency` | Currency |
| `base_price` | Pricing step |
| `max_outlets` | Limits step → `PATCH .../limits` |
| `max_tills` | Limits step → `PATCH .../limits` |
| `max_users` | Limits step → `PATCH .../limits` |
| `status` | Draft on create; active on publish; retired on archive |
| `created_at` | System timestamp on create |
| `updated_at` | System timestamp on update |

Allowed `billing_cycle` values:

- `monthly`
- `yearly`
- `custom`
- `trial`
- `demo`

Allowed `status` values:

- `draft`
- `active`
- `retired`

API response status (plan rows):

- Returns the same DB values: `draft`, `active`, `retired`
- Backend must **not** return `published` or `archived` for plan status

Frontend display mapping (UI only):

- DB `active` → display label **Published**
- DB `retired` → display label **Archived**
- DB `draft` → display label **Draft**

List query filter aliases (input only):

- `published` → filters DB `active`
- `archived` → filters DB `retired`

## Not in Release 1 Create Plan UI

These are not stored from the current Create Plan wizard:

- tax mode / taxMode
- visibility
- setup fee / setupFee
- effective date / effectiveFrom
- plan type column (derived in list API only)
- monthlyPrice / annualPrice / trialDays
- add-on pricing / revenue preview
- extra outlet/till/user price
- storage limit / API access limit / product limit

## Related entitlement tables

- `subscription_plan_features`
- `platform_modules`
- `platform_features`

## Related Files

- [[../04_MODULE_KNOWLEDGE/Subscription/03_Technical_Contract]]
- [[../07_UI_UX_KNOWLEDGE/Platform_Admin_Subscription_UI]]
