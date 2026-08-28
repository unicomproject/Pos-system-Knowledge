OV.AppShell = {
  render(content){
    return `
      <div class="app-layout">
        ${this.header()}
        ${this.mobileStrip()}
        <main><section class="workspace">${content}</section></main>
        ${this.bottomNav()}
      </div>
    `;
  },
  header(){
    return `
      <header class="app-header">
        <div class="header-left">
          <div class="brand">
            <div class="brand-mark">ov</div>
            <div class="brand-name">OneVerz <span>POS</span></div>
          </div>

          <div class="session-card">
            <span class="session-dot"></span>
            <div class="session-copy">
              <strong>OPEN</strong>
              <small>Till Session #T-1001</small>
            </div>
          </div>

          <div class="context-chip">${OV.Icon("pin")}<span class="truncate">Etihad Stadium Store</span></div>
          <div class="context-chip">${OV.Icon("terminal")}<span class="truncate">POS-01</span></div>
        </div>

        <div class="header-right">
          <button class="notification-btn" aria-label="Notifications">
            ${OV.Icon("bell")}
            <span class="badge">5</span>
          </button>

          <div class="profile">
            <div class="avatar">JS</div>
            <div class="profile-copy">
              <strong>John Smith</strong>
              <small>Manager</small>
            </div>
            ${OV.Icon("chevronRight")}
          </div>

          <button class="logout-btn" aria-label="Logout">${OV.Icon("logout")}</button>
        </div>
      </header>
    `;
  },
  mobileStrip(){
    return `
      <div class="mobile-strip">
        <span class="mobile-pill open">● OPEN</span>
        <span class="mobile-pill">Etihad Stadium Store</span>
        <span class="mobile-pill">POS-01</span>
      </div>
    `;
  },
  bottomNav(){
    const item = (icon, label, active=false) => `
      <button class="nav-item ${active ? "active" : ""}">
        ${OV.Icon(icon)}
        <span>${label}</span>
      </button>`;
    return `
      <nav class="bottom-nav">
        ${item("home", "Home")}
        ${item("cart", "New Sale")}
        ${item("orders", "Orders", true)}
        ${item("customers", "Customers")}
        ${item("settings", "Settings")}
      </nav>
    `;
  }
};
