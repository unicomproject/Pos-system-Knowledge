OV.OrderSummaryCards = {
  render(counts) {
    const cards = [
      ["New", "new", "bag"],
      ["Preparing", "preparing", "box"],
      ["Ready", "ready", "checkBag"],
      ["Delayed", "delayed", "clock"],
      ["Collected", "collected", "check"],
      ["Cancelled", "cancelled", "close"]
    ];

    return `
      <section class="summary-grid" aria-label="Online order summary">
        ${cards.map(([label, cls, icon]) => `
          <article class="summary-card ${cls}">
            <div class="summary-icon">${OV.Icon(icon)}</div>
            <div>
              <div class="summary-label">${label}</div>
              <div class="summary-count">${counts[label] ?? 0}</div>
            </div>
          </article>
        `).join("")}
      </section>
    `;
  }
};
