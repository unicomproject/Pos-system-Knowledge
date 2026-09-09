OV.PrototypeQaPanel = {
  render(uiState, permissionService){
    const permissionRows=[
      ["qaOrdersAccess",OV.PERMISSIONS.ORDERS_ACCESS],
      ["qaPackingView",OV.PERMISSIONS.PACKING_VIEW],
      ["qaPackingPack",OV.PERMISSIONS.PACKING_PACK],
      ["qaMarkReady",OV.PERMISSIONS.COLLECTION_MARK_READY]
    ];

    return `
      <button class="qa-toggle" id="qaToggle">Prototype QA</button>

      <aside class="qa-panel" id="qaPanel">
        <h3>OO-05 Production QA</h3>

        <div class="qa-row">
          <label for="qaState">Screen state</label>
          <select id="qaState">
            ${["Normal","Loading","Error"].map(v=>`<option ${uiState.screenState===v?"selected":""}>${v}</option>`).join("")}
          </select>
        </div>

        <div class="qa-row">
          <label for="qaCommand">Ready command</label>
          <select id="qaCommand">
            ${["Normal","CommandError"].map(v=>`<option ${uiState.commandState===v?"selected":""}>${v}</option>`).join("")}
          </select>
        </div>

        <div class="qa-row">
          <label>All items picked</label>
          <input type="checkbox" id="qaAllPicked" ${uiState.allPicked?"checked":""}>
        </div>

        <div class="qa-row">
          <label>Stress long content</label>
          <input type="checkbox" id="qaStress" ${uiState.stress?"checked":""}>
        </div>

        <div class="qa-row">
          <label>click_collect entitlement</label>
          <input type="checkbox" id="qaEntitlement" ${permissionService.entitled(OV.ENTITLEMENTS.CLICK_COLLECT)?"checked":""}>
        </div>

        ${permissionRows.map(([id,code])=>`
          <div class="qa-row">
            <label>${code}</label>
            <input type="checkbox" id="${id}" ${permissionService.has(code)?"checked":""}>
          </div>
        `).join("")}

        <div class="qa-note">
          Prototype-only. Used to validate state, permissions, entitlement, responsive behavior and long-content handling.
        </div>
      </aside>
    `;
  }
};
