OV.AppShell = {
  render(content){
    return `
      <div class="app-layout">
        ${this.header()}
        ${this.mobileContext()}
        <main><section class="workspace">${content}</section></main>
        ${this.footer()}
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

          <div class="context-chip">
            ${OV.Icon("pin")}
            <span class="truncate">Etihad Stadium Store</span>
          </div>

          <div class="context-chip">
            ${OV.Icon("terminal")}
            <span class="truncate">POS-01</span>
          </div>
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
          </div>

          <button class="logout-btn" aria-label="Logout">${OV.Icon("logout")}</button>
        </div>
      </header>
    `;
  },

  mobileContext(){
    return `
      <div class="mobile-context-strip">
        <span class="mobile-context-pill open">● OPEN</span>
        <span class="mobile-context-pill">Etihad Stadium Store</span>
        <span class="mobile-context-pill">POS-01</span>
      </div>
    `;
  },

  footer(){
    const nav=(icon,label,active=false)=>`
      <button class="nav-item ${active?"active":""}">
        ${OV.Icon(icon)}
        <span>${label}</span>
      </button>
    `;

    return `
      <nav class="bottom-nav" aria-label="Primary navigation">
        ${nav("home","Home")}
        ${nav("cart","New Sale")}
        ${nav("orders","Orders",true)}
        ${nav("customers","Customers")}
        ${nav("settings","Settings")}
      </nav>
    `;
  }
};
