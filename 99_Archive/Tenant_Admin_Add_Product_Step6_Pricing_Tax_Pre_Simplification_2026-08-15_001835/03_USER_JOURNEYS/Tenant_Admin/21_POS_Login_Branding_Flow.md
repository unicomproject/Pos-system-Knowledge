<!-- title: Tenant Admin POS Login Branding Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-10 -->

# Tenant Admin POS Login Branding Flow

## Preconditions

- Tenant Admin is authenticated in the active tenant.
- User has `tenant.settings.manage`.
- Canonical tenant profile/media flows are available for name and logo changes.

## Main Flow

1. Open **Settings -> POS Login Branding**.
2. Load configured and effective values; show deterministic defaults while loading.
3. Edit system name, login description and subtitle template.
4. Choose exactly one background mode: `IMAGE` or `COLOR`.
5. For `IMAGE`, select/upload tenant-owned `POS_LOGIN_BACKGROUND` media; retained
   colour remains the fallback. For `COLOR`, enter/select valid `#RRGGBB`; any
   retained image is inactive and must not render.
6. Select/upload tenant-owned `POS_LOGIN_HERO` media.
7. Update brand/trading name and logo only through canonical profile/media flow.
8. Preview using runtime resolution, mode, overlay, fallback and `{tenantName}`
   substitution rules.
9. Save. Backend validates the complete representation, tenant ownership,
   purpose/status/MIME and permission; then atomically upserts settings, audits
   field names changed and invalidates cache.
10. Show success and refreshed configured/effective values. POS login receives
    updated branding on its next background refresh.

## Alternate Flows

- **Cancel:** discard local edits; do not call update.
- **Reset:** confirm, send default/null representation, preview defaults, then save.
- **Unsaved navigation:** show the standard discard/stay confirmation.
- **Validation error:** keep edits and focus the first invalid field.
- **Wrong/inactive/deleted media:** reject without partial persistence.
- **Permission denied:** show access denied and no editable controls.
- **Network/server failure:** keep edits and allow explicit retry; never claim save.

## Preview Requirements

Preview includes image or colour background, overlay, logo, effective tenant
name, system name, description, hero and resolved subtitle. It must visually warn
when contrast is unsafe and must match runtime fallback behaviour.

## Completion Criteria

- Only the authenticated tenant is mutated.
- A saved mode switch renders only the chosen mode.
- Invalid data never partially persists.
- Audit and cache invalidation occur after successful save.

## Related Files

- [[../../04_MODULE_KNOWLEDGE/02_Tenant_Foundation/04_POS_Login_Branding_Functional_Rules]]
- [[../../04_MODULE_KNOWLEDGE/02_Tenant_Foundation/05_POS_Login_Branding_Technical_Contract]]
