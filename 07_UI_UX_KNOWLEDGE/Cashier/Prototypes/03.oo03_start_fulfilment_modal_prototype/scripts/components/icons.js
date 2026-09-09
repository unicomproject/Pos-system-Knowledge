OV.Icon=function(name){
  const c='viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  const m={
    back:`<svg ${c}><path d="M15 18l-6-6 6-6"/><path d="M9 12h10"/></svg>`,
    pin:`<svg ${c}><path d="M12 21s7-5.1 7-12A7 7 0 1 0 5 9c0 6.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2.2"/></svg>`,
    till:`<svg ${c}><path d="M6 4h12v4H6zM5 8h14l1 11H4L5 8Z"/><path d="M8 12h8M8 15h8"/></svg>`,
    bell:`<svg ${c}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg>`,
    home:`<svg ${c}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></svg>`,
    cart:`<svg ${c}><path d="M3 4h2l2 11h10l2-8H6"/><circle cx="9" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/></svg>`,
    orders:`<svg ${c}><path d="M6 3h12v18H6z"/><path d="M9 3v3m6-3v3M9 10h6m-6 4h6"/></svg>`,
    customer:`<svg ${c}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
    settings:`<svg ${c}><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/></svg>`,
    order:`<svg ${c}><rect x="5" y="7" width="14" height="13" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="m9 14 2 2 4-4"/></svg>`,
    clock:`<svg ${c}><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>`,
    user:`<svg ${c}><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-4 3-7 7-7s7 3 7 7"/></svg>`,
    payment:`<svg ${c}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18"/><path d="m14 15 2 2 4-4"/></svg>`,
    box:`<svg ${c}><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/></svg>`,
    info:`<svg ${c}><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-9h.01"/></svg>`,
    chevron:`<svg ${c}><path d="m9 18 6-6-6-6"/></svg>`,
    play:`<svg ${c}><path d="m8 5 11 7-11 7V5Z"/></svg>`,
    close:`<svg ${c}><path d="m7 7 10 10m0-10L7 17"/></svg>`,
    clipboard:`<svg ${c}><path d="M9 4h6l1 2h3v14H5V6h3l1-2Z"/><path d="M9 4v3h6V4"/><path d="m9 13 2 2 4-4"/></svg>`
  };
  return m[name]||m.info;
};

OV.ProductSvg=function(kind){
  if(kind==="jersey") return `<svg viewBox="0 0 100 90"><rect width="100" height="90" rx="10" fill="#EEF5FF"/><path d="M30 15 42 10h16l12 5 16 12-10 15-9-6v40H33V36l-9 6-10-15 16-12Z" fill="#80C6F3"/><text x="50" y="35" text-anchor="middle" font-size="7" fill="#124E85">HAALAND</text><text x="50" y="54" text-anchor="middle" font-size="21" font-weight="700" fill="#124E85">9</text></svg>`;
  if(kind==="shirt") return `<svg viewBox="0 0 100 90"><rect width="100" height="90" rx="10" fill="#F2F4F7"/><path d="M29 15 42 10h16l13 5 15 14-12 15-8-6v38H34V38l-8 6-12-15 15-14Z" fill="#101820"/><circle cx="50" cy="44" r="11" fill="#6EA6C7"/></svg>`;
  return `<svg viewBox="0 0 100 90"><rect width="100" height="90" rx="10" fill="#F2F4F7"/><path d="M24 50c3-23 17-34 31-34 21 0 32 14 33 36-22-5-42-4-64-2Z" fill="#11171B"/><path d="M47 50c22 0 34 6 42 17-21-4-35-5-56-3l14-14Z" fill="#1C2227"/></svg>`;
};
