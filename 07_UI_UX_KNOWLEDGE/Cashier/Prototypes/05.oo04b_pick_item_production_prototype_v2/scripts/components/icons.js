OV.Icon = function(name){
  const base='viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  const i={
    arrowLeft:`<svg ${base}><path d="M15 18l-6-6 6-6"/><path d="M9 12h10"/></svg>`,
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
    chevronRight:`<svg ${base}><path d="m9 18 6-6-6-6"/></svg>`,
    barcode:`<svg ${base}><path d="M5 5v14M8 7v10M11 5v14M14 7v10M17 5v14M20 7v10"/></svg>`,
    keyboard:`<svg ${base}><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 11h.01M10 11h.01M13 11h.01M16 11h.01M7 14h10"/></svg>`,
    person:`<svg ${base}><circle cx="12" cy="8" r="3"/><path d="M5 20c0-3.4 3.1-6 7-6s7 2.6 7 6"/></svg>`,
    help:`<svg ${base}><circle cx="12" cy="12" r="9"/><path d="M9.2 9a2.8 2.8 0 1 1 4.8 2c-.8.7-1.5 1.1-1.5 2.4"/><path d="M12 17h.01"/></svg>`
  };
  return i[name]||i.box;
};

OV.ProductArt = function(type){
  if(type==="jersey"){
    return `<svg viewBox="0 0 320 360" aria-label="Manchester City style jersey illustration">
      <defs>
        <linearGradient id="jerseyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#BDE5FF"/>
          <stop offset="100%" stop-color="#8DCCFB"/>
        </linearGradient>
      </defs>
      <path d="M96 40 132 22h56l36 18 42 32-25 39-18-12v194H97V99l-18 12-25-39 42-32Z" fill="url(#jerseyGrad)" stroke="#7AB9E7" stroke-width="3"/>
      <path d="M140 25c5 14 13 22 20 22s15-8 20-22" fill="none" stroke="#4D6A8F" stroke-width="4"/>
      <text x="160" y="132" text-anchor="middle" font-size="32" font-family="Arial, sans-serif" fill="#355499" letter-spacing="3">HAALAND</text>
      <text x="160" y="238" text-anchor="middle" font-size="128" font-weight="700" font-family="Arial, sans-serif" fill="#355499">9</text>
      <circle cx="86" cy="116" r="18" fill="#D8C08B" opacity=".95"/>
      <circle cx="234" cy="116" r="18" fill="#D8C08B" opacity=".95"/>
      <path d="M150 320h20" stroke="#8D6E3A" stroke-width="8"/>
    </svg>`;
  }

  if(type==="shirt"){
    return `<svg viewBox="0 0 100 90"><path d="M29 15 42 10h16l13 5 15 14-12 15-8-6v38H34V38l-8 6-12-15 15-14Z" fill="#111827"/><circle cx="50" cy="44" r="12" fill="#64748B"/><circle cx="50" cy="44" r="8" fill="#1F2937"/></svg>`;
  }

  return `<svg viewBox="0 0 100 90"><path d="M24 50c3-23 17-34 31-34 21 0 32 14 33 36-22-5-42-4-64-2Z" fill="#111827"/><path d="M47 50c22 0 34 6 42 17-21-4-35-5-56-3l14-14Z" fill="#1F2937"/><text x="58" y="53" text-anchor="middle" font-size="8" fill="#fff">MAN CITY</text></svg>`;
};
