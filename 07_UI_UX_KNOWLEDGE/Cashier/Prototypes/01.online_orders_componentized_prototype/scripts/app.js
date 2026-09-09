OV.escapeHtml = function(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};
OV.escapeAttr = OV.escapeHtml;
OV.money = function(value) {
  return new Intl.NumberFormat("en-GB", {minimumFractionDigits:2, maximumFractionDigits:2}).format(value);
};

OV.app = {
  mount: null,
  permissions: new OV.PermissionService(),
  state: {
    search: "",
    status: "All",
    payment: "All",
    urgency: "All",
    sort: "collection-asc",
    page: 1,
    pageSize: 5,
    sortOpen: window.innerWidth >= 1200,
    qaState: "Normal",
    stressContent: false
  },

  start() {
    this.mount = document.getElementById("app");
    this.render();
  },

  data() {
    const base = [...OV.mockOrders];
    if (this.state.stressContent) base.splice(1, 0, OV.stressOrder);
    return base;
  },

  screenContent() {
    if (!this.permissions.entitled(OV.ENTITLEMENTS.CLICK_COLLECT)) {
      return OV.ScreenState.notEntitled();
    }
    if (!this.permissions.has(OV.PERMISSIONS.ORDERS_ACCESS)) {
      return OV.ScreenState.denied(OV.PERMISSIONS.ORDERS_ACCESS);
    }
    if (!this.permissions.has(OV.PERMISSIONS.ORDERS_VIEW)) {
      return OV.ScreenState.denied(OV.PERMISSIONS.ORDERS_VIEW);
    }

    if (this.state.qaState === "Loading") return OV.ScreenState.loading();
    if (this.state.qaState === "Error") return OV.ScreenState.error();

    const list = this.state.qaState === "Empty"
      ? []
      : OV.OrderQuery.filterAndSort(this.data(), this.state);

    const pages = Math.max(1, Math.ceil(list.length / this.state.pageSize));
    if (this.state.page > pages) this.state.page = pages;
    const start = (this.state.page - 1) * this.state.pageSize;
    const pageOrders = list.slice(start, start + this.state.pageSize);

    return `
      ${OV.OnlineOrdersHeader.render(this.state.search)}
      ${OV.OrderSummaryCards.render(OV.summaryCounts)}
      <div class="orders-toolbar">
        ${OV.OrderStatusTabs.render(this.state.status, OV.summaryCounts)}
        ${OV.OrderSortControl.render(this.state.sort, this.state.sortOpen)}
      </div>
      ${OV.ResponsiveOrderList.render(pageOrders, this.permissions)}
    `;
  },

  render() {
    this.mount.innerHTML =
      OV.AppShell.render(this.screenContent(), this.permissions) +
      OV.OrderFilterModal.render(this.state) +
      OV.PrototypeQaPanel.render(this.state, this.permissions);

    const paginationMount = document.getElementById("paginationMount");
    if (paginationMount && this.state.qaState === "Normal") {
      const total = OV.OrderQuery.filterAndSort(this.data(), this.state).length;
      paginationMount.innerHTML = OV.Pagination.render({
        page: this.state.page,
        pageSize: this.state.pageSize,
        total
      });
    }

    this.bind();
  },

  bind() {
    const search = document.getElementById("searchInput");
    if (search) {
      search.addEventListener("input", e => {
        this.state.search = e.target.value;
        this.state.page = 1;
        this.render();
        const newSearch = document.getElementById("searchInput");
        if (newSearch) {
          newSearch.focus();
          newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
        }
      });
    }

    document.getElementById("statusTabs")?.addEventListener("click", e => {
      const btn = e.target.closest("[data-status]");
      if (!btn) return;
      this.state.status = btn.dataset.status;
      this.state.page = 1;
      this.render();
    });

    document.getElementById("sortButton")?.addEventListener("click", () => {
      this.state.sortOpen = !this.state.sortOpen;
      this.render();
    });

    document.querySelectorAll("[data-sort]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.state.sort = btn.dataset.sort;
        this.state.sortOpen = false;
        this.state.page = 1;
        this.render();
      });
    });

    document.addEventListener("click", this._outsideSortHandler, { once:true });

    document.getElementById("filterButton")?.addEventListener("click", () => {
      document.getElementById("filterModal")?.classList.add("show");
    });

    document.getElementById("cancelFilters")?.addEventListener("click", () => {
      document.getElementById("filterModal")?.classList.remove("show");
    });

    document.getElementById("applyFilters")?.addEventListener("click", () => {
      this.state.payment = document.getElementById("paymentFilter").value;
      this.state.urgency = document.getElementById("urgencyFilter").value;
      this.state.page = 1;
      document.getElementById("filterModal")?.classList.remove("show");
      this.render();
    });

    document.getElementById("clearFilters")?.addEventListener("click", () => {
      this.state.payment = "All";
      this.state.urgency = "All";
      this.state.page = 1;
      this.render();
    });

    document.querySelectorAll("[data-page]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.state.page = Number(btn.dataset.page);
        this.render();
      });
    });

    document.querySelector("[data-page-action='prev']")?.addEventListener("click", () => {
      this.state.page = Math.max(1, this.state.page - 1);
      this.render();
    });

    document.querySelector("[data-page-action='next']")?.addEventListener("click", () => {
      const total = OV.OrderQuery.filterAndSort(this.data(), this.state).length;
      const pages = Math.max(1, Math.ceil(total / this.state.pageSize));
      this.state.page = Math.min(pages, this.state.page + 1);
      this.render();
    });

    document.querySelectorAll("[data-action='open-order'], [data-action='view-items']").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.order;
        alert(`Prototype navigation: ${btn.dataset.action === "open-order" ? "open order detail" : "view items"} — ${id}`);
      });
    });

    document.getElementById("qaToggle")?.addEventListener("click", () => {
      document.getElementById("qaPanel")?.classList.toggle("open");
    });

    document.getElementById("qaState")?.addEventListener("change", e => {
      this.state.qaState = e.target.value;
      this.render();
      document.getElementById("qaPanel")?.classList.add("open");
    });

    document.getElementById("qaEntitlement")?.addEventListener("change", e => {
      this.permissions.setEntitlement(OV.ENTITLEMENTS.CLICK_COLLECT, e.target.checked);
      this.render();
      document.getElementById("qaPanel")?.classList.add("open");
    });

    document.getElementById("qaAccess")?.addEventListener("change", e => {
      this.permissions.set(OV.PERMISSIONS.ORDERS_ACCESS, e.target.checked);
      this.render();
      document.getElementById("qaPanel")?.classList.add("open");
    });

    document.getElementById("qaView")?.addEventListener("change", e => {
      this.permissions.set(OV.PERMISSIONS.ORDERS_VIEW, e.target.checked);
      this.render();
      document.getElementById("qaPanel")?.classList.add("open");
    });

    document.getElementById("qaStress")?.addEventListener("change", e => {
      this.state.stressContent = e.target.checked;
      this.state.page = 1;
      this.render();
      document.getElementById("qaPanel")?.classList.add("open");
    });
  },

  _outsideSortHandler(e) {
    const app = OV.app;
    if (!app.state.sortOpen) return;
    const control = document.getElementById("sortControl");
    if (control && !control.contains(e.target)) {
      app.state.sortOpen = false;
      app.render();
    }
  }
};

window.addEventListener("DOMContentLoaded", () => OV.app.start());
