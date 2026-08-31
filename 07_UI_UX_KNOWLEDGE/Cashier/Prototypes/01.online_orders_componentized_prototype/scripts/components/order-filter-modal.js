OV.OrderFilterModal = {
  render(state) {
    return `
      <div class="modal-backdrop" id="filterModal" role="presentation">
        <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="filterTitle">
          <h2 id="filterTitle">Filter Online Orders</h2>
          <p>Prototype filters map to the same list query state used by desktop, tablet and phone.</p>

          <label for="paymentFilter">Payment</label>
          <select id="paymentFilter">
            <option value="All" ${state.payment === "All" ? "selected" : ""}>All payment states</option>
            <option value="Paid" ${state.payment === "Paid" ? "selected" : ""}>Paid</option>
            <option value="Cash Due" ${state.payment === "Cash Due" ? "selected" : ""}>Cash Due</option>
          </select>

          <label for="urgencyFilter">Collection urgency</label>
          <select id="urgencyFilter">
            <option value="All" ${state.urgency === "All" ? "selected" : ""}>All collection times</option>
            <option value="Upcoming" ${state.urgency === "Upcoming" ? "selected" : ""}>Upcoming</option>
            <option value="Overdue" ${state.urgency === "Overdue" ? "selected" : ""}>Overdue</option>
          </select>

          <div class="modal-actions">
            <button class="secondary-button" id="clearFilters">Clear</button>
            <button class="secondary-button" id="cancelFilters">Cancel</button>
            <button class="modal-primary" id="applyFilters">Apply</button>
          </div>
        </section>
      </div>
    `;
  }
};
