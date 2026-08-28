OV.PERMISSIONS = Object.freeze({
  ORDERS_ACCESS:"commerce.online_order.orders.access",
  ORDERS_VIEW:"commerce.online_order.orders.view",
  FULFILMENT_START:"commerce.online_order.fulfilment.start"
});

OV.ENTITLEMENTS = Object.freeze({
  CLICK_COLLECT:"click_collect"
});

OV.PermissionService = class {
  constructor(){
    this.permissions = new Set([
      OV.PERMISSIONS.ORDERS_ACCESS,
      OV.PERMISSIONS.ORDERS_VIEW,
      OV.PERMISSIONS.FULFILMENT_START
    ]);
    this.entitlements = new Set([OV.ENTITLEMENTS.CLICK_COLLECT]);
  }
  has(p){return this.permissions.has(p)}
  entitled(e){return this.entitlements.has(e)}
  set(p,on){on?this.permissions.add(p):this.permissions.delete(p)}
  setEntitlement(e,on){on?this.entitlements.add(e):this.entitlements.delete(e)}
};
