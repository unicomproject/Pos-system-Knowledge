OV.CollectionTime = function(order) {
  const className = order.status === "Delayed"
    ? "overdue"
    : order.status === "Ready" && order.urgency === "Overdue"
      ? "past"
      : "";
  return `
    <div class="collection-main wrap-anywhere">${order.collection}</div>
    <div class="collection-subtext ${className}">${order.collectionSub}</div>
  `;
};
