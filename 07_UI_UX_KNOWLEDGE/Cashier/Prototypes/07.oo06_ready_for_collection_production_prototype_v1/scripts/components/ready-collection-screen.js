OV.ReadyCollectionScreen = {
  render(data, permissionService, uiState){
    if(!permissionService.entitled(OV.ENTITLEMENTS.CLICK_COLLECT)){
      return OV.ScreenState.notEntitled();
    }

    if(!permissionService.has(OV.PERMISSIONS.ORDERS_ACCESS)){
      return OV.ScreenState.denied(OV.PERMISSIONS.ORDERS_ACCESS);
    }

    if(!permissionService.has(OV.PERMISSIONS.ORDERS_VIEW)){
      return OV.ScreenState.denied(OV.PERMISSIONS.ORDERS_VIEW);
    }

    if(!permissionService.has(OV.PERMISSIONS.COLLECTION_VIEW_READY)){
      return OV.ScreenState.denied(OV.PERMISSIONS.COLLECTION_VIEW_READY);
    }

    if(uiState.screenState==="Loading"){
      return OV.ScreenState.loading();
    }

    if(uiState.screenState==="Error"){
      return OV.ScreenState.error();
    }

    return `
      <header class="ready-head">
        <div>
          <a class="back-link" href="#">${OV.Icon("arrowLeft")} Back to Review &amp; Pack</a>

          <div class="title-row">
            <h1>Ready for Collection</h1>
            <span class="sequence-badge">${OV.escape(data.step)}</span>
          </div>

          <div class="ready-subtitle">
            Finalize the order and confirm it is ready for customer collection.
          </div>
        </div>

        ${OV.SummaryMetrics.render(data)}
      </header>

      <div class="ready-layout">
        <section class="ready-primary">
          ${OV.ReadyHero.render(permissionService,uiState)}
        </section>

        <aside class="ready-secondary">
          ${OV.OrderSummary.render(data)}
        </aside>
      </div>
    `;
  }
};
