OV.StartFulfilmentModal = {
  render(order){
    return `
      <div class="modal-backdrop" id="startModal">
        <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="startTitle">
          <h2 id="startTitle">Start Fulfilment?</h2>
          <p>This prototype confirms the staff action before the canonical start-fulfilment command is sent.</p>

          <div class="modal-summary">
            <div class="modal-summary-row"><span>Order</span><strong>${OV.escapeHtml(order.id)}</strong></div>
            <div class="modal-summary-row"><span>Collect by</span><strong>${OV.escapeHtml(order.collection.displayTime)}</strong></div>
            <div class="modal-summary-row"><span>Items</span><strong>${order.itemSummary.itemCount}</strong></div>
          </div>

          <div class="modal-actions">
            <button class="secondary-button" id="cancelStart">Cancel</button>
            <button class="modal-primary" id="confirmStart">Start Fulfilment</button>
          </div>
        </section>
      </div>
    `;
  }
};
