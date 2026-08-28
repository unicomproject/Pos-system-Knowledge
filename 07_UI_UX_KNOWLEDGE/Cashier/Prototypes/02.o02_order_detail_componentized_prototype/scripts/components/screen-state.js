OV.ScreenState = {
  loading(){
    return `
      <section class="state-panel" aria-busy="true">
        <div class="loading-lines">
          <div class="loading-line"></div>
          <div class="loading-line"></div>
          <div class="loading-line"></div>
        </div>
      </section>`;
  },
  error(){
    return this.message("error","Unable to load order","The order detail could not be loaded. Use the canonical retry/error path in production.");
  },
  denied(permission){
    return this.message("denied","Permission required",`Access requires ${permission}.`);
  },
  notEntitled(){
    return this.message("denied","Click & Collect is not enabled","This tenant is not entitled to the click_collect feature.");
  },
  message(type,title,message){
    return `
      <section class="state-panel">
        <div class="state-card ${type}">
          <div class="state-icon">${OV.Icon(type==="error"?"alert":"lock")}</div>
          <h2>${title}</h2>
          <p>${message}</p>
        </div>
      </section>`;
  }
};
