OV.PrototypeQaPanel = {
  render(uiState, permissionService){
    const checks=[
      ["qaOrdersAccess",OV.PERMISSIONS.ORDERS_ACCESS],
      ["qaView",OV.PERMISSIONS.PICKING_VIEW],
      ["qaScan",OV.PERMISSIONS.PICKING_SCAN],
      ["qaManual",OV.PERMISSIONS.PICKING_MANUAL_ENTRY],
      ["qaPick",OV.PERMISSIONS.PICKING_PICK],
      ["qaIssue",OV.PERMISSIONS.PICKING_REPORT_ISSUE]
    ];

    return `
      <button class="qa-toggle" id="qaToggle">Prototype QA</button>

      <aside class="qa-panel" id="qaPanel" aria-label="Prototype QA controls">
        <h3>OO-04b Production QA</h3>

        <div class="qa-row">
          <label for="qaState">Screen state</label>
          <select id="qaState">
            ${["Normal","Loading","Error"].map(v=>`<option ${uiState.screenState===v?"selected":""}>${v}</option>`).join("")}
          </select>
        </div>

        <div class="qa-row">
          <label>Barcode scanned</label>
          <input type="checkbox" id="qaScanned" ${uiState.scanned?"checked":""}>
        </div>

        <div class="qa-row">
          <label>Current item picked</label>
          <input type="checkbox" id="qaPicked" ${uiState.pickedMode?"checked":""}>
        </div>

        <div class="qa-row">
          <label>Stress long content</label>
          <input type="checkbox" id="qaStress" ${uiState.stress?"checked":""}>
        </div>

        <div class="qa-row">
          <label>click_collect entitlement</label>
          <input type="checkbox" id="qaEntitlement" ${permissionService.entitled(OV.ENTITLEMENTS.CLICK_COLLECT)?"checked":""}>
        </div>

        ${checks.map(([id,code])=>`
          <div class="qa-row">
            <label>${code}</label>
            <input type="checkbox" id="${id}" ${permissionService.has(code)?"checked":""}>
          </div>
        `).join("")}

        <div class="qa-note">
          Prototype-only. Used to validate layout, permissions, entitlement, state coverage and long-content behavior.
        </div>
      </aside>
    `;
  }
};
