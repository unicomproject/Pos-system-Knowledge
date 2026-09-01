OV.OnlineOrdersHeader = {
  render(searchValue="") {
    return `
      <div class="online-orders-head">
        <div>
          <h1>Online Orders</h1>
          <p>Manage e-commerce Click &amp; Collect orders.</p>
        </div>

        <div class="head-controls">
          <label class="search-box">
            <span class="sr-only">Search online orders</span>
            ${OV.Icon("search")}
            <input id="searchInput" type="search"
              autocomplete="off"
              value="${OV.escapeHtml(searchValue)}"
              placeholder="Search by order number or customer..." />
          </label>

          <button class="filter-button" id="filterButton" aria-haspopup="dialog">
            ${OV.Icon("filter")}
            <span class="filter-label">Filters</span>
          </button>
        </div>
      </div>
    `;
  }
};
