OV.OrderItemsList = {
  render(order){
    return `
      <section class="items-panel">
        <div class="items-panel-head">
          <div class="items-panel-title">Order Items <span>(${order.itemSummary.itemCount})</span></div>
          <button class="view-details" id="viewDetailsButton">
            ${OV.Icon("info")}
            <span class="view-details-copy">
              <strong>View Details</strong>
              <small>Customer, payment, timeline & more</small>
            </span>
            <span class="chev">${OV.Icon("chevron")}</span>
          </button>
        </div>

        <div>
          ${order.items.map(item=>this.itemRow(item,order.itemSummary.itemCount)).join("")}
        </div>
      </section>
    `;
  },

  itemRow(item,itemCount){
    return `
      <article class="item-row">
        <div class="product-thumb">${OV.ProductSvg(item.type)}</div>

        <div class="wrap-anywhere">
          <div class="product-name wrap-anywhere">${OV.escapeHtml(item.name)}</div>
          <div class="product-variant wrap-anywhere">${OV.escapeHtml(item.variant)}</div>
          <div class="product-sku wrap-anywhere">SKU: ${OV.escapeHtml(item.sku)}</div>
        </div>

        <div class="quantity-block">
          <div class="qty-label">Quantity</div>
          <div class="qty-value">${item.quantity}</div>
          <div class="qty-unit">${item.quantity===1?"unit":"units"}</div>
        </div>

        <button class="pick-pill" data-action="pick-line" data-line="${OV.escapeAttr(item.id)}">
          ${OV.Icon("box")} ${itemCount} items to pick
        </button>

        <div class="item-chevron">${OV.Icon("chevron")}</div>
      </article>
    `;
  }
};
