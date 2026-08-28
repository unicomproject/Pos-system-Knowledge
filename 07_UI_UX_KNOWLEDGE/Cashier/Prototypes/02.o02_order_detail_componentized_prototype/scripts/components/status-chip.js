OV.StatusChip = function(status){
  return `<span class="new-badge" aria-label="Order status: ${OV.escapeHtml(status)}">${OV.escapeHtml(status)}</span>`;
};
