OV.SummaryMetrics = {
  render(data, pickedMode){
    return `
      <section class="summary-metrics" aria-label="Order pick summary">
        ${this.metric("blue","box",data.summary.items,"Items")}
        ${this.metric("green","checkCircle",pickedMode?"1 / 3":data.summary.picked,"Picked")}
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
          <strong class="wrap-anywhere">${OV.escape(value)}</strong>
          <span>${label}</span>
        </div>
      </article>
    `;
  }
};
