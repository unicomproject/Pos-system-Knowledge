OV.OrderSortControl = {
  options: [
    ["collection-asc", "Collection Time (Earliest First)"],
    ["collection-desc", "Collection Time (Latest First)"],
    ["placed-desc", "Order Placed Time (Newest First)"],
    ["placed-asc", "Order Placed Time (Oldest First)"],
    ["amount-desc", "Amount (Highest First)"],
    ["amount-asc", "Amount (Lowest First)"],
    ["customer-asc", "Customer Name (A–Z)"],
    ["customer-desc", "Customer Name (Z–A)"],
    ["status-priority", "Status Priority"]
  ],

  render(selected, open=false) {
    const selectedLabel = this.options.find(([v]) => v === selected)?.[1] || this.options[0][1];
    return `
      <div class="sort-control ${open ? "open" : ""}" id="sortControl">
        <button class="sort-button" id="sortButton" aria-haspopup="listbox" aria-expanded="${open}">
          <span class="truncate">Sort by: ${selectedLabel}</span>
          <span aria-hidden="true">⌃</span>
        </button>
        <div class="sort-menu" role="listbox">
          ${this.options.map(([value,label]) => `
            <button class="sort-option ${selected === value ? "selected" : ""}" data-sort="${value}" role="option"
              aria-selected="${selected === value ? "true" : "false"}">
              <span>${label}</span><span>${selected === value ? "✓" : ""}</span>
            </button>
          `).join("")}
          <div class="sort-help">Sorting changes list order. Status tabs continue to control filtering.</div>
        </div>
      </div>
    `;
  }
};
