OV.BackgroundOrderDetail={
  render(order){
    return `
      <div class="back-row"><button class="back-button">${OV.Icon("back")} Back to Orders</button></div>

      <section class="hero">
        <div class="hero-left">
          <div class="order-icon">${OV.Icon("order")}</div>
          <div class="wrap-anywhere">
            <div class="order-title-row"><h1 class="order-title wrap-anywhere">Order ${OV.escape(order.id)}</h1><span class="status-badge">NEW</span></div>
            <div class="order-meta">Placed on 26 May 2025, 09:15 AM &nbsp; • &nbsp; Via E-commerce Web</div>
            <div class="customer">${OV.Icon("user")}<span>${OV.escape(order.customer)}</span><span class="guest">Guest</span></div>
          </div>
        </div>

        <div class="collect-by">
          <div class="collect-label">${OV.Icon("clock")} Collect by</div>
          <div class="collect-time wrap-anywhere">${OV.escape(order.collectBy)}</div>
          <div class="collect-remain">${OV.escape(order.remaining)}</div>
        </div>

        <div class="cta-wrap">
          <button class="start-cta">${OV.Icon("order")}<strong>START<br>FULFILMENT</strong></button>
          <div class="start-helper">Accept and start picking this order</div>
        </div>
      </section>

      <section class="summary-grid">
        ${this.summary("green","pin","Collection",`<div class="summary-main wrap-anywhere">${OV.escape(order.collectionOutlet)}</div><div class="summary-sub">${OV.escape(order.collectBy)}</div>`)}
        ${this.summary("green","payment","Payment",`<span class="payment-tag">${order.payment}</span><div class="payment-amount">£${OV.money(order.amount)}</div>`)}
        ${this.summary("blue","box","Items",`<div class="summary-main">${order.items} items</div><div class="summary-sub">${order.units} units</div>`)}
      </section>

      <section class="items-panel">
        <div class="items-head"><strong>Order Items (${order.items})</strong><span class="view-details">${OV.Icon("info")} View Details ${OV.Icon("chevron")}</span></div>
        ${this.item("jersey","Man City Home Jersey 24/25","Size: M · Player: Haaland 9","SKU: MCJ-2425-S")}
        ${this.item("shirt","Man City Core T-Shirt","Size: M · Color: Black","SKU: MCT-BLK-M")}
        ${this.item("cap","Man City Cap","Size: One Size · Color: Black","SKU: MCC-BLK-OS")}
      </section>
    `;
  },
  summary(cls,icon,title,body){
    return `<article class="summary-card ${cls}"><div class="summary-icon">${OV.Icon(icon)}</div><div><div class="summary-title">${title}</div>${body}</div><div>${OV.Icon("chevron")}</div></article>`;
  },
  item(kind,name,meta,sku){
    return `<article class="item-row">
      <div class="thumb">${OV.ProductSvg(kind)}</div>
      <div><div class="product-name">${name}</div><div class="product-meta">${meta}</div><div class="sku">${sku}</div></div>
      <div class="qty-block"><div class="qty-label">Quantity</div><div class="qty-value">1</div><div class="qty-label">unit</div></div>
      <div class="pick-pill">${OV.Icon("box")} 3 items to pick</div>
      <div>${OV.Icon("chevron")}</div>
    </article>`;
  }
};
