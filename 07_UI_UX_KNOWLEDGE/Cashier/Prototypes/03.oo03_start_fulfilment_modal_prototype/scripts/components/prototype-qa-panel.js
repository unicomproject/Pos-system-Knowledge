OV.PrototypeQaPanel={
  render(appState,permissions){
    return `
      <button class="qa-toggle" id="qaToggle">Prototype QA</button>
      <aside class="qa-panel" id="qaPanel">
        <h3>Popup QA</h3>

        <div class="qa-row">
          <label for="qaCommand">Command result</label>
          <select id="qaCommand">
            <option ${appState.commandState==="Normal"?"selected":""}>Normal</option>
            <option ${appState.commandState==="CommandError"?"selected":""}>CommandError</option>
          </select>
        </div>

        <div class="qa-row">
          <label>click_collect</label>
          <input id="qaEntitlement" type="checkbox" ${permissions.entitled(OV.ENTITLEMENTS.CLICK_COLLECT)?"checked":""}>
        </div>

        <div class="qa-row">
          <label>${OV.PERMISSIONS.FULFILMENT_START}</label>
          <input id="qaPermission" type="checkbox" ${permissions.has(OV.PERMISSIONS.FULFILMENT_START)?"checked":""}>
        </div>

        <div class="qa-row">
          <label>Stress long content</label>
          <input id="qaStress" type="checkbox" ${appState.stress?"checked":""}>
        </div>

        <div class="qa-note">
          Prototype-only controls. They are not production UI.
        </div>
      </aside>`;
  }
};
