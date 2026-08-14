<!-- title: Inventory UI Prototype Pack Notes -->
<!-- status: PROTOTYPE APPROVED -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Inventory UI Prototype Pack Notes

This folder is the **canonical** Tenant Admin Inventory HTML/CSS prototype pack.

Do not duplicate these files into other Second Brain folders.

## Status

```text
Prototype Status: APPROVED
Implementation Audit: PASS
UI/UX Contract: LOCKED
HTML/CSS source: prototype reference only (NOT a production constraint)
Production UI Implementation: NOT STARTED
```

Screen count: **29/29**

## How to open

Open `inventory_html_prototype/index.html` in a browser.

Canonical screens: root `01_*.html` … `29_*.html`  
Secondary copies: `standalone/`  
Screenshot references: `reference/`  
Product images: `assets/`

There is **no** separate `inventory.css`. CSS is inlined in each HTML file.

## Documentation

- [[../../Tenant_Admin_Inventory_Approved_UI_Prototype]]
- [[../../Inventory_UI_Prototype_Screen_Registry]]
- [[../../Tenant_Admin_Inventory_Implementation_Audit]]
- [[../../Tenant_Admin_Inventory_Lock_Manifest]]

## Do not

- Redesign these HTML/CSS files
- Treat HTML DOM / CSS class names as production constraints
- Treat this pack as Flutter/backend implementation complete
- Start Flutter/.NET work automatically from this folder without the lock manifest
