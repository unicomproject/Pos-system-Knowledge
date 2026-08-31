OV.OrderSummary = {
  render(data, permissionService, uiState){
    const canMarkReady=permissionService.has(OV.PERMISSIONS.COLLECTION_MARK_READY);
    const allPicked=uiState.allPicked;

    return `
      <section class="card order-summary">
        <div class="order-summary-title">Order Summary</div>

        <div class="order-id-row">
          <strong class="wrap-anywhere">Order ${OV.escape(data.orderId)}</strong>
          <span class="new-badge">NEW</span>
        </div>

        <div class="summary-info-row first">
          ${OV.Icon("person")}
          <div class="summary-info-main">
            <strong class="wrap-anywhere">${OV.escape(data.customer)}</strong>
          </div>
        </div>

        <div class="summary-info-row">
          ${OV.Icon("pin")}
          <div class="summary-info-main">
            <strong>Collection</strong>
            <p class="wrap-anywhere">${OV.escape(data.collectionStore)}</p>
            <p>${OV.escape(data.collectionTime)}</p>
          </div>
          <div class="urgent">${OV.escape(data.remaining)}</div>
        </div>

        <div class="progress-block">
          <div class="progress-title">Order Progress</div>

          <div class="progress-grid">
            <div class="progress-ring" style="${allPicked ? "" : "border-color:#EAECF0"}">
              <div class="progress-inner">
                <div>
                  <strong>${allPicked ? "3 / 3" : "2 / 3"}</strong>
                  <span>Picked</span>
                </div>
              </div>
            </div>

            <div class="legend">
              <div class="legend-row"><span class="legend-dot green"></span><span>Picked</span><strong>${allPicked ? 3 : 2}</strong></div>
              <div class="legend-row"><span class="legend-dot orange"></span><span>Pending</span><strong>${allPicked ? 0 : 1}</strong></div>
              <div class="legend-row"><span class="legend-dot red"></span><span>Issues</span><strong>0</strong></div>
            </div>
          </div>
        </div>

        ${allPicked ? `
          <div class="success-panel">
            ${OV.Icon("checkCircle")}
            <div>
              <strong>All items picked successfully!</strong>
              <p>You can now mark this order as Ready for Collection.</p>
            </div>
          </div>
        ` : `
          <div class="permission-note">
            All required items must be picked before this order can be marked Ready for Collection.
          </div>
        `}
      </section>

      ${uiState.commandState==="CommandError" ? `
        <div class="command-error">
          Mark as Ready failed in this prototype state. Production should keep the user on this screen, show the canonical error, and allow retry.
        </div>
      ` : ""}

      <button class="ready-btn" id="markReadyBtn"
        ${allPicked && canMarkReady ? "" : "disabled"}>
        Mark as Ready for Collection ${OV.Icon("arrowRight")}
      </button>

      ${!canMarkReady ? `
        <div class="permission-note">
          Ready action requires <strong>${OV.PERMISSIONS.COLLECTION_MARK_READY}</strong>.
        </div>
      ` : ""}

      <button class="back-btn" id="backPickBtn">
        ${OV.Icon("arrowLeft")} Back to Pick Items
      </button>
    `;
  }
};
