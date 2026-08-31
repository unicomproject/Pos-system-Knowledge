OV.StartFulfilmentModal={
  render(order,canConfirm,state){
    return `
      <div class="modal-backdrop" id="modalBackdrop" role="presentation">
        <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <div class="modal-icon">${OV.Icon("order")}</div>
          <h2 class="modal-title" id="modalTitle">Start Fulfilment?</h2>
          <p class="modal-intro">You are about to start picking this order.<br>This order will be assigned to you.</p>

          <div class="detail-card">
            ${this.row("clipboard","Order",OV.escape(order.id))}
            ${this.row("user","Customer",OV.escape(order.customer))}
            ${this.row("pin","Collection",OV.escape(order.collectionOutlet))}
            ${this.row("clock","Collect by",`<span class="highlight">${OV.escape(order.collectBy)}</span><small>${OV.escape(order.remaining)}</small>`)}
            ${this.row("box","Items",`${order.items} items &nbsp; • &nbsp; ${order.units} units`)}
          </div>

          ${!canConfirm?`<div class="permission-warning">Requires <strong>${OV.PERMISSIONS.FULFILMENT_START}</strong>. The confirmation action is disabled.</div>`:""}
          ${state==="CommandError"?`<div class="error-box">Start Fulfilment failed in this prototype state. The user remains on the confirmation modal and can retry or cancel.</div>`:""}

          <button class="confirm-button" id="confirmButton" ${canConfirm?"":"disabled"}>${OV.Icon("play")} Yes, Start Fulfilment</button>
          <button class="cancel-button" id="cancelButton">${OV.Icon("close")} Cancel</button>
        </section>
      </div>
    `;
  },
  row(icon,label,value){
    return `<div class="detail-row"><div>${OV.Icon(icon)}</div><div class="detail-label">${label}</div><div class="detail-value wrap-anywhere">${value}</div></div>`;
  }
};
