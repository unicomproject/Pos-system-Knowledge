OV.Pagination = {
  render({page, pageSize, total}) {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, pages);
    const start = total ? ((safePage - 1) * pageSize) + 1 : 0;
    const end = Math.min(safePage * pageSize, total);

    return `
      <footer class="list-footer">
        <div>Showing ${start} to ${end} of ${total} matching orders</div>
        <div class="pagination" aria-label="Pagination">
          <button class="page-button" data-page-action="prev" ${safePage <= 1 ? "disabled" : ""}>‹</button>
          ${[1,2,3,4,5].map(p => `
            <button class="page-button ${safePage === p ? "active" : ""}" data-page="${p}">${p}</button>
          `).join("")}
          <button class="page-button" data-page-action="next" ${safePage >= pages ? "disabled" : ""}>›</button>
        </div>
      </footer>
    `;
  }
};
