OV.OrderSummaryCards = {
  render(order){
    return `
      <section class="summary-grid" aria-label="Order summary">
        ${this.card("collection","pin","Collection",`
          <div class="summary-main wrap-anywhere">${OV.escapeHtml(order.collection.outlet)}</div>
          <div class="summary-sub wrap-anywhere">${OV.escapeHtml(order.collection.displayTime)}</div>
        `)}

        ${this.card("payment","payment","Payment",`
          <span class="payment-paid">${OV.escapeHtml(order.payment.status)}</span>
          <div class="payment-amount">£${OV.money(order.payment.amount)}</div>
        `)}

        ${this.card("items","box","Items",`
          <div class="summary-main">${order.itemSummary.itemCount} items</div>
          <div class="summary-sub">${order.itemSummary.unitCount} units</div>
        `)}
      </section>
    `;
  },

  card(cls,icon,title,body){
    return `
      <article class="summary-card ${cls}">
        <div class="summary-icon">${OV.Icon(icon)}</div>
        <div>
          <div class="summary-title">${title}</div>
          ${body}
        </div>
        <div class="summary-chevron">${OV.Icon("chevron")}</div>
      </article>
    `;
  }
};
