OV.AppShell = {
  render(content, permissionService) {
    const canAccessOrders = permissionService.has(OV.PERMISSIONS.ORDERS_ACCESS);
    return `
      <div class="app-layout">
        ${this.header()}
        ${this.mobileContext()}
        <main><section class="workspace">${content}</section></main>
        ${this.bottomNav(canAccessOrders)}
      </div>
    `;
  },

  header() {
    return `
      <header class="app-header">
        <div class="header-left">
          <div class="brand">
            <div class="brand-mark">ov</div>
            <div class="brand-name">OneVerz <span>POS</span></div>
          </div>

          <div class="session-card" title="Till session is open">
            <span class="session-dot"></span>
            <div class="session-copy">
              <strong>OPEN</strong>
              <small>Till Session</small>
            </div>
          </div>
        </div>

        <div class="header-right">
          <div class="context-chip" title="Development Main Store">
            ${OV.Icon("pin")}
            <span class="truncate">Development Main Store</span>
          </div>
          <div class="context-chip" title="Front Till 01">
            ${OV.Icon("till")}
            <span class="truncate">Front Till 01</span>
          </div>
          <button class="notification-button" aria-label="Notifications">
            ${OV.Icon("bell")}
          </button>
        </div>
      </header>
    `;
  },

  mobileContext() {
    return `
      <div class="mobile-context-strip" aria-label="Current POS context">
        <span class="mobile-context-pill open">● OPEN</span>
        <span class="mobile-context-pill">Development Main Store</span>
        <span class="mobile-context-pill">Front Till 01</span>
      </div>
    `;
  },

  bottomNav(canAccessOrders) {
    return `
      <nav class="bottom-nav" aria-label="Primary navigation">
        ${this.navItem("home", "Home")}
        ${this.navItem("cart", "New Sale")}
        ${this.navItem("orders", "Orders", true, !canAccessOrders)}
        ${this.navItem("customer", "Customers")}
        ${this.navItem("settings", "Settings")}
      </nav>
    `;
  },

  navItem(icon, label, active=false, hidden=false) {
    return `
      <button class="nav-item ${active ? "active" : ""} ${hidden ? "permission-hidden" : ""}"
        ${hidden ? 'aria-hidden="true" tabindex="-1"' : ""}>
        ${OV.Icon(icon)}
        <span>${label}</span>
      </button>
    `;
  }
};
