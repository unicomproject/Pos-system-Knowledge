OV.Icon = function(name) {
  const common = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  const icons = {
    search: `<svg ${common}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
    filter: `<svg ${common}><path d="M4 5h16M7 12h10M10 19h4"/></svg>`,
    pin: `<svg ${common}><path d="M12 21s7-5.1 7-12A7 7 0 1 0 5 9c0 6.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2.2"/></svg>`,
    till: `<svg ${common}><path d="M6 4h12v4H6zM5 8h14l1 11H4L5 8Z"/><path d="M8 12h8M8 15h8"/></svg>`,
    bell: `<svg ${common}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg>`,
    home: `<svg ${common}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></svg>`,
    cart: `<svg ${common}><path d="M3 4h2l2 11h10l2-8H6"/><circle cx="9" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/></svg>`,
    orders: `<svg ${common}><path d="M6 3h12v18H6z"/><path d="M9 3v3m6-3v3M9 10h6m-6 4h6"/></svg>`,
    customer: `<svg ${common}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
    settings: `<svg ${common}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>`,
    bag: `<svg ${common}><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`,
    box: `<svg ${common}><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/></svg>`,
    checkBag: `<svg ${common}><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="m9 14 2 2 4-4"/></svg>`,
    clock: `<svg ${common}><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>`,
    check: `<svg ${common}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>`,
    close: `<svg ${common}><circle cx="12" cy="12" r="9"/><path d="m8.5 8.5 7 7m0-7-7 7"/></svg>`,
    lock: `<svg ${common}><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>`,
    alert: `<svg ${common}><path d="M12 3 2.7 20h18.6L12 3Z"/><path d="M12 9v5m0 3h.01"/></svg>`,
    info: `<svg ${common}><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-9h.01"/></svg>`
  };
  return icons[name] || icons.info;
};
