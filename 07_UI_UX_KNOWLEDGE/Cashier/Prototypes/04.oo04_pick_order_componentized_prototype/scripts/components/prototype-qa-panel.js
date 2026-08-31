OV.PrototypeQaPanel = {
  render(uiState, permissionService){
    return `
      <button class="qa-toggle" id="qaToggle">Prototype QA</button>
      <aside class="qa-panel" id="qaPanel">
        <h3>OO-04 QA</h3>

        <div class="qa-row">
          <label for="qaScreenState">Screen state</label>
          <select id="qaScreenState">
            <option ${uiState.screenState === "Normal" ? "selected" : ""}>Normal</option>
            <option ${uiState.screenState === "Loading" ? "selected" : ""}>Loading</option>
            <option ${uiState.screenState === "Error" ? "selected" : ""}>Error</option>
          </select>
        </div>

        <div class="qa-row">
          <label>All items picked</label>
          <input type="checkbox" id="qaAllPicked" ${uiState.allPicked ? "checked" : ""}>
        </div>

        <div class="qa-row">
          <label>Stress long content</label>
          <input type="checkbox" id="qaStress" ${uiState.stress ? "checked" : ""}>
        </div>

        <div class="qa-row">
          <label>click_collect</label>
          <input type="checkbox" id="qaEntitlement" ${permissionService.entitled(OV.ENTITLEMENTS.CLICK_COLLECT) ? "checked" : ""}>
        </div>

        <div class="qa-row">
          <label>${OV.PERMISSIONS.PICKING_VIEW}</label>
          <input type="checkbox" id="qaView" ${permissionService.has(OV.PERMISSIONS.PICKING_VIEW) ? "checked" : ""}>
        </div>

        <div class="qa-row">
          <label>${OV.PERMISSIONS.PICKING_PICK}</label>
          <input type="checkbox" id="qaPick" ${permissionService.has(OV.PERMISSIONS.PICKING_PICK) ? "checked" : ""}>
        </div>

        <div class="qa-row">
          <label>${OV.PERMISSIONS.PICKING_SCAN}</label>
          <input type="checkbox" id="qaScan" ${permissionService.has(OV.PERMISSIONS.PICKING_SCAN) ? "checked" : ""}>
        </div>

        <div class="qa-row">
          <label>${OV.PERMISSIONS.PICKING_NOTE}</label>
          <input type="checkbox" id="qaNote" ${permissionService.has(OV.PERMISSIONS.PICKING_NOTE) ? "checked" : ""}>
        </div>

        <div class="qa-row">
          <label>${OV.PERMISSIONS.PACKING_PACK}</label>
          <input type="checkbox" id="qaPack" ${permissionService.has(OV.PERMISSIONS.PACKING_PACK) ? "checked" : ""}>
        </div>

        <div class="qa-note">
          Prototype-only control panel for state, permission and entitlement coverage.
        </div>
      </aside>
    `;
  }
};
