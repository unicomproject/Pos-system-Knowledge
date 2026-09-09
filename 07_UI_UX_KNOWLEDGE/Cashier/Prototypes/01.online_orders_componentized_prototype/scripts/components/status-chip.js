OV.StatusChip = function(status) {
  const cls = String(status).toLowerCase().replace(/\s+/g, "-");
  return `<span class="status-chip ${cls}" aria-label="Order status: ${status}">${status}</span>`;
};
