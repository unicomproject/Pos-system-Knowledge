OV.escape=function(v){
  return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
};
OV.money=function(v){
  return new Intl.NumberFormat("en-GB",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v);
};

OV.app={
  mount:null,
  permissions:new OV.PermissionService(),
  state:{commandState:"Normal",stress:false},

  start(){
    this.mount=document.getElementById("app");
    this.render();
  },

  order(){return this.state.stress?OV.stressOrder:OV.order},

  render(){
    const order=this.order();

    let background=OV.BackgroundOrderDetail.render(order);
    const allowed =
      this.permissions.entitled(OV.ENTITLEMENTS.CLICK_COLLECT) &&
      this.permissions.has(OV.PERMISSIONS.ORDERS_ACCESS) &&
      this.permissions.has(OV.PERMISSIONS.ORDERS_VIEW);

    if(!allowed){
      background=`<div style="min-height:520px;display:grid;place-items:center;text-align:center;color:#66758F">
        <div><h2 style="color:#102B66;margin-bottom:8px">Order detail unavailable</h2>
        <p>The underlying screen requires click_collect + orders access/view.</p></div></div>`;
    }

    const canConfirm =
      allowed &&
      this.permissions.has(OV.PERMISSIONS.FULFILMENT_START);

    this.mount.innerHTML =
      OV.AppShell.render(background) +
      OV.StartFulfilmentModal.render(order,canConfirm,this.state.commandState) +
      OV.PrototypeQaPanel.render(this.state,this.permissions);

    this.bind();
  },

  bind(){
    document.getElementById("confirmButton")?.addEventListener("click",()=>{
      if(!this.permissions.has(OV.PERMISSIONS.FULFILMENT_START))return;

      if(this.state.commandState==="CommandError"){
        alert("Prototype: command failed. Modal remains open for retry/cancel.");
        return;
      }

      alert("Prototype command:\\nPOST /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/fulfilment/start\\n\\nSuccess → navigate to OO-04 Pick Order.");
    });

    document.getElementById("cancelButton")?.addEventListener("click",()=>{
      alert("Prototype: close modal and remain on OO-02 Order Detail.");
    });

    document.getElementById("qaToggle")?.addEventListener("click",()=>{
      document.getElementById("qaPanel")?.classList.toggle("open");
    });

    document.getElementById("qaCommand")?.addEventListener("change",e=>{
      this.state.commandState=e.target.value;
      this.render();
      document.getElementById("qaPanel")?.classList.add("open");
    });

    document.getElementById("qaEntitlement")?.addEventListener("change",e=>{
      this.permissions.setEntitlement(OV.ENTITLEMENTS.CLICK_COLLECT,e.target.checked);
      this.render();
      document.getElementById("qaPanel")?.classList.add("open");
    });

    document.getElementById("qaPermission")?.addEventListener("change",e=>{
      this.permissions.set(OV.PERMISSIONS.FULFILMENT_START,e.target.checked);
      this.render();
      document.getElementById("qaPanel")?.classList.add("open");
    });

    document.getElementById("qaStress")?.addEventListener("change",e=>{
      this.state.stress=e.target.checked;
      this.render();
      document.getElementById("qaPanel")?.classList.add("open");
    });
  }
};

window.addEventListener("DOMContentLoaded",()=>OV.app.start());
