OV.PERMISSIONS = Object.freeze({
  ORDERS_ACCESS:"commerce.online_order.orders.access",
  ORDERS_VIEW:"commerce.online_order.orders.view",
  COLLECTION_VIEW_READY:"commerce.online_order.collection.view_ready",
  COLLECTION_NOTIFY_CUSTOMER:"commerce.online_order.collection.notify_customer"
});

OV.ENTITLEMENTS = Object.freeze({
  CLICK_COLLECT:"click_collect"
});

OV.PermissionService = class{
  constructor(){
    this.permissions = new Set([
      OV.PERMISSIONS.ORDERS_ACCESS,
      OV.PERMISSIONS.ORDERS_VIEW,
      OV.PERMISSIONS.COLLECTION_VIEW_READY,
      OV.PERMISSIONS.COLLECTION_NOTIFY_CUSTOMER
    ]);
    this.entitlements = new Set([OV.ENTITLEMENTS.CLICK_COLLECT]);
  }

  has(code){return this.permissions.has(code)}
  set(code,on){on?this.permissions.add(code):this.permissions.delete(code)}
  entitled(code){return this.entitlements.has(code)}
  setEntitlement(code,on){on?this.entitlements.add(code):this.entitlements.delete(code)}
};
