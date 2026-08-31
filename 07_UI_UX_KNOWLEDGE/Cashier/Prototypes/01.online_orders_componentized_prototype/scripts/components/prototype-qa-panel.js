OV.PrototypeQaPanel = {
  render(state, permissionService) {
    return `
      <button class="qa-toggle" id="qaToggle" type="button">Prototype QA</button>
      <aside class="qa-panel" id="qaPanel" aria-label="Prototype QA controls">
        <h3>Prototype QA</h3>

        <div class="qa-row">
          <label for="qaState">Screen state</label>
          <select id="qaState">
            ${["Normal","Loading","Error","Empty"].map(v => `<option ${state.qaState === v ? "selected" : ""}>${v}</option>`).join("")}
          </select>
        </div>

        <div class="qa-row">
          <label for="qaEntitlement">click_collect entitled</label>
          <input type="checkbox" id="qaEntitlement" ${permissionService.entitled(OV.ENTITLEMENTS.CLICK_COLLECT) ? "checked" : ""}>
        </div>

        <div class="qa-row">
          <label for="qaAccess">${OV.PERMISSIONS.ORDERS_ACCESS}</label>
          <input type="checkbox" id="qaAccess" ${permissionService.has(OV.PERMISSIONS.ORDERS_ACCESS) ? "checked" : ""}>
        </div>

        <div class="qa-row">
          <label for="qaView">${OV.PERMISSIONS.ORDERS_VIEW}</label>
          <input type="checkbox" id="qaView" ${permissionService.has(OV.PERMISSIONS.ORDERS_VIEW) ? "checked" : ""}>
        </div>

        <div class="qa-row">
          <label for="qaStress">Stress long content</label>
          <input type="checkbox" id="qaStress" ${state.stressContent ? "checked" : ""}>
        </div>

        <div class="qa-note">
          Prototype-only controls. They validate entitlement, permission, loading/error/empty states and long-content responsiveness.
        </div>
      </aside>
    `;
  }
};
