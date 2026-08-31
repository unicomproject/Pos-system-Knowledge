OV.OrderSummary = {
  render(data){
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
            <div class="progress-ring">
              <div class="progress-inner">
                <div>
                  <strong>3 / 3</strong>
                  <span>Picked</span>
                </div>
              </div>
            </div>

            <div class="legend">
              <div class="legend-row"><span class="legend-dot green"></span><span>Picked</span><strong>${data.progress.picked}</strong></div>
              <div class="legend-row"><span class="legend-dot orange"></span><span>Pending</span><strong>${data.progress.pending}</strong></div>
              <div class="legend-row"><span class="legend-dot red"></span><span>Issues</span><strong>${data.progress.issues}</strong></div>
            </div>
          </div>
        </div>

        <div class="ready-status-panel">
          ${OV.Icon("checkCircle")}
          <div>
            <strong>Order is ready for collection!</strong>
            <p>Waiting for customer to collect their order.</p>
          </div>
        </div>

        <button class="view-details-btn" id="viewDetailsBtn">
          ${OV.Icon("details")} View Order Details
        </button>
      </section>
    `;
  }
};
