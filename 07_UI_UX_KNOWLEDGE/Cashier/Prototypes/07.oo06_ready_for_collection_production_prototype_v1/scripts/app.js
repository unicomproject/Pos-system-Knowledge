OV.app = {
  mount:null,
  permissions:new OV.PermissionService(),

  uiState:{
    screenState:"Normal",
    notifyState:"Idle",
    stress:false
  },

  data(){
    return this.uiState.stress ? OV.mockStress : OV.mock;
  },

  render(){
    this.mount.innerHTML =
      OV.AppShell.render(
        OV.ReadyCollectionScreen.render(this.data(),this.permissions,this.uiState)
      ) +
      OV.PrototypeQaPanel.render(this.uiState,this.permissions);

    this.bind();
  },

  keepQaOpen(){
    document.getElementById("qaPanel")?.classList.add("open");
  },

  bind(){
    document.getElementById("qaToggle")?.addEventListener("click",()=>{
      document.getElementById("qaPanel")?.classList.toggle("open");
    });

    document.getElementById("qaState")?.addEventListener("change",e=>{
      this.uiState.screenState=e.target.value;
      this.render();
      this.keepQaOpen();
    });

    document.getElementById("qaNotifyState")?.addEventListener("change",e=>{
      this.uiState.notifyState=e.target.value;
      this.render();
      this.keepQaOpen();
    });

    document.getElementById("qaStress")?.addEventListener("change",e=>{
      this.uiState.stress=e.target.checked;
      this.render();
      this.keepQaOpen();
    });

    document.getElementById("qaEntitlement")?.addEventListener("change",e=>{
      this.permissions.setEntitlement(OV.ENTITLEMENTS.CLICK_COLLECT,e.target.checked);
      this.render();
      this.keepQaOpen();
    });

    [
      ["qaOrdersAccess",OV.PERMISSIONS.ORDERS_ACCESS],
      ["qaOrdersView",OV.PERMISSIONS.ORDERS_VIEW],
      ["qaReadyView",OV.PERMISSIONS.COLLECTION_VIEW_READY],
      ["qaNotify",OV.PERMISSIONS.COLLECTION_NOTIFY_CUSTOMER]
    ].forEach(([id,code])=>{
      document.getElementById(id)?.addEventListener("change",e=>{
        this.permissions.set(code,e.target.checked);
        this.render();
        this.keepQaOpen();
      });
    });

    document.getElementById("notifyCustomerBtn")?.addEventListener("click",()=>{
      if(!this.permissions.has(OV.PERMISSIONS.COLLECTION_NOTIFY_CUSTOMER)) return;

      if(this.uiState.notifyState==="Error"){
        alert("Prototype: notification failed. Order remains Ready for Collection.");
        return;
      }

      this.uiState.notifyState="Success";
      this.render();
      alert("Prototype action: customer-ready notification sent.");
    });

    document.getElementById("printSlipBtn")?.addEventListener("click",()=>{
      alert("Prototype action: print collection slip.\nNo new Online Order permission is invented for this prototype.");
    });

    document.getElementById("shareInfoBtn")?.addEventListener("click",()=>{
      alert("Prototype action: share collection information.\nNo new Online Order permission is invented for this prototype.");
    });

    document.getElementById("viewDetailsBtn")?.addEventListener("click",()=>{
      alert("Prototype handoff: open Order Details.");
    });
  },

  start(){
    this.mount=document.getElementById("app");
    this.render();
  }
};

window.addEventListener("DOMContentLoaded",()=>OV.app.start());
