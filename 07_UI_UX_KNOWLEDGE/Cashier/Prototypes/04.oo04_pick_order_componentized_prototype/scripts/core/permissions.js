OV.PERMISSIONS = Object.freeze({
  ORDERS_ACCESS:"commerce.online_order.orders.access",
  PICKING_VIEW:"commerce.online_order.picking.view",
  PICKING_PICK:"commerce.online_order.picking.pick",
  PICKING_SCAN:"commerce.online_order.picking.scan",
  PICKING_NOTE:"commerce.online_order.picking.notes.manage",
  PACKING_PACK:"commerce.online_order.packing.pack"
});

OV.ENTITLEMENTS = Object.freeze({
  CLICK_COLLECT:"click_collect"
});

OV.PermissionService = class{
  constructor(){
    this.permissions = new Set([
      OV.PERMISSIONS.ORDERS_ACCESS,
      OV.PERMISSIONS.PICKING_VIEW,
      OV.PERMISSIONS.PICKING_PICK,
      OV.PERMISSIONS.PICKING_SCAN,
      OV.PERMISSIONS.PICKING_NOTE,
      OV.PERMISSIONS.PACKING_PACK
    ]);
    this.entitlements = new Set([OV.ENTITLEMENTS.CLICK_COLLECT]);
  }
  has(code){return this.permissions.has(code)}
  set(code,on){on?this.permissions.add(code):this.permissions.delete(code)}
  entitled(code){return this.entitlements.has(code)}
  setEntitlement(code,on){on?this.entitlements.add(code):this.entitlements.delete(code)}
};
