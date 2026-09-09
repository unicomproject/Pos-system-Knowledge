OV.PrototypeQaPanel = {
  render(state,permissions){
    return `
      <button class="qa-toggle" id="qaToggle" type="button">Prototype QA</button>
      <aside class="qa-panel" id="qaPanel">
        <h3>Prototype QA</h3>

        <div class="qa-row">
          <label for="qaState">Screen state</label>
          <select id="qaState">
            ${["Normal","Loading","Error"].map(v=>`<option ${state.qaState===v?"selected":""}>${v}</option>`).join("")}
          </select>
        </div>

        <div class="qa-row">
          <label>click_collect entitlement</label>
          <input id="qaEntitlement" type="checkbox" ${permissions.entitled(OV.ENTITLEMENTS.CLICK_COLLECT)?"checked":""}>
        </div>

        <div class="qa-row">
          <label>${OV.PERMISSIONS.ORDERS_ACCESS}</label>
          <input id="qaAccess" type="checkbox" ${permissions.has(OV.PERMISSIONS.ORDERS_ACCESS)?"checked":""}>
        </div>

        <div class="qa-row">
          <label>${OV.PERMISSIONS.ORDERS_VIEW}</label>
          <input id="qaView" type="checkbox" ${permissions.has(OV.PERMISSIONS.ORDERS_VIEW)?"checked":""}>
        </div>

        <div class="qa-row">
          <label>${OV.PERMISSIONS.FULFILMENT_START}</label>
          <input id="qaStart" type="checkbox" ${permissions.has(OV.PERMISSIONS.FULFILMENT_START)?"checked":""}>
        </div>

        <div class="qa-row">
          <label>Stress long content</label>
          <input id="qaStress" type="checkbox" ${state.stressContent?"checked":""}>
        </div>

        <div class="qa-note">
          Prototype-only controls for responsive stress, permission, entitlement, loading and error validation.
        </div>
      </aside>
    `;
  }
};
