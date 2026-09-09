OV.escape = function(value){
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

OV.app = {
  mount:null,
  permissions:new OV.PermissionService(),
  uiState:{
    screenState:"Normal",
    allPicked:false,
    stress:false
  },

  getData(){
    return this.uiState.stress ? OV.stressScreenData : OV.screenData;
  },

  render(){
    const html = OV.AppShell.render(
      OV.PickOrderScreen.render(this.getData(), this.permissions, this.uiState)
    ) + OV.PrototypeQaPanel.render(this.uiState, this.permissions);

    this.mount.innerHTML = html;
    this.bind();
  },

  bind(){
    document.getElementById("qaToggle")?.addEventListener("click", ()=>{
      document.getElementById("qaPanel")?.classList.toggle("open");
    });

    document.getElementById("qaScreenState")?.addEventListener("change", e=>{
      this.uiState.screenState = e.target.value;
      this.render();
      document.getElementById("qaPanel")?.classList.add("open");
    });

    document.getElementById("qaAllPicked")?.addEventListener("change", e=>{
      this.uiState.allPicked = e.target.checked;
      this.render();
      document.getElementById("qaPanel")?.classList.add("open");
    });

    document.getElementById("qaStress")?.addEventListener("change", e=>{
      this.uiState.stress = e.target.checked;
      this.render();
      document.getElementById("qaPanel")?.classList.add("open");
    });

    document.getElementById("qaEntitlement")?.addEventListener("change", e=>{
      this.permissions.setEntitlement(OV.ENTITLEMENTS.CLICK_COLLECT, e.target.checked);
      this.render();
      document.getElementById("qaPanel")?.classList.add("open");
    });

    [
      ["qaView", OV.PERMISSIONS.PICKING_VIEW],
      ["qaPick", OV.PERMISSIONS.PICKING_PICK],
      ["qaScan", OV.PERMISSIONS.PICKING_SCAN],
      ["qaNote", OV.PERMISSIONS.PICKING_NOTE],
      ["qaPack", OV.PERMISSIONS.PACKING_PACK]
    ].forEach(([id, code])=>{
      document.getElementById(id)?.addEventListener("change", e=>{
        this.permissions.set(code, e.target.checked);
        this.render();
        document.getElementById("qaPanel")?.classList.add("open");
      });
    });

    document.getElementById("reviewPackBtn")?.addEventListener("click", ()=>{
      if(!(this.uiState.allPicked && this.permissions.has(OV.PERMISSIONS.PACKING_PACK))) return;
      alert("Prototype handoff:\nOO-04 Pick Order → OO-05 Review & Pack");
    });
  },

  start(){
    this.mount = document.getElementById("app");
    this.render();
  }
};

window.addEventListener("DOMContentLoaded", ()=>OV.app.start());
