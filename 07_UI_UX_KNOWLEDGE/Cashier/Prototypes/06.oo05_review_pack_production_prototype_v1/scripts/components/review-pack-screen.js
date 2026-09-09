OV.ReviewPackScreen = {
  render(data, permissionService, uiState){
    if(!permissionService.entitled(OV.ENTITLEMENTS.CLICK_COLLECT)){
      return OV.ScreenState.notEntitled();
    }

    if(!permissionService.has(OV.PERMISSIONS.ORDERS_ACCESS)){
      return OV.ScreenState.denied(OV.PERMISSIONS.ORDERS_ACCESS);
    }

    if(!permissionService.has(OV.PERMISSIONS.PACKING_VIEW)){
      return OV.ScreenState.denied(OV.PERMISSIONS.PACKING_VIEW);
    }

    if(uiState.screenState==="Loading"){
      return OV.ScreenState.loading();
    }

    if(uiState.screenState==="Error"){
      return OV.ScreenState.error();
    }

    return `
      <header class="review-head">
        <div>
          <a class="back-link" href="#">${OV.Icon("arrowLeft")} Back to Pick Order</a>
          <div class="title-row">
            <h1>Review &amp; Pack</h1>
            <span class="sequence-badge">${OV.escape(data.step)}</span>
          </div>
          <div class="review-subtitle">
            Verify picked items and add any notes before marking as ready.
          </div>
        </div>

        ${OV.SummaryMetrics.render(data)}
      </header>

      <div class="review-layout">
        <section class="review-primary">
          ${OV.PickedItemsList.render(data)}
          ${OV.PackingNotes.render(permissionService,uiState.noteValue)}
          <div class="info-strip">
            ${OV.Icon("info")}
            <span>Please ensure all items are in perfect condition before marking as ready.</span>
          </div>
        </section>

        <aside class="review-secondary">
          ${OV.OrderSummary.render(data,permissionService,uiState)}
        </aside>
      </div>
    `;
  }
};
