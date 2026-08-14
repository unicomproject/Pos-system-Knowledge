# OneVerz Super Admin — Selected-Tenant Mode Visual Direction

**Document type:** Official visual direction / prototype design contract  
**Product:** OneVerz Super Admin  
**Scope slice:** Selected-Tenant Mode — bootstrap configuration  
**Theme:** Premium Blue (mandatory — same as UI-3A / UI-4A)  
**Date:** 2026-08-12  
**Status:** APPROVED for prototype and pre-implementation documentation  

**Authority order:**

1. [[../../03_USER_JOURNEYS/Platform_Admin/Selected_Tenant_Mode_Contract]]
2. This Visual Direction Specification
3. Approved static prototypes under `prototypes/selected-tenant/`
4. UI-1 shared Super Admin tokens (`--primary` `#0b5cff`, sidebar `#0f172a`)
5. Tenant Admin module field contracts (field semantics only — not TA shell copy)

---

## 1. Design objective

Communicate clearly:

> "I am still a Platform Admin, configuring **this specific tenant** for initial bootstrap — not managing day-to-day tenant operations."

The UI must feel like a **controlled setup workspace** attached to Tenant Detail, not a second Tenant Admin application.

## 2. Relationship with existing Super Admin identity

Reuse without regression:

- Deep navy sidebar (`#0f172a`)
- Primary blue CTAs (`#0b5cff`)
- Cool canvas (`#f8fafc`)
- White surfaces, soft borders (`#e2e8f0`)
- Status semantic colors (success/warning/danger/info)
- PageHeader + breadcrumb patterns from UI-4A subscription plans

**Do not** introduce orange Tenant Admin primary actions in Selected-Tenant Mode.

## 3. Page hierarchy

```text
Platform shell (sidebar stays Platform Mode nav)
└── Main workspace
    ├── Breadcrumb: Tenants / {Tenant Name} / Configure
    ├── Selected-Tenant Context Banner (always)
    ├── Page title + description
    ├── Primary content (hub cards or bootstrap form)
    └── Sticky footer on forms (Cancel | Primary)
```

## 4. Selected-tenant visual identity

Add a **tenant context band** immediately below PageHeader:

- Background: `--primary-soft` (`#eff6ff`)
- Left border accent: 4px `--primary`
- Contains tenant identity block + Exit action
- Distinct from platform dashboard cards but not alarmist

## 5. Tenant context presentation

| Element | Treatment |
|---|---|
| Tenant name | Semibold, `--text-primary`, 1rem–1.125rem |
| Tenant code | Muted mono chip, e.g. `TEN-ABC-001` |
| Status | Lifecycle status chip (reuse platform tenant badges) |
| Plan | Secondary text or compact chip |
| Exit Tenant Context | Secondary button, right-aligned; icon optional |

## 6. Header behavior

- Platform top bar unchanged (platform user menu, notifications if any)
- PageHeader title switches to bootstrap context: "Initial Setup", "Create Outlet", etc.
- Breadcrumb always includes tenant name

## 7. Sidebar behavior

- **Platform sidebar remains Platform Mode items only**
- No permanent Outlets/Tills/Products entries
- Optional: subtle highlight on **Tenants** parent while in selected-tenant context
- Do not morph sidebar into Tenant Admin navigation

## 8. Breadcrumb behavior

`Tenants` → `{Tenant Name}` → `Configure` → `{Module}` (when in child screen)

All segments clickable except current page.

## 9. CTA hierarchy

| Level | Usage |
|---|---|
| Primary | Configure, Save, Import, Add User |
| Secondary | Cancel, Back to Hub, Exit Tenant Context |
| Tertiary | Switch Tenant, View in Tenant Detail |
| Destructive | Rare in bootstrap; use danger outline + confirm dialog |

## 10. Forms

- Single-column primary form on laptop; max-width ~720px for bootstrap forms
- Required field marker `*`
- Helper text under entitled/conditional fields
- Read-only server-generated codes in muted field with helper "Auto-generated on save"

## 11. Lists / tables

Hub uses **module cards**, not dense tables.

CSV import preview may use compact table with error row highlighting.

## 12. Empty states

- Hub module NOT STARTED: neutral icon, short explanation, primary Configure CTA
- No outlets for till: dependency notice card with link back to outlet setup

## 13. Permission-denied state

Full-page illustration + message + "Return to Tenant Detail" — do not redirect to login.

## 14. Feature-not-entitled state

Module card badge **NOT ENTITLED** (muted purple-gray) + route-level feature-disabled page if deep-linked.

## 15. Suspended tenant state

Banner warning stripe on context band; hub read-only; mutation CTAs disabled with tooltip.

## 16. Loading / error states

- Hub: skeleton cards
- Forms: field-level spinners on submit only
- Server error: top banner with retry

## 17. Confirmation dialogs

- Exit with dirty form: "Discard changes?"
- Import confirm: row count summary

## 18. Success states

- Inline success banner on return to hub
- Optional journey success strip on form completion before redirect

## 19. Responsive behavior

| Breakpoint | Behavior |
|---|---|
| ≥1440px | Hub 2-column card grid |
| 1024–1439px | Hub 2-column, forms full workspace |
| 768–1023px | Hub 1-column; sidebar collapsible |
| <768px | Supported for admin tablet; not mobile-first POS layout |

## 20. Accessibility

- Context banner `aria-label="Selected tenant context"`
- Exit action keyboard reachable
- Status chips include text, not color-only
- Focus rings: 3px `#84adff`

## 21. Typography

Segoe UI / system-ui stack; same scale as UI-4A prototypes.

## 22. Spacing system

8px base grid; card padding 1.25rem; section gaps 1.5rem.

## 23. Radius / borders

Cards `--radius-lg` 12px; inputs `--radius-md` 8px; chips pill.

## 24. Icon strategy

Simple line icons for module cards (outlet, till, users, roles, products). No custom illustration set required.

## 25. Status chips (hub module states)

| State | Color | Meaning |
|---|---|---|
| NOT STARTED | Neutral gray | No bootstrap activity detected |
| CONFIGURED | Success green | Minimum bootstrap threshold met |
| NOT REQUIRED | Muted outline | Operational need absent / system provisioned |
| NOT ENTITLED | Purple-gray | Feature not on plan |
| BLOCKED | Warning amber | Dependency or lifecycle prevents action |

**IN PROGRESS is not used** — see [[../../03_USER_JOURNEYS/Platform_Admin/Selected_Tenant_Setup_Hub_Status_Model]].

**Note:** Hub states are UX concepts unless/until persistence approved.

## 26. Destructive action treatment

Bootstrap scope is create-focused. If delete is ever added post-R1, use danger red with typed confirmation — out of scope for current prototypes.
