OV.OrderQuery = {
  filterAndSort(orders, queryState) {
    const q = (queryState.search || "").trim().toLowerCase();
    let list = orders.filter(o => {
      const statusOk = queryState.status === "All" || o.status === queryState.status;
      const searchOk = !q || [o.id, o.customer, o.email, o.phone]
        .some(v => String(v).toLowerCase().includes(q));
      const paymentOk = queryState.payment === "All" || o.payment === queryState.payment;
      const urgencyOk = queryState.urgency === "All" || o.urgency === queryState.urgency;
      return statusOk && searchOk && paymentOk && urgencyOk;
    });

    const priority = { Delayed:1, Ready:2, Preparing:3, New:4, Collected:5, Cancelled:6 };
    const sort = queryState.sort;

    list.sort((a,b) => {
      if (sort === "collection-asc") return a.collectionMin - b.collectionMin;
      if (sort === "collection-desc") return b.collectionMin - a.collectionMin;
      if (sort === "placed-desc") return b.placedMin - a.placedMin;
      if (sort === "placed-asc") return a.placedMin - b.placedMin;
      if (sort === "amount-desc") return b.amount - a.amount;
      if (sort === "amount-asc") return a.amount - b.amount;
      if (sort === "customer-asc") return a.customer.localeCompare(b.customer);
      if (sort === "customer-desc") return b.customer.localeCompare(a.customer);
      if (sort === "status-priority") return priority[a.status] - priority[b.status];
      return 0;
    });

    return list;
  }
};
