OV.OrderStatusTabs = {
  render(active, counts) {
    const tabs = [
      ["All", "All Orders"],
      ["New", `New (${counts.New})`],
      ["Preparing", `Preparing (${counts.Preparing})`],
      ["Ready", `Ready (${counts.Ready})`],
      ["Delayed", `Delayed (${counts.Delayed})`],
      ["Collected", `Collected (${counts.Collected})`],
      ["Cancelled", `Cancelled (${counts.Cancelled})`]
    ];

    return `
      <div class="status-tabs" id="statusTabs" role="tablist" aria-label="Order status">
        ${tabs.map(([value,label]) => `
          <button class="status-tab ${active === value ? "active" : ""}"
            data-status="${value}" role="tab"
            aria-selected="${active === value ? "true" : "false"}">
            ${label}
          </button>
        `).join("")}
      </div>
    `;
  }
};
