OV.QuantityPanel = {
  render(data, permissionService, uiState){
    const canPick=permissionService.has(OV.PERMISSIONS.PICKING_PICK);
    const picked=uiState.pickedMode?1:data.currentItem.picked;
    const remaining=uiState.pickedMode?0:data.currentItem.remaining;

    return `
      <section class="card quantity-card">
        <div class="quantity-grid">
          <div class="quantity-cell">
            <div class="quantity-label">Quantity to pick</div>
            <div class="quantity-controls">
              <button class="round-btn" id="decreaseQty" aria-label="Decrease quantity">−</button>
              <div class="quantity-number">${data.currentItem.toPick}</div>
              <button class="round-btn" id="increaseQty" aria-label="Increase quantity">+</button>
            </div>
            <div class="quantity-caption">of 1 unit</div>
          </div>

          <div class="quantity-cell">
            <div class="quantity-label">Picked</div>
            <div class="quantity-stat green">${picked}</div>
            <div class="quantity-caption">unit</div>
          </div>

          <div class="quantity-cell">
            <div class="quantity-label">Remaining</div>
            <div class="quantity-stat orange">${remaining}</div>
            <div class="quantity-caption">unit</div>
          </div>

          <div class="quantity-cell">
            <button class="mark-picked-btn" id="markPickedBtn" ${canPick?"":"disabled"}>
              ${OV.Icon("checkCircle")} Mark as Picked
            </button>
            ${!canPick?`
              <div class="permission-note">
                Requires <strong>${OV.PERMISSIONS.PICKING_PICK}</strong>
              </div>
            `:""}
          </div>
        </div>
      </section>
    `;
  }
};
