OV.PickItemScreen = {
  render(data, permissionService, uiState){
    if(!permissionService.entitled(OV.ENTITLEMENTS.CLICK_COLLECT)){
      return OV.ScreenState.notEntitled();
    }

    if(!permissionService.has(OV.PERMISSIONS.ORDERS_ACCESS)){
      return OV.ScreenState.denied(`Required permission: ${OV.PERMISSIONS.ORDERS_ACCESS}`);
    }

    if(!permissionService.has(OV.PERMISSIONS.PICKING_VIEW)){
      return OV.ScreenState.denied(`Required permission: ${OV.PERMISSIONS.PICKING_VIEW}`);
    }

    if(uiState.screenState==="Loading"){
      return OV.ScreenState.loading();
    }

    if(uiState.screenState==="Error"){
      return OV.ScreenState.error();
    }

    return `
      <header class="pick-page-head">
        <div>
          <a class="back-link" href="#">${OV.Icon("arrowLeft")} Back to Pick Items</a>
          <div class="title-row">
            <h1 class="wrap-anywhere">${OV.escape(data.title)}</h1>
            <span class="sequence-badge">${OV.escape(data.sequence)}</span>
          </div>
          <div class="product-meta-line wrap-anywhere">${OV.escape(data.meta)}</div>
        </div>

        ${OV.SummaryMetrics.render(data,uiState.pickedMode)}
      </header>

      <div class="pick-layout">
        <div class="pick-primary">
          <section class="card pick-main-card">
            <div class="pick-main-grid">
              ${OV.ScannerPanel.render(permissionService,uiState)}
              ${OV.ProductPanel.render(data)}
            </div>
          </section>

          ${OV.QuantityPanel.render(data,permissionService,uiState)}
        </div>

        <aside class="pick-secondary">
          ${OV.OrderSidebar.render(data,permissionService,uiState)}
        </aside>
      </div>
    `;
  }
};
