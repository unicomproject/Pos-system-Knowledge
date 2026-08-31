OV.ScreenState = {
  render(kind,message){
    return `
      <section class="card state-card">
        <div class="state-inner">
          <h2>${kind}</h2>
          <p>${message}</p>
        </div>
      </section>
    `;
  },

  loading(){
    return this.render("Loading Pick Item","Loading item detail, scanner readiness, order progress and next-item information.");
  },

  error(){
    return this.render("Unable to load Pick Item","The prototype keeps the shell stable while the content area enters an error state. Production should use the canonical retry/error flow.");
  },

  denied(detail){
    return this.render("Permission required",detail);
  },

  notEntitled(){
    return this.render("Click & Collect unavailable","The click_collect feature entitlement is required for this workflow.");
  }
};
