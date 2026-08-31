OV.ResponsiveOrderList = {
  render(orders, permissionService) {
    if (!permissionService.has(OV.PERMISSIONS.ORDERS_VIEW)) {
      return OV.ScreenState.denied(OV.PERMISSIONS.ORDERS_VIEW);
    }

    if (!orders.length) return OV.ScreenState.empty();

    return `
      <div class="orders-shell">
        ${this.desktop(orders)}
        ${this.tablet(orders)}
        ${this.phone(orders)}
        <div id="paginationMount"></div>
      </div>
    `;
  },

  desktop(orders) {
    return `
      <div class="desktop-table-wrap">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th class="collection">Collection Time ↓</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => this.desktopRow(o)).join("")}
          </tbody>
        </table>
      </div>
    `;
  },

  desktopRow(o) {
    return `
      <tr>
        <td>
          <div class="order-id wrap-anywhere">${OV.escapeHtml(o.id)}</div>
          <div class="meta">Placed ${OV.escapeHtml(o.placed)}</div>
        </td>
        <td>
          <div class="customer-name wrap-anywhere">${OV.escapeHtml(o.customer)}</div>
          <div class="contact wrap-anywhere">${OV.escapeHtml(o.email)} • ${OV.escapeHtml(o.phone)}</div>
        </td>
        <td class="items-cell">
          <strong>${o.items} ${o.items === 1 ? "item" : "items"} · ${o.units} units</strong>
          <button class="link-button" data-action="view-items" data-order="${OV.escapeAttr(o.id)}">View items</button>
        </td>
        <td>${OV.CollectionTime(o)}</td>
        <td>${OV.StatusChip(o.status)}</td>
        <td>${OV.PaymentChip(o.payment)}</td>
        <td class="amount wrap-anywhere">£${OV.money(o.amount)}</td>
        <td><button class="open-button" data-action="open-order" data-order="${OV.escapeAttr(o.id)}">Open</button></td>
      </tr>
    `;
  },

  tablet(orders) {
    return `
      <div class="tablet-order-list">
        ${orders.map(o => `
          <article class="tablet-order-card">
            <div class="wrap-anywhere">
              <div class="order-id">${OV.escapeHtml(o.id)}</div>
              <div class="customer-name">${OV.escapeHtml(o.customer)}</div>
              <div class="contact">${OV.escapeHtml(o.phone)}</div>
            </div>

            <div class="wrap-anywhere">
              <div class="field-label">Collection</div>
              ${OV.CollectionTime(o)}
            </div>

            <div class="wrap-anywhere">
              <div class="field-label">Items / Payment / Amount</div>
              <div class="field-value">${o.items} items · ${o.units} units</div>
              <div style="margin-top:6px">${OV.PaymentChip(o.payment)}</div>
              <div class="field-value" style="margin-top:6px">£${OV.money(o.amount)}</div>
            </div>

            <div class="tablet-actions">
              ${OV.StatusChip(o.status)}
              <button class="open-button" data-action="open-order" data-order="${OV.escapeAttr(o.id)}">Open</button>
            </div>
          </article>
        `).join("")}
      </div>
    `;
  },

  phone(orders) {
    return `
      <div class="phone-order-list">
        ${orders.map(o => `
          <article class="phone-order-card">
            <div class="phone-card-head">
              <div class="wrap-anywhere">
                <div class="order-id">${OV.escapeHtml(o.id)}</div>
                <div class="meta">Placed ${OV.escapeHtml(o.placed)}</div>
              </div>
              ${OV.StatusChip(o.status)}
            </div>

            <div class="customer-name wrap-anywhere">${OV.escapeHtml(o.customer)}</div>
            <div class="contact wrap-anywhere">${OV.escapeHtml(o.email)} • ${OV.escapeHtml(o.phone)}</div>

            <div class="phone-card-grid">
              <div>
                <div class="field-label">Items</div>
                <div class="field-value">${o.items} items · ${o.units} units</div>
              </div>
              <div>
                <div class="field-label">Payment</div>
                <div class="field-value">${OV.PaymentChip(o.payment)}</div>
              </div>
              <div>
                <div class="field-label">Collection</div>
                ${OV.CollectionTime(o)}
              </div>
              <div>
                <div class="field-label">Amount</div>
                <div class="field-value wrap-anywhere">£${OV.money(o.amount)}</div>
              </div>
            </div>

            <div class="phone-card-foot">
              <button class="link-button" data-action="view-items" data-order="${OV.escapeAttr(o.id)}">View items</button>
              <button class="primary-button" data-action="open-order" data-order="${OV.escapeAttr(o.id)}">Open Order</button>
            </div>
          </article>
        `).join("")}
      </div>
    `;
  }
};
