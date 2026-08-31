OV.ScreenState = {
  loading() {
    return `
      <section class="state-panel" aria-busy="true" aria-label="Loading online orders">
        <div class="loading-lines">
          <div class="loading-line"></div>
          <div class="loading-line"></div>
          <div class="loading-line"></div>
        </div>
      </section>`;
  },

  empty() {
    return this.message("info", "No online orders", "No orders match the current status, search or filter.");
  },

  error() {
    return this.message("error", "Unable to load online orders", "The list could not be loaded. Retry from the real application using the canonical error handling flow.");
  },

  notEntitled() {
    return this.message("denied", "Click & Collect is not enabled", "This tenant is not entitled to the click_collect feature.");
  },

  denied(permission) {
    return this.message("denied", "Permission required", `Access requires ${permission}.`);
  },

  message(type, title, message) {
    const icon = type === "error" ? "alert" : type === "denied" ? "lock" : "info";
    return `
      <section class="state-panel">
        <div class="state-card ${type}">
          <div class="state-icon">${OV.Icon(icon)}</div>
          <h2>${title}</h2>
          <p>${message}</p>
        </div>
      </section>`;
  }
};
