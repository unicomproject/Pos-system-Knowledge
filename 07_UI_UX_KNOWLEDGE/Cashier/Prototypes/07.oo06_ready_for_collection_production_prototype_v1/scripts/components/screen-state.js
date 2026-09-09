OV.ScreenState = {
  render(title,message){
    return `
      <section class="card state-card">
        <div class="state-inner">
          <h2>${title}</h2>
          <p>${message}</p>
        </div>
      </section>
    `;
  },

  loading(){
    return this.render("Loading Ready for Collection","Loading ready-state details, customer notification state, order summary and collection handoff information.");
  },

  error(){
    return this.render("Unable to load Ready for Collection","The shell remains stable while the content area enters an error state. Production should use the canonical retry flow.");
  },

  denied(code){
    return this.render("Permission required",`Required permission: ${code}`);
  },

  notEntitled(){
    return this.render("Click & Collect unavailable","This workflow requires the click_collect feature entitlement.");
  }
};
