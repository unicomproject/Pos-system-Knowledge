OV.PickOrderScreen = {
  render(data, permissionService, uiState){
    const entitled = permissionService.entitled(OV.ENTITLEMENTS.CLICK_COLLECT);
    const hasOrdersAccess = permissionService.has(OV.PERMISSIONS.ORDERS_ACCESS);
    const canView = permissionService.has(OV.PERMISSIONS.PICKING_VIEW);

    if(!entitled || !hasOrdersAccess || !canView){
      return `
        <div class="permission-box">
          <strong>Pick Order screen unavailable</strong>
          <div class="state-copy">
            Required access:
            <br>- ${OV.ENTITLEMENTS.CLICK_COLLECT}
            <br>- ${OV.PERMISSIONS.ORDERS_ACCESS}
            <br>- ${OV.PERMISSIONS.PICKING_VIEW}
          </div>
        </div>
      `;
    }

    if(uiState.screenState === "Loading"){
      return `
        <div class="state-box">
          <div class="state-title">Loading Pick Order…</div>
          <div class="state-copy">This prototype state represents loading item locations, picking progress, and step workflow details.</div>
        </div>
      `;
    }

    if(uiState.screenState === "Error"){
      return `
        <div class="state-box">
          <div class="state-title">Unable to load Pick Order</div>
          <div class="state-copy">Production should surface canonical error handling, retry, and safe navigation back to Order Detail or Orders list.</div>
        </div>
      `;
    }

    const canScan = permissionService.has(OV.PERMISSIONS.PICKING_SCAN);
    const canNote = permissionService.has(OV.PERMISSIONS.PICKING_NOTE);
    const canPack = permissionService.has(OV.PERMISSIONS.PACKING_PACK);
    const pickedAll = uiState.allPicked;

    return `
      <div class="page-top">
        <div class="title-block">
          <a href="#" class="back-link">${OV.Icon("arrowLeft")} Back to Order Detail</a>
          <h1 class="wrap-anywhere">Pick Order ${OV.escape(data.orderId)} <span class="new-badge">NEW</span></h1>
          <div class="meta-line wrap-anywhere">
            <span>Customer: <strong>${OV.escape(data.customer)}</strong></span>
            <span>•</span>
            <span>Collection: <span class="accent">${OV.escape(data.collectionText)}</span></span>
          </div>
        </div>

        <div class="metric-row">
          ${this.metric("blue", "box", data.items, "Items")}
          ${this.metric("green", "checkCircle", `${pickedAll ? 3 : 0} / 3`, "Picked")}
          ${this.metric("orange", "clock", data.remaining, "Remaining")}
          ${this.metric("purple", "clipboard", data.units, "Units")}
        </div>
      </div>

      <div class="layout">
        <div class="left-stack">
          <section class="card">
            <div class="stepper">
              ${this.stepper()}
            </div>

            <div class="item-list">
              ${data.itemsList.map(item => this.itemCard(item, permissionService)).join("")}
            </div>
          </section>

          <section class="card scan-card ${canScan ? "" : "hidden"}">
            <div class="scan-icon">${OV.Icon("barcode")}</div>
            <div>
              <div class="scan-title">Scan Item Barcode</div>
              <div class="scan-sub">Scan to pick item quickly</div>
            </div>
            <div class="item-chevron">${OV.Icon("chevronRight")}</div>
          </section>

          ${!canScan ? `
            <section class="permission-box">
              <strong>Scan Item Barcode hidden</strong>
              <div class="state-copy">Missing permission: ${OV.PERMISSIONS.PICKING_SCAN}</div>
            </section>` : ""}
        </div>

        <div class="right-stack">
          <section class="card progress-card">
            <h3>Order Progress</h3>
            <div class="progress-layout">
              <div class="progress-ring">
                <div class="progress-center">
                  <div>
                    <strong>${pickedAll ? "3 / 3" : "0 / 3"}</strong>
                    <span>Picked</span>
                  </div>
                </div>
              </div>

              <div class="legend">
                <div class="legend-row"><span class="dot green"></span><span>Picked</span><span class="value">${pickedAll ? 3 : 0}</span></div>
                <div class="legend-row"><span class="dot orange"></span><span>Pending</span><span class="value">${pickedAll ? 0 : data.pending}</span></div>
                <div class="legend-row"><span class="dot red"></span><span>Issues</span><span class="value">${data.issues}</span></div>
              </div>
            </div>
          </section>

          <section class="card tips-card">
            <h3>${OV.Icon("lightbulb")} Picking Tips</h3>
            <ul class="tips-list">
              <li>Follow the aisle locations for faster picking</li>
              <li>Scan the product barcode to confirm</li>
              <li>All items must be picked to continue</li>
            </ul>
          </section>

          ${canNote ? `
          <section class="card note-card">
            <div>${OV.Icon("note")}</div>
            <div>Add Picking Note</div>
            <div class="item-chevron">${OV.Icon("chevronRight")}</div>
          </section>` : `
          <section class="permission-box">
            <strong>Add Picking Note hidden</strong>
            <div class="state-copy">Missing permission: ${OV.PERMISSIONS.PICKING_NOTE}</div>
          </section>`}

          <section class="cta-wrap">
            <button class="primary-cta ${pickedAll && canPack ? "enabled" : ""}" ${pickedAll && canPack ? "" : "disabled"} id="reviewPackBtn">
              Review & Pack ${OV.Icon("chevronRight")}
            </button>
            <div class="cta-help">${pickedAll ? (canPack ? "All items picked. Continue to Review & Pack." : `Missing permission: ${OV.PERMISSIONS.PACKING_PACK}`) : "Pick all items to continue"}</div>
          </section>
        </div>
      </div>
    `;
  },

  metric(color, icon, value, label){
    return `
      <div class="metric-card ${color}">
        <div class="metric-icon">${OV.Icon(icon)}</div>
        <div>
          <strong>${value}</strong>
          <span>${label}</span>
        </div>
      </div>
    `;
  },

  stepper(){
    const steps = [
      {num:1,label:"Pick Items",active:true},
      {num:2,label:"Review & Pack",active:false},
      {num:3,label:"Ready for Collection",active:false}
    ];
    return `
      <div class="step-row">
        ${steps.map((step, idx) => `
          <div class="step-wrap">
            <div class="step ${step.active ? "active" : ""}">
              <div class="num">${step.num}</div>
              <div class="label">${step.label}</div>
            </div>
            <div class="step-line"></div>
          </div>
        `).join("")}
      </div>
    `;
  },

  itemCard(item, permissionService){
    const canPick = permissionService.has(OV.PERMISSIONS.PICKING_PICK);
    return `
      <article class="item-card ${item.active ? "active" : ""}">
        <div class="item-thumb">${OV.ProductSvg(item.type)}</div>

        <div class="item-main wrap-anywhere">
          <h3>${OV.escape(item.title)}</h3>
          <p>${OV.escape(item.subtitle)}</p>
          <p>${OV.escape(item.sku)}</p>
        </div>

        <div class="location-block wrap-anywhere">
          <div class="label">Location</div>
          <div class="value">${OV.escape(item.location)}</div>
          <div class="loc-pill">${OV.Icon("pin")} ${OV.escape(item.locationCode)}</div>
        </div>

        <div class="pick-block">
          <div class="label">Pick</div>
          <div class="count">${OV.escape(item.picked)}</div>
          <div class="sub">${canPick ? "picked" : "view only"}</div>
        </div>

        <div class="item-chevron">${OV.Icon("chevronRight")}</div>
      </article>
    `;
  }
};
