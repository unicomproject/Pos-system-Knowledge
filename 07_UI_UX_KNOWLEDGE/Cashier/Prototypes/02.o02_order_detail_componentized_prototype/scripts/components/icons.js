OV.Icon = function(name){
  const common='viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  const icons={
    back:`<svg ${common}><path d="M15 18l-6-6 6-6"/><path d="M9 12h10"/></svg>`,
    pin:`<svg ${common}><path d="M12 21s7-5.1 7-12A7 7 0 1 0 5 9c0 6.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2.2"/></svg>`,
    till:`<svg ${common}><path d="M6 4h12v4H6zM5 8h14l1 11H4L5 8Z"/><path d="M8 12h8M8 15h8"/></svg>`,
    bell:`<svg ${common}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg>`,
    home:`<svg ${common}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></svg>`,
    cart:`<svg ${common}><path d="M3 4h2l2 11h10l2-8H6"/><circle cx="9" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/></svg>`,
    orders:`<svg ${common}><path d="M6 3h12v18H6z"/><path d="M9 3v3m6-3v3M9 10h6m-6 4h6"/></svg>`,
    customer:`<svg ${common}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
    settings:`<svg ${common}><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/></svg>`,
    orderBag:`<svg ${common}><rect x="5" y="7" width="14" height="13" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M9 13h6m-3-3v6"/></svg>`,
    clock:`<svg ${common}><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>`,
    user:`<svg ${common}><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-4 3-7 7-7s7 3 7 7"/></svg>`,
    payment:`<svg ${common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18"/><path d="m14 15 2 2 4-4"/></svg>`,
    box:`<svg ${common}><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/></svg>`,
    checkBag:`<svg ${common}><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="m9 14 2 2 4-4"/></svg>`,
    chevron:`<svg ${common}><path d="m9 18 6-6-6-6"/></svg>`,
    info:`<svg ${common}><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-9h.01"/></svg>`,
    lock:`<svg ${common}><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>`,
    alert:`<svg ${common}><path d="M12 3 2.7 20h18.6L12 3Z"/><path d="M12 9v5m0 3h.01"/></svg>`
  };
  return icons[name]||icons.info;
};

OV.ProductSvg = function(type){
  if(type==="jersey"){
    return `<svg viewBox="0 0 120 100" aria-label="Jersey placeholder">
      <rect width="120" height="100" rx="12" fill="#EDF5FF"/>
      <path d="M37 16 51 10h18l14 6 18 13-12 18-10-6v45H41V41l-10 6-12-18 18-13Z" fill="#82C7F5"/>
      <text x="60" y="38" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#124E85">HAALAND</text>
      <text x="60" y="57" text-anchor="middle" font-size="23" font-weight="700" font-family="sans-serif" fill="#124E85">9</text>
    </svg>`;
  }
  if(type==="shirt"){
    return `<svg viewBox="0 0 120 100" aria-label="T-shirt placeholder">
      <rect width="120" height="100" rx="12" fill="#F1F3F6"/>
      <path d="M35 17 50 10h20l15 7 17 16-14 17-10-8v45H42V42l-10 8-14-17 17-16Z" fill="#111820"/>
      <circle cx="60" cy="46" r="13" fill="#243749"/><circle cx="60" cy="46" r="8" fill="#6EA6C7"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 120 100" aria-label="Cap placeholder">
    <rect width="120" height="100" rx="12" fill="#F1F3F6"/>
    <path d="M27 56c3-26 18-38 35-38 24 0 36 16 37 40-24-5-46-4-72-2Z" fill="#101418"/>
    <path d="M53 56c26 0 38 7 48 19-24-5-39-6-64-3l16-16Z" fill="#191F24"/>
    <text x="64" y="43" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#FFFFFF">MAN CITY</text>
  </svg>`;
};
