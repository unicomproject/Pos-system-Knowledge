OV.ReadyHero = {
  render(permissionService, uiState){
    const canNotify=permissionService.has(OV.PERMISSIONS.COLLECTION_NOTIFY_CUSTOMER);

    return `
      <section class="card ready-card">
        <div class="success-hero">
          <div class="success-ring">
            ${OV.Icon("checkCircle")}
            <div class="confetti">
              <span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>

          <h2>All items picked and packed!</h2>
          <p>This order is ready for customer collection.</p>
        </div>

        <div class="next-card">
          <div class="next-title">What's next?</div>

          <div class="next-grid">
            ${this.nextStep("clipboard","Customer Collection","Notify the customer that their order is ready.")}
            ${this.nextStep("verify","Verify Collection","Confirm customer details when they arrive.")}
            ${this.nextStep("complete","Complete Order","Mark the order as collected to close it.")}
          </div>
        </div>

        <div class="action-stack">
          <button class="notify-btn" id="notifyCustomerBtn" ${canNotify?"":"disabled"}>
            ${OV.Icon("bell")} Notify Customer Order is Ready
          </button>

          ${!canNotify ? `
            <div class="permission-note">
              Notification requires <strong>${OV.PERMISSIONS.COLLECTION_NOTIFY_CUSTOMER}</strong>.
            </div>
          ` : ""}

          ${uiState.notifyState==="Success" ? `
            <div class="command-success">Customer-ready notification sent successfully in this prototype state.</div>
          ` : ""}

          ${uiState.notifyState==="Error" ? `
            <div class="command-error">Notification failed in this prototype state. Production should preserve Ready status and allow retry.</div>
          ` : ""}

          <div class="secondary-actions">
            <button class="secondary-btn" id="printSlipBtn">
              ${OV.Icon("printer")} Print Collection Slip
            </button>

            <button class="secondary-btn" id="shareInfoBtn">
              ${OV.Icon("share")} Share Collection Info
            </button>
          </div>

          <div class="info-strip">
            ${OV.Icon("info")}
            <span>You can also notify the customer later from the Orders list.</span>
          </div>
        </div>
      </section>
    `;
  },

  nextStep(icon,title,copy){
    return `
      <article class="next-step">
        <div class="next-icon">${OV.Icon(icon)}</div>
        <div>
          <strong>${title}</strong>
          <p>${copy}</p>
        </div>
      </article>
    `;
  }
};
