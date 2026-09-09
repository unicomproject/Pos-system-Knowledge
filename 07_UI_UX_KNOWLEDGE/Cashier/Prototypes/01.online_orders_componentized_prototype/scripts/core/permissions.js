OV.PERMISSIONS = Object.freeze({
  ORDERS_ACCESS: "commerce.online_order.orders.access",
  ORDERS_VIEW: "commerce.online_order.orders.view"
});

OV.ENTITLEMENTS = Object.freeze({
  CLICK_COLLECT: "click_collect"
});

OV.PermissionService = class {
  constructor() {
    this.permissions = new Set([
      OV.PERMISSIONS.ORDERS_ACCESS,
      OV.PERMISSIONS.ORDERS_VIEW
    ]);
    this.entitlements = new Set([OV.ENTITLEMENTS.CLICK_COLLECT]);
  }

  has(permission) { return this.permissions.has(permission); }
  entitled(entitlement) { return this.entitlements.has(entitlement); }

  set(permission, enabled) {
    enabled ? this.permissions.add(permission) : this.permissions.delete(permission);
  }

  setEntitlement(entitlement, enabled) {
    enabled ? this.entitlements.add(entitlement) : this.entitlements.delete(entitlement);
  }
};
