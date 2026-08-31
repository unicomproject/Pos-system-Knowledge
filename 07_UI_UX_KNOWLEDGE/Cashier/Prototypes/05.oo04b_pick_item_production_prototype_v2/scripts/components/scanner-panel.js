OV.ScannerPanel = {
  render(permissionService, uiState){
    const canScan=permissionService.has(OV.PERMISSIONS.PICKING_SCAN);
    const canManual=permissionService.has(OV.PERMISSIONS.PICKING_MANUAL_ENTRY);

    return `
      <section class="scanner-panel">
        <div class="scanner-title">Scan item barcode to pick</div>
        <div class="scanner-copy">Scan the barcode on the product or packaging</div>

        ${canScan ? `
          <div class="scan-surface">
            <div class="scan-inner">
              ${OV.Icon("barcode")}
              <strong>${uiState.scanned?"Barcode scanned":"Ready to scan"}</strong>
            </div>
          </div>
        ` : `
          <div class="permission-note" style="width:100%">
            Scanner unavailable. Required permission: <strong>${OV.PERMISSIONS.PICKING_SCAN}</strong>
          </div>
        `}

        <div class="scan-divider">OR</div>

        ${canManual ? `
          <button class="manual-entry-btn" id="manualBarcodeBtn">
            ${OV.Icon("keyboard")} Enter Barcode Manually
          </button>
        ` : `
          <div class="permission-note" style="width:100%">
            Manual barcode entry unavailable. Required permission: <strong>${OV.PERMISSIONS.PICKING_MANUAL_ENTRY}</strong>
          </div>
        `}
      </section>
    `;
  }
};
