OV.OrderSidebar = {
  render(data, permissionService, uiState){
    const canIssue=permissionService.has(OV.PERMISSIONS.PICKING_REPORT_ISSUE);

    const progress=uiState.pickedMode
      ? {picked:1,pending:2,issues:0}
      : data.progress;

    return `
      <section class="card order-sidebar">
        <div class="order-sidebar-head">
          <strong class="wrap-anywhere">Order ${OV.escape(data.orderId)}</strong>
          <span class="new-badge">NEW</span>
        </div>

        <div class="info-row first">
          ${OV.Icon("person")}
          <div class="info-row-main">
            <strong class="wrap-anywhere">${OV.escape(data.customer)}</strong>
          </div>
        </div>

        <div class="info-row">
          ${OV.Icon("pin")}
          <div class="info-row-main">
            <strong>Collection</strong>
            <p class="wrap-anywhere">${OV.escape(data.collectionStore)}</p>
            <p>${OV.escape(data.collectionTime)}</p>
          </div>
          <div class="urgent">${OV.escape(data.collectionRemaining)}</div>
        </div>

        <div class="progress-section">
          <div class="progress-title">Order Progress</div>
          <div class="progress-grid">
            <div class="progress-ring">
              <div class="progress-ring-inner">
                <div>
                  <strong>${progress.picked} / 3</strong>
                  <span>Picked</span>
                </div>
              </div>
            </div>

            <div class="legend">
              <div class="legend-row"><span class="legend-dot green"></span><span>Picked</span><strong>${progress.picked}</strong></div>
              <div class="legend-row"><span class="legend-dot orange"></span><span>Pending</span><strong>${progress.pending}</strong></div>
              <div class="legend-row"><span class="legend-dot red"></span><span>Issues</span><strong>${progress.issues}</strong></div>
            </div>
          </div>
        </div>

        <div class="next-items-head">
          <strong>Next Items</strong>
          <span>2 items pending</span>
        </div>

        ${data.nextItems.map(item=>`
          <article class="next-item">
            <div class="next-item-thumb">${OV.ProductArt(item.type)}</div>
            <div class="wrap-anywhere">
              <div class="next-item-name">${OV.escape(item.name)}</div>
              <div class="next-item-sub">${OV.escape(item.sub)}</div>
            </div>
            <div class="next-item-location">${OV.escape(item.aisle)}<br>${OV.escape(item.rack)}</div>
            ${OV.Icon("chevronRight")}
          </article>
        `).join("")}

        ${canIssue ? `
          <button class="issue-btn" id="reportIssueBtn">
            ${OV.Icon("help")} Can't Find Item?
          </button>
        ` : `
          <div class="permission-note">
            Can't Find Item unavailable. Requires <strong>${OV.PERMISSIONS.PICKING_REPORT_ISSUE}</strong>
          </div>
        `}

        <button class="next-btn" id="nextItemBtn">
          Pick Next Item? ${OV.Icon("chevronRight")}
        </button>
      </section>
    `;
  }
};
