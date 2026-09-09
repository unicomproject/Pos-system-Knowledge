OV.PERMISSIONS = Object.freeze({
  ORDERS_ACCESS:"commerce.online_order.orders.access",
  PACKING_VIEW:"commerce.online_order.packing.view",
  PACKING_PACK:"commerce.online_order.packing.pack",
  COLLECTION_MARK_READY:"commerce.online_order.collection.mark_ready"
});

OV.ENTITLEMENTS = Object.freeze({
  CLICK_COLLECT:"click_collect"
});

OV.PermissionService = class{
  constructor(){
    this.permissions = new Set([
      OV.PERMISSIONS.ORDERS_ACCESS,
      OV.PERMISSIONS.PACKING_VIEW,
      OV.PERMISSIONS.PACKING_PACK,
      OV.PERMISSIONS.COLLECTION_MARK_READY
    ]);
    this.entitlements = new Set([OV.ENTITLEMENTS.CLICK_COLLECT]);
  }

  has(code){return this.permissions.has(code)}
  set(code,on){on?this.permissions.add(code):this.permissions.delete(code)}
  entitled(code){return this.entitlements.has(code)}
  setEntitlement(code,on){on?this.entitlements.add(code):this.entitlements.delete(code)}
};
