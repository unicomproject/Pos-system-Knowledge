OV.OrderHero = {
  render(order, canStart){
    return `
      <div class="back-row">
        <button class="back-button" id="backToOrders">${OV.Icon("back")} Back to Orders</button>
      </div>

      <section class="order-hero">
        <div class="order-identity">
          <div class="order-icon">${OV.Icon("orderBag")}</div>
          <div class="wrap-anywhere">
            <div class="order-title-row">
              <h1 class="order-title wrap-anywhere">Order ${OV.escapeHtml(order.id)}</h1>
              ${OV.StatusChip(order.status)}
            </div>
            <div class="order-meta wrap-anywhere">
              Placed on ${OV.escapeHtml(order.placedAt)} &nbsp; • &nbsp; Via ${OV.escapeHtml(order.source)}
            </div>
            <div class="customer-line wrap-anywhere">
              ${OV.Icon("user")}
              <span>${OV.escapeHtml(order.customer.name)}</span>
              <span class="guest-badge">${OV.escapeHtml(order.customer.classification)}</span>
            </div>
          </div>
        </div>

        <div class="collect-by">
          <div class="collect-label">${OV.Icon("clock")} <span>Collect by</span></div>
          <div class="collect-time wrap-anywhere">${OV.escapeHtml(order.collection.displayTime)}</div>
          <div class="collect-remaining">${OV.escapeHtml(order.collection.remaining)}</div>
        </div>

        <div class="fulfilment-cta-wrap">
          <button class="fulfilment-cta" id="startFulfilmentButton" ${canStart?"":"disabled"}>
            ${OV.Icon("checkBag")}
            <span class="fulfilment-cta-text">START<br>FULFILMENT</span>
          </button>
          <div class="fulfilment-helper">Accept and start picking this order</div>
          <div class="permission-note ${canStart?"":"show"}">
            Requires commerce.online_order.fulfilment.start
          </div>
        </div>
      </section>
    `;
  }
};
