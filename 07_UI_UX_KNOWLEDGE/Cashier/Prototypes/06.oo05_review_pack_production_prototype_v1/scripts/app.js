OV.app = {
  mount:null,
  permissions:new OV.PermissionService(),

  uiState:{
    screenState:"Normal",
    commandState:"Normal",
    allPicked:true,
    stress:false,
    noteValue:""
  },

  data(){
    return this.uiState.stress ? OV.mockStress : OV.mock;
  },

  render(){
    this.mount.innerHTML =
      OV.AppShell.render(
        OV.ReviewPackScreen.render(this.data(),this.permissions,this.uiState)
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

    document.getElementById("qaCommand")?.addEventListener("change",e=>{
      this.uiState.commandState=e.target.value;
      this.render();
      this.keepQaOpen();
    });

    document.getElementById("qaAllPicked")?.addEventListener("change",e=>{
      this.uiState.allPicked=e.target.checked;
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
      ["qaPackingView",OV.PERMISSIONS.PACKING_VIEW],
      ["qaPackingPack",OV.PERMISSIONS.PACKING_PACK],
      ["qaMarkReady",OV.PERMISSIONS.COLLECTION_MARK_READY]
    ].forEach(([id,code])=>{
      document.getElementById(id)?.addEventListener("change",e=>{
        this.permissions.set(code,e.target.checked);
        this.render();
        this.keepQaOpen();
      });
    });

    document.getElementById("packingNotes")?.addEventListener("input",e=>{
      this.uiState.noteValue=e.target.value.slice(0,200);
      const count=document.getElementById("noteCount");
      if(count) count.textContent=`${this.uiState.noteValue.length} / 200`;
    });

    document.getElementById("markReadyBtn")?.addEventListener("click",()=>{
      if(!this.uiState.allPicked) return;
      if(!this.permissions.has(OV.PERMISSIONS.COLLECTION_MARK_READY)) return;

      if(this.uiState.commandState==="CommandError"){
        alert("Prototype command failed: remain on OO-05 Review & Pack and allow retry.");
        return;
      }

      alert("Prototype command:\nPOST /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/ready\n\nSuccess → Ready for Collection screen.");
    });

    document.getElementById("backPickBtn")?.addEventListener("click",()=>{
      alert("Prototype handoff: OO-05 Review & Pack → OO-04 Pick Order.");
    });
  },

  start(){
    this.mount=document.getElementById("app");
    this.render();
  }
};

window.addEventListener("DOMContentLoaded",()=>OV.app.start());
