OV.PaymentChip = function(payment) {
  const cls = String(payment).toLowerCase().replace(/\s+/g, "-");
  return `<span class="payment-chip ${cls}" aria-label="Payment status: ${payment}">${payment}</span>`;
};
