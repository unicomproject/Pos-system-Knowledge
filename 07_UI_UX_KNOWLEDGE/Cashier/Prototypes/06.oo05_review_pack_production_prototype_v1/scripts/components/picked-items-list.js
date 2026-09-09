OV.PickedItemsList = {
  render(data){
    return `
      <section class="card picked-items-card">
        <header class="picked-items-head">
          <strong>Picked Items (3 of 3)</strong>
          <span class="all-picked">${OV.Icon("checkCircle")} All items picked</span>
        </header>

        ${data.items.map(item=>`
          <article class="picked-item">
            <div class="item-thumb">${OV.ProductArt(item.type)}</div>

            <div class="wrap-anywhere">
              <div class="item-title">${OV.escape(item.name)}</div>
              <div class="item-meta">${OV.escape(item.meta)}</div>
              <div class="item-sku">${OV.escape(item.sku)}</div>
            </div>

            <div class="location-block">
              <div class="location-label">Location</div>
              <div class="location-value wrap-anywhere">${OV.escape(item.location)}</div>
            </div>

            <div class="picked-badge">
              <div>${OV.Icon("checkCircle")} Picked</div>
              <small>${OV.escape(item.picked)}</small>
            </div>
          </article>
        `).join("")}
      </section>
    `;
  }
};
