OV.ProductPanel = {
  render(data){
    return `
      <section class="product-panel">
        <div class="product-art">${OV.ProductArt("jersey")}</div>
        <div class="location-block">
          <div class="location-chip">${OV.Icon("pin")} ${OV.escape(data.currentItem.locationCode)}</div>
          <div class="location-meta wrap-anywhere">${OV.escape(data.currentItem.locationText)}</div>
        </div>
      </section>
    `;
  }
};
