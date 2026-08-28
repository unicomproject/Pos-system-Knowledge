OV.app = {
  mount:null,
  permissions:new OV.PermissionService(),

  uiState:{
    screenState:"Normal",
    scanned:false,
    pickedMode:false,
    stress:false
  },

  data(){
    return this.uiState.stress ? OV.mockStress : OV.mock;
  },

  render(){
    this.mount.innerHTML =
      OV.AppShell.render(
        OV.PickItemScreen.render(this.data(),this.permissions,this.uiState)
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

    document.getElementById("qaScanned")?.addEventListener("change",e=>{
      this.uiState.scanned=e.target.checked;
      this.render();
      this.keepQaOpen();
    });

    document.getElementById("qaPicked")?.addEventListener("change",e=>{
      this.uiState.pickedMode=e.target.checked;
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
      ["qaView",OV.PERMISSIONS.PICKING_VIEW],
      ["qaScan",OV.PERMISSIONS.PICKING_SCAN],
      ["qaManual",OV.PERMISSIONS.PICKING_MANUAL_ENTRY],
      ["qaPick",OV.PERMISSIONS.PICKING_PICK],
      ["qaIssue",OV.PERMISSIONS.PICKING_REPORT_ISSUE]
    ].forEach(([id,code])=>{
      document.getElementById(id)?.addEventListener("change",e=>{
        this.permissions.set(code,e.target.checked);
        this.render();
        this.keepQaOpen();
      });
    });

    document.getElementById("manualBarcodeBtn")?.addEventListener("click",()=>{
      alert("Prototype action: open manual barcode entry.");
    });

    document.getElementById("markPickedBtn")?.addEventListener("click",()=>{
      if(!this.permissions.has(OV.PERMISSIONS.PICKING_PICK)) return;
      this.uiState.pickedMode=true;
      this.render();
      alert("Prototype state: current item marked as picked.");
    });

    document.getElementById("reportIssueBtn")?.addEventListener("click",()=>{
      alert("Prototype action: open picking issue reporting flow.");
    });

    document.getElementById("nextItemBtn")?.addEventListener("click",()=>{
      alert("Prototype handoff: move to the next pending item.");
    });

    document.getElementById("increaseQty")?.addEventListener("click",()=>{
      alert("Prototype constraint: quantity cannot exceed the remaining required quantity.");
    });

    document.getElementById("decreaseQty")?.addEventListener("click",()=>{
      alert("Prototype constraint: quantity cannot go below the allowed minimum.");
    });
  },

  start(){
    this.mount=document.getElementById("app");
    this.render();
  }
};

window.addEventListener("DOMContentLoaded",()=>OV.app.start());
