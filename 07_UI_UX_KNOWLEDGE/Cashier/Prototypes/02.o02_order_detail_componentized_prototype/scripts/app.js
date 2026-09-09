OV.escapeHtml = function(value){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
};
OV.escapeAttr = OV.escapeHtml;
OV.money = function(value){
  return new Intl.NumberFormat("en-GB",{minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
};

OV.app = {
  mount:null,
  permissions:new OV.PermissionService(),
  state:{
    qaState:"Normal",
    stressContent:false
  },

  start(){
    this.mount=document.getElementById("app");
    this.render();
  },

  order(){
    return this.state.stressContent ? OV.stressOrder : OV.mockOrder;
  },

  content(){
    if(!this.permissions.entitled(OV.ENTITLEMENTS.CLICK_COLLECT)){
      return OV.ScreenState.notEntitled();
    }
    if(!this.permissions.has(OV.PERMISSIONS.ORDERS_ACCESS)){
      return OV.ScreenState.denied(OV.PERMISSIONS.ORDERS_ACCESS);
    }
    if(!this.permissions.has(OV.PERMISSIONS.ORDERS_VIEW)){
      return OV.ScreenState.denied(OV.PERMISSIONS.ORDERS_VIEW);
    }
    if(this.state.qaState==="Loading"){
      return OV.ScreenState.loading();
    }
    if(this.state.qaState==="Error"){
      return OV.ScreenState.error();
    }

    const order=this.order();
    const canStart=this.permissions.has(OV.PERMISSIONS.FULFILMENT_START);

    return `
      ${OV.OrderHero.render(order,canStart)}
      ${OV.OrderSummaryCards.render(order)}
      ${OV.OrderItemsList.render(order)}
    `;
  },

  render(){
    const order=this.order();
    this.mount.innerHTML=
      OV.AppShell.render(this.content())+
      OV.StartFulfilmentModal.render(order)+
      OV.PrototypeQaPanel.render(this.state,this.permissions);

    this.bind();
  },

  bind(){
    document.getElementById("backToOrders")?.addEventListener("click",()=>{
      alert("Prototype navigation: back to OO-01 Online Orders");
    });

    document.getElementById("startFulfilmentButton")?.addEventListener("click",()=>{
      if(!this.permissions.has(OV.PERMISSIONS.FULFILMENT_START)) return;
      document.getElementById("startModal")?.classList.add("show");
    });

    document.getElementById("cancelStart")?.addEventListener("click",()=>{
      document.getElementById("startModal")?.classList.remove("show");
    });

    document.getElementById("confirmStart")?.addEventListener("click",()=>{
      document.getElementById("startModal")?.classList.remove("show");
      alert("Prototype command: POST /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/fulfilment/start");
    });

    document.getElementById("viewDetailsButton")?.addEventListener("click",()=>{
      alert("Prototype: view customer, payment, timeline and audit details");
    });

    document.querySelectorAll("[data-action='pick-line']").forEach(btn=>{
      btn.addEventListener("click",()=>{
        alert("Prototype navigation: open picking flow for " + btn.dataset.line);
      });
    });

    document.getElementById("qaToggle")?.addEventListener("click",()=>{
      document.getElementById("qaPanel")?.classList.toggle("open");
    });

    document.getElementById("qaState")?.addEventListener("change",e=>{
      this.state.qaState=e.target.value;
      this.render();
      document.getElementById("qaPanel")?.classList.add("open");
    });

    document.getElementById("qaEntitlement")?.addEventListener("change",e=>{
      this.permissions.setEntitlement(OV.ENTITLEMENTS.CLICK_COLLECT,e.target.checked);
      this.render();
      document.getElementById("qaPanel")?.classList.add("open");
    });

    document.getElementById("qaAccess")?.addEventListener("change",e=>{
      this.permissions.set(OV.PERMISSIONS.ORDERS_ACCESS,e.target.checked);
      this.render();
      document.getElementById("qaPanel")?.classList.add("open");
    });

    document.getElementById("qaView")?.addEventListener("change",e=>{
      this.permissions.set(OV.PERMISSIONS.ORDERS_VIEW,e.target.checked);
      this.render();
      document.getElementById("qaPanel")?.classList.add("open");
    });

    document.getElementById("qaStart")?.addEventListener("change",e=>{
      this.permissions.set(OV.PERMISSIONS.FULFILMENT_START,e.target.checked);
      this.render();
      document.getElementById("qaPanel")?.classList.add("open");
    });

    document.getElementById("qaStress")?.addEventListener("change",e=>{
      this.state.stressContent=e.target.checked;
      this.render();
      document.getElementById("qaPanel")?.classList.add("open");
    });
  }
};

window.addEventListener("DOMContentLoaded",()=>OV.app.start());
