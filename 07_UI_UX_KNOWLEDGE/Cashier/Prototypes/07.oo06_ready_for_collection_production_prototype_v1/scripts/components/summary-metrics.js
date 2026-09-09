OV.SummaryMetrics = {
  render(data){
    return `
      <section class="summary-metrics" aria-label="Ready for collection summary">
        ${this.metric("blue","box",data.summary.items,"Items")}
        ${this.metric("green","checkCircle",data.summary.picked,"Picked")}
        ${this.metric("orange","clock",data.summary.remaining,"Remaining")}
        ${this.metric("purple","clipboard",data.summary.units,"Units")}
      </section>
    `;
  },

  metric(cls,icon,value,label){
    return `
      <article class="summary-metric ${cls}">
        <div class="metric-icon">${OV.Icon(icon)}</div>
        <div>
          <strong>${OV.escape(value)}</strong>
          <span>${label}</span>
        </div>
      </article>
    `;
  }
};
