OV.AppShell={
  render(content){
    return `
      <div class="app-layout">
        ${this.header()}
        ${this.mobileContext()}
        <main><section class="workspace">${content}</section></main>
        ${this.bottomNav()}
      </div>
    `;
  },
  header(){
    return `
      <header class="app-header">
        <div class="header-left">
          <div class="brand"><div class="brand-mark">ov</div><div class="brand-name">OneVerz <span>POS</span></div></div>
          <div class="session-card"><span class="session-dot"></span><div class="session-copy"><strong>OPEN</strong><small>Till Session</small></div></div>
        </div>
        <div class="header-right">
          <div class="context-chip">${OV.Icon("pin")}<span class="truncate">Development Main Store</span></div>
          <div class="context-chip">${OV.Icon("till")}<span class="truncate">Front Till 01</span></div>
          <button class="notification-button" aria-label="Notifications">${OV.Icon("bell")}</button>
        </div>
      </header>`;
  },
  mobileContext(){
    return `<div class="mobile-context-strip"><span class="mobile-context-pill open">● OPEN</span><span class="mobile-context-pill">Development Main Store</span><span class="mobile-context-pill">Front Till 01</span></div>`;
  },
  bottomNav(){
    const nav=(icon,label,active=false)=>`<button class="nav-item ${active?"active":""}">${OV.Icon(icon)}<span>${label}</span></button>`;
    return `<nav class="bottom-nav">${nav("home","Home")}${nav("cart","New Sale")}${nav("orders","Orders",true)}${nav("customer","Customers")}${nav("settings","Settings")}</nav>`;
  }
};
