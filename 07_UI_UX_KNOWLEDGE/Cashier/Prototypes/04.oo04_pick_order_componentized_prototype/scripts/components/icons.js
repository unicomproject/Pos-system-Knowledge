OV.Icon = function(name){
  const base = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  const icons = {
    arrowLeft:`<svg ${base}><path d="M15 18l-6-6 6-6"/><path d="M9 12h10"/></svg>`,
    pin:`<svg ${base}><path d="M12 21s7-5.1 7-12A7 7 0 1 0 5 9c0 6.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2.2"/></svg>`,
    terminal:`<svg ${base}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h4m-4 4h8"/></svg>`,
    bell:`<svg ${base}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg>`,
    logout:`<svg ${base}><path d="M15 16l4-4-4-4"/><path d="M9 12h10"/><path d="M13 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7"/></svg>`,
    home:`<svg ${base}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></svg>`,
    cart:`<svg ${base}><path d="M3 4h2l2 11h10l2-8H6"/><circle cx="9" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/></svg>`,
    orders:`<svg ${base}><path d="M6 3h12v18H6z"/><path d="M9 3v3m6-3v3M9 10h6m-6 4h6"/></svg>`,
    customers:`<svg ${base}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6"/><path d="M11 20c0-3 2.5-5.5 5.5-5.5S22 17 22 20"/></svg>`,
    settings:`<svg ${base}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1Z"/></svg>`,
    box:`<svg ${base}><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/></svg>`,
    checkCircle:`<svg ${base}><circle cx="12" cy="12" r="9"/><path d="m8.5 12.3 2.2 2.2 4.8-5.1"/></svg>`,
    clock:`<svg ${base}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
    clipboard:`<svg ${base}><path d="M9 4h6l1 2h3v14H5V6h3l1-2Z"/><path d="M9 4v3h6V4"/></svg>`,
    chevronRight:`<svg ${base}><path d="m9 18 6-6-6-6"/></svg>`,
    barcode:`<svg ${base}><path d="M5 5v14M8 7v10M11 5v14M14 7v10M17 5v14M20 7v10"/></svg>`,
    note:`<svg ${base}><path d="M8 3h8l5 5v13H3V3h5Z"/><path d="M16 3v5h5"/></svg>`,
    lightbulb:`<svg ${base}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M8 14c-1.2-1-2-2.6-2-4.4A6 6 0 0 1 18 9.6c0 1.8-.8 3.4-2 4.4-.8.7-1.2 1.3-1.3 2H9.3c-.1-.7-.5-1.3-1.3-2Z"/></svg>`
  };
  return icons[name] || icons.box;
};

OV.ProductSvg = function(type){
  if(type === "jersey") return `<svg viewBox="0 0 100 90"><rect width="100" height="90" rx="10" fill="#EEF5FF"/><path d="M30 15 42 10h16l12 5 16 12-10 15-9-6v40H33V36l-9 6-10-15 16-12Z" fill="#86C8F2"/><text x="50" y="34" text-anchor="middle" font-size="7" fill="#194C83">HAALAND</text><text x="50" y="54" text-anchor="middle" font-size="22" font-weight="700" fill="#194C83">9</text></svg>`;
  if(type === "shirt") return `<svg viewBox="0 0 100 90"><rect width="100" height="90" rx="10" fill="#F2F4F7"/><path d="M29 15 42 10h16l13 5 15 14-12 15-8-6v38H34V38l-8 6-12-15 15-14Z" fill="#111827"/><circle cx="50" cy="44" r="12" fill="#64748B"/><circle cx="50" cy="44" r="8" fill="#1F2937"/></svg>`;
  return `<svg viewBox="0 0 100 90"><rect width="100" height="90" rx="10" fill="#F2F4F7"/><path d="M24 50c3-23 17-34 31-34 21 0 32 14 33 36-22-5-42-4-64-2Z" fill="#111827"/><path d="M47 50c22 0 34 6 42 17-21-4-35-5-56-3l14-14Z" fill="#1F2937"/><text x="58" y="53" text-anchor="middle" font-size="8" fill="#fff">MAN CITY</text></svg>`;
};
