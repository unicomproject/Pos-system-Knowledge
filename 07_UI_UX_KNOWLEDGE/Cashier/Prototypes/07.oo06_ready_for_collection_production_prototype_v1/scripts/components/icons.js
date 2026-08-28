OV.Icon = function(name){
  const base='viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  const i={
    arrowLeft:`<svg ${base}><path d="M15 18l-6-6 6-6"/><path d="M9 12h10"/></svg>`,
    arrowRight:`<svg ${base}><path d="m9 18 6-6-6-6"/></svg>`,
    pin:`<svg ${base}><path d="M12 21s7-5.1 7-12A7 7 0 1 0 5 9c0 6.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2.2"/></svg>`,
    terminal:`<svg ${base}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h4m-4 4h8"/></svg>`,
    bell:`<svg ${base}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg>`,
    logout:`<svg ${base}><path d="M15 16l4-4-4-4"/><path d="M9 12h10"/><path d="M13 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7"/></svg>`,
    home:`<svg ${base}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></svg>`,
    cart:`<svg ${base}><path d="M3 4h2l2 11h10l2-8H6"/><circle cx="9" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/></svg>`,
    orders:`<svg ${base}><path d="M6 3h12v18H6z"/><path d="M9 3v3m6-3v3M9 10h6m-6 4h6"/></svg>`,
    customers:`<svg ${base}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6"/><path d="M11 20c0-3 2.5-5.5 5.5-5.5S22 17 22 20"/></svg>`,
    settings:`<svg ${base}><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/></svg>`,
    box:`<svg ${base}><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/></svg>`,
    checkCircle:`<svg ${base}><circle cx="12" cy="12" r="9"/><path d="m8.5 12.3 2.2 2.2 4.8-5.1"/></svg>`,
    clock:`<svg ${base}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
    clipboard:`<svg ${base}><path d="M9 4h6l1 2h3v14H5V6h3l1-2Z"/><path d="M9 4v3h6V4"/></svg>`,
    person:`<svg ${base}><circle cx="12" cy="8" r="3"/><path d="M5 20c0-3.4 3.1-6 7-6s7 2.6 7 6"/></svg>`,
    verify:`<svg ${base}><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h5"/><circle cx="16.5" cy="15.5" r="2.5"/><path d="m18.2 17.2 2 2"/></svg>`,
    complete:`<svg ${base}><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7"/><path d="m9 15 2 2 4-4"/></svg>`,
    printer:`<svg ${base}><path d="M7 8V3h10v5"/><rect x="5" y="14" width="14" height="7"/><rect x="3" y="8" width="18" height="9" rx="2"/></svg>`,
    share:`<svg ${base}><circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5m-8 7 8 5"/></svg>`,
    info:`<svg ${base}><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-9h.01"/></svg>`,
    details:`<svg ${base}><rect x="5" y="4" width="14" height="16" rx="2"/><path d="M8 8h8M8 12h6M8 16h4"/></svg>`
  };
  return i[name]||i.box;
};
